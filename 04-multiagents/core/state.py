class AgentState:
    def __init__(self, problem):
        self.problem = problem
        self.answers = []
        self.design = None
        self.code = None
        self.review = None
        self.tests = None