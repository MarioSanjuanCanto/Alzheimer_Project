import json
from crewai import Agent, Task, Crew
import yaml
from dotenv import load_dotenv
import os


load_dotenv()

class selector:
    def __init__(self):
        print("[selector] initialized")

        # Obtener ruta absoluta del archivo actual (core/selector.py)
        current_dir = os.path.dirname(os.path.abspath(__file__))

        # Subir un nivel (Backend/)
        backend_dir = os.path.dirname(current_dir)


        # ______ Agents.yaml load  ______

        # Construir ruta absoluta a config/agents.yaml
        config_path = os.path.join(backend_dir, "config", "agents.yaml")

        with open(config_path, "r") as f:
            self.agents_config = yaml.safe_load(f)

        self.selector_agent = Agent(
            **self.agents_config["selector_agent"]
        )

        # ______ Tasks.yaml load ______

        # Construir ruta absoluta a config/tasks.yaml
        config_path = os.path.join(backend_dir, "config", "tasks.yaml")

        with open(config_path, "r") as f:
            self.tasks_config = yaml.safe_load(f)

        # le asignamos el agente que hemos creado
        self.tasks_config["select_task"]["agent"] = self.selector_agent
        self.selector_task = Task(
            **self.tasks_config["select_task"]
        )


    
    def select(self, title, description, analysis, exercise_types):
        print(f"[selector] Selecting content for: {exercise_types}")

        try:
           selector_crew = Crew(
            agents=[self.selector_agent],
            tasks=[self.selector_task],
            verbose=True
           )

           result = selector_crew.kickoff(inputs={
            "title": title,
            "description": description,
            "analysis": analysis,
            "exercise_types": exercise_types
           })

           return result
        except Exception as e:
            print(f"[selector] Error: {e}")
            return {etype: f"{title}: {description}" for etype in exercise_types}



       


