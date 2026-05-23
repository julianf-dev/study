from core.llm import call_llm

SYSTEM_PROMPT = """
Genera tests unitarios claros y útiles.
"""

def run(state):
    result = call_llm(SYSTEM_PROMPT, state.code)
    state.tests = result
    return state