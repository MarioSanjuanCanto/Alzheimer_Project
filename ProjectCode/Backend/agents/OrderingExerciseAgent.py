from base_agent import BaseAgent

class OrderingExerciseAgent(BaseAgent):
    def generate(self, memory_data, strategy):
        prompt = f"""
Crea 1 ejercicios de estimulación cognitiva terapéutica de tipo 'ordering' basados en este recuerdo. 

REQUISITOS DE LOS EJERCICIOS:
- DIFICULTAD: fácil
- IDIOMA: Español

Título: {memory_data.get('title', 'Sin título')}
Descripción: {memory_data.get('user_description', '')}

  "options" es un array de 3-4 eventos o pasos desordenados.
  "correct_answer" es un array con los mismos strings pero en el orden cronológico correcto.
  {{
    "type": "ordering",
    "question": "...",
    "options": ["...", "...", "..."],
    "correct_answer": ["...", "...", "..."],
    "hint": "...", "difficulty": "..."
  }}

IMPORTANTE: Responde ÚNICAMENTE con el JSON solicitado, sin texto adicional ni formato markdown.
        """

        message = [{"role": "user", "content": prompt}]
        return self._call_llm(message)
        
