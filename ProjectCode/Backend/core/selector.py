import json
from crewai import Agent, Task, Crew, LLM
import yaml
from dotenv import load_dotenv
import os


load_dotenv()

class selector:
    def __init__(self):
        print("[selector] initialized")
        current_dir = os.path.dirname(os.path.abspath(__file__))
        backend_dir = os.path.dirname(current_dir)
        self.config_path = os.path.join(backend_dir, "config")

    def refresh(self):
        """Recrea Agent y Task frescos para evitar contaminación entre memorias."""
        with open(os.path.join(self.config_path, "agents.yaml"), "r") as f:
            agents_config = yaml.safe_load(f)

        llm = LLM(
            model="ollama/phi3:mini",
            temperature=0,
            base_url="http://localhost:11434"
        )
        agents_config["selector_agent"]["llm"] = llm

        self.selector_agent = Agent(**agents_config["selector_agent"])

        with open(os.path.join(self.config_path, "tasks.yaml"), "r") as f:
            tasks_config = yaml.safe_load(f)

        tasks_config["select_task"]["agent"] = self.selector_agent
        self.selector_task = Task(**tasks_config["select_task"])

    def select(self, title, description, analysis, exercise_types):
        print(f"[selector] Selecting content for: {exercise_types}")
        self.refresh()

        try:
           selector_crew = Crew(
            agents=[self.selector_agent],
            tasks=[self.selector_task],
            verbose=False,
            memory=False
           )

           result = selector_crew.kickoff(inputs={
            "title": title,
            "description": description,
            "analysis": analysis,
            "exercise_types": exercise_types
           })
           print("[selector] Raw: " + str(result.raw))
           result = result.raw.strip()
           parsed = json.loads(result)

           return parsed
        except Exception as e:
            print(f"[selector] Error: {e}")
            return {etype: f"{title}: {description}" for etype in exercise_types}
