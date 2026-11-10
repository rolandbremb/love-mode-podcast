import { createClient, type SanityClient } from "@sanity/client";
import { Resend } from "resend";

/* Shared by the website forms and the paid email: saving submissions to the
   Studio inbox and sending email through Resend. */

export function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// A Sanity client that can write; null until SANITY_WRITE_TOKEN is set
export function inboxClient(): SanityClient | null {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const token = process.env.SANITY_WRITE_TOKEN;
  if (!projectId || !token) return null;
  return createClient({
    projectId,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
    apiVersion: "2024-01-01",
    token,
    useCdn: false,
  });
}

// The dataset is public, but IDs with a "." prefix are only readable with a token,
// so submitters' details stay private while still showing in the Studio
export function newInboxId() {
  return `inbox.${crypto.randomUUID()}`;
}

// The team's inbox addresses (CONTACT_TO_EMAIL, comma-separated)
export function teamAddresses() {
  return (process.env.CONTACT_TO_EMAIL ?? "")
    .split(",")
    .map((address) => address.trim())
    .filter(Boolean);
}

// Sends one email; false when Resend isn't configured, throws if sending fails
export async function sendMail(message: {
  to: string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || message.to.length === 0) return false;

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: process.env.CONTACT_FROM_EMAIL || "Love Mode Website <onboarding@resend.dev>",
    ...message,
  });
  if (error) throw new Error(`${error.name}: ${error.message}`);
  return true;
}

// The table-style email the team gets for each submission
export function teamEmail(heading: string, rows: [string, string][]) {
  const filled = rows.filter(([, value]) => value);
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#2d1530;max-width:600px">
      <h2 style="color:#b01444;margin:0 0 16px">${escapeHtml(heading)}</h2>
      <table cellpadding="8" style="border-collapse:collapse;width:100%">
        ${filled
          .map(
            ([label, value]) =>
              `<tr><td style="font-weight:bold;vertical-align:top;width:35%;border-bottom:1px solid #ffe0e8">${escapeHtml(label)}</td><td style="white-space:pre-wrap;border-bottom:1px solid #ffe0e8">${escapeHtml(value)}</td></tr>`
          )
          .join("")}
      </table>
      <p style="color:#8e1330;font-size:12px;margin-top:20px">Reply to this email to answer them directly. A copy is saved in the Studio inbox.</p>
    </div>`;
  const text = `${heading}\n\n${filled.map(([label, value]) => `${label}: ${value}`).join("\n")}`;
  return { html, text };
}
