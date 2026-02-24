import { supabase } from "@/supabaseClient";

export const handleDeleteAccount = async () => {
  const { data: sessionData } = await supabase.auth.getSession();

  const accessToken = sessionData.session?.access_token;
  if (!accessToken) {
    throw new Error("Not authenticated");
  }

  const res = await fetch(
    "https://bctkatrszylphkujbkje.supabase.co/functions/v1/delete-account",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to delete account");
  }

  await supabase.auth.signOut();
};
