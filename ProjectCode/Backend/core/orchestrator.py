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
import yaml

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


        # Save the path to the custom flows
        self.custom_flows_path = os.path.join(backend_dir, "flows")

    # --- Main pipeline ---
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

    # --- Visual flow functions ---
    def run_custom_pipeline(self, flow_doc, user_id, title: str, description: str, analysis: str, exercise_types):
        
        nodes = []
        edges = []
        # Open the .yaml
        with open(os.path.join(self.custom_flows_path, flow_doc), 'r') as f:
            flow = yaml.safe_load(f)
            nodes = flow["nodes"]
            edges = flow["edges"]

            if not nodes or not edges:
                raise Exception("No nodes or edges passed in the .yaml file")

        node_results = {}
        
        for node in nodes:
            if node["type"] == "selector":
                node_results[node["id"]] = {"type":"selector", "agent": selector(), "params": {}}
            elif node["type"] == "generator":
                if node["ex_type"] == "ordering":
                    node_results[node["id"]] = {"type":"generator", "ex_type": "ordering", "agent": OrderingAgent(self.config_path), "params": {}}
                elif node["ex_type"] == "multiple_choice":
                    node_results[node["id"]] = {"type":"generator", "ex_type": "multiple_choice", "agent": MultipleChoiceAgent(self.config_path), "params": {}}
                elif node["ex_type"] == "fill_in_the_blank":
                    node_results[node["id"]] = {"type":"generator", "ex_type": "fill_in_the_blank", "agent": FillInTheBlankAgent(self.config_path), "params": {}}
            elif node["type"] == "validator":
                node_results[node["id"]] = {"type":"validator", "agent": VerificadorAgent(self.config_path), "params": {}}
        
        outputs = {}

        for edge in edges:
            source_id = edge["from"]
            target_id = edge["to"]

            # 1. Si el origen no se ha ejecutado (ej: el Selector al inicio), lo ejecutamos
            if source_id not in outputs:
                source_node = node_results[source_id]
                if source_node["type"] == "selector":
                    outputs[source_id] = self.run_selector(title, description, analysis, exercise_types)
                # Aquí podrías añadir más tipos de nodos iniciales si existieran

            # 2. Cogemos el output del origen para dárselo al destino
            data_from_source = outputs[source_id]
            target_node = node_results[target_id]

            # 3. Ejecutamos el destino (si no se ha ejecutado ya por otro cable)
            if target_id not in outputs:
                if target_node["type"] == "generator":
                    ex_type = target_node["ex_type"]
                    # Filtramos la data si viene de un selector
                    gen_input = data_from_source.get(ex_type) if isinstance(data_from_source, dict) else data_from_source
                    
                    outputs[target_id] = self.run_generator(ex_type, gen_input, feedback="", difficulty="media")
                    print(f"--- Nodo {target_id} ({ex_type}) ejecutado ---")

                elif target_node["type"] == "validator":
                    # El validador recibe lo que soltó el nodo anterior
                    # Tienes que saber el ex_type (puedes guardarlo en el nodo origen o pasarlo en el edge)
                    outputs[target_id] = self.run_validator("verificador", "multiple_choice", data_from_source, "info_referencia")
                    print(f"--- Nodo {target_id} validado ---")
                    
        return outputs

        


    def run_selector(self, title, description, analysis, exercise_types):
        return self.selector.select(title, description, analysis, exercise_types)
    
    def run_generator(self, ex_type, data, feedback, difficulty):
        gen = self.generators.get(ex_type)
        if not gen:
            return None
        return gen.generate(data, feedback, difficulty)

    def run_validator(self, val_type, ex_type, exercise, data):
        val = self.validators.get(val_type)
        if not val:
            return None
        
        structure = self.structures.get(ex_type)
        
        return val.validate(exercise, data, structure)
