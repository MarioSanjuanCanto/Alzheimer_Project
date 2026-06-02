import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import handleCreate from "../../api/handleCreate";
import handleUpdate from "../../api/handleUpdate";
import { useNavigate, useLocation } from "react-router-dom";
import { ZodError } from "zod";
import {
  imageStepSchema,
  textStepSchema,
  createMemorySchema,
} from "../../schemas/createMemorySchema";
import { useParticipant } from "../../context/practicerContext";
import { getCurrentProfile } from "../../api/getCurrentProfile";

const getSupportedAudioMimeType = () => {
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ];

  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) || "";
};

export const useMemoryForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const memoryToEdit = location.state?.memory || null;
  const totalSteps = 3;
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    image: memoryToEdit?.image || null,
    title: memoryToEdit?.title || "",
    description: memoryToEdit?.description || "",
    audio: memoryToEdit?.audio || null,
  });
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(formData.audio || null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingFinalizationRef = useRef<Promise<Blob | null> | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const { selectedParticipant } = useParticipant();
  const [currentProfile, setCurrentProfile] = useState<any>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const profile = await getCurrentProfile();
      setCurrentProfile(profile);
    };
    loadProfile();
  }, []);
  
  // Create logic
 const handleSubmit = async () => {
  if (isSubmitting || isProcessingAudio) return;

  if (recording) {
    toast.error("Please stop the recording before creating the memory.");
    return;
  }

  try {
    setIsSubmitting(true);
    const finalizedAudio = await recordingFinalizationRef.current;
    const formDataToSubmit = finalizedAudio
      ? { ...formData, audio: finalizedAudio }
      : formData;

    createMemorySchema.parse(formDataToSubmit);

    const isParticipant = currentProfile?.role === "user" || currentProfile?.role === "participant";
    const targetDbId = isParticipant ? currentProfile.id : selectedParticipant?.id;

    if (!targetDbId) {
      toast.error("Could not identify the owner for this memory.");
      return;
    }

    if (memoryToEdit) {
      await handleUpdate(memoryToEdit.id, formDataToSubmit);
      toast.success("Memory updated successfully!");
    } else {
      await handleCreate(formDataToSubmit, targetDbId);
      const successMsg = !isParticipant && selectedParticipant 
        ? `Memory created for ${selectedParticipant.fullName}` 
        : "Memory created successfully!";
      toast.success(successMsg);
    }

    navigate("/view");
  } catch (err) {
    if (err instanceof ZodError) {
      toast.error("Please fix the errors before submitting");
    } else {
      toast.error(err instanceof Error ? err.message : "Something went wrong!");
    }
  } finally {
    setIsSubmitting(false);
  }
};

  // Recording logic
  const startRecording = async () => {
    console.log("Attempting to start recording");
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mimeType = getSupportedAudioMimeType();
    const mediaRecorder = mimeType
      ? new MediaRecorder(stream, { mimeType })
      : new MediaRecorder(stream);

    mediaRecorderRef.current = mediaRecorder;
    mediaStreamRef.current = stream;
    audioChunksRef.current = [];
    recordingFinalizationRef.current = null;

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
      console.log("Start recording");
    };

    recordingFinalizationRef.current = new Promise((resolve) => {
      mediaRecorder.onstop = () => {
        setIsProcessingAudio(true);
        mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;

        const blob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType || mimeType || "audio/webm",
        });

        if (blob.size === 0) {
          toast.error("The recording was empty. Please try recording again.");
          updateFormData("audio", null);
          setAudioUrl(null);
          setIsProcessingAudio(false);
          resolve(null);
          return;
        }

        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        updateFormData("audio", blob);
        setIsProcessingAudio(false);
        resolve(blob);
      };
    });

    mediaRecorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
  };

  const deleteRecording = () => {
    setAudioUrl(null);
    recordingFinalizationRef.current = null;
    audioChunksRef.current = [];
    updateFormData("audio", null);
  };

  // Navigation logic
  useEffect(() => {
    if (memoryToEdit) setFormData(memoryToEdit);
  }, [memoryToEdit]);

  const updateFormData = (key, value) =>
    setFormData((prev) => {
      const next = { ...prev, [key]: value };

      setErrors((prevErrors) => {
        const copy = { ...prevErrors };
        delete copy[key];
        return copy;
      });

      return next;
    });

  const handleFileChange = (e, key) => {
    const file = e.target.files[0];
    if (file) updateFormData(key, file);
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (currentStep < totalSteps) {
      setCurrentStep((s) => s + 1);
    }
  };

  const handleBack = () => currentStep > 1 && setCurrentStep((s) => s - 1);

  const validateStep = () => {
    try {
      setErrors({});

      if (currentStep === 1) {
        imageStepSchema.parse(formData);
      }

      if (currentStep === 2) {
        textStepSchema.parse(formData);
      }

      return true;
    } catch (err) {
      if (err instanceof ZodError) {
        const fieldErrors: Record<string, string> = {};
        for (const key in err.flatten().fieldErrors) {
          fieldErrors[key] = err.flatten().fieldErrors[key]?.[0] ?? "";
        }
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  return {
    formData,
    updateFormData,
    handleFileChange,
    handleNext,
    handleBack,
    handleSubmit,
    currentStep,
    audioUrl,
    recording,
    isProcessingAudio,
    isSubmitting,
    startRecording,
    stopRecording,
    deleteRecording,
    totalSteps,
    errors,
  };
};
