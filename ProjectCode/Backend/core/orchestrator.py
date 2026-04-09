from typing import List, Dict, Any

from core.selector import selector
from agents.exercise.multiple_choice import MultipleChoiceAgent
from agents.exercise.fill_in_the_blank import FillInTheBlankAgent
from agents.exercise.ordering import OrderingAgent

from agents.validation.adecuacion import AdecuacionCognitivaAgent
from agents.validation.regulador_emocional import ReguladorEmocionalAgent
from agents.validation.verificador import VerificadorAgent
from agents.validation.corrector import CorrectorAgent

import database.db as db
import os

class Orchestrator:
    def __init__(self):
        print("[orchestrator] orquestrator initialized")
        # 1) Path to config file with agents info
        # Obtener ruta absoluta del archivo actual (core/selector.py)
        current_dir = os.path.dirname(os.path.abspath(__file__))

        # Subir un nivel (Backend/)
        backend_dir = os.path.dirname(current_dir)

        # Construir ruta absoluta a config/agents.yaml
        self.config_path = os.path.join(backend_dir, "config")


        # 2) Selector
        self.selector = selector()

        # 3) Generators
        self.generators = {
            "multiple_choice": MultipleChoiceAgent(self.config_path),
            "fill_in_the_blank": FillInTheBlankAgent(self.config_path),
            "ordering": OrderingAgent(self.config_path),
        }

        # 4) validators
        self.validators = {
            "verificador": VerificadorAgent(self.config_path),
            "corrector": CorrectorAgent(self.config_path),
        }

        # 5) structures
        self.structures = {
            "fill_in_the_blank": {"type", "question", "correct_answer", "hint", "difficulty"}, 
            "multiple_choice": {"type", "question", "options", "correct_answer", "hint", "difficulty"}, 
            "ordering": {"type", "question", "options", "correct_answer", "hint", "difficulty"}
        }

    def run_pipeline(self, title: str, description: str, analysis: str, exercise_types: List[str], user_id: str) -> Dict[str, Any]:
        # A) adapt memory for each exercise type
        selected = self.selector.select(title, description, analysis, exercise_types)

        # B) Generate exercises
        difficulty = self.get_user_difficulty(user_id)
        print("[orchestrator] Difficulty: ", difficulty)

        exercises = []
        for ex_type in exercise_types:
            gen = self.generators.get(ex_type)
            if not gen:
                continue

            status = 'error'
            validation = {}
            i = 0

            while status == 'error' and i < 3:
                # C) Generate exercise
                print(f"[orchestrator] Generating {ex_type}")
                data = selected.get(ex_type, f'{title}: {description}')
                print(f"[orchestrator] Selected: {data}\n\n")
                exercise = gen.generate(data, validation.get("Analysis", ""), difficulty.get(ex_type, "media"))

                # D) Validate exercise
                validation = self.validators.get('verificador').validate(exercise, data, self.structures.get(ex_type))
        
                if validation.get('status') == 'ok':
                    exercises.append(exercise)
                    status = 'ok'
                elif i == 2:
                    exercises.append(exercise)
                    status = 'failed - last one chosen'
                else:
                    print(f"[orquestrator] Error detected, feedback received: {validation.get('Analysis','')}")
                    i += 1

        return exercises

    def get_user_difficulty(self, user_id:str):
        user_stats = db.get_user_stats(user_id)

        if not user_stats or user_stats == []:
            db.add_new_user_stats(user_id)
            return {"multiple_choice": "media", "fill_in_the_blank": "media", "ordering": "media"}

        # Now we can determine the strategy based on the user's performance
        user_stats = user_stats[0]
        
        if user_stats["multiple_choice_done"] >= 15 or user_stats["fill_in_the_blank_done"] >= 15 or user_stats["ordering_done"] >= 15:
            db.reset_user_stats(user_id)

        strategy = {"multiple_choice": self.difficulty_level(user_stats["multiple_choice_right"] / (user_stats["multiple_choice_done"] if user_stats["multiple_choice_done"] > 0 else 1)), 
                    "fill_in_the_blank": self.difficulty_level(user_stats["fill_in_the_blank_right"] / (user_stats["fill_in_the_blank_done"] if user_stats["fill_in_the_blank_done"] > 0 else 1)), 
                    "ordering": self.difficulty_level(user_stats["ordering_right"] / (user_stats["ordering_done"] if user_stats["ordering_done"] > 0 else 1))}
        return strategy

    def difficulty_level(self, score:float):
        if score < 0.5:
            return "fácil"
        elif score < 0.8:
            return "media"
        else:
            return "difícil"

    def correct_fill_in_the_blank(self, user_answer: str, correct_answer:str):
        result = self.validators.get("corrector").correct_exercise(user_answer, correct_answer)
        return result