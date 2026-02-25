import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

class BaseAgent:
    def __init__(self, name, memory):
        self.name = name
        self.memory = memory
        self.client = OpenAI(api_key = os.getenv("OPENROUTER_API_KEY"), base_url=os.getenv("OPENROUTER_URL"))


    def _call_llm(self, prompt, model="openrouter/free"):
        response = self.client.chat.completions.create(
            model = model,
            max_tokens = 2000,
            messages = prompt
        )

        return response.choices[0].message.content





