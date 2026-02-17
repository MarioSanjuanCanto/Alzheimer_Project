import { supabase } from "@/supabaseClient";

type DisconnectUserParams = {
  adminId: string;
  userId: string;
};

export const handleDisconnectUser = async ({
  adminId,
  userId,
}: DisconnectUserParams) => {
  if (!adminId || !userId) {
    throw new Error("Missing admin or user id");
  }

  const { error } = await supabase
    .from("user_admin_links")
    .delete()
    .eq("admin_id", adminId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }
};
