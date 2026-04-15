from flask import Flask, request, jsonify
from flask_cors import CORS
import database.db as db
from services.exercise_service import ExerciseService

# ______________________________________ API END Points ______________________________________

print("\033[42m[INFO] Server initialized\033[0m")
app = Flask(__name__)
CORS(app)

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
        # Update the database
        db.update_user_stats(user_id, exercise_type, is_correct)
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
        exercise_set = service.generate(user_id, memory_data['title'], memory_data['user_description'], memory_data.get("ai_analysis", {}))
        
        if not exercise_set or exercise_set == "":
            return jsonify(service.generate_fallback_exercises(memory_data, count=3))
        else: 
            exercise_set = {"exercises": exercise_set}

            print("\033[91m[app]\033[0m Answer: " + str(exercise_set) + " | Type: " + str(type(exercise_set)))
            return jsonify(exercise_set)
    except Exception as e:
        print(f"\033[91m[app]\033[0m Error generating exercises: {e}")
        print(f"\033[91m[app]\033[0m Generating fallback exercises:")
        return jsonify(service.generate_fallback_exercises(memory_data, count=3))

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
