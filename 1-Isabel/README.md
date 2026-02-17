# Memex: Cognitive Stimulation Platform

This project is a web platform designed for cognitive reminiscence therapy, aimed at older adults with mild cognitive impairment (MCI) or early-stage Alzheimer's. The application allows family members to upload memories in the form of photos and audio narrations, and uses artificial intelligence to convert these memories into personalized cognitive exercises.

## Key Features

- **Upload Memories:** Upload family photographs and accompany them with audio or text narrations.
- **AI Analysis:** The platform uses OpenAI's **GPT-4 Vision** to analyze images, describing details, people, contexts, and emotions.
- **Audio Transcription:** Voice narrations are automatically converted to text using OpenAI's **Whisper** model.
- **Exercise Generation:** Based on the information from the memories, the AI automatically generates personalized therapeutic exercises to stimulate memory and other cognitive skills.
- **Memory Database:** All memories and generated exercises are stored securely in a local file (`memories_database.json`).
- **Web Interface:** A simple interface allows users to interact with memories, view images, and complete the exercises.

## Technologies Used

- **Backend:** Python with the Flask framework.
- **Artificial Intelligence:** OpenAI API (GPT-4 Vision, Whisper).
- **Frontend:** HTML, CSS, JavaScript.
- **Python Libraries:** `Pillow` for image processing, `requests` for API calls, among others listed in `requirements.txt`.

## Setup and Execution Instructions

Follow these steps to set up and run the project on your local machine.

### 1. Prerequisites

- **Python 3.8** or a higher version installed.
- An **OpenAI API key** to access the AI models.

### 2. Clone and Set Up the Environment

```bash
# 1. Clone this repository or download the files into a local folder.
# 2. Open a terminal in the project folder.

# 3. Create a virtual environment to install the dependencies
python -m venv env

# 4. Activate the virtual environment
# On Windows:
# env\Scripts\activate
# On macOS and Linux:
source env/bin/activate
```

### 3. Install Dependencies

Once the virtual environment is activated, install all necessary libraries by running:

```bash
pip install -r requirements.txt
```

### 4. Configure the OpenAI API Key

The application needs an API key to function. You must create a file to store this environment variable.

1.  Create a file named `.env` in the project root.
2.  Open the file and add the following line, replacing `your_openai_api_key_here` with your actual key:

    ```
    OPENAI_API_KEY="your_openai_api_key_here"
    ```

    The application will load this key automatically.

### 5. Run the Application

With the environment activated and dependencies installed, start the Flask server:

```bash
python app.py
```

You will see a message in the terminal indicating that the server is running.

### 6. Access the Platform

Open your web browser and go to the following address:

[http://127.0.0.1:5000/](http://127.0.0.1:5000/)

From here you can start using the platform.

## Project Structure

- `app.py`: The main Flask application file containing all server logic and API routes.
- `index.html`: The main page of the web application.
- `requirements.txt`: A list of all Python dependencies.
- `memories_database.json`: A JSON file that acts as a database to store memories and exercises.
- `uploads/`: The folder where images uploaded by users are stored.
- `static/`: The folder for static files like CSS and JavaScript.
- `guia.md`: A detailed design document for the project.