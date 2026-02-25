import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

class BaseAgent:
    def __init__(self, name, memory):
        self.name = name
        self.memory = memory
        self.client = OpenAI(api_key = os.getenv("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"), base_url=os.getenv("https://openrouter.ai/api/v1"))


    def generate(self, prompt, model="openrouter/free"):
        response = 





