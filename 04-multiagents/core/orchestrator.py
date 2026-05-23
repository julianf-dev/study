from agents import design_agent, code_agent, review_agent, test_agent

def run_pipeline(state, interactive=True):
    # 1. Diseño
    state = design_agent.run(state)

    if interactive:
        print("\n--- DISEÑO ---\n")
        print(state.design)

        user_input = input("\nResponde a las preguntas o ENTER para continuar:\n")
        if user_input:
            state.answers.append(user_input)
            state.problem += "\n" + user_input

    # 2. Código
    state = code_agent.run(state)

    print("\n--- CÓDIGO ---\n")
    print(state.code)

    # 3. Review
    state = review_agent.run(state)

    print("\n--- REVIEW ---\n")
    print(state.review)

    # 4. Tests
    state = test_agent.run(state)

    print("\n--- TESTS ---\n")
    print(state.tests)

    return state