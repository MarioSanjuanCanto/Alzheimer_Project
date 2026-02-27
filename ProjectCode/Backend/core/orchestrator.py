from exercise_agents.fill_in_the_blank import fill_in_the_blanK
from exercise_agents.multiple_choice import multiple_choice
from exercise_agents.ordering import ordering
import db
from selector import selector
from comprobation_agents.verificador import verificador


class orquestrator:
    def __init__(self):
        print("[orquestrator] orquestrator initialized")
        self.memory = None
        self.agents = {"fill_in_the_blank": fill_in_the_blanK("Fill in the blanck"), "multiple_choice": multiple_choice("Multiple choice"), "ordering": ordering("Ordering")}
        self.selector = selector()
        self.verificador = verificador()
        self.exercise_types = ["ordering", "fill_in_the_blank", "multiple_choice"]

    def generate(self, user_id, memory_data):
        print("[orquestrador] generate")
        
        # 1. Extract data from the input 
        user_stats = db.get_user_stats(user_id)
        memory_title = memory_data.get("title","Sin titulo")
        memory_description = memory_data.get("user_description","Sin descripcion")
        memory_analysis = memory_data.get("ai_analysis","Sin analisis")

        # 2. We send data to the selector to divide it for the exercises:
        strategy = self.selector.select(memory_title, memory_description, memory_analysis, self.exercise_types)
        
        # 3. Generate exercises using the selected content
        exercises = {}
        for exercise_type in self.exercise_types:
            content = strategy.get(exercise_type)
            if content:
                print(f"[orquestrator] Generating {exercise_type}...")
                exercises[exercise_type] = self.agents[exercise_type].generate_exercise(content)
        
        print("[orquestrator] Exercises generated successfully")
        return exercises

orquestrator().generate("38a71d49-27e4-4eed-84b0-6fef657e38b6", {"title": "De pesca con mi nieto", "user_description": "Este fin de semana he ido con mi nieto a pescar, no hemos pescado nada pero le he regalado un gorro y le ha gustado muchísimo"})