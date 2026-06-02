import { supabase } from "../supabaseClient";
import transcribeAudio, { getAudioFileExtension } from "./transcribeAudio";

const handleUpdate = async (id, formData) => {
  console.log("DEBUG: Updating Memory with ID:", id, "Type:", typeof id);
  // Debugging: Check if ID is actually arriving
  console.log("Updating record ID:", id);
  console.log("With data:", formData);

  if (!id) throw new Error("No memory ID provided for update.");

  try {
    let imageUrl = formData.image;
    let audioUrl = formData.audio;
    let audioTranscription: string | null | undefined = undefined;

    // Handle Image: Only upload if user picked a NEW file
    if (formData.image instanceof File) {
      const fileName = `${Date.now()}_${formData.image.name}`;
      const { error: uploadError } = await supabase.storage
        .from("memories")
        .upload(`images/${fileName}`, formData.image);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("memories")
        .getPublicUrl(`images/${fileName}`);
      imageUrl = data.publicUrl;
    }

    // Handle Audio: Only upload if it's a NEW recording (Blob)
    if (formData.audio instanceof Blob) {
      const audioExtension = getAudioFileExtension(formData.audio.type);
      const audioName = `${Date.now()}_audio.${audioExtension}`;
      const { error: audioError } = await supabase.storage
        .from("memories")
        .upload(`audio/${audioName}`, formData.audio, {
          contentType: formData.audio.type || `audio/${audioExtension}`,
        });

      if (audioError) throw audioError;

      const { data } = supabase.storage
        .from("memories")
        .getPublicUrl(`audio/${audioName}`);
      audioUrl = data.publicUrl;

      // Transcribe the new audio via backend (Whisper)
      console.log("🎙️ Transcribing updated audio...");
      audioTranscription = await transcribeAudio(formData.audio);
      if (audioTranscription) {
        console.log("✅ Audio transcribed successfully");
      } else {
        console.warn("⚠️ Audio transcription returned null");
        audioTranscription = null;
      }
    }

    console.log("IMAGE CHECK", {
      imageUrl,
      type: typeof imageUrl,
      isNull: imageUrl === null,
      isUndefined: imageUrl === undefined,
      instanceOfFile: imageUrl instanceof File,
    });

    // Build the update payload (only include audio_transcription if audio was re-recorded)
    const updatePayload: any = {
      title: formData.title,
      description: formData.description,
      image: imageUrl,
      audio: audioUrl,
    };

    if (audioTranscription !== undefined) {
      updatePayload.audio_transcription = audioTranscription;
    }

    // UPDATE DB
    const { data, error: updateError } = await supabase
      .from("memories")
      .update(updatePayload)
      .eq("id", id)
      .select();

    if (updateError) throw updateError;

    if (!data || data.length === 0) {
      throw new Error("Error");
    }

    return data;
  } catch (err) {
    console.error("Supabase Update Error:", err);
    throw err;
  }
};

export default handleUpdate;
