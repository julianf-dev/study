from core.llm import call_llm

SYSTEM_PROMPT = """
Eres un arquitecto senior experto en Clean Code.

Proceso:
1. Haz preguntas si falta contexto
2. Define arquitectura clara
3. Aplica SRP, DRY, separación de responsabilidades

Responde en JSON:
{
  "preguntas": [],
  "diseno": ""
}
"""

def run(state):
    result = call_llm(SYSTEM_PROMPT, state.problem)
    state.design = result
    return state