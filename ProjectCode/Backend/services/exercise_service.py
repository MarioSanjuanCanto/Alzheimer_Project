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
    
    # _____ Custom Agents Flow _____
    def generate_custom(self, flow_doc,user_id, title: str, description: str, analysis: str, exercise_types):
        return self.orchestrator.run_custom_pipeline(
            flow_doc,
            title=title,
            description=description,
            analysis=analysis,
            exercise_types=exercise_types,
            user_id=user_id
        )

e = ExerciseService()
e.generate_custom("flow_test.yaml", 1, "Día tranquilo en el parque", "Aquella tarde fui a pasear al parque como solía hacer a menudo. Caminé despacio por los senderos mientras observaba a la gente pasar y escuchaba el sonido de las hojas movidas por el viento. Me senté un rato en un banco a descansar y a contemplar el lago. El ambiente era tranquilo y agradable, y por un momento pude detenerme simplemente a disfrutar del silencio y de los pequeños detalles que me rodeaban.", "", ["multiple_choice", "ordering"])