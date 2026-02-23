from dotenv import load_dotenv
from openai import OpenAI
import os
import json
import db

load_dotenv()  # Load environment variables from .env

client = OpenAI(api_key=os.getenv("OPENROUTER_API_KEY"), base_url=os.getenv("OPENROUTER_URL"))


# ______________________________________ Exercise Generation ______________________________________

def generate_cognitive_exercises(memory_data, strategy=None, user_id=None):
    """
    Generates personalized cognitive exercises. 
    Now requests 3 different types in a single call for better consistency and performance.
    """
    print(f"[logic] generate_cognitive_exercises for user {user_id} with strategy {strategy}")

    difficulty_prompt = strategy.get("difficulty", "media") if strategy else "media"

    # --- Prompt creation ---
    prompt = f"""
Create 3 therapeutic cognitive stimulation exercises based on this memory. 
You MUST create exactly one of each type: 'multiple_choice', 'fill_in_the_blank', and 'ordering'.

Title: {memory_data.get('title', 'Untitled')}
Description: {memory_data.get('user_description', '')}
AI Analysis: {json.dumps(memory_data.get('ai_analysis', {}), ensure_ascii=False)}

EXERCISE REQUIREMENTS:
- TOTAL EXERCISES: 3
- TYPES INCLUDED: 1x multiple_choice, 1x fill_in_the_blank, 1x ordering
- DIFFICULTY: {difficulty_prompt}
- LANGUAGE: Spanish

EXACT JSON FORMAT:
Respond with a JSON object containing an 'exercises' array with the 3 exercises.

- For multiple choice:
  "options" is an array of strings, "correct_answer" is the index of the correct answer.
  {{
    "type": "multiple_choice",
    "question": "...",
    "options": ["...", "...", "..."],
    "correct_answer": 0,
    "hint": "...", "difficulty": "..."
  }}

- For fill-in-the-blank:
  "question" is an open ended question. The question may not exceed 150 characters.
  "correct_answer" is a string with the correct word or phrase.
  {{
    "type": "fill_in_the_blank",
    "question": "...",
    "correct_answer": "...",
    "hint": "...", "difficulty": "..."
  }}

- For ordering:
  "options" is an array of 3-4 unordered events/steps.
  "correct_answer" is an array of the same strings in the correct chronological order.
  {{
    "type": "ordering",
    "question": "...",
    "options": ["...", "...", "..."],
    "correct_answer": ["...", "...", "..."],
    "hint": "...", "difficulty": "..."
  }}

IMPORTANT: Respond ONLY with the requested JSON, without additional text.
"""

    # --- AI model response ---
    try:
        response = client.chat.completions.create(
            model="openrouter/free",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=2000
        )
        response_text = response.choices[0].message.content
        print(f"[logic] Raw AI response:\n{response_text}") 

        # Robust JSON cleaning
        clean_text = response_text.strip()
        if "```" in clean_text:
            # Try to extract content between ```json and ``` or just ``` and ```
            if "```json" in clean_text:
                clean_text = clean_text.split("```json")[1].split("```")[0].strip()
            else:
                clean_text = clean_text.split("```")[1].split("```")[0].strip()
        
        data = json.loads(clean_text)
        if isinstance(data, dict) and 'exercises' in data:
            return data
        elif isinstance(data, list):
            return {"exercises": data}
        else:
            print("[logic] JSON valid but format unexpected")
            return generate_fallback_exercises(memory_data, count=3)

    except Exception as e:
        print(f"Error in 'generate_cognitive_exercises': {e}")
        try:
            # If json.loads failed, let's see what it was trying to parse
            print(f"[logic] Failed to parse this text: {clean_text if 'clean_text' in locals() else 'N/A'}")
        except:
            pass
        return generate_fallback_exercises(memory_data, count=3)

def generate_fallback_exercises(memory_data, count=1):
    """Generates fallback exercises if the AI fails."""
    print(f"[logic] generate_fallback_exercises(count={count})")

    fallbacks = [
        {
            "type": "multiple_choice",
            "question": f"Sobre el recuerdo '{memory_data.get('title', 'el evento')}', ¿quiénes crees que son las personas principales?",
            "options": ["Familia", "Amigos", "Conocidos", "No estoy seguro"],
            "correct_answer": 0,
            "hint": "Piensa en las personas más cercanas a ti.",
            "difficulty": "fácil"
        },
        {
            "type": "fill_in_the_blank",
            "question": "¿Cómo describirías el sentimiento general de este recuerdo en una palabra?",
            "correct_answer": "Feliz",
            "hint": "Puede ser alegría, paz, emoción...",
            "difficulty": "media"
        },
        {
            "type": "ordering",
            "question": "Ordena estos momentos típicos de una celebración:",
            "options": ["Llegada", "Comida", "Despedida"],
            "correct_answer": ["Llegada", "Comida", "Despedida"],
            "hint": "Piensa en el orden lógico del tiempo.",
            "difficulty": "media"
        }
    ]
    
    if count == 1:
        return {"exercises": [fallbacks[0]]}
    
    return {"exercises": fallbacks[:count]}

# ______________________________________ Strategy Planning ______________________________________

def determine_next_exercise_strategy(user_id=None):
    """
    Simplified strategy function for the API.
    For now, it returns a general strategy.
    """
    print(f"[logic] determine_next_exercise_strategy for user {user_id}")

    user_stats = db.get_user_stats(user_id)
    print(f"[logic] {user_stats}")


    # In the future, this function could receive the user's performance history
    # not necessary now
    return {"type": "general", "difficulty": "media", "exclude_types": []}


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




