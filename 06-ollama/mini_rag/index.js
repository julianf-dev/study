import express from "express";
import bodyParser from "body-parser";
import fs from "fs";
import pdfParse from "pdf-parse";
import {Ollama} from "ollama";

// ─── Capturar errores globales ───────────────────────────────────────────────
process.on("uncaughtException", (err) => {
    console.error("❌ Error no capturado:", err);
});
process.on("unhandledRejection", (reason) => {
    console.error("❌ Promesa rechazada sin manejar:", reason);
});

// ─── Configuración ──────────────────────────────────────────────────────────
const app = express();
app.use(bodyParser.json());
app.use(express.static("public"));

const OLLAMA_HOST = "http://localhost:11434";
const MODELO_CHAT = "glm-4.7-flash";       // Modelo para generar respuestas
const MODELO_EMBED = "nomic-embed-text";    // Modelo para embeddings (274MB)
const TIMEOUT_MS = 120000;                  // 120 segundos de timeout
const CHUNK_SIZE = 500;                     // Caracteres por chunk
const CHUNK_OVERLAP = 100;                  // Solapamiento entre chunks
const TOP_K = 5;                            // Cuántos chunks enviar al modelo

const ollama = new Ollama({host: OLLAMA_HOST});

// ─── Estado de la aplicación ────────────────────────────────────────────────
let chunks = [];           // Fragmentos de texto del PDF
let chunkEmbeddings = [];  // Embedding de cada chunk
let documentoCargado = false;

// ─── Verificar conexión a Ollama ────────────────────────────────────────────
async function verificarOllama() {
    try {
        console.log(`🔌 Conectando a Ollama en ${OLLAMA_HOST}...`);
        const lista = await ollama.list();
        const modelos = lista.models.map(m => m.name);
        console.log(`✅ Ollama conectado. Modelos disponibles:`);
        modelos.forEach(m => console.log(`   - ${m}`));

        // Verificar modelo de chat
        if (!modelos.some(m => m.startsWith(MODELO_CHAT))) {
            console.warn(`⚠️  ADVERTENCIA: Modelo chat "${MODELO_CHAT}" NO encontrado.`);
            console.warn(`   Instálalo con: ollama pull ${MODELO_CHAT}`);
        } else {
            console.log(`✅ Modelo chat "${MODELO_CHAT}" encontrado.`);
        }

        // Verificar modelo de embeddings
        if (!modelos.some(m => m.startsWith(MODELO_EMBED))) {
            console.warn(`⚠️  ADVERTENCIA: Modelo embeddings "${MODELO_EMBED}" NO encontrado.`);
            console.warn(`   Instálalo con: ollama pull ${MODELO_EMBED}`);
        } else {
            console.log(`✅ Modelo embeddings "${MODELO_EMBED}" encontrado.`);
        }
    } catch (error) {
        console.error(`❌ No se pudo conectar a Ollama en ${OLLAMA_HOST}`);
        console.error(`   ¿Está Ollama ejecutándose? Inícialo con: ollama serve`);
        console.error(`   Error:`, error.message);
    }
}

// ─── RAG: Dividir texto en chunks ───────────────────────────────────────────
function dividirEnChunks(texto) {
    const chunksResult = [];
    // Limpiar texto: quitar líneas vacías múltiples
    const textoLimpio = texto.replace(/\n{3,}/g, "\n\n").trim();

    for (let i = 0; i < textoLimpio.length; i += CHUNK_SIZE - CHUNK_OVERLAP) {
        const chunk = textoLimpio.slice(i, i + CHUNK_SIZE).trim();
        if (chunk.length > 50) { // Ignorar chunks muy pequeños
            chunksResult.push(chunk);
        }
    }
    return chunksResult;
}

// ─── RAG: Generar embeddings para los chunks ────────────────────────────────
async function generarEmbeddings(chunks) {
    console.log(`\n🧮 Generando embeddings para ${chunks.length} chunks...`);
    const inicio = Date.now();
    const embeddings = [];

    for (let i = 0; i < chunks.length; i++) {
        const resp = await ollama.embed({
            model: MODELO_EMBED,
            input: chunks[i],
        });
        embeddings.push(resp.embeddings[0]);

        // Mostrar progreso cada 10 chunks
        if ((i + 1) % 10 === 0 || i === chunks.length - 1) {
            console.log(`   Progreso: ${i + 1}/${chunks.length} chunks`);
        }
    }

    const duracion = ((Date.now() - inicio) / 1000).toFixed(1);
    console.log(`✅ Embeddings generados en ${duracion}s`);
    return embeddings;
}

// ─── RAG: Similitud coseno ──────────────────────────────────────────────────
function similitudCoseno(a, b) {
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// ─── RAG: Buscar chunks relevantes ──────────────────────────────────────────
async function buscarChunksRelevantes(pregunta, topK = TOP_K) {
    console.log(`🔍 Buscando los ${topK} chunks más relevantes...`);
    const inicio = Date.now();

    // Generar embedding de la pregunta
    const resp = await ollama.embed({
        model: MODELO_EMBED,
        input: pregunta,
    });
    const queryEmbedding = resp.embeddings[0];

    // Calcular similitud con cada chunk
    const scores = chunkEmbeddings.map((emb, i) => ({
        index: i,
        score: similitudCoseno(queryEmbedding, emb),
        texto: chunks[i],
    }));

    // Ordenar por relevancia y tomar los top-K
    const relevantes = scores.sort((a, b) => b.score - a.score).slice(0, topK);

    const duracion = ((Date.now() - inicio) / 1000).toFixed(1);
    console.log(`✅ Búsqueda completada en ${duracion}s`);
    relevantes.forEach((r, i) => {
        console.log(`   ${i + 1}. Chunk #${r.index} (similitud: ${(r.score * 100).toFixed(1)}%) - "${r.texto.slice(0, 60)}..."`);
    });

    return relevantes;
}

// ─── Cargar PDF y preparar RAG ──────────────────────────────────────────────
async function cargarPDF() {
    try {
        if (!fs.existsSync("./docs/example.pdf")) {
            console.error("❌ No se encontró el archivo ./docs/example.pdf");
            return;
        }

        console.log("📄 Cargando PDF...");
        const buffer = fs.readFileSync("./docs/example.pdf");
        const data = await pdfParse(buffer);
        console.log(`✅ PDF cargado: ${data.numpages} páginas, ${data.text.length} caracteres`);

        // Dividir en chunks
        chunks = dividirEnChunks(data.text);
        console.log(`📦 Documento dividido en ${chunks.length} chunks (${CHUNK_SIZE} chars, ${CHUNK_OVERLAP} overlap)`);

        // Generar embeddings
        chunkEmbeddings = await generarEmbeddings(chunks);

        documentoCargado = true;
        console.log(`\n🚀 RAG listo! ${chunks.length} chunks indexados.\n`);
    } catch (error) {
        console.error("❌ Error al cargar el PDF:", error);
    }
}

// ─── Consultar Ollama con contexto RAG ──────────────────────────────────────
async function consultarOllama(pregunta, contextoChunks) {
    const inicio = Date.now();

    // Construir contexto solo con chunks relevantes
    const contexto = contextoChunks
        .map((c, i) => `[Fragmento ${i + 1}]:\n${c.texto}`)
        .join("\n\n");

    // Estimar tokens (1 token ≈ 4 caracteres en español)
    const VENTANA_CONTEXTO = 4096; // tokens del modelo
    const systemPrompt = `Eres un asistente que responde preguntas basándote ÚNICAMENTE en los fragmentos del documento proporcionados. Si la información no está en los fragmentos, di que no encontraste esa información en el documento.`;
    const tokensSystem = Math.ceil(systemPrompt.length / 4);
    const tokensContexto = Math.ceil(contexto.length / 4);
    const tokensPregunta = Math.ceil(pregunta.length / 4);
    const tokensUsados = tokensSystem + tokensContexto + tokensPregunta;
    const tokensDisponibles = VENTANA_CONTEXTO - tokensUsados;

    console.log(`\n📨 [${new Date().toLocaleTimeString()}] Enviando consulta a Ollama (modelo: ${MODELO_CHAT})...`);
    console.log(`   ┌─────────────────────────────────────────────┐`);
    console.log(`   │  📊 USO DE VENTANA DE CONTEXTO (${VENTANA_CONTEXTO} tokens) │`);
    console.log(`   ├─────────────────────────────────────────────┤`);
    console.log(`   │  System prompt:  ~${String(tokensSystem).padStart(4)} tokens (${systemPrompt.length} chars)  │`);
    console.log(`   │  Contexto RAG:   ~${String(tokensContexto).padStart(4)} tokens (${contexto.length} chars)  │`);
    console.log(`   │  Pregunta:       ~${String(tokensPregunta).padStart(4)} tokens (${pregunta.length} chars)  │`);
    console.log(`   ├─────────────────────────────────────────────┤`);
    console.log(`   │  Total usado:    ~${String(tokensUsados).padStart(4)} tokens (${((tokensUsados / VENTANA_CONTEXTO) * 100).toFixed(0)}%)              │`);
    console.log(`   │  Disponible:     ~${String(Math.max(0, tokensDisponibles)).padStart(4)} tokens para respuesta  │`);
    console.log(`   └─────────────────────────────────────────────┘`);
    console.log(`   📉 Reducción vs PDF completo: ${(100 - (contexto.length / 25933 * 100)).toFixed(0)}% menos texto`);

    if (tokensDisponibles < 200) {
        console.warn(`   ⚠️ Pocos tokens disponibles para respuesta. Considera reducir TOP_K.`);
    }

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => {
            controller.abort();
            console.error(`❌ [${new Date().toLocaleTimeString()}] TIMEOUT: Ollama no respondió en ${TIMEOUT_MS / 1000}s`);
        }, TIMEOUT_MS);

        const response = await ollama.chat({
            model: MODELO_CHAT,
            messages: [
                {
                    role: "system",
                    content: `Eres un asistente que responde preguntas basándote ÚNICAMENTE en los fragmentos del documento proporcionados. Si la información no está en los fragmentos, di que no encontraste esa información en el documento.`,
                },
                {
                    role: "user",
                    content: `Contexto del documento:\n${contexto}\n\nPregunta: ${pregunta}`,
                },
            ],
            signal: controller.signal,
        });

        clearTimeout(timeout);
        const duracion = ((Date.now() - inicio) / 1000).toFixed(1);
        console.log(`✅ [${new Date().toLocaleTimeString()}] Respuesta recibida en ${duracion}s`);
        console.log(`   Largo de respuesta: ${response.message.content.length} caracteres`);

        return response.message.content;
    } catch (error) {
        const duracion = ((Date.now() - inicio) / 1000).toFixed(1);
        console.error(`❌ [${new Date().toLocaleTimeString()}] Error después de ${duracion}s:`);
        console.error(`   Tipo: ${error.name}`);
        console.error(`   Mensaje: ${error.message}`);
        if (error.name === "AbortError") {
            throw new Error(`Ollama no respondió en ${TIMEOUT_MS / 1000} segundos.`);
        }
        throw error;
    }
}

// ─── Rutas ──────────────────────────────────────────────────────────────────
app.post("/preguntar", async (req, res) => {
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📥 [${new Date().toLocaleTimeString()}] Nueva pregunta recibida`);
    try {
        const {pregunta} = req.body;
        console.log(`   Pregunta: "${pregunta}"`);

        if (!pregunta || pregunta.trim() === "") {
            console.log(`   ⚠️ Pregunta vacía, rechazada`);
            return res
                .status(400)
                .json({respuesta: "Por favor, ingresa una pregunta."});
        }

        if (!documentoCargado) {
            console.log(`   ⚠️ Documento no cargado aún`);
            return res.status(503).json({
                respuesta: "El documento aún se está cargando. Intenta nuevamente en unos segundos.",
            });
        }

        // RAG: buscar chunks relevantes en vez de enviar todo
        const chunksRelevantes = await buscarChunksRelevantes(pregunta);

        const respuesta = await consultarOllama(pregunta, chunksRelevantes);
        console.log(`📤 [${new Date().toLocaleTimeString()}] Respuesta enviada al cliente`);
        res.json({respuesta});
    } catch (error) {
        console.error("❌ Error en /preguntar:", error);
        res.status(500).json({
            respuesta: "Error al procesar la pregunta. Asegúrate de que Ollama está ejecutándose.",
        });
    }
});

app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        documentoCargado,
        totalChunks: chunks.length,
        modelo: MODELO_CHAT,
        modeloEmbeddings: MODELO_EMBED,
    });
});

// ─── Iniciar ────────────────────────────────────────────────────────────────
app.listen(3000, async () => {
    console.log("🚀 Servidor corriendo en http://localhost:3000");
    await verificarOllama();
    await cargarPDF();
});
