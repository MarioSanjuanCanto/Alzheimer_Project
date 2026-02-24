// api/forgotPassword.ts
import { supabase } from "@/supabaseClient";

export const handleForgotPassword = async (email: string) => {
  if (!email) {
    throw new Error("Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `reset-password`,
  });

  if (error) {
    throw new Error(error.message);
  }
};
