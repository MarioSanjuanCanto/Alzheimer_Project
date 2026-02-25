
class StudentMemory:
    
    def __init__(self):
        self.history = []
        self.level = "medium"
        self.common_errors = []

    def add_interaction(self, interaction):
        self.history.append(interaction)

    def get_recent(self, n=3):
        return self.history[-n:]