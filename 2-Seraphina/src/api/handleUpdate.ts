import { supabase } from "../supabaseClient";

const handleUpdate = async (id, formData) => {
  console.log("DEBUG: Updating Memory with ID:", id, "Type:", typeof id);
  // Debugging: Check if ID is actually arriving
  console.log("Updating record ID:", id);
  console.log("With data:", formData);

  if (!id) throw new Error("No memory ID provided for update.");

  try {
    let imageUrl = formData.image;
    let audioUrl = formData.audio;

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
      const audioName = `${Date.now()}_audio.webm`;
      const { error: audioError } = await supabase.storage
        .from("memories")
        .upload(`audio/${audioName}`, formData.audio);

      if (audioError) throw audioError;

      const { data } = supabase.storage
        .from("memories")
        .getPublicUrl(`audio/${audioName}`);
      audioUrl = data.publicUrl;
    }

    console.log("IMAGE CHECK", {
      imageUrl,
      type: typeof imageUrl,
      isNull: imageUrl === null,
      isUndefined: imageUrl === undefined,
      instanceOfFile: imageUrl instanceof File,
    });

    // UPDATE DB
    const { data, error: updateError } = await supabase
      .from("memories")
      .update({
        title: formData.title,
        description: formData.description,
        image: imageUrl,
        audio: audioUrl,
      })
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