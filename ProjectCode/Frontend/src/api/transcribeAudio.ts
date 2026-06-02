/**
 * Sends an audio Blob to the backend for transcription via OpenAI Whisper.
 * @param audioBlob - The audio Blob recorded by the user.
 * @returns The transcribed text, or null if transcription fails.
 */
export const getAudioFileExtension = (mimeType = "") => {
  if (mimeType.includes("mp4")) return "mp4";
  if (mimeType.includes("mpeg")) return "mp3";
  if (mimeType.includes("ogg")) return "ogg";
  if (mimeType.includes("wav")) return "wav";
  return "webm";
};

const transcribeAudio = async (audioBlob: Blob): Promise<string | null> => {
  try {
    const formData = new FormData();
    const extension = getAudioFileExtension(audioBlob.type);
    formData.append("audio", audioBlob, `recording.${extension}`);

    const response = await fetch("http://localhost:5001/api/transcribe", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("❌ Transcription API error:", errorData);
      return null;
    }

    const data = await response.json();
    console.log("✅ Transcription received:", data.transcription?.substring(0, 80) + "...");
    return data.transcription || null;
  } catch (err) {
    console.error("❌ Transcription request failed:", err);
    return null;
  }
};

export default transcribeAudio;
