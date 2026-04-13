from core.orchestrator import Orchestrator

class ExerciseService:
    # _____ Default Agents Flow _____    
    def __init__(self):
        self.orchestrator = Orchestrator()

    def generate(self, user_id, title: str, description: str, analysis: str, exercise_types):
        return self.orchestrator.run_pipeline(
            title=title,
            description=description,
            analysis=analysis,
            exercise_types=exercise_types,
            user_id=user_id
        )
    
    def correct_fill_in_the_blank(self, user_answer: str, correct_answer:str):
        return self.orchestrator.correct_fill_in_the_blank(user_answer, correct_answer)
    
