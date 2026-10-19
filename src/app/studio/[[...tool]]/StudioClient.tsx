"use client";

import { Studio } from "sanity";
import config from "../../../../sanity.config";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const isConfigured =
  Boolean(projectId) && projectId !== "your_project_id_here";

export default function StudioClient() {
  if (!isConfigured) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-stone-950 px-6 py-16 text-white">
        <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-rose-300">
            Sanity Setup Required
          </p>
          <h1 className="mt-4 text-3xl font-semibold text-white">
            The Studio route is ready, but this site is not connected to a
            Sanity project yet.
          </h1>
          <p className="mt-4 text-base leading-7 text-stone-300">
            Create a Sanity project, then add its values to{" "}
            <code className="rounded bg-white/10 px-2 py-1 text-sm text-rose-200">
              .env.local
            </code>{" "}
            and restart the dev server.
          </p>
          <pre className="mt-6 overflow-x-auto rounded-2xl border border-white/10 bg-stone-900/80 p-4 text-sm text-stone-200">
{`NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_SANITY_DATASET=${dataset}
SANITY_API_TOKEN=`}
          </pre>
          <p className="mt-4 text-sm leading-6 text-stone-400">
            You only need <code>NEXT_PUBLIC_SANITY_PROJECT_ID</code> and{" "}
            <code>NEXT_PUBLIC_SANITY_DATASET</code> to load the embedded studio.
            The API token is optional unless you need authenticated server-side
            Sanity requests.
          </p>
        </div>
      </main>
    );
  }

  return <Studio config={config} />;
}
