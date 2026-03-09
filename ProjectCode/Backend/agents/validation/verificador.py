import os
import yaml
from crewai import Agent, Task, Crew, LLM
import json
from utils.json_utils import parse_llm_json

class VerificadorAgent:
    def __init__(self, config_path):
        print("[verificador_agent] initialized")
        self.config_path = config_path

    def refresh(self):
        """Recrea Agent y Task frescos para evitar contaminación entre memorias."""
        with open(os.path.join(self.config_path, "agents.yaml"), "r") as f:
            agents_config = yaml.safe_load(f)

        llm = LLM(
            model="gpt-4o-mini",
            temperature=0
        )

        agents_config["validator_agent"]["llm"] = llm

        self.agent = Agent(**agents_config["validator_agent"])

        with open(os.path.join(self.config_path, "tasks.yaml"), "r") as f:
            tasks_config = yaml.safe_load(f)

        tasks_config["validate_task"]["agent"] = self.agent
        self.task = Task(**tasks_config["validate_task"])

    def validate(self, exercise: dict, original_information: str, structure:dict):
        print("[verificador_agent] Validating exercises")

        # First thing verify the structure
        for key in structure:
            if key not in exercise:
                return {"status": "error", "Analysis": f"Estructura incorrecta, falta el apartado llamado {key}"}



        # Call the agent
        self.refresh()
        
        try:
            crew = Crew(
                agents=[self.agent],
                tasks=[self.task],
                verbose=False,
                memory=False
            )

            result = crew.kickoff(inputs={
                "ejercicio": json.dumps(exercise, ensure_ascii=False),
                "informacion_original": original_information
            })

            print("[verificador_agent] Raw: " + str(result.raw))
            result = result.raw.strip()
            parsed = parse_llm_json(result)

            return parsed
        except Exception as e:
            print(f"[verificador_agent] Error: {e}")
            return {"status": "error", "Analysis": "Error en el proceso de validación."}
