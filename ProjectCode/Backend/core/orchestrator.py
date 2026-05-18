from shutil import ExecError
from typing import List, Dict, Any

from core.selector import selector
from agents.exercise.multiple_choice import MultipleChoiceAgent
from agents.exercise.fill_in_the_blank import FillInTheBlankAgent
from agents.exercise.ordering import OrderingAgent
from agents.validation.verificador import VerificadorAgent
from agents.validation.corrector import CorrectorAgent

from utils.email_sender import send_exercise_disabled_alert_email,send_all_exercises_disabled_alert_email

import database.db as db
import os
import yaml
import random
import math


class Orchestrator:
    def __init__(self):
        """ Initializes the orchestrator, loading agents and configurations. """
        print("\033[93m[orchestrator]\033[0m orquestrator initialized")
        # 1.1) Path to config file with agents info

        # Obtener ruta absoluta del archivo actual (core/selector.py)
        current_dir = os.path.dirname(os.path.abspath(__file__))

        # Subir un nivel (Backend/)
        backend_dir = os.path.dirname(current_dir)

        # Construir ruta absoluta a config/agents.yaml
        self.config_path = os.path.join(backend_dir, "config")

        # 1.2) Selector
        self.selector = selector()

        # 1.3) Generators
        self.generators = {
            "multiple_choice": MultipleChoiceAgent(self.config_path),
            "fill_in_the_blank": FillInTheBlankAgent(self.config_path),
            "ordering": OrderingAgent(self.config_path),
        }

        # 1.4) validators
        self.validators = {
            "verificador": VerificadorAgent(self.config_path),
            "corrector": CorrectorAgent(self.config_path),
        }


        # 2.1) Difficulty levels:
        self.difficulty_levels = ["fácil", "media", "difícil"]

        # 2.2) Exercise types:
        self.exercise_types = ["fill_in_the_blank", "multiple_choice", "ordering"]

        # 2.3) structures
        self.structures = {
            "fill_in_the_blank": {"type", "question", "correct_answer", "hint", "difficulty"}, 
            "multiple_choice": {"type", "question", "options", "correct_answer", "hint", "difficulty"}, 
            "ordering": {"type", "question", "options", "correct_answer", "hint", "difficulty"}
        }

    # --- Main pipeline ---
    def run_pipeline(self, title: str, description: str, analysis: str, user_id: str) -> Dict[str, Any]:
        """ Main pipeline to orchestrate the selection, generation, and validation of exercises. """
        print("\033[93m[orchestrator]\033[0m Running generation pipeline")

        # A) Get distribution first (needed to select different content per slot)
        difficulty = self.get_difficulties(user_id)
        distribution = self.get_distribution(user_id, difficulty)

        
        if distribution is None:
            # All exercises difficulty under the treshold - contact with caretaker
            return []


        print("\033[93m[orchestrator]\033[0m Difficulty: ", difficulty)

        # B) Select different content for each slot in the distribution
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

        print(f"\033[93m[orchestrator]\033[0m Generation status of {ex_type} : ", status)

        return exercises
    
    def correct_fill_in_the_blank(self, user_answer: str, correct_answer:str):
        """ Corrects a 'fill in the blank' exercise using the assigned agent. """
        print("\033[93m[orchestrator]\033[0m correct_fill_in_the_blank")
        result = self.validators.get("corrector").correct_exercise(user_answer, correct_answer)
        return result

    # --- Adaptative Difficulty ---

    def get_difficulties(self, user_id:str, min_done:int = 3):
        """ Calculates the difficulty levels for each exercise type based on user performance. """
        print("\033[93m[orchestrator]\033[0m get_difficulties")
        new_difficulties = {}

        #Read current levels from db
        scores = db.get_user_exercises_stats(user_id, self.exercise_types)

        for exercise_type, data in scores.items():
            done = data["score"]["done"]
            right = data["score"]["right"]
            current_level = data["current_level"]

            if done < min_done:
                print("\033[93m[orchestrator]\033[0m Minimum exercises treshold not reached yet")
                
                if current_level == -1:
                    new_difficulties[exercise_type] = None
                else:
                    new_difficulties[exercise_type] = self.difficulty_levels[current_level]
                
                continue

            score = right / done if done > 0 else 0

            new_difficulties[exercise_type] = self.adaptative_difficulty(user_id, exercise_type, current_level, score)  

            db.reset_exercise_stats(user_id, exercise_type)

        print("\033[93m[orchestrator]\033[0m New difficulties: ", new_difficulties)

        return new_difficulties

    def adaptative_difficulty(self, user_id, exercise_type:str, current_level:int, score:float, thresholds:tuple= (0.5, 0.8)):        
        """ Adjusts the difficulty level of a specific exercise type and returns the new difficulty string. """
        print(f"\033[93m[orchestrator]\033[0m adaptative_difficulty for {user_id} and {exercise_type}")  

        # Apply action
        action = self.update_level(score, thresholds) 
        print(f"\033[93m[orchestrator]\033[0m Action: {action}")
        new_level = current_level + action

        # Limit level
        if new_level < 0:
            # Remove exercise
            db.update_current_level(user_id, exercise_type, -1)

            # Alert caretaker
            self.alert_exercise_disabled_caretaker(user_id, exercise_type)

            return None
        elif new_level >= len(self.difficulty_levels):
            # Keep the maximum
            max_level = len(self.difficulty_levels) - 1
            db.update_current_level(user_id, exercise_type, max_level)
            return self.difficulty_levels[max_level]
        else:
            db.update_current_level(user_id, exercise_type, new_level)
            return self.difficulty_levels[new_level]

    def update_level(self, score, thresholds):
        """ Determines the direction to change the difficulty level (-1, 0, 1) based on score. """
        print("\033[93m[orchestrator]\033[0m update_level")
        # Umbral de bajada
        if score < thresholds[0]:
            return -1
        # Umbral de mantenimiento
        elif score < thresholds[1]:
            return 0
        # Umbral de subida
        else:
            return 1

    def get_distribution(self, user_id:str, difficulty:dict[str,str | None]):
        """ Filters and returns the exercise types that have an active difficulty level. """
        print("\033[93m[orchestrator]\033[0m get_distribution")
        distribution = []

        for ex_type, difficulty in difficulty.items():
            if difficulty is None:
                continue
            
            distribution.append(ex_type)
        
        if len(distribution) == 0 and len(self.exercise_types) > 0:
            # If no exercises available return first one and notice caretaker
            distribution = [self.exercise_types[0]]

            self.alert_all_exercises_disabled_caretaker(user_id)

            return distribution

        return distribution
    
    def alert_exercise_disabled_caretaker(self, user_id:str, ex_type:str):
        """ Sends an alert email to the caretaker when an exercise is deactivated. """
        print("\033[93m[orchestrator]\033[0m alert_caretaker")
        caretaker_id = db.get_patient_caretaker_id(user_id)

        if caretaker_id is None:
            return

        caretaker = db.get_admin_info(caretaker_id)[0]

        if caretaker is None:
            return

        patient = db.get_user_info(user_id)[0]

        if patient is None:
            return

        send_exercise_disabled_alert_email(caretaker["email"], patient["full_name"], user_id, ex_type)

    def alert_all_exercises_disabled_caretaker(self, user_id:str):
        """ Sends an alert email to the caretaker when all exercises are deactivated. """
        print("\033[93m[orchestrator]\033[0m alert_caretaker")
        caretaker_id = db.get_patient_caretaker_id(user_id)

        if caretaker_id is None:
            return

        caretaker = db.get_admin_info(caretaker_id)[0]

        if caretaker is None:
            return

        patient = db.get_user_info(user_id)[0]

        if patient is None:
            return

        send_all_exercises_disabled_alert_email(caretaker["email"], patient["full_name"], user_id)
                

