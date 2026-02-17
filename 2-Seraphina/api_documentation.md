# Cognitive Exercise API Documentation

## Introduction

This document provides instructions on how to use the Cognitive Exercise API. The API generates personalized cognitive stimulation exercises based on user-provided memories. It is a language-agnostic service that communicates via HTTP and JSON.

## Base URL

All API endpoints are relative to the following base URL:

`http://localhost:5001/api`

## Authentication

The API itself does not require an authentication token in the request headers. However, the server running the API needs a valid OpenAI API key to be configured in a `.env` file in the project's root directory.

**Example `.env` file:**
```
OPENAI_API_KEY="your_openai_secret_key_here"
```

---

## Endpoints

### 1. Health Check

Use this endpoint to verify that the API server is running and accessible.

- **URL:** `/test`
- **Method:** `GET`
- **Success Response (200 OK):**
  - **Content-Type:** `application/json`
  - **Body:**
    ```json
    {
      "message": "The exercise generation API is active.",
      "usage": "Send a POST request to /api/generate_exercise with the memory data."
    }
    ```

### 2. Generate Exercise

This is the main endpoint for creating a new cognitive exercise.

- **URL:** `/generate_exercise`
- **Method:** `POST`
- **Headers:**
  - `Content-Type: application/json`

#### Request Body

The body of the request must be a JSON object containing the details of the memory.

**Fields:**

- `title` (string, **required**): The title of the memory.
- `user_description` (string, **required**): The user's detailed description of the memory.
- `ai_analysis` (object, optional): A container for any AI-generated metadata about the memory.
- `exercise_type` (string, optional): The specific type of exercise you want to generate. If omitted, a random type will be chosen.
  - **Available types:** `multiple_choice`, `fill_in_the_blank`, `ordering`.
- `difficulty` (string, optional): The desired difficulty. Defaults to `media`.
  - **Available difficulties:** `fácil`, `media`, `difícil`.

**Example Request Body:**
```json
{
  "title": "Summer vacation in the village",
  "user_description": "I remember summers at my grandparents' house, playing in the river and eating ice cream in the square.",
  "ai_analysis": {
    "detected_people": ["grandparents"],
    "location": "village",
    "activities": ["playing in the river", "eating ice cream"]
  },
  "exercise_type": "fill_in_the_blank"
}
```

#### Success Response (200 OK)

The response will be a JSON object containing a list of generated exercises.

**Structure:**

The root object contains an `exercises` key, which is an array. Each object in the array represents a single exercise and has the following fields:

- `type` (string): The type of the exercise (e.g., `fill_in_the_blank`).
- `question` (string): The question or instruction for the user.
- `options` (array of strings, optional): A list of choices for multiple-choice or ordering exercises.
- `correct_answer`: The correct answer. **The format depends on the `type` (see below).**
- `hint` (string): A hint for the user.
- `difficulty` (string): The difficulty level of the exercise.

#### Interpreting `correct_answer`

The structure of `correct_answer` changes based on the exercise `type`:

1.  **For `multiple_choice`:**
    - `correct_answer` is an **integer** representing the zero-based index of the correct option in the `options` array.

2.  **For `fill_in_the_blank`:**
    - `correct_answer` is a **string** containing the exact word or phrase that completes the sentence.

3.  **For `ordering`:**
    - `correct_answer` is an **array of strings**, with the elements from `options` listed in the correct chronological order.

**Example Success Response Body:**
```json
{
  "exercises": [
    {
      "type": "fill_in_the_blank",
      "question": "During the summers, we ate ice cream in the ______.",
      "correct_answer": "square",
      "options": null,
      "hint": "Think about the central place in a village.",
      "difficulty": "media"
    }
  ]
}
```

#### Error Responses

- **Code:** `400 Bad Request`
  - **Reason:** The request body is not valid JSON, or required fields (`title`, `user_description`) are missing.
  - **Body:**
    ```json
    {
      "error": "JSON must contain 'title' and 'user_description'."
    }
    ```

- **Code:** `500 Internal Server Error`
  - **Reason:** An unexpected error occurred on the server, likely during the call to the OpenAI service. Check the server logs for more details.
  - **Body:**
    ```json
    {
      "error": "Could not generate exercise."
    }
    ```
