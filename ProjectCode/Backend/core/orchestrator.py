from typing import List, Dict, Any

from core.selector import selector
from agents.exercise.multiple_choice import MultipleChoiceAgent
from agents.exercise.fill_in_the_blank import FillInTheBlankAgent
from agents.exercise.ordering import OrderingAgent

from agents.validation.adecuacion import AdecuacionCognitivaAgent
from agents.validation.regulador_emocional import ReguladorEmocionalAgent
from agents.validation.verificador import VerificadorAgent

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
        self.validators = [
            AdecuacionCognitivaAgent(),
            ReguladorEmocionalAgent(),
            VerificadorAgent(),
        ]

    def run_pipeline(self, title: str, description: str, analysis: str, exercise_types: List[str]) -> Dict[str, Any]:
        # A) adapt memory for each exercise type
        selected = self.selector.select(title, description, analysis, exercise_types)

    
        # B) generate exercises
        exercises = []
        for ex_type in exercise_types:
            gen = self.generators.get(ex_type)
            if not gen:
                continue
            exercises.append(gen.generate(selected.get(ex_type, f"{title}: {description}")))
        
        '''
        # C) validate
        validations = {}
        for v in self.validators:
            validations[v.name] = v.validate(title, description, analysis, exercises)

        # D) persist
        save_generation(title, description, analysis, exercises, validations)

        return {"exercises": exercises, "validations": validations}'''
        return exercises


