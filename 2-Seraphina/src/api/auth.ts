import { supabase } from "../supabaseClient";

/**
 * Links a User (Participant) with an Admin (Supporter)
 * when the User accepts an invite.
 */
const linkUserWithAdmin = async (inviteToken: string, userId: string) => {
  const { data: invite, error: inviteError } = await supabase
    .from("invites_for_users")
    .select("admin_id")
    .eq("token", inviteToken)
    .single();

  if (inviteError || !invite) {
    throw new Error("Invalid or expired invite token");
  }

  const { error: linkError } = await supabase.from("user_admin_links").insert({
    admin_id: invite.admin_id,
    user_id: userId,
  });

  if (linkError) throw new Error(linkError.message);

  const { error: updateError } = await supabase
    .from("invites_for_users")
    .update({ status: "accepted" })
    .eq("token", inviteToken);

  if (updateError) throw new Error(updateError.message);
};

/**
 * Links an Admin (Supporter) with a User (Participant)
 * when the Admin accepts an invite.
 */
const linkAdminWithUser = async (inviteToken: string, adminId: string) => {
  const { data: invite, error: inviteError } = await supabase
    .from("invites_for_admins")
    .select("user_id")
    .eq("token", inviteToken)
    .single();

  if (inviteError || !invite) {
    throw new Error("Invalid or expired invite token");
  }

  if (!invite.user_id) throw new Error("Invite is missing user_id");

  const { error: linkError } = await supabase.from("admin_user_links").insert({
    admin_id: adminId,
    user_id: invite.user_id,
  });

  if (linkError) throw new Error(linkError.message);

  const { error: updateError } = await supabase
    .from("invites_for_admins")
    .update({ status: "accepted" })
    .eq("token", inviteToken);

  if (updateError) throw new Error(updateError.message);
};

/**
 * REGISTER USER OR ADMIN
 * Now includes the trigger to send the invitation email in Step 3.
 */
export const registerUser = async ({
  email,
  password,
  selectedRole,
  full_name: fullName,
  inviteToken,
  linkEmail,
}: {
  email: string;
  password: string;
  selectedRole: "user" | "admin";
  full_name: string;
  inviteToken?: string | null;
  linkEmail?: string;
}) => {
  if (!selectedRole) throw new Error("Role not selected");

  // 1. Create the Auth User
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });

  if (authError) throw new Error(authError.message);
  if (!authData.user) throw new Error("Auth user not returned");

  const authUserId = authData.user.id;

  // --- SCENARIO A: REGISTERING AS AN ADMIN (SUPPORTER) ---
  if (selectedRole === "admin") {
    const { data: adminRow, error: adminError } = await supabase
      .from("admins")
      .insert({
        auth_id: authUserId,
        email,
        full_name: fullName,
      })
      .select("id")
      .single();

    if (adminError) throw new Error(adminError.message);
    if (!adminRow) throw new Error("Admin row not returned");

    // STEP 3 LOGIC: Save invite AND trigger the Edge Function email
    if (linkEmail && linkEmail.trim() !== "") {
      const token = crypto.randomUUID();
      const cleanEmail = linkEmail.toLowerCase().trim();
      const { error: inviteError } = await supabase
        .from("invites_for_users")
        .insert({
          admin_id: adminRow.id,
          email: cleanEmail,
          token: token,
          status: "pending",
        });

      if (!inviteError) {

        // Construct the URL exactly as the user will see it
        const inviteUrl = `${window.location.origin}/register?inviteToken=${token}&role=user`;
        try {
          const { data, error: funcError } = await supabase.functions.invoke(
            "send-invite",
            {
              body: {
                email: cleanEmail,
                inviteUrl: inviteUrl,
                invitedRole: "user",
              },
            }
          );

          if (funcError) {
            console.error("Edge Function returned an error:", funcError);
          } else {
            console.log("Edge Function Response:", data);
          }
        } catch (err) {
          console.error("Failed to call Edge Function:", err);
        }
      } else {
        console.error("Database Error on invite insert:", inviteError);
      }
    }

    if (inviteToken) {
      try {
        await linkAdminWithUser(inviteToken, adminRow.id);
      } catch (e) {
        console.error("Failed to link admin with invite:", e);
      }
    }
  }

  // --- SCENARIO B: REGISTERING AS A USER (PRACTICER) ---
  if (selectedRole === "user") {
    const { data: userRow, error: userError } = await supabase
      .from("users")
      .insert({
        auth_id: authUserId,
        email,
        full_name: fullName,
        allow_memory_creation: true,
      })
      .select("id")
      .single();

    if (userError) throw new Error(userError.message);
    if (!userRow) throw new Error("User row not returned");

    if (inviteToken) {
      try {
        await linkUserWithAdmin(inviteToken, userRow.id);
      } catch (e) {
        console.error("Failed to link user with invite:", e);
      }
    }
  }

  return authData.user;
};

/**
 * LOGIN USER
 */
export const loginUser = async ({
  email,
  password,
  inviteToken,
}: {
  email: string;
  password: string;
  inviteToken?: string | null;
}) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message.toLowerCase().includes("invalid login credentials")) {
      throw new LoginError(
        "INVALID_CREDENTIALS",
        "Email or password is incorrect"
      );
    }
    throw new LoginError("UNKNOWN", "Something went wrong");
  }

  if (!data.user) throw new LoginError("UNKNOWN", "Authentication failed");

  const authUserId = data.user.id;

  // Check if Admin
  const { data: adminRow } = await supabase
    .from("admins")
    .select("id")
    .eq("auth_id", authUserId)
    .single();

  if (adminRow) {
    if (inviteToken) await linkAdminWithUser(inviteToken, adminRow.id);
    return { user: data.user, role: "admin" as const };
  }

  // Check if User
  const { data: userRow } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", authUserId)
    .single();

  if (userRow) {
    if (inviteToken) await linkUserWithAdmin(inviteToken, userRow.id);
    return { user: data.user, role: "user" as const };
  }

  throw new LoginError("UNKNOWN", "No role assigned to this user");
};

export class LoginError extends Error {
  code: "INVALID_CREDENTIALS" | "UNKNOWN";
  constructor(code: LoginError["code"], message: string) {
    super(message);
    this.code = code;
  }
}
