from core.llm import call_llm

SYSTEM_PROMPT = """
Eres un revisor experto en Clean Code.

Detecta:
- Violaciones SRP
- Complejidad innecesaria
- Malos nombres

Devuelve:
- Problemas
- Código mejorado
"""

def run(state):
    result = call_llm(SYSTEM_PROMPT, state.code)
    state.review = result
    return state