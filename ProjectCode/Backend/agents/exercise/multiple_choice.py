import os
import yaml
from crewai import Agent, Task, Crew
import json

class MultipleChoiceAgent:
  def __init__(self, config_path):
    print("[multiple_choice_agent] initialized")

    # __________ Agents.yaml load __________

    # Construir ruta absoluta a config/agents.yaml
    agents_path = os.path.join(config_path, "agents.yaml")

    with open(agents_path, "r") as f:
        self.agents_config = yaml.safe_load(f)

    self.selector_agent = Agent(
        **self.agents_config["multiple_choice_agent"]
    )

    # ______ Tasks.yaml load ______

    # Construir ruta absoluta a config/tasks.yaml
    tasks_path = os.path.join(config_path, "tasks.yaml")

    with open(tasks_path, "r") as f:
        self.tasks_config = yaml.safe_load(f)

    # le asignamos el agente que hemos creado
    self.tasks_config["multiple_choice_task"]["agent"] = self.selector_agent
    self.selector_task = Task(
        **self.tasks_config["multiple_choice_task"]
    )

  def generate(self, data:dict):
    print(f"[multiple_choice_agent] Generating exercise: " + str(data))
    
    try:
        selector_crew = Crew(
        agents=[self.selector_agent],
        tasks=[self.selector_task],
        verbose=True
        )

        result = selector_crew.kickoff(inputs={
        "informacion": data
        })

        result = result.raw.strip()
        parsed = json.loads(result)

        return parsed
    except Exception as e:
        print(f"[multiple_choice_agent] Error: {e}")
        return {}

