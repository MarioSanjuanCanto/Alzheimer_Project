import os
import yaml
from crewai import Agent, Task, Crew, LLM
import json
from utils.json_utils import parse_llm_json

class CorrectorAgent:
    def __init__(self, config_path):
        print("\033[95m[corrector]\033[0m initialized")
        self.config_path = config_path

    def refresh(self):
        """Recrea Agent y Task frescos para evitar contaminación entre memorias."""
        with open(os.path.join(self.config_path, "agents.yaml"), "r") as f:
            agents_config = yaml.safe_load(f)

        llm = LLM(
            model="gpt-4o-mini",
            temperature=0
        )

        agents_config["corrector_agent"]["llm"] = llm

        self.agent = Agent(**agents_config["corrector_agent"])

        with open(os.path.join(self.config_path, "tasks.yaml"), "r") as f:
            tasks_config = yaml.safe_load(f)

        task_name = "corrector_task"
        if task_name not in tasks_config:
             # Fallback simple si no existe la específica
             print(f"\033[95m[corrector_agent]\033[0m Advertencia: No existe la tarea {task_name}")
             return False

        tasks_config[task_name]["agent"] = self.agent
        self.task = Task(**tasks_config[task_name])
        return True

    def correct_exercise(self, user_answer: str, correct_answer:str):
        print("\033[95m[corrector]\033[0m Validating exercises")

        # Call the agent
        if not self.refresh():
            return {"status": "error", "Analysis": f"No se encontró la tarea"}
        
        try:
            crew = Crew(
                agents=[self.agent],
                tasks=[self.task],
                verbose=False,
                memory=False
            )

            result = crew.kickoff(inputs={
                "correct_answer": correct_answer,
                "user_answer": user_answer
            })

            print("\033[95m[corrector]\033[0m Raw: " + str(result.raw))
            result = result.raw.strip()
            parsed = parse_llm_json(result)

            return parsed
        except Exception as e:
            print(f"\033[95m[corrector]\033[0m Error: {e}")
            return {"status": "error", "Analysis": "Error en el proceso de corrección."}
