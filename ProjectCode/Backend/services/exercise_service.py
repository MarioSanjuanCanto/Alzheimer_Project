from core.orchestrator import Orchestrator
import random
import re

class ExerciseService:
    # _____ Default Agents Flow _____    
    def __init__(self):
        print("\033[32m[ExerciseService]\033[0m Initializing ExerciseService")
        self.orchestrator = Orchestrator()

    def generate(self, user_id, title: str, description: str, analysis: str):
        print("\033[32m[ExerciseService]\033[0m Generating exercises")
        return self.orchestrator.run_pipeline(
            title=title,
            description=description,
            analysis=analysis,
            user_id=user_id
        ) 
    
    def correct_fill_in_the_blank(self, user_answer: str, correct_answer:str):
        print("\033[32m[ExerciseService]\033[0m Correcting fill in the blank")
        return self.orchestrator.correct_fill_in_the_blank(user_answer, correct_answer)
        
    def generate_fallback_exercises(self, memory_data, count=1):
        """Generates fallback exercises dynamically if the AI fails."""
        print("\033[32m[ExerciseService]\033[0m Generating fallback exercises")

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

    def debugging_service(self):
        pass



