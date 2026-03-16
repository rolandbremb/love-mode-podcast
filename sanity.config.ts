/**
 * Sanity Studio configuration.
 *
 * This file is used when running `npx sanity dev` (local studio)
 * or `npx sanity deploy` (deploy hosted studio).
 *
 * To use, first install the Sanity Studio as a dev dependency:
 *   npm install --save-dev sanity @sanity/vision styled-components
 *
 * Then run:
 *   npx sanity dev    — local studio at http://localhost:3333
 *   npx sanity deploy — deploy to https://<name>.sanity.studio
 */
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./src/sanity/schemas";

export default defineConfig({
  name: "love-mode-podcast",
  title: "Love Mode Podcast",
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  plugins: [structureTool()],
  schema: { types: schemaTypes },
});
