import { createClient } from "next-sanity";
import { defineEnableDraftMode } from "next-sanity/draft-mode";

// The Studio's Presentation tool creates a short-lived secret for each preview;
// this checks it with Sanity and only redirects to paths on this site
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;

export const GET = projectId
  ? defineEnableDraftMode({
      client: createClient({
        projectId,
        dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
        apiVersion: "2024-01-01",
        useCdn: false,
        token: process.env.SANITY_API_TOKEN,
      }),
    }).GET
  : () => new Response("Sanity is not configured", { status: 500 });
