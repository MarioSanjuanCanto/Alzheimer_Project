from dotenv import load_dotenv
from openai import OpenAI
import os
import json
import db
import random
import re

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
Crea 3 ejercicios de estimulación cognitiva terapéutica basados en este recuerdo. 
DEBES crear exactamente uno de cada tipo: 'multiple_choice', 'fill_in_the_blank', y 'ordering'.

Título: {memory_data.get('title', 'Sin título')}
Descripción: {memory_data.get('user_description', '')}
Análisis de IA: {json.dumps(memory_data.get('ai_analysis', {}), ensure_ascii=False)}

REQUISITOS DE LOS EJERCICIOS:
- TOTAL DE EJERCICIOS: 3
- TIPOS INCLUIDOS: 1x multiple_choice, 1x fill_in_the_blank, 1x ordering
- DIFICULTAD: {difficulty_prompt}
- IDIOMA: Español

FORMATO JSON EXACTO:
Responde con un objeto JSON que contenga un array 'exercises' con los 3 ejercicios.

- Para opción múltiple (multiple_choice):
  "options" es un array de strings (las opciones posibles), "correct_answer" es el índice de la respuesta correcta.
  {{
    "type": "multiple_choice",
    "question": "...",
    "options": ["...", "...", "..."],
    "correct_answer": 0,
    "hint": "...", "difficulty": "..."
  }}

- Para rellenar el hueco (fill_in_the_blank):
  "question" es una pregunta abierta o frase incompleta. La pregunta no debe exceder los 150 caracteres.
  "correct_answer" es un string con la palabra o frase correcta.
  {{
    "type": "fill_in_the_blank",
    "question": "...",
    "correct_answer": "...",
    "hint": "...", "difficulty": "..."
  }}

- Para ordenar (ordering):
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
    """Generates fallback exercises dynamically if the AI fails."""
    print(f"[logic] generate_fallback_exercises_dynamic(count={count})")

    title = memory_data.get('title', 'este recuerdo')
    description = memory_data.get('user_description', '')
    
    # Extract words from description
    words = re.findall(r'\b[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+\b', description)
    long_words = [w for w in words if len(w) > 4]
    
    # 1. Multiple Choice
    if len(long_words) > 0:
        correct_word = random.choice(long_words)
        generic_options = ["familia", "amigos", "viaje", "comida", "casa", "fiesta", "trabajo", "regalo"]
        options = random.sample([opt for opt in generic_options if opt.lower() != correct_word.lower()], 3) + [correct_word]
        random.shuffle(options)
        correct_idx = options.index(correct_word)
        mc_exercise = {
            "type": "multiple_choice",
            "question": f"Sobre el recuerdo '{title}', ¿cuál de estas palabras es clave en tu historia?",
            "options": options,
            "correct_answer": correct_idx,
            "hint": f"Empieza por la letra '{correct_word[0].upper()}'.",
            "difficulty": "media"
        }
    else:
        # Static fallback if description is too short
        mc_exercise = {
            "type": "multiple_choice",
            "question": f"Sobre el recuerdo '{title}', ¿cómo te sentiste principalmente?",
            "options": ["Feliz", "Nostálgico", "Tranquilo", "Emocionado"],
            "correct_answer": 0,
            "hint": "Casi todos los buenos recuerdos traen emociones positivas.",
            "difficulty": "fácil"
        }
        
    # 2. Fill in the blank
    fib_exercise = None
    if len(long_words) > 1:
        # Take a sentence and blank a word
        sentences = re.split(r'[.!?]+', description)
        valid_sentences = [s.strip() for s in sentences if len(s.split()) > 3]
        
        if valid_sentences:
            chosen_sentence = random.choice(valid_sentences)
            sentence_words = re.findall(r'\b[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+\b', chosen_sentence)
            blanks = [w for w in sentence_words if len(w) > 4]
            if blanks:
                blank_word = random.choice(blanks)
                # Replace the exact word in the sentence keeping punctuation
                question = re.sub(rf'\b{blank_word}\b', "______", chosen_sentence, count=1) + "."
                fib_exercise = {
                    "type": "fill_in_the_blank",
                    "question": question,
                    "correct_answer": blank_word,
                    "hint": f"La palabra tiene {len(blank_word)} letras y empieza por '{blank_word[:2]}'.",
                    "difficulty": "difícil"
                }
                
    if not fib_exercise:
        # Static fallback
        fib_exercise = {
            "type": "fill_in_the_blank",
            "question": f"¿Cómo de importante dirías que es este recuerdo '{title}'? (Muy importante / Algo importante)",
            "correct_answer": "Muy importante",
            "hint": "Probablemente tiene mucho valor para ti.",
            "difficulty": "media"
        }
        
    # 3. Ordering
    sentences = re.split(r'[.!?]+', description)
    valid_sentences = [s.strip() for s in sentences if len(s.split()) > 2]
    
    if len(valid_sentences) >= 3:
        # Extract first 3 or 4 valid sentences
        to_order = valid_sentences[:3]
        correct_order = list(to_order)
        # We need options shuffled
        shuffled = list(to_order)
        # Ensure it's not accidentally in the right order if possible
        attempts = 0
        while  shuffled == correct_order and attempts < 10:
            random.shuffle(shuffled)
            attempts += 1
            
        ord_exercise = {
            "type": "ordering",
            "question": f"Ordena cronológicamente estas partes de tu historia:",
            "options": shuffled,
            "correct_answer": correct_order,
            "hint": "Intenta recordar cómo empezó todo.",
            "difficulty": "difícil"
        }
    else:
        ord_exercise = {
            "type": "ordering",
            "question": f"Normalmente, ¿cómo sucedió el evento de '{title}'?",
            "options": ["Los preparativos", "El evento principal", "El momento posterior"],
            "correct_answer": ["Los preparativos", "El evento principal", "El momento posterior"],
            "hint": "Todo evento suele contar con un antes, un durante y un después.",
            "difficulty": "media"
        }
        
    fallbacks = [mc_exercise, fib_exercise, ord_exercise]
    
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
    
    if user_stats["multiple_choice_done"] >= 15 or user_stats["fill_in_the_blank_done"] >= 15 or user_stats["ordering_done"] >= 15:
        reset_user_stats(user_id)

    strategy = {"multiple_choice": difficulty_level(user_stats["multiple_choice_right"] / (user_stats["multiple_choice_done"] if user_stats["multiple_choice_done"] > 0 else 1)), 
                "fill_in_the_blank": difficulty_level(user_stats["fill_in_the_blank_right"] / (user_stats["fill_in_the_blank_done"] if user_stats["fill_in_the_blank_done"] > 0 else 1)), 
                "ordering": difficulty_level(user_stats["ordering_right"] / (user_stats["ordering_done"] if user_stats["ordering_done"] > 0 else 1))}


    return strategy

def difficulty_level(score:float):
    if score < 0.5:
        return "fácil"
    elif score < 0.8:
        return "media"
    else:
        return "difícil"

def update_exercise_stats(user_id, exercise_type, is_correct):
    print(f"[logic] update_exercise_stats({user_id}, {exercise_type}, {is_correct})")
    db.update_user_stats(user_id, exercise_type, is_correct)

def reset_user_stats(user_id):
    print(f"[logic] reset_user_stats({user_id})")
    db.reset_user_stats(user_id)

# ______________________________________ Debugging ______________________________________

if __name__ == "__main__":
    print("[logic] Debugging")





