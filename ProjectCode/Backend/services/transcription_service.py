from crewai import context
import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()


class TranscriptionService:
    """Service to transcribe audio files using OpenAI Whisper."""

    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY is not set in the environment.")
        self.client = OpenAI(api_key=api_key)

    def transcribe(self, audio_file, language: str = "es") -> str:
        """
        Transcribes an audio file to text using OpenAI Whisper.

        Args:
            audio_file: A file-like object (e.g., from Flask's request.files).
            language: Language code for the audio (default: "es" for Spanish).

        Returns:
            The transcribed text as a string.
        """
        print("\033[34m[TranscriptionService]\033[0m Transcribing audio...")

        try:
            audio_bytes = audio_file.read()
            if not audio_bytes:
                raise ValueError("The uploaded audio file is empty.")

            transcription = self.client.audio.transcriptions.create(
                model="whisper-1",
                file=(audio_file.filename or "recording.webm", audio_bytes, audio_file.content_type or "audio/webm"),
                language=language,
            )

            text = transcription.text
            print(f"\033[34m[TranscriptionService]\033[0m Transcription complete ({len(text)} chars): {text}")
            return text

        except Exception as e:
            print(f"\033[91m[TranscriptionService]\033[0m Error transcribing audio: {e}")
            raise
