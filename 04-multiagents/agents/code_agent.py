from core.llm import call_llm

SYSTEM_PROMPT = """
Eres un ingeniero senior.

Genera código limpio:
- Nombres claros
- Funciones pequeñas
- Sin duplicación
"""

def run(state):
    prompt = f"""
Problema:
{state.problem}

Diseño:
{state.design}
"""
    result = call_llm(SYSTEM_PROMPT, prompt)
    state.code = result
    return state