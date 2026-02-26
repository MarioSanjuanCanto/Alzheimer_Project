from exercise_agents.fill_in_the_blank import fill_in_the_blanK
from exercise_agents.multiple_choice import multiple_choice
from exercise_agents.ordering import ordering



class orquestrator:
    def __init__(self):
        self.memory = None
        self.agents = {"fill_in_the_blank": fill_in_the_blanK("Fill in the blanck"), "multiple_choice": multiple_choice("Multiple choice"), "ordering": ordering("Ordering")}


    def generate(self, memory_data, user_id):
        
        # 1.We send data to the selector to divide it for the exercises:
        print(self.agents["fill_in_the_blank"].generate_exercise("say hello"))

orquestrator().generate("say hello", "1")