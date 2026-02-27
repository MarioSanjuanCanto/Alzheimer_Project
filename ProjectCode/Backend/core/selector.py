import json
from crewai import Agent, Task
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

        # Construir ruta absoluta a config/agents.yaml
        config_path = os.path.join(backend_dir, "config", "agents.yaml")

        with open(config_path, "r") as f:
            self.agents_config = yaml.safe_load(f)

        self.selector_agent = Agent(
            **self.agents_config["selector_agent"]
        )

    
    def select(self, title, description, analysis, exercise_types):
        print(f"[selector] Selecting content for: {exercise_types}")

        prompt = f"""
Título de la Memoria: {title}
Descripción de la Memoria: {description}
Análisis de IA: {analysis}

Tipos de ejercicios solicitados: {exercise_types}

INSTRUCCIONES:
Genera un JSON donde cada clave sea el tipo de ejercicio y el valor el contenido adaptado.

Reglas:
- multiple_choice → hechos concretos, nombres, fechas.
- fill_in_the_blank → sustantivos o verbos clave.
- ordering → secuencia cronológica.

Devuelve ÚNICAMENTE JSON válido.
"""

        try:
            response = self.selector_agent.run(prompt)

            # Limpiar posible markdown
            if response.startswith("```"):
                response = response.strip("```json").strip("```").strip()

            return json.loads(response)

        except Exception as e:
            print(f"[selector] Error: {e}")
            return {etype: f"{title}: {description}" for etype in exercise_types}



       


