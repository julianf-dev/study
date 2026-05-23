import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from core.state import AgentState
from core.orchestrator import run_pipeline

def main():
    print("🤖 Clean Code AI Agent\n")

    problem = input("¿Qué quieres construir?\n> ")

    state = AgentState(problem)

    run_pipeline(state)

if __name__ == "__main__":
    main()