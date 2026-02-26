from .base_agent import BaseAgent

class fill_in_the_blanK(BaseAgent):
  def generate_exercise(self, memory):
    prompt = [{"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": memory}]
    return self._call_llm(prompt)