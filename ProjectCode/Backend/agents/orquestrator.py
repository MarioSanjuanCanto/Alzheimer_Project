from .exercise_agents.fill_in_the_blank import fill_in_the_blanK
from .exercise_agents.multiple_choice import multiple_choice
from .exercise_agents.ordering import ordering
from . import db
from .selector import selector
from .comprobation_agents.verificador import verificador


class orquestrator:
    def __init__(self):
        print("[orquestrator] orquestrator initialized")
        self.memory = None
        self.agents = {"fill_in_the_blank": fill_in_the_blanK("Fill in the blanck"), "multiple_choice": multiple_choice("Multiple choice"), "ordering": ordering("Ordering")}
        self.selector = selector()
        self.verificador = verificador()

    def generate(self, memory_data, user_id):
        
        # 1.We send data to the selector to divide it for the exercises:
        user_stats = db.get_user_stats(user_id)



      
        

orquestrator()