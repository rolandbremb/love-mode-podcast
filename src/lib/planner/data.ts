import { cache } from "react";
import { inboxClient } from "@/lib/inbox";
import { showUpcoming } from "@/lib/socialProof";
import { dayKey } from "@/lib/dashboard/summary";
import type { Contact, Episode, Post } from "@/lib/planner/shared";

/* The planner's contacts, episodes and posts live in Sanity, next to the website
   inbox, under private "planner." ids (readable only with SANITY_WRITE_TOKEN).
   Locally, without a token, it shows labelled sample data and saving is off. */

export type Planner = { contacts: Contact[]; episodes: Episode[]; posts: Post[] };
export type PlannerSource = { status: "ok" | "missing" | "error"; data: Planner; sample: boolean };

const CONTACT_FIELDS = `_id, name, kind, stage, company, email, phone, social, website, tags, notes, lastContacted, followUp, sourceId`;
const EPISODE_FIELDS = `_id, title, number, stage, "guestIds": coalesce(guests[]._ref, []), recordDate, recordTime, publishDate, summary, questions, notes, link, "checklist": coalesce(checklist, [])`;
const POST_FIELDS = `_id, title, "platforms": coalesce(platforms, []), format, stage, date, time, caption, notes, link, "episodeId": episode._ref`;

export const loadPlanner = cache(async (): Promise<PlannerSource> => {
  const empty: Planner = { contacts: [], episodes: [], posts: [] };
  const client = inboxClient();
  if (!client) {
    return showUpcoming ? { status: "missing", data: samplePlanner(), sample: true } : { status: "missing", data: empty, sample: false };
  }
  try {
    const data = await client.fetch<Planner>(
      `{
        "contacts": *[_type == "contact"] | order(lower(name) asc)[0...2000]{ ${CONTACT_FIELDS} },
        "episodes": *[_type == "plannerEpisode"] | order(coalesce(publishDate, recordDate, "9999") asc, _createdAt asc)[0...1000]{ ${EPISODE_FIELDS} },
        "posts": *[_type == "contentPost"] | order(coalesce(date, "9999") asc, time asc, _createdAt asc)[0...3000]{ ${POST_FIELDS} }
      }`
    );
    return { status: "ok", data, sample: false };
  } catch (error) {
    console.error("[planner] Sanity:", error);
    return { status: "error", data: empty, sample: false };
  }
});

// ---------- Sample data (local only, before the Studio is connected) ----------

function inDays(days: number) {
  return dayKey(new Date(Date.now() + days * 86_400_000));
}

function samplePlanner(): Planner {
  const contacts: Contact[] = [
    { _id: "planner.00000000-0000-4000-8000-000000000001", name: "Sample: Gabriela Zuluaga", kind: "guest", stage: "confirmed", email: "gabriela@example.com", social: "@gabizuluaga", tags: ["dating", "coach"], followUp: inDays(1) },
    { _id: "planner.00000000-0000-4000-8000-000000000002", name: "Sample: Dra. Betsy Reuss", kind: "expert", stage: "talking", email: "betsy@example.com", lastContacted: inDays(-6), followUp: inDays(-1) },
    { _id: "planner.00000000-0000-4000-8000-000000000003", name: "Sample: Per'la", kind: "brand", stage: "worked", company: "Per'la Swim", email: "hola@example.com", website: "example.com" },
    { _id: "planner.00000000-0000-4000-8000-000000000004", name: "Sample: Camila Restrepo", kind: "guest", stage: "idea", social: "@camirestrepo", notes: "Wrote a book about dating after divorce." },
  ];
  const checklist = (done: number) =>
    ["Guest confirmed", "Questions ready", "Recorded", "Edited", "Thumbnail", "Title & show notes", "Uploaded to YouTube & Spotify", "Clips planned for social"].map(
      (label, i) => ({ _key: `k${i}`, label, done: i < done })
    );
  const episodes: Episode[] = [
    { _id: "planner.00000000-0000-4000-8000-000000000011", title: "Sample: Volver al dating después del divorcio", number: 42, stage: "editing", guestIds: [contacts[0]._id], recordDate: inDays(-5), publishDate: inDays(4), checklist: checklist(4), summary: "How to know you're ready to date again." },
    { _id: "planner.00000000-0000-4000-8000-000000000012", title: "Sample: La neurociencia del apego", number: 43, stage: "scheduled", guestIds: [contacts[1]._id], recordDate: inDays(2), recordTime: "11:00", publishDate: inDays(18), checklist: checklist(1) },
    { _id: "planner.00000000-0000-4000-8000-000000000013", title: "Sample: Red flags en las apps", stage: "idea", guestIds: [], checklist: checklist(0) },
  ];
  const posts: Post[] = [
    { _id: "planner.00000000-0000-4000-8000-000000000021", title: "Sample: Clip: “I wasn't ready, and that's okay”", platforms: ["instagram", "tiktok", "shorts"], format: "reel", stage: "ready", date: inDays(4), time: "18:00", episodeId: episodes[0]._id },
    { _id: "planner.00000000-0000-4000-8000-000000000022", title: "Sample: Episode 42 is out", platforms: ["newsletter"], format: "email", stage: "drafting", date: inDays(4), episodeId: episodes[0]._id },
    { _id: "planner.00000000-0000-4000-8000-000000000023", title: "Sample: 5 signs you're ready to date again", platforms: ["instagram"], format: "carousel", stage: "idea", date: inDays(7) },
    { _id: "planner.00000000-0000-4000-8000-000000000024", title: "Sample: Behind the scenes, recording day", platforms: ["instagram"], format: "story", stage: "scheduled", date: inDays(2) },
    { _id: "planner.00000000-0000-4000-8000-000000000025", title: "Sample: Q&A live with listeners", platforms: ["instagram", "youtube"], format: "live", stage: "idea" },
  ];
  return { contacts, episodes, posts };
}

// How many website guest applications and brand inquiries aren't contacts yet
export const loadUnsavedSubmissions = cache(async () => {
  const client = inboxClient();
  if (!client) return 0;
  try {
    return await client.fetch<number>(
      `count(*[_type in ["guestApplication", "brandInquiry"] && !(_id in *[_type == "contact"].sourceId)])`
    );
  } catch {
    return 0;
  }
});

// The next N days, as "YYYY-MM-DD" keys in Miami time, starting today
export function upcomingDays(days: number) {
  return { from: dayKey(new Date()), to: dayKey(new Date(Date.now() + (days - 1) * 86_400_000)) };
}
