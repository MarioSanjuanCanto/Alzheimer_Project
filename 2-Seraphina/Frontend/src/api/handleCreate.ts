import { supabase } from "../supabaseClient";

/**
 * Handles uploading assets and creating a memory record.
 * @param formData - The data from the form (Title, Description, File, etc.)
 * @param targetDbId - The UUID from the public.users table (The Owner)
 */
const handleCreate = async (formData: any, targetDbId: string) => {
  // CRITICAL: Ensure we have a target ID
  if (!targetDbId) {
    console.error("❌ CREATE ERROR: No targetDbId provided to handleCreate.");
    throw new Error("Target User ID is required to link the memory.");
  }

  // DEBUG: Log exactly who this memory is being saved for
  console.log(`🛠️ DB ATTEMPT: Saving memory for User ID: ${targetDbId}`);

  try {
    let imageUrl = formData.image;
    let audioUrl = formData.audio;

    // 1. Upload Image to Storage
    if (formData.image instanceof File) {
      // Organized by target user ID for RLS security
      const fileName = `${targetDbId}/images/${Date.now()}_${formData.image.name}`;

      const { error: uploadError } = await supabase.storage
        .from("memories")
        .upload(fileName, formData.image, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("memories").getPublicUrl(fileName);
      imageUrl = data.publicUrl;
    }

    // 2. Upload Audio to Storage
    if (formData.audio instanceof Blob) {
      const audioName = `${targetDbId}/audio/${Date.now()}_audio.webm`;

      const { error: audioError } = await supabase.storage
        .from("memories")
        .upload(audioName, formData.audio, { upsert: true });

      if (audioError) throw audioError;

      const { data } = supabase.storage.from("memories").getPublicUrl(audioName);
      audioUrl = data.publicUrl;
    }

    // 3. Insert record into the 'memories' table
    const { error: insertError } = await supabase.from("memories").insert({
      title: formData.title,
      description: formData.description,
      image: imageUrl,
      audio: audioUrl || null,
      user_id: targetDbId, // The Foreign Key to public.users(id)
    });

    if (insertError) {
      console.error("❌ Supabase DB Error:", insertError.message);
      console.error("❌ Detail:", insertError.details);
      throw insertError;
    }

    console.log("✅ Success: Memory saved for ID:", targetDbId);
    return { success: true };
    
  } catch (err) {
    console.error("❌ handleCreate Exception:", err);
    throw err;
  }
};

export default handleCreate;