import React from "npm:react@18.3.1";
import { Resend } from "npm:resend@4.0.0";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import { MagicLinkEmail } from "./_templates/magic-link.tsx";

const resend = new Resend(Deno.env.get("RESEND_API_KEY") as string);

Deno.serve(async (req) => {
  const headers = new Headers({
    "Access-Control-Allow-Origin": "*", 
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    // Added 'apikey' and 'x-client-info' to the existing list
    "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info", 
  });

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: headers,
    });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers });
  }

  try {
    const { email, inviteUrl, invitedRole } = await req.json();

    if (!email || !inviteUrl) {
      return new Response(
        JSON.stringify({ error: "Missing email or inviteUrl" }),
        { status: 400, headers }
      );
    }

    const inviteUrlWithRole = inviteUrl.includes("role=") 
      ? inviteUrl 
      : `${inviteUrl}&role=${invitedRole || 'user'}`;

    const html = await renderAsync(
      React.createElement(MagicLinkEmail, {
        supabase_url: Deno.env.get("SUPABASE_URL") ?? "",
        redirect_to: inviteUrlWithRole,
      })
    );

    const { error } = await resend.emails.send({
      from: "Your App <onboarding@resend.dev>",
      to: [email],
      subject: `You have been invited as ${invitedRole === 'admin' ? 'a Supporter' : 'a User'}!`,
      html,
    });

    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers,
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers,
    });
  }
});