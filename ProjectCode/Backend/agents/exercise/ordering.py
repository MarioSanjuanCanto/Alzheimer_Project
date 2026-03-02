import os
import yaml
from crewai import Agent, Task, Crew
import json

class OrderingAgent:
    def __init__(self, config_path):
        print("[ordering_agent] initialized")

        # __________ Agents.yaml load __________

        # Construir ruta absoluta a config/agents.yaml
        agents_path = os.path.join(config_path, "agents.yaml")

        with open(agents_path, "r") as f:
            self.agents_config = yaml.safe_load(f)

        self.ordering_agent = Agent(
            **self.agents_config["ordering_agent"]
        )

        # ______ Tasks.yaml load ______

        # Construir ruta absoluta a config/tasks.yaml
        tasks_path = os.path.join(config_path, "tasks.yaml")

        with open(tasks_path, "r") as f:
            self.tasks_config = yaml.safe_load(f)

        # le asignamos el agente que hemos creado
        self.tasks_config["ordering_task"]["agent"] = self.ordering_agent
        self.ordering_task = Task(
            **self.tasks_config["ordering_task"]
        )

    def generate(self, data:dict):
        print(f"[ordering_agent] Generating exercise: " + str(data))
        
        try:
            ordering_crew = Crew(
            agents=[self.ordering_agent],
            tasks=[self.ordering_task],
            verbose=True
            )

            result = ordering_crew.kickoff(inputs={
            "informacion": data
            })

            result = result.raw.strip()
            parsed = json.loads(result)

            return parsed
        except Exception as e:
            print(f"[ordering_agent] Error: {e}")
            return {}