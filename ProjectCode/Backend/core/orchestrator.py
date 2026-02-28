from typing import List, Dict, Any

from core.selector import selector
from agents.exercise.multiple_choice import MultipleChoiceAgent
from agents.exercise.fill_in_the_blank import FillInTheBlankAgent
from agents.exercise.ordering import OrderingAgent

from agents.validation.adecuacion import AdecuacionCognitivaAgent
from agents.validation.regulador_emocional import ReguladorEmocionalAgent
from agents.validation.verificador import VerificadorAgent

import database.db as db



class Orchestrator:
    def __init__(self):
        print("[orchestrator] orquestrator initialized")
        # 1) Selector
        self.selector = selector()

        # 2) Generators
        self.generators = {
            "multiple_choice": MultipleChoiceAgent(),
            "fill_in_the_blank": FillInTheBlankAgent(),
            "ordering": OrderingAgent(),
        }

        # 3) validators
        self.validators = [
            AdecuacionCognitivaAgent(),
            ReguladorEmocionalAgent(),
            VerificadorAgent(),
        ]

       

    def run_pipeline(self, title: str, description: str, analysis: str, exercise_types: List[str]) -> Dict[str, Any]:
        # A) adapt memory for each exercise type
        selected = self.selector.select(title, description, analysis, exercise_types)
        # selected = { "multiple_choice": "...", "ordering": "...", ... }
        '''
        # B) generate exercises
        exercises: Dict[str, Any] = {}
        for ex_type in exercise_types:
            gen = self.generators.get(ex_type)
            if not gen:
                continue
            raw = gen.generate(selected.get(ex_type, f"{title}: {description}"))
            exercises[ex_type] = safe_json_loads(raw)  # robust parsing

        # C) validate
        validations = {}
        for v in self.validators:
            validations[v.name] = v.validate(title, description, analysis, exercises)

        # D) persist
        save_generation(title, description, analysis, exercises, validations)

        return {"exercises": exercises, "validations": validations}'''


