from flask import Flask, request, jsonify
from flask_cors import CORS
import database.db as db
from services.exercise_service import ExerciseService
from services.transcription_service import TranscriptionService

# ______________________________________ API END Points ______________________________________

print("\033[42m[INFO] Server initialized\033[0m")
app = Flask(__name__)
CORS(app)

@app.route('/api/transcribe', methods=['POST'])
def transcribe_audio_endpoint():
    """
    Endpoint to transcribe an audio file using OpenAI Whisper.
    Expects a multipart/form-data request with an 'audio' file.
    """
    print("\033[91m[app]\033[0m transcribe_audio_endpoint")

    if 'audio' not in request.files:
        return jsonify({"error": "No audio file provided. Send it as 'audio' in form-data."}), 400

    audio_file = request.files['audio']

    if audio_file.filename == '':
        return jsonify({"error": "Empty filename."}), 400

    try:
        service = TranscriptionService()
        transcription = service.transcribe(audio_file)
        return jsonify({"transcription": transcription}), 200
    except Exception as e:
        print(f"\033[91m[app]\033[0m Error transcribing audio: {e}")
        return jsonify({"error": "Could not transcribe audio.", "details": str(e)}), 500

@app.route('/api/excercise_correction', methods=['POST'])
def excercise_correction_endpoint():
    """
    Endpoint to correct cognitive exercises from memory data.
    """
    print("\033[91m[app]\033[0m excercise_correction_endpoint")

    # --- Request Input validation ---
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400

    # --- Extract exercise data ---
    exercise_data = request.get_json()
    user_id = exercise_data.get('user_id')
    exercise_type = exercise_data.get('exercise_type')
    resultado = exercise_data.get('resultado')

    if not exercise_data or not exercise_type or resultado is None:
        return jsonify({
            "error": "JSON must contain 'exercise_type' and 'resultado'."
        }), 400
    if user_id is None:
        return jsonify({
            "error": "JSON must contain 'user_id'."
        }), 400
    
    print(f"\033[91m[app]\033[0m Correcting exercise for user: {user_id} | Type: {exercise_type} | Result: {resultado}")

   # --- Evaluate exercise and update database values ---

    is_correct = (resultado == 'succeed')
    
    try:        
        # Update user stats in the database
        db.update_user_stats(user_id, exercise_type, is_correct)
        
        # --- Map difficulty and insert to exercise history ---
        difficulty_level = db.get_user_stats(user_id)[0].get(f"{exercise_type}_current_level", None)
        memory_id = exercise_data.get('memory_id')
        
        db.insert_exercise_history(
            user_id=user_id,
            exercise_type=exercise_type,
            is_correct=is_correct,
            difficulty_level=difficulty_level,
            memory_id=memory_id
        )
        return jsonify({"status": "success", "message": "Exercise stats updated."}), 200
    except Exception as e:
        print(f"\033[91m[app]\033[0m Error updating user stats: {e}")
        return jsonify({"error": "Could not update user stats."}), 500

@app.route('/api/excercise_correction/fill_in_the_blank', methods=['POST'])
def fill_in_the_blank_correction_endpoint():
    """
    Endpoint to correct the fill in the blank exercise using an agent
    """
    print("\033[91m[app]\033[0m fill_in_the_blank_correction_endpoint")

    # --- Inicializar el service una vez por llamada ---
    service = ExerciseService()

    # --- Request Input validation ---
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400

    # --- Extract exercise data ---
    exercise_data = request.get_json()
    user_id = exercise_data.get('user_id')
    exercise_type = exercise_data.get('exercise_type')
    resultado = exercise_data.get('resultado')
    user_answer = exercise_data.get('user_answer')
    correct_answer = exercise_data.get('correct_answer')

    if not exercise_data or not exercise_type or resultado is None:
        return jsonify({
            "error": "JSON must contain 'exercise_type' and 'resultado'."
        }), 400
    if user_id is None:
        return jsonify({
            "error": "JSON must contain 'user_id'."
        }), 400
    
    # --- Exercise correction ---

    # Si la respuesta es la palabra exacta
    if user_answer == correct_answer:
        return jsonify({"status": "correct"}), 200

    # Si la respuesta no es tal cual la palabra exacta, comprobar con agente de ai si se parece a la original
    result = service.correct_fill_in_the_blank(user_answer, correct_answer)
    status = result.get('status')

    if status == "ok":
        return jsonify({"status": "correct"}), 200         
    else:
        feedback_msg = result.get('analysis', result.get('Analysis', ''))
        return jsonify({"status": "incorrect", "feedback": feedback_msg}), 200

@app.route('/api/generate_exercise', methods=['POST'])
def generate_exercise_endpoint():
    """
    Endpoint to generate cognitive exercises from memory data.
    """
    print("\033[91m[app]\033[0m generate_exercise_endpoint")

    # --- Inicializar el service una vez por llamada ---
    service = ExerciseService()

    # --- Request Input validation ---
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400

    memory_data = request.get_json()
    user_id = memory_data.get('user_id')

    if not memory_data or 'title' not in memory_data or 'user_description' not in memory_data:
        return jsonify({
            "error": "JSON must contain 'title' and 'user_description'."
        }), 400

    # --- Exercise generation logic ---
    try:
        description_parts = [
            memory_data.get('user_description', ''),
            memory_data.get('audio_transcription', ''),
        ]
        description = "\n".join(
            part.strip()
            for part in description_parts
            if part and part.strip()
        )

        memory_data['user_description'] = description
        exercise_set = service.generate(user_id, memory_data['title'], description, memory_data.get("ai_analysis", {}))
        
        exercise_set = {"exercises": exercise_set}

        print("\033[91m[app]\033[0m Answer: " + str(exercise_set) + " | Type: " + str(type(exercise_set)))
        return jsonify(exercise_set)

    except Exception as e:
        print(f"\033[91m[app]\033[0m Error generating exercises: {e}")
        print(f"\033[91m[app]\033[0m Generating fallback exercises:")
        return jsonify(service.generate_fallback_exercises(memory_data, count=3))


@app.route('/api/delete_account', methods=['POST'])
def delete_account_endpoint():
    """
    Endpoint to delete a user account and all associated data.
    """
    print("\033[91m[app]\033[0m delete_account_endpoint")

    # --- Request Input validation ---
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400

    data = request.get_json()
    user_id = data.get('user_id')

    if not user_id:
        return jsonify({"error": "JSON must contain 'user_id'."}), 400

    try:
        result = db.delete_account(user_id)
        return jsonify(result), 200
    except Exception as e:
        print(f"\033[91m[app]\033[0m Error deleting account: {e}")
        return jsonify({"error": "Could not delete account."}), 500

@app.route('/api/exercise_history/<user_id>', methods=['GET'])
def get_exercise_history_endpoint(user_id):
    """
    Endpoint to get exercise history for a specific user.
    """
    print(f"\033[91m[app]\033[0m get_exercise_history_endpoint for user: {user_id}")
    try:
        history = db.get_user_exercise_history(user_id, limit=100)
        return jsonify(history), 200
    except Exception as e:
        print(f"\033[91m[app]\033[0m Error fetching exercise history: {e}")
        return jsonify({"error": "Could not fetch exercise history."}), 500

@app.route('/api/test', methods=['GET'])
def test_endpoint():
    """Test endpoint to verify that the API is working."""
    print("\033[91m[app]\033[0m test_endpoint")

    return jsonify({
        "message": "The exercise generation API is active.",
        "usage": "Send a POST request to /api/generate_exercise with the memory data."
    })

if __name__ == '__main__':
    print("Starting Cognitive Exercise Generation API...")
    print("Test endpoint: http://localhost:5001/api/test")
    print("Main endpoint (POST): http://localhost:5001/api/generate_exercise")
    
    # Runs on port 5001 to avoid collision with the main app
    app.run(debug=True, host='0.0.0.0', port=5001)
