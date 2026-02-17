import { useState } from "react";

const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
const [isRecording, setIsRecording] = useState(false);
const [audioChunks, setAudioChunks] = useState<Blob[]>([]);

// Start recording
export const handleRecording = async () => {
  if (!navigator.mediaDevices?.getUserMedia) return alert("Browser not supported");

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const recorder = new MediaRecorder(stream);
  const chunks: Blob[] = [];

  recorder.ondataavailable = (e) => chunks.push(e.data);
  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: "audio/webm" });
    updateFormData("audio", blob);
    setAudioChunks([]);
  };

  recorder.start();
  setMediaRecorder(recorder);
  setIsRecording(true);
  setAudioChunks(chunks);
};

const pauseRecording = () => {
  mediaRecorder?.pause();
  setIsRecording(false);
};

const resumeRecording = () => {
  mediaRecorder?.resume();
  setIsRecording(true);
};

const stopRecording = () => {
  mediaRecorder?.stop();
  setIsRecording(false);
  setMediaRecorder(null);
};
function updateFormData(arg0: string, blob: Blob) {
  throw new Error("Function not implemented.");
}

