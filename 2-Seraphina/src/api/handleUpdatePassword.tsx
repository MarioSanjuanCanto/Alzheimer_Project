import { supabase } from "@/supabaseClient";

export const updatePassword = async (
  email: string,
  oldPassword: string,
  newPassword: string
) => {
  // 1. Re-authenticate user (important)
  const { error: signInError } =
    await supabase.auth.signInWithPassword({
      email,
      password: oldPassword,
    });

  if (signInError) {
    throw new Error("Old password is incorrect");
  }

  // 2. Update password
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) {
    throw new Error(updateError.message);
  }
};
