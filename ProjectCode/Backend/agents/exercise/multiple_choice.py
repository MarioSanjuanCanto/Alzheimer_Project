import os
import yaml
from crewai import Agent, Task, Crew, LLM
import json
from utils.json_utils import parse_llm_json

class MultipleChoiceAgent:
  def __init__(self, config_path):
    print("[multiple_choice_agent] initialized")

    # __________ Agents.yaml load __________

    # Construir ruta absoluta a config/agents.yaml
    agents_path = os.path.join(config_path, "agents.yaml")

    with open(agents_path, "r") as f:
        self.agents_config = yaml.safe_load(f)

    llm = LLM(
        model="ollama/phi3:mini",
        temperature=0,
        base_url="http://localhost:11434"
    )
    self.agents_config["multiple_choice_agent"]["llm"] = llm

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
    print(f"[multiple_choice_agent] Generating exercise")
    
    try:
        selector_crew = Crew(
        agents=[self.selector_agent],
        tasks=[self.selector_task],
        verbose=False,
        memory=False
        )

        result = selector_crew.kickoff(inputs={
        "informacion": data
        })

        print("[multiple_choice_agent] Raw: " + str(result.raw))
        result = result.raw.strip()
        parsed = parse_llm_json(result)

        return parsed
    except Exception as e:
        print(f"[multiple_choice_agent] Error: {e}")
        return {}

