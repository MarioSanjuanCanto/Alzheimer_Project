import { supabase } from "../supabaseClient";
import { toast } from "sonner";

export const handleDeleteMemory = async (
  id: number,
  onSuccess: () => void
) => {
  const { error } = await supabase
    .from("memories")
    .delete()
    .eq("id", Number(id))

  if (error) {
    console.error("Error deleting memory:", error);
    alert("Failed to delete memory. Please try again.");
  } else {
    toast.success("Memory deleted successfully!");
    onSuccess();
  }
};


export default handleDeleteMemory;