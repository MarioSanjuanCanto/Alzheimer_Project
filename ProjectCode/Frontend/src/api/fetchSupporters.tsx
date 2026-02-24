import { supabase } from "@/supabaseClient";

export type Supporter = {
  id: string;
  fullName: string;
  email: string;
};

export const fetchSupporters = async (
  userId: string
): Promise<Supporter[]> => {
  const { data, error } = await supabase
    .from("admin_user_links")
    .select(
      `
      admin:admins (
        id,
        full_name,
        email
      )
    `
    )
    .eq("user_id", userId);

  if (error) {
    console.error("Failed to fetch supporters:", error);
    return [];
  }

  return (
    data?.map((row: any) => ({
      id: row.admin.id,
      fullName: row.admin.full_name,
      email: row.admin.email,
    })) ?? []
  );
};
