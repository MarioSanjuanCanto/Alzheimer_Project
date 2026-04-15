import json
from crewai import Agent, Task, Crew, LLM
import yaml
from dotenv import load_dotenv
import os

load_dotenv()

class selector:
    def __init__(self):
        print("\033[96m[selector]\033[0m initialized")
        current_dir = os.path.dirname(os.path.abspath(__file__))
        backend_dir = os.path.dirname(current_dir)
        self.config_path = os.path.join(backend_dir, "config")

    def refresh(self):
        """Recrea Agent y Task frescos para evitar contaminación entre memorias."""
        with open(os.path.join(self.config_path, "agents.yaml"), "r") as f:
            agents_config = yaml.safe_load(f)

        llm = LLM(
            model="gpt-4o-mini",
            temperature=0
        )
        agents_config["selector_agent"]["llm"] = llm

        self.selector_agent = Agent(**agents_config["selector_agent"])

        with open(os.path.join(self.config_path, "tasks.yaml"), "r") as f:
            tasks_config = yaml.safe_load(f)

        tasks_config["select_task"]["agent"] = self.selector_agent
        self.selector_task = Task(**tasks_config["select_task"])

    def select(self, title, description, analysis, distribution):
        print(f"\033[96m[selector]\033[0m Selecting content for distribution: {distribution}")
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
            "exercise_types": distribution
           })
           print("\033[96m[selector]\033[0m Raw: " + str(result.raw))
           result = result.raw.strip()
           parsed = json.loads(result)

           # Expect a JSON array, one item per slot
           if isinstance(parsed, list):
               return parsed

           # Fallback: if returned a dict (old format), map distribution to list
           return [parsed.get(ex_type, f"{title}: {description}") for ex_type in distribution]

        except Exception as e:
            print(f"\033[96m[selector]\033[0m Error: {e}")
            return [f"{title}: {description}" for _ in distribution]
