from .base_agent import BaseAgent

class multiple_choice(BaseAgent):
    def generate_exercise(self, memory):
    
        prompt = [{"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": memory}]
    
        return self._call_llm(prompt)