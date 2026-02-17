import { supabase } from "@/supabaseClient";

type UpdateAdminProfileParams = {
  adminId: string;   // admins.id (internal)
  fullName: string;
  email: string;     // new email
};

export const updateAdminProfile = async ({
  adminId,
  fullName,
  email,
}: UpdateAdminProfileParams) => {
  if (!adminId) {
    throw new Error("Admin ID is required");
  }

  // 1. Update AUTH email (triggers confirmation email)
  const { error: authError } = await supabase.auth.updateUser({
    email,
  });

  if (authError) {
    throw new Error(authError.message);
  }

  // 2. Update admins table
  const { error: dbError } = await supabase
    .from("admins")
    .update({
      full_name: fullName,
      email,
    })
    .eq("id", adminId);

  if (dbError) {
    throw new Error(dbError.message);
  }
};


