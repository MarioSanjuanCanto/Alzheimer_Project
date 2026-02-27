from exercise_agents.base_agent import BaseAgent
import json

class selector(BaseAgent):
    def __init__(self):
        super().__init__("Selector")
    
    def select(self, title, description, analysis, exercise_types):
        print(f"[selector] Selecting content for: {exercise_types}")

        prompt = [
            {
                "role": "system",
                "content": (
                    "Eres un procesador de memoria especializado para una aplicación de terapia cognitiva para personas con Alzheimer. "
                    "Tu tarea es tomar una memoria específica (título, descripción y análisis de IA) y dividir/adaptar su contenido "
                    "para diferentes tipos de generadores de ejercicios.\n\n"
                    "El objetivo es generar un objeto JSON donde cada clave sea el nombre del tipo de ejercicio y el valor sea el contenido "
                    "específicamente adaptado que sea útil para ese generador:\n"
                    "- 'multiple_choice': Céntrate en hechos concretos, nombres, fechas o detalles específicos que permitan crear alternativas falsas claras.\n"
                    "- 'fill_in_the_blank': Céntrate en sustantivos o verbos clave que sean cruciales para el contexto y significativos de recordar.\n"
                    "- 'ordering': Céntrate en la secuencia cronológica de eventos o pasos mencionados en la memoria.\n\n"
                    "Formato de respuesta: Debes devolver ÚNICAMENTE un objeto JSON válido con este formato exacto:\n"
                    "{\"tipo_ejercicio1\": \"contenido adaptado...\", \"tipo_ejercicio2\": \"contenido adaptado...\"}\n"
                    "No incluyas explicaciones adicionales, solo el JSON."
                )
            },
            {
                "role": "user",
                "content": (
                    f"Título de la Memoria: {title}\n"
                    f"Descripción de la Memoria: {description}\n"
                    f"Análisis de IA: {analysis}\n\n"
                    f"Tipos de ejercicios solicitados: {exercise_types}\n\n"
                    "Genera el JSON ahora."
                )
            }
        ]

        try:
            response = self._call_llm(prompt)
            # Remove any markdown code block indicators if present
            if response.startswith("```json"):
                response = response[7:-3].strip()
            elif response.startswith("```"):
                response = response[3:-3].strip()
            
            content_dict = json.loads(response)
            return content_dict
        except Exception as e:
            print(f"[selector] Error during selection: {e}")
            # Fallback: return the same description for everything if LLM fails
            return {etype: f"{title}: {description}" for etype in exercise_types}
