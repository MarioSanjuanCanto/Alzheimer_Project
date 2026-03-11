import os
import yaml
from crewai import Agent, Task, Crew, LLM
import json
from utils.json_utils import parse_llm_json

class FillInTheBlankAgent:
  def __init__(self, config_path):
    print("[fill_in_the_blank_agent] initialized")
    self.config_path = config_path

  def refresh(self):
    """Recrea Agent y Task frescos para evitar contaminación entre memorias."""
    with open(os.path.join(self.config_path, "agents.yaml"), "r") as f:
        agents_config = yaml.safe_load(f)

    llm = LLM(
        model="gpt-4o-mini",
        temperature=0
    )

    agents_config["fill_in_the_blank_agent"]["llm"] = llm

    self.agent = Agent(**agents_config["fill_in_the_blank_agent"])

    with open(os.path.join(self.config_path, "tasks.yaml"), "r") as f:
        tasks_config = yaml.safe_load(f)

    tasks_config["fill_in_the_blank_task"]["agent"] = self.agent
    self.task = Task(**tasks_config["fill_in_the_blank_task"])

  def generate(self, data:dict, validation="", difficulty="media"):
    print(f"[fill_in_the_blank_agent] Generating exercise")
    self.refresh()

    if validation != "":
      validation = "COSAS A MEJORAR: " + validation
    
    try:
        crew = Crew(
        agents=[self.agent],
        tasks=[self.task],
        verbose=False,
        memory=False
        )

        result = crew.kickoff(inputs={
        "informacion": data,
        "feedback_ia": validation
        })
        
        print("[fill_in_the_blank_agent] Raw: " + str(result.raw))
        result = result.raw.strip()
        parsed = parse_llm_json(result)

        # Post-procesado: reemplazar la palabra correct_answer por "_______" en la question
        word = parsed.get("correct_answer", "")
        question = parsed.get("question", "")
        if word and word in question:
            parsed["question"] = question.replace(word, "_______", 1)
        parsed["type"] = "fill_in_the_blank"
        
        return parsed
    except Exception as e:
        print(f"[fill_in_the_blank_agent] Error: {e}")
        return {}
