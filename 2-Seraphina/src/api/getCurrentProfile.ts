import { supabase } from "@/supabaseClient";

export async function getCurrentProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: admin } = await supabase
    .from("admins")
    .select("id, full_name, email") 
    .eq("auth_id", user.id)
    .single();

  if (admin) {
    return {
      role: "admin",
      id: admin.id,          
      authId: user.id,   
      fullName: admin.full_name,
      email: admin.email,
      authEmail: user.email,
      allow_memory_creation: true, 
    };
  }

  const { data: userProfile } = await supabase
    .from("users")
    .select("id, full_name, email, allow_memory_creation") 
    .eq("auth_id", user.id)
    .single();

  if (userProfile) {
    return {
      role: "user",
      id: userProfile.id,  
      authId: user.id,      
      fullName: userProfile.full_name,
      email: userProfile.email,
      authEmail: user.email,
      allow_memory_creation: userProfile.allow_memory_creation, 
    };
  }

  return null;
}