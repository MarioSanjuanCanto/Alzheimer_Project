from typing import List, Dict, Any

from core.selector import selector
from agents.exercise.multiple_choice import MultipleChoiceAgent
from agents.exercise.fill_in_the_blank import FillInTheBlankAgent
from agents.exercise.ordering import OrderingAgent
from agents.validation.verificador import VerificadorAgent
from agents.validation.corrector import CorrectorAgent

import database.db as db
import os
import yaml
import random
import math


class Orchestrator:
    def __init__(self):
        print("\033[93m[orchestrator]\033[0m orquestrator initialized")
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

    # --- Main pipeline ---
    def run_pipeline(self, title: str, description: str, analysis: str, user_id: str) -> Dict[str, Any]:
        print("\033[93m[orchestrator]\033[0m Running generation pipeline")

        # A) Get distribution first (needed to select different content per slot)
        difficulty, distribution = self.get_user_difficulty(user_id)
        print("\033[93m[orchestrator]\033[0m Difficulty: ", difficulty)

        # B) Select different content for each slot in the distribution
        # selector returns a LIST, one item per slot - different content for repeated types
        selected = self.selector.select(title, description, analysis, distribution)

        exercises = []
        for idx, ex_type in enumerate(distribution):
            gen = self.generators.get(ex_type)
            if not gen:
                continue

            # Variables del bucle
            status = 'error'
            validation = {}
            i = 0

            while status == 'error' and i < 3:
                # C) Generate exercise using the content for this specific slot
                print(f"\033[93m[orchestrator]\033[0m Generating {ex_type} (slot {idx})")
                data = selected[idx] if isinstance(selected, list) and idx < len(selected) else f'{title}: {description}'
                print(f"\033[93m[orchestrator]\033[0m Selected: {data}\n\n")
                exercise = gen.generate(data, validation=validation.get("Analysis", ""), difficulty=difficulty.get(ex_type, "media"))

                # D) Validate exercise
                validation = self.validators.get('verificador').validate(exercise, data, self.structures.get(ex_type))
        
                if validation.get('status') == 'ok':
                    exercises.append(exercise)
                    status = 'ok'
                elif i == 2:
                    exercises.append(exercise)
                    status = 'failed - last one chosen'
                else:
                    print(f"\033[93m[orquestrator]\033[0m Error detected, feedback received: {validation.get('Analysis','')}")
                    i += 1

        return exercises


    # --- Difficulty ---
    def get_user_difficulty(self, user_id:str):
        print("\033[93m[orchestrator]\033[0m get_user_difficulty")
        user_stats = db.get_user_stats(user_id)

        if not user_stats or user_stats == []:
            db.add_new_user_stats(user_id)
            return {"multiple_choice": "media", "fill_in_the_blank": "media", "ordering": "media"}

        # Now we can determine the strategy based on the user's performance
        user_stats = user_stats[0]

        strategy = {"multiple_choice": user_stats["multiple_choice_right"] / (user_stats["multiple_choice_done"] if user_stats["multiple_choice_done"] > 0 else 1), 
                    "fill_in_the_blank": user_stats["fill_in_the_blank_right"] / (user_stats["fill_in_the_blank_done"] if user_stats["fill_in_the_blank_done"] > 0 else 1), 
                    "ordering": user_stats["ordering_right"] / (user_stats["ordering_done"] if user_stats["ordering_done"] > 0 else 1)}
        
        distribution = self.decide_exercises_distribution(strategy)

        strategy["multiple_choice"] = self.difficulty_level(strategy["multiple_choice"])
        strategy["fill_in_the_blank"] = self.difficulty_level(strategy["fill_in_the_blank"])
        strategy["ordering"] = self.difficulty_level(strategy["ordering"])
        
        return (strategy, distribution)

    def difficulty_level(self, score:float):
        if score < 0.5:
            return "fácil"
        elif score < 0.8:
            return "media"
        else:
            return "difícil"

    def correct_fill_in_the_blank(self, user_answer: str, correct_answer:str):
        print("\033[93m[orchestrator]\033[0m correct_fill_in_the_blank")
        result = self.validators.get("corrector").correct_exercise(user_answer, correct_answer)
        return result


    # --- Adaptative Difficulty ---
    def adaptative_difficulty(self, current_level:int, score:float, levels:list= ["fácil", "medio", "difícil"], tresholds:list= [0.5, 0.8]):
        # Esperar cantidad de jugadas específica para decir
        # ---
        
        # Obtener y aplicar la acción a realizar
        action = self.upgrade_level(score, tresholds)
        new_level = current_level + action

        # Limitar el nivel
        if new_level < 0:
            new_level = 0
        elif new_level >= len(levels):
            new_level = len(levels) - 1
            
        return levels[new_level]

    def upgrade_level(self, score, tresholds):
        # Umbral de bajada
        if score < tresholds[0]:
            return -1
        # Umbral de mantenimiento
        elif score < tresholds[1]:
            return 0
        # Umbral de subida
        else:
            return 1

    # --- Distribution ---
    def softmax(self, scores):
        exp_scores = [math.exp(s) for s in scores]
        total = sum(exp_scores)
        return [e / total for e in exp_scores]
         
    def decide_exercises_distribution(self, strategy):
        print("\033[93m[orchestrator]\033[0m decide_exercises_distribution")

        nombres = list(strategy.keys())
        dificultades = list(strategy.values())

        # favorecer ejercicios fáciles
        scores = [(1 - d) for d in dificultades]

        # convertir a probabilidades
        probs = self.softmax(scores)
        print("\033[93m[orchestrator]\033[0m Probs: ", probs)

        # elegir 3 ejercicios con repetición
        resultado = random.choices(nombres, weights=probs, k=3)
        print("\033[93m[orchestrator]\033[0m Resultado: ", resultado)

        return resultado