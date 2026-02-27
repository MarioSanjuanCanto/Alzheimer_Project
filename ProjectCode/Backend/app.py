from flask import Flask, request, jsonify
from flask_cors import CORS
import logic
from services.exercise_service import ExerciseService

# ______________________________________ API END Points ______________________________________

app = Flask(__name__)
CORS(app)

@app.route('/api/generate_exercise', methods=['POST'])
def generate_exercise_endpoint():
    """
    Endpoint to generate cognitive exercises from memory data.
    """
    print("[app] generate_exercise_endpoint")

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
    
    # We now generate the full set of exercises (3 different types)
    strategy = logic.determine_next_exercise_strategy(user_id)
    
    exercise_set = logic.generate_cognitive_exercises(
        memory_data, 
        strategy,
        user_id
    )
    
    if not exercise_set or not exercise_set.get("exercises"):
        return jsonify({"error": "Could not generate exercises."}), 500

    return jsonify(exercise_set)

@app.route('/api/excercise_correction', methods=['POST'])
def excercise_correction_endpoint():
    """
    Endpoint to correct cognitive exercises from memory data.
    """
    print("[app] excercise_correction_endpoint")

    # --- Request Input validation ---
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400

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
    
    print(f"[app] Correcting exercise for user: {user_id} | Type: {exercise_type} | Result: {resultado}")

    # Convert 'succeed'/'fail' to boolean for db.update_user_stats
    is_correct = (resultado == 'succeed')
    
    try:
        logic.update_exercise_stats(user_id, exercise_type, is_correct)
        return jsonify({"status": "success", "message": "Exercise stats updated."}), 200
    except Exception as e:
        print(f"[app] Error updating user stats: {e}")
        return jsonify({"error": "Could not update user stats."}), 500

@app.route('/api/test', methods=['GET'])
def test_endpoint():
    """Test endpoint to verify that the API is working."""
    print("[app] test_endpoint")
    
    return jsonify({
        "message": "The exercise generation API is active.",
        "usage": "Send a POST request to /api/generate_exercise with the memory data."
    })



# ______________________________________ Agents API endpoint ______________________________________

service = ExerciseService()

@app.route('/api/generate_exercise_agents', methods=['POST'])
def generate_exercise_agents_endpoint():
    """
    Endpoint to generate cognitive exercises from memory data.
    """
    print("[app] generate_exercise_agents_endpoint")

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
    exercise_types = ["multiple_choice", "fill_in_the_blank", "ordering"]
    exercise_set = service.generate(user_id, memory_data['title'], memory_data['user_description'], memory_data.get("ai_analysis", {}), exercise_types)
    
    return jsonify(exercise_set)


if __name__ == '__main__':
    print("Starting Cognitive Exercise Generation API...")
    print("Test endpoint: http://localhost:5001/api/test")
    print("Main endpoint (POST): http://localhost:5001/api/generate_exercise")
    
    # Runs on port 5001 to avoid collision with the main app
    app.run(debug=True, host='0.0.0.0', port=5001)
