import { supabase } from "@/supabaseClient";

export const handleDeleteAccount = async () => {
  const { data: sessionData } = await supabase.auth.getSession();

  const accessToken = sessionData.session?.access_token;
  const userId = sessionData.session?.user?.id;

  if (!accessToken || !userId) {
    throw new Error("Not authenticated");
  }

  const res = await fetch(
    "http://localhost:5001/api/delete_account",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ user_id: userId }),
    }
  );

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to delete account");
  }

  await supabase.auth.signOut();
};
