from dotenv import load_dotenv
from openai import OpenAI
import os
import json
import db

load_dotenv()  # Load environment variables from .env

client = OpenAI(api_key=os.getenv("OPENROUTER_API_KEY"), base_url=os.getenv("OPENROUTER_URL"))


# ______________________________________ Exercise Generation ______________________________________

all_types = ["multiple_choice", "fill_in_the_blank", "ordering"]

def generate_cognitive_exercises(memory_data, strategy=None, exclude_types=None):
    """
    Generates personalized cognitive exercises based on a strategy,
    with the option to exclude certain types of exercises.
    """
    print(f"[logic] generate_cognitive_exercises(,{strategy}, {exclude_types})")

    global all_types

    # --- Generate exercise type and difficulty prompt ---

    if strategy is None or strategy.get("type") == "general":
        available_types = [t for t in all_types if t not in (exclude_types or [])]

        if not available_types:
            available_types = all_types  # If all are excluded, use all

        exercise_type_prompt = f"a varied type of exercise (choose one from: {', '.join(available_types)})"
        difficulty_prompt = strategy.get("difficulty", "media") if strategy else "media"
    else:
        exercise_type_prompt = f"the exercise type '{strategy.get('type')}'"
        difficulty_prompt = strategy.get('difficulty', 'media')

    # --- Prompt creation ---
    prompt = f"""
Create 3 therapeutic cognitive stimulation exercise based on this memory:

Title: {memory_data.get('title', 'Untitled')}
Description: {memory_data.get('user_description', '')}
AI Analysis: {json.dumps(memory_data.get('ai_analysis', {}), ensure_ascii=False)}

EXERCISE REQUIREMENTS:
- TYPE: {exercise_type_prompt}
- DIFFICULTY: {difficulty_prompt}
- RESTRICTION: Do not generate an exercise of a type that has already been used if there are other options.

EXACT JSON FORMAT:
Respond with a JSON array containing 1 single exercise inside an 'exercises' object.

- For multiple choice:
  "options" is an array of strings, "correct_answer" is the index of the correct answer.
  {{
    "type": "multiple choice",
    "question": "Who appears in the photo?",
    "options": ["Family", "Friends", "Strangers"],
    "correct_answer": 0,
    "hint": "...", "difficulty": "easy"
  }}

- For fill-in-the-blank:
  "question" is an open ended question. The question may not exceed 150 characters
  "correct_answer" is a string with the correct word or phrase.
  {{
    "type": "fill_in_the_blank",
    "question": "What are the favorite flowers of your grandmother?",
    "correct_answer": "blue",
    "hint": "...", "difficulty": "medium"
  }}

- For ordering:
  "options" is an array of unordered events.
  "correct_answer" is an array of the same strings in the correct chronological order.
  {{
    "type": "ordering",
    "question": "Order the following events as you think they occurred:",
    "options": ["Arrival of guests", "Cutting the cake", "Opening of gifts"],
    "correct_answer": ["Arrival of guests", "Cutting the cake", "Opening of gifts"],
    "hint": "...", "difficulty": "hard"
  }}

IMPORTANT: Respond ONLY with the requested JSON, without additional text.
The JSON must be inside an 'exercises' object which is an array.

"""

    # --- AI model response ---
    try:
        print(prompt)
        response = client.chat.completions.create(

            model="openrouter/free",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1000
        )
        response_text = response.choices[0].message.content
        response_text = response_text.replace('```json', '').replace('```', '').strip()
        
        exercises_data = json.loads(response_text)
        if isinstance(exercises_data, list):
            return {"exercises": exercises_data}
        elif isinstance(exercises_data, dict) and 'exercises' not in exercises_data:
            return {"exercises": [exercises_data]}
        elif isinstance(exercises_data, dict) and 'exercises' in exercises_data:
            return exercises_data
        else:
            return generate_fallback_exercises(memory_data)

    except Exception as e:
        print(f"Error in 'generate_cognitive_exercises': {e}")
        return generate_fallback_exercises(memory_data)

def generate_fallback_exercises(memory_data, count=1):
    """Generates fallback exercises if the AI fails."""
    print("[logic] generate_fallback_exercises")


    fallback_exercise = {
        "type": "reconocimiento",
        "question": f"About the memory '{memory_data.get('title', 'memory')}', who do you think are the main people?",
        "options": ["Family", "Friends", "Acquaintances", "I'm not sure"],
        "correct_answer": 0,
        "hint": "Think about the most important people to you.",
        "difficulty": "easy"
    }
    
    exercises = [fallback_exercise for _ in range(count)]
    return {"exercises": exercises}

# ______________________________________ Strategy Planning ______________________________________

def determine_next_exercise_strategy():
    """
    Simplified strategy function for the API.
    For now, it returns a general strategy.
    """
    print("[logic] determine_next_exercise_strategy")

    # In the future, this function could receive the user's performance history
    # not necessary now
    return {"type": "general", "difficulty": "media", "exclude_types": []}


# ______________________________________ User Performance ______________________________________




# ______________________________________ Debugging ______________________________________

if __name__ == "__main__":
    print("[logic] Debugging")

    respone = client.chat.completions.create(
        model = "gpt-3.5-turbo",
        messages = [
            {"role": "user", "content": "Hello, what day it is"}
        ],
        max_tokens = 300
    )

    print(response.choices[0].message.content)




