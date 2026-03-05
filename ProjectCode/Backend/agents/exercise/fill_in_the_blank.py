import os
import yaml
from crewai import Agent, Task, Crew, LLM
import json
from utils.json_utils import parse_llm_json

class FillInTheBlankAgent:
  def __init__(self, config_path):
    print("[fill_in_the_blank_agent] initialized")

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
    self.agents_config["fill_in_the_blank_agent"]["llm"] = llm

    self.selector_agent = Agent(
        **self.agents_config["fill_in_the_blank_agent"]
    )

    # ______ Tasks.yaml load ______

    # Construir ruta absoluta a config/tasks.yaml
    tasks_path = os.path.join(config_path, "tasks.yaml")

    with open(tasks_path, "r") as f:
        self.tasks_config = yaml.safe_load(f)

    # le asignamos el agente que hemos creado
    self.tasks_config["fill_in_the_blank_task"]["agent"] = self.selector_agent
    self.selector_task = Task(
        **self.tasks_config["fill_in_the_blank_task"]
    )

  def generate(self, data:dict):
    print(f"[fill_in_the_blank_agent] Generating exercise")
    
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
        
        print("[fill_in_the_blank_agent] Raw: " + str(result.raw))
        result = result.raw.strip()
        parsed = parse_llm_json(result)

        # Post-procesado: reemplazar la palabra correct_answer por "_______" en la question
        word = parsed.get("correct_answer", "")
        question = parsed.get("question", "")
        if word and word in question:
            parsed["question"] = question.replace(word, "_______", 1)
        
        print(f"[fill_in_the_blank_agent] Final question: {parsed.get('question')}")
        return parsed
    except Exception as e:
        print(f"[fill_in_the_blank_agent] Error: {e}")
        return {}

