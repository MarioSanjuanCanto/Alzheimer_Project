from flask import Flask, request, jsonify
from flask_cors import CORS
import logic

# ______________________________________ Type Mapping ______________________________________

# Maps external English names to internal Spanish names
TYPE_MAP_TO_INTERNAL = {
    'multiple_choice': 'reconocimiento',  # Default to 'reconocimiento' for multiple choice
    'fill_in_the_blank': 'completar_frase',
    'ordering': 'orden_cronologico'
}

# Maps internal Spanish names back to external English names
TYPE_MAP_TO_EXTERNAL = {
    'reconocimiento': 'multiple_choice',
    'emocional': 'multiple_choice',
    'asociativo': 'multiple_choice',
    'completar_frase': 'fill_in_the_blank',
    'orden_cronologico': 'ordering'
}


# ______________________________________ API END Points ______________________________________

app = Flask(__name__)
CORS(app)

@app.route('/api/generate_exercise', methods=['POST'])
def generate_exercise_endpoint():
    """
    Endpoint to generate a single cognitive exercise from memory data.
    Expects a JSON with 'title', 'user_description', and optionally 'ai_analysis'.
    """
    print("[app] generate_exercise_endpoint")
    

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
        strategy = logic.determine_next_exercise_strategy()

    exercise_set = logic.generate_cognitive_exercises(
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
