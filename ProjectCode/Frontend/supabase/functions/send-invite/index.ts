import React from "npm:react@18.3.1";
import nodemailer from "npm:nodemailer";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import { MagicLinkEmail } from "./_templates/magic-link.tsx";

Deno.serve(async (req) => {
  const gmailUser = Deno.env.get("GMAIL_USER");
  const gmailPassword = Deno.env.get("GMAIL_APP_PASSWORD");

  if (!gmailUser || !gmailPassword) {
    console.error("GMAIL_USER or GMAIL_APP_PASSWORD is not set in environment variables");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: gmailUser,
      pass: gmailPassword,
    },
  });
  const headers = new Headers({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, apikey, x-client-info",
  });

  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers,
    });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", {
      status: 405,
      headers,
    });
  }

  try {
    const { email, inviteUrl, invitedRole } = await req.json();

    const html = await renderAsync(
      React.createElement(MagicLinkEmail, {
        supabase_url: Deno.env.get("SUPABASE_URL") ?? "",
        redirect_to: inviteUrl,
      })
    );

    await transporter.sendMail({
      from: `"Your App" <${gmailUser}>`,
      to: email,
      subject: `You have been invited!`,
      html,
    });

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers,
      }
    );
  } catch (err) {
    console.error(err);

    return new Response(
      JSON.stringify({ error: err.message }),
      {
        status: 500,
        headers,
      }
    );
  }
});