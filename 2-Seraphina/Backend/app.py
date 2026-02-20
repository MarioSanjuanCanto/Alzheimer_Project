from flask import Flask, request, jsonify
from flask_cors import CORS
import logic

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

    print(f"[app] Generating exercises for user: {user_id}")

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

@app.route('/api/test', methods=['GET'])
def test_endpoint():
    """Test endpoint to verify that the API is working."""
    print("[app] test_endpoint")
    
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
