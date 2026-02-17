import requests
import json
import os


BASE_URL = "http://localhost:5001/api"

# Test Data
VALID_MEMORY_DATA = {
    "title": "Summer vacation in the village",
    "user_description": "I remember summers at my grandparents' house, playing in the river and eating ice cream in the square.",
    "ai_analysis": {
        "detected_people": ["grandparents"],
        "location": "village",
        "activities": ["playing in the river", "eating ice cream"]
    }
}

INVALID_MEMORY_DATA = {
    "title": "Description is missing"
}

def test_api_is_running():
    """Tests that the /test endpoint responds correctly."""
    print("------------  Testing if the API is active...")
    try:
        response = requests.get(f"{BASE_URL}/test", timeout=5)
        
        # Verify that the request was successful
        assert response.status_code == 200, f"Expected 200, but got {response.status_code}"
        
        # Verify that the content is as expected
        data = response.json()
        assert "message" in data
        assert "active" in data["message"]
        
        print("   Success! The API is running.\n")
        return True
    except requests.RequestException as e:
        print(f"Failure! Could not connect to the API at {BASE_URL}/test.")
        print(f"Error: {e}")
        print(" Make sure the 'exercise_api.py' script is running in another terminal.\n")
        return False

def test_generate_exercise_success():
    """Tests the successful generation of a multiple-choice exercise."""
    print("Testing the generation of an exercise (multiple-choice case)...")
    
    # Check if the API Key is configured
    if not os.getenv('OPENAI_API_KEY'):
        print("Warning: The OPENAI_API_KEY environment variable is not set.")
        print(" This test will generate a fallback exercise.\n")

    try:
        # For this test, we will request a multiple-choice exercise
        payload = VALID_MEMORY_DATA.copy()
        payload['exercise_type'] = 'multiple_choice'

        headers = {"Content-Type": "application/json"}
        response = requests.post(
            f"{BASE_URL}/generate_exercise",
            data=json.dumps(payload),
            headers=headers,
            timeout=20  # Increase the timeout because the OpenAI call may take time
        )
        
        assert response.status_code == 200, f"Expected 200, but got {response.status_code}"
        
        data = response.json()
        assert "exercises" in data, "The JSON response must contain the 'exercises' key."
        assert isinstance(data["exercises"], list), "'exercises' must be a list."
        assert len(data["exercises"]) > 0, "The 'exercises' list cannot be empty."
        
        # Validate the structure of the first exercise
        exercise = data["exercises"][0]
        assert "type" in exercise
        assert "question" in exercise
        assert "correct_answer" in exercise
        # Also assert that we got the requested type or the fallback
        assert exercise.get('type') == 'multiple_choice', f"Expected 'multiple_choice', but got {exercise.get('type')}"
        
        print("Success! A multiple-choice exercise was generated correctly.")
        print(f"Generated exercise:\n{json.dumps(data['exercises'], indent=2)}\n")
        return True
    except (requests.RequestException, AssertionError) as e:
        print(f"Failure! The request to /generate_exercise failed.")
        print(f"  Error: {e}\n")
        return False

def test_generate_exercise_bad_request():
    """Tests that the API correctly handles an incorrect request."""
    print("Testing error handling (bad request)...")
    try:
        headers = {"Content-Type": "application/json"}
        response = requests.post(
            f"{BASE_URL}/generate_exercise",
            data=json.dumps(INVALID_MEMORY_DATA),
            headers=headers,
            timeout=10
        )
        
        # We expect a 400 (Bad Request) error
        assert response.status_code == 400, f"Expected 400, but got {response.status_code}"
        
        data = response.json()
        assert "error" in data, "The error response must contain the 'error' key."
        
        print(" Success! The API handled the bad request as expected.\n")
        return True
    except requests.RequestException as e:
        print(f"  Failure! The request failed unexpectedly.")
        print(f" Error: {e}\n")
        return False

def test_generate_specific_exercise_type():

    """Tests that a specific exercise type (ordering) can be requested and generated."""

    print("Testing the generation of a specific exercise type ('ordering')...")

    

    

    memory_with_type = VALID_MEMORY_DATA.copy()

    memory_with_type["exercise_type"] = "ordering"

    

    # The OpenAI call will only be executed if the key is present

    if not os.getenv('OPENAI_API_KEY'):

        print(" Warning: The OPENAI_API_KEY environment variable is not set.")

        print(" Cannot verify specific type generation without the API. Skipping test.\n")

        return



    try:

        headers = {"Content-Type": "application/json"}

        response = requests.post(

            f"{BASE_URL}/generate_exercise",

            data=json.dumps(memory_with_type),

            headers=headers,

            timeout=20

        )

        

        assert response.status_code == 200, f"Expected 200, but got {response.status_code}"

        

        data = response.json()

        assert "exercises" in data and len(data["exercises"]) > 0

        

        exercise = data["exercises"][0]

        # Verify that the exercise type is the one we requested

        assert exercise.get("type") == "ordering", f"Expected 'ordering', but got '{exercise.get('type')}'"



        print("Success! An exercise of type 'ordering' was generated as requested.")

        print(f" Specific exercise generated:\n{json.dumps(data['exercises'], indent=2)}\n")

        return True

    except (requests.RequestException, AssertionError) as e:

        print(f" Failure! The test for the specific type failed.")

        print(f" Error: {e}\n")

        return False



def test_transcribe_audio_success():

    """Tests successful audio transcription."""

    print("------------ Testing successful audio transcription...")

    

    audio_file_path = "testrecord.mp3"



    if not os.path.exists(audio_file_path):

        print(f"Warning: Audio file not found at '{audio_file_path}'. Skipping test.\n")

        return False



    if not os.getenv('OPENAI_API_KEY'):

        print("Warning: OPENAI_API_KEY is not set. Skipping transcription test.\n")

        return False



    try:

        with open(audio_file_path, "rb") as f:

            files = {"audio": (os.path.basename(audio_file_path), f, "audio/mpeg")}

            response = requests.post(f"{BASE_URL}/transcribe", files=files, timeout=30)



        assert response.status_code == 200, f"Expected 200, but got {response.status_code}"

        

        data = response.json()

        assert data.get("success") is True, "Expected 'success' to be true."

        assert "transcription" in data, "Response must contain a 'transcription' key."

        assert len(data["transcription"]) > 0, "Transcription should not be empty."



        print("Success! Audio was transcribed correctly.")

        print(f"Transcription: '{data['transcription'][:50]}...'\n")

        return True

    except (requests.RequestException, AssertionError) as e:

        print(f"Failure! The request to /transcribe failed.")

        print(f"Error: {e}\n")

        return False



def test_transcribe_audio_no_file():

    """Tests that the API handles requests with no audio file."""

    print("------------ Testing transcription error (no file)...")

    try:

        response = requests.post(f"{BASE_URL}/transcribe", timeout=10)

        

        assert response.status_code == 200, f"Expected 200, but got {response.status_code}"

        

        data = response.json()

        assert data.get("success") is False, "Expected 'success' to be false for a bad request."

        assert "error" in data, "The error response must contain 'error'."



        print("Success! The API handled the missing file correctly.\n")

        return True

    except (requests.RequestException, AssertionError) as e:

        print(f"Failure! The request failed unexpectedly.")

        print(f"Error: {e}\n")

        return False





if __name__ == "__main__":

    print("--- STARTING AUTOMATED TESTS FOR exercise_api.py ---")

    

    # Make sure the server is running before launching the tests.

    if not test_api_is_running():

        exit(1) # If the API is not active, we do not continue.

        

    test_generate_exercise_success()

    test_generate_exercise_bad_request()

    test_generate_specific_exercise_type()

    test_transcribe_audio_success()

    test_transcribe_audio_no_file()

    

    print("--- TESTS FINISHED ---")
