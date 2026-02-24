import { supabase } from "../supabaseClient";

// Define the user type
export interface LinkedUser {
  id: string;       // DB primary key
  auth_id: string;  // Supabase Auth UUID
  fullName: string;
  email: string;
}

export const getLinkedUsers = async (adminId: string): Promise<LinkedUser[]> => {
  if (!adminId) return [];

  const { data: links, error } = await supabase
    .from("user_admin_links")
    .select(`
      user:users (
        id,
        auth_id,
        full_name,
        email
      )
    `)
    .eq("admin_id", adminId);

  if (error) {
    console.error("Error fetching linked users:", error);
    return [];
  }

  if (!links) return [];

  // Map to flat array of LinkedUser
  return links.map((link: any) => ({
    id: link.user.id,
    auth_id: link.user.auth_id,
    fullName: link.user.full_name, // map snake_case → camelCase
    email: link.user.email,
  }));
};
