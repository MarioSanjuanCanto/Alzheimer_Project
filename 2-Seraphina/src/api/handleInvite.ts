import { supabase } from "../supabaseClient";

export const handleUserInvite = async (
  email: string,
  currentAdminId: string
) => {
  if (!email) return alert("Email is required");

  try {
    const token = crypto.randomUUID();

    // Save invite in Supabase
    const { data: invite, error } = await supabase
      .from("invites_for_users")
      .insert({ admin_id: currentAdminId, email, token, status: "pending" })
      .select("*")
      .single();

    if (error) throw new Error(error.message);

    // --- CHANGED: Added &role=user ---
    const inviteUrl = `${window.location.origin}/register?inviteToken=${token}&role=user`;

    // Send email via Edge Function
    await fetch(
      "https://bctkatrszylphkujbkje.supabase.co/functions/v1/send-invite",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        // It is helpful to pass the role explicitly in the body too, 
        // in case your email template needs to say "You are invited as a User"
        body: JSON.stringify({ 
          email, 
          inviteUrl, 
          invitedRole: "user" 
        }),
      }
    );

    alert("Invite sent!");
  } catch (err: any) {
    alert(err.message);
  }
};

export const handleSupporterInvite = async (
  email: string,
  currentProfileId: string,
  userIdToAssign?: string
) => {
  if (!email) return alert("Email is required");

  try {
    const token = crypto.randomUUID();

    const { error: inviteError } = await supabase
      .from("invites_for_admins")
      .insert({
        invited_email: email,
        token,
        status: "pending",
        user_id: userIdToAssign,
        admin_id: currentProfileId,
      });

    if (inviteError) throw new Error(inviteError.message);

    // --- CHANGED: Added &role=admin ---
    const inviteUrl = `${window.location.origin}/register?inviteToken=${token}&role=admin`;

    await fetch(
      "https://bctkatrszylphkujbkje.supabase.co/functions/v1/send-invite",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        // It is helpful to pass the role explicitly in the body too
        body: JSON.stringify({ 
          email, 
          inviteUrl, 
          invitedRole: "admin" 
        }),
      }
    );

    alert("Admin invite sent!");
  } catch (err: any) {
    alert(err.message);
  }
};