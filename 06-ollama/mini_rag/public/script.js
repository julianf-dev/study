async function enviarPregunta() {
    const pregunta = document.getElementById("pregunta").value;
    const respuestaDiv = document.getElementById("respuesta");

    if (!pregunta.trim()) {
        respuestaDiv.textContent = "Por favor, ingresa una pregunta.";
        return;
    }

    respuestaDiv.textContent = "Procesando...";
    respuestaDiv.style.color = "#666";

    try {
        const res = await fetch("/preguntar", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({pregunta}),
        });

        if (!res.ok) {
            const errorData = await res.json();
            respuestaDiv.textContent =
                errorData.respuesta || "Error en el servidor";
            respuestaDiv.style.color = "#d32f2f";
            return;
        }

        const data = await res.json();
        respuestaDiv.textContent = data.respuesta;
        respuestaDiv.style.color = "#333";
    } catch (error) {
        respuestaDiv.textContent = "Error de conexión: " + error.message;
        respuestaDiv.style.color = "#d32f2f";
        console.error("Error:", error);
    }
}

// Permitir enviar con Enter
document.addEventListener("DOMContentLoaded", () => {
    const inputPregunta = document.getElementById("pregunta");
    if (inputPregunta) {
        inputPregunta.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                enviarPregunta();
            }
        });
    }
});
