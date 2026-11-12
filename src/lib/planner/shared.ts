// The planner's options and types, shared by its server code, its forms and the Studio
// schemas (safe in the browser: no secrets, no server imports)

export type Option = { value: string; label: string };

// ---------- Contacts ----------

export const CONTACT_KINDS: Option[] = [
  { value: "guest", label: "Guest" },
  { value: "brand", label: "Brand" },
  { value: "expert", label: "Expert" },
  { value: "press", label: "Press & media" },
  { value: "collaborator", label: "Collaborator" },
  { value: "other", label: "Other" },
];

export const CONTACT_STAGES: Option[] = [
  { value: "idea", label: "Want to reach" },
  { value: "contacted", label: "Contacted" },
  { value: "talking", label: "In talks" },
  { value: "confirmed", label: "Confirmed" },
  { value: "worked", label: "Worked together" },
  { value: "notAFit", label: "Not a fit" },
];

export type Contact = {
  _id: string;
  name: string;
  kind: string;
  stage: string;
  company?: string;
  email?: string;
  phone?: string;
  social?: string;
  website?: string;
  tags?: string[];
  notes?: string;
  lastContacted?: string;
  followUp?: string;
  // The inbox submission this contact was saved from, so it's only saved once
  sourceId?: string;
};

// ---------- Episodes ----------

export const EPISODE_STAGES: Option[] = [
  { value: "idea", label: "Idea" },
  { value: "booking", label: "Booking guest" },
  { value: "scheduled", label: "Recording booked" },
  { value: "recorded", label: "Recorded" },
  { value: "editing", label: "Editing" },
  { value: "ready", label: "Ready to publish" },
  { value: "published", label: "Published" },
];

// Every new episode starts with these steps; they can be ticked off on its page
export const DEFAULT_CHECKLIST = [
  "Guest confirmed",
  "Questions ready",
  "Recorded",
  "Edited",
  "Thumbnail",
  "Title & show notes",
  "Uploaded to YouTube & Spotify",
  "Clips planned for social",
];

export type ChecklistItem = { _key: string; label: string; done: boolean };

export type Episode = {
  _id: string;
  title: string;
  number?: number;
  stage: string;
  guestIds: string[];
  recordDate?: string;
  recordTime?: string;
  publishDate?: string;
  summary?: string;
  questions?: string;
  notes?: string;
  link?: string;
  checklist: ChecklistItem[];
};

// ---------- Social posts ----------

// Each platform keeps its colour wherever it shows (calendar, lists, pills)
export const PLATFORMS: (Option & { color: string; ink: string })[] = [
  { value: "instagram", label: "Instagram", color: "#e87ba4", ink: "#2d1530" },
  { value: "tiktok", label: "TikTok", color: "#2d1530", ink: "#fff2ec" },
  { value: "youtube", label: "YouTube", color: "#eb6834", ink: "#2d1530" },
  { value: "shorts", label: "YouTube Shorts", color: "#eda100", ink: "#2d1530" },
  { value: "facebook", label: "Facebook", color: "#2a78d6", ink: "#ffffff" },
  { value: "newsletter", label: "Newsletter", color: "#1baf7a", ink: "#2d1530" },
  { value: "other", label: "Other", color: "#d9cbd6", ink: "#2d1530" },
];

export const POST_FORMATS: Option[] = [
  { value: "reel", label: "Reel / short video" },
  { value: "carousel", label: "Carousel" },
  { value: "post", label: "Photo post" },
  { value: "story", label: "Story" },
  { value: "video", label: "Full episode" },
  { value: "live", label: "Live" },
  { value: "email", label: "Email" },
];

export const POST_STAGES: Option[] = [
  { value: "idea", label: "Idea" },
  { value: "drafting", label: "Drafting" },
  { value: "ready", label: "Ready" },
  { value: "scheduled", label: "Scheduled" },
  { value: "posted", label: "Posted" },
];

export type Post = {
  _id: string;
  title: string;
  platforms: string[];
  format?: string;
  stage: string;
  date?: string;
  time?: string;
  caption?: string;
  notes?: string;
  link?: string;
  episodeId?: string;
};

// ---------- Shared ----------

export type PlannerType = "contact" | "plannerEpisode" | "contentPost";

export const STAGES: Record<PlannerType, Option[]> = {
  contact: CONTACT_STAGES,
  plannerEpisode: EPISODE_STAGES,
  contentPost: POST_STAGES,
};

export function labelFor(options: Option[], value?: string) {
  return options.find((option) => option.value === value)?.label ?? value ?? "";
}

// Planner documents are saved as "planner.<uuid>": the dot keeps them private in the
// public dataset. Page addresses only carry the uuid.
export const PLANNER_PREFIX = "planner.";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export function idFromSlug(slug: string) {
  return UUID.test(slug) ? `${PLANNER_PREFIX}${slug}` : null;
}

export function slugFromId(id: string) {
  return id.startsWith(PLANNER_PREFIX) ? id.slice(PLANNER_PREFIX.length) : id;
}
