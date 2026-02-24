// api/resetPassword.ts
import { supabase } from "@/supabaseClient";

export const handleResetPassword = async (newPassword: string) => {
  if (!newPassword) {
    throw new Error("Password is required");
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    throw new Error(error.message);
  }
};
