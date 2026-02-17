
import os
import json
import uuid
import tempfile
import openai
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv() # Load environment variables from .env


# --- Type Mapping ---
# Maps external English names to internal Spanish names
TYPE_MAP_TO_INTERNAL = {
    'multiple_choice': 'reconocimiento',  # Default to 'reconocimiento' for multiple choice
    'fill_in_the_blank': 'completar_frase',
    'ordering': 'orden_cronologico'
}

# Maps internal Spanish names back to external English names
'''
TYPE_MAP_TO_EXTERNAL = {
    'reconocimiento': 'multiple_choice',
    'emocional': 'multiple_choice',
    'asociativo': 'multiple_choice',
    'completar_frase': 'fill_in_the_blank',
    'orden_cronologico': 'ordering'
}
'''

app = Flask(__name__)
CORS(app)


# --- OpenAI API Key Configuration ---
# Make sure the OPENAI_API_KEY environment variable is set
openai.api_key = os.getenv('OPENAI_API_KEY', None)

def transcribe_audio(audio_file_path):
    """Transcribe audio using OpenAI Whisper"""
    try:
        with open(audio_file_path, 'rb') as audio_file:
            transcript = openai.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file
            )
            return transcript.text
    except Exception as e:
        return f"Error en transcripción: {str(e)}"

def generate_cognitive_exercises(memory_data, strategy=None, exclude_types=None):
    """
    Generates personalized cognitive exercises based on a strategy,
    with the option to exclude certain types of exercises.
    """
    all_types = ["reconocimiento", "completar_frase", "orden_cronologico", "emocional", "asociativo"]

    if strategy is None or strategy.get("type") == "general":
        available_types = [t for t in all_types if t not in (exclude_types or [])]
        if not available_types:
            available_types = all_types  # If all are excluded, use all

        exercise_type_prompt = f"a varied type of exercise (choose one from: {', '.join(available_types)})"
        difficulty_prompt = strategy.get("difficulty", "media") if strategy else "media"
    else:
        exercise_type_prompt = f"the exercise type '{strategy.get('type')}'"
        difficulty_prompt = strategy.get('difficulty', 'media')


    prompt = f"""
Create 1 therapeutic cognitive stimulation exercise based on this memory:

Title: {memory_data.get('title', 'Untitled')}
Description: {memory_data.get('user_description', '')}
AI Analysis: {json.dumps(memory_data.get('ai_analysis', {}), ensure_ascii=False)}

EXERCISE REQUIREMENTS:
- TYPE: {exercise_type_prompt}
- DIFFICULTY: {difficulty_prompt}
- RESTRICTION: Do not generate an exercise of a type that has already been used if there are other options.

EXACT JSON FORMAT:
Respond with a JSON array containing 1 single exercise inside an 'exercises' object.

- For multiple choice ('reconocimiento', 'emocional', 'asociativo'):
  "options" is an array of strings, "correct_answer" is the index of the correct answer.
  {{
    "type": "reconocimiento",
    "question": "Who appears in the photo?",
    "options": ["Family", "Friends", "Strangers"],
    "correct_answer": 0,
    "hint": "...", "difficulty": "easy"
  }}

- For fill-in-the-blank ('completar_frase'):
  "question" contains the sentence with "______" in the place to be filled.
  "correct_answer" is a string with the correct word or phrase.
  {{
    "type": "completar_frase",
    "question": "In the image, the grandmother is wearing a ______ dress.",
    "correct_answer": "blue",
    "hint": "...", "difficulty": "medium"
  }}

- For ordering ('orden_cronologico'):
  "options" is an array of unordered events.
  "correct_answer" is an array of the same strings in the correct chronological order.
  {{
    "type": "orden_cronologico",
    "question": "Order the following events as you think they occurred:",
    "options": ["Arrival of guests", "Cutting the cake", "Opening of gifts"],
    "correct_answer": ["Arrival of guests", "Cutting the cake", "Opening of gifts"],
    "hint": "...", "difficulty": "hard"
  }}

IMPORTANT: Respond ONLY with the requested JSON, without additional text.
The JSON must be inside an 'exercises' object which is an array.
"""
    try:
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
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

def determine_next_exercise_strategy():
    """
    Simplified strategy function for the API.
    For now, it returns a general strategy.
    """
    # In the future, this function could receive the user's performance history
    # not necessary now
    return {"type": "general", "difficulty": "media", "exclude_types": []}

# API Endpoints 

@app.route('/api/generate_exercise', methods=['POST'])
def generate_exercise_endpoint():
    """
    Endpoint to generate a single cognitive exercise from memory data.
    Expects a JSON with 'title', 'user_description', and optionally 'ai_analysis'.
    """
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400

    memory_data = request.get_json()
    
    # Input data validation 
    if not memory_data or 'title' not in memory_data or 'user_description' not in memory_data:
        return jsonify({
            "error": "JSON must contain 'title' and 'user_description'.",
            "example": {
                "title": "Birthday at the beach",
                "user_description": "It was a sunny day, we celebrated grandma's birthday. All the grandchildren were there."
            }
        }), 400

    # --- Exercise generation logic ---
    # Check if a specific exercise type has been requested
    requested_type = memory_data.get("exercise_type")
    
    if requested_type:
        # Map the user-friendly name to the internal name
        internal_type = TYPE_MAP_TO_INTERNAL.get(requested_type, requested_type)
        strategy = {"type": internal_type, "difficulty": memory_data.get("difficulty", "media")}
    else:
        # Otherwise, the general default strategy is used
        strategy = determine_next_exercise_strategy()

    exercise_set = generate_cognitive_exercises(
        memory_data, 
        strategy, 
        exclude_types=[]
    )
    
    if not exercise_set or not exercise_set.get("exercises"):
        return jsonify({"error": "Could not generate exercise."}), 500

    # Map internal types back to user-friendly external types for the response
    for exercise in exercise_set.get("exercises", []):
        if exercise.get('type') in TYPE_MAP_TO_EXTERNAL:
            exercise['type'] = TYPE_MAP_TO_EXTERNAL[exercise['type']]

    return jsonify(exercise_set)

@app.route('/api/transcribe', methods=['POST'])
def transcribe_audio_endpoint():
    """API para transcribir audio"""
    try:
        audio_file = request.files.get('audio')
        if not audio_file:
            return jsonify({"success": False, "error": "Archivo de audio requerido"})

        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_audio_file:
            audio_file.save(temp_audio_file.name)
            temp_audio_path = temp_audio_file.name
        
        # Transcribir
        transcription = transcribe_audio(temp_audio_path)
        
        os.remove(temp_audio_path)
        
        if "Error en transcripción" in transcription:
            return jsonify({"success": False, "error": transcription})
            
        return jsonify({"success": True, "transcription": transcription})
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

@app.route('/api/test', methods=['GET'])
def test_endpoint():
    """Test endpoint to verify that the API is working."""
    return jsonify({
        "message": "The exercise generation API is active.",
        "usage": "Send a POST request to /api/generate_exercise with the memory data."
    })



if __name__ == '__main__':
    print("Starting Cognitive Exercise Generation API...")
    print("Test endpoint: http://localhost:5001/api/test")
    print("Main endpoint (POST): http://localhost:5001/api/generate_exercise")
    print("Audio Transcription endpoint (POST): http://localhost:5001/api/transcribe")
    
    # Runs on port 5001 to avoid collision with the main app
    app.run(debug=True, host='0.0.0.0', port=5001)
