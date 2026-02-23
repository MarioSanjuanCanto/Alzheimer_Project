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

    difficulty_prompt = ""

    for exercise_type in strategy:
        difficulty_prompt += f"{exercise_type}:{strategy[exercise_type]} | "
        


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
        print(f"[logic] Error in 'generate_cognitive_exercises': {e}")
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

    # Check if the user is in the user stats table, if not, we add it with the reference 
    user_stats = db.get_user_stats(user_id)
    if not user_stats or user_stats == []:
       db.add_new_user_stats(user_id)

    # Now we can determine the strategy based on the user's performance
    user_stats = user_stats[0]
    
    strategy = {"multiple_choice": difficulty_level(user_stats["multiple_choice_right"] / (user_stats["multiple_choice_done"] if user_stats["multiple_choice_done"] > 0 else 1)), 
                "fill_in_the_blank": difficulty_level(user_stats["fill_in_the_blank_right"] / (user_stats["fill_in_the_blank_done"] if user_stats["fill_in_the_blank_done"] > 0 else 1)), 
                "ordering": difficulty_level(user_stats["ordering_right"] / (user_stats["ordering_done"] if user_stats["ordering_done"] > 0 else 1))}

    print("[logic] strategy selected: " + str(strategy))


    return strategy

def difficulty_level(score:float):
    if score < 0.3:
        return "fácil"
    elif score < 0.7:
        return "media"
    else:
        return "difícil"


# ______________________________________ Debugging ______________________________________

if __name__ == "__main__":
    print("[logic] Debugging")





