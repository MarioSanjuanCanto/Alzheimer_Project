from core.orchestrator import Orchestrator

class ExerciseService:
    def __init__(self):
        self.orchestrator = Orchestrator()

    def generate(self, user_id, title: str, description: str, analysis: str, exercise_types):
        '''return self.orchestrator.run_pipeline(
            title=title,
            description=description,
            analysis=analysis,
            exercise_types=exercise_types
        )'''
        pass