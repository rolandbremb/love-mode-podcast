import {
  CONTACT_KINDS,
  CONTACT_STAGES,
  EPISODE_STAGES,
  PLATFORMS,
  POST_FORMATS,
  POST_STAGES,
  labelFor,
  type Option,
} from "../../lib/planner/shared";

/* The dashboard's planner: contacts, episodes in production and social posts. They're
   added and edited on /dashboard and saved under private "planner." ids; these
   schemas let them be read and corrected in the Studio too. */

const list = (options: Option[]) => ({ list: options.map(({ value, label }) => ({ value, title: label })) });

export const contact = {
  name: "contact",
  title: "Contact",
  type: "document" as const,
  fields: [
    { name: "name", title: "Name", type: "string", validation: (rule: { required: () => unknown }) => rule.required() },
    { name: "kind", title: "Type", type: "string", options: list(CONTACT_KINDS) },
    { name: "stage", title: "Stage", type: "string", options: list(CONTACT_STAGES) },
    { name: "company", title: "Company / role", type: "string" },
    { name: "email", title: "Email", type: "string" },
    { name: "phone", title: "Phone / WhatsApp", type: "string" },
    { name: "social", title: "Instagram / TikTok", type: "string" },
    { name: "website", title: "Website", type: "string" },
    { name: "tags", title: "Tags", type: "array", of: [{ type: "string" }], options: { layout: "tags" } },
    { name: "notes", title: "Notes", type: "text", rows: 6 },
    { name: "lastContacted", title: "Last contacted", type: "date" },
    { name: "followUp", title: "Follow up on", type: "date" },
    { name: "sourceId", title: "Saved from website submission", type: "string", readOnly: true, hidden: ({ value }: { value?: string }) => !value },
  ],
  orderings: [{ title: "Name", name: "nameAsc", by: [{ field: "name", direction: "asc" }] }],
  preview: {
    select: { title: "name", kind: "kind", stage: "stage" },
    prepare: ({ title, kind, stage }: Record<string, string | undefined>) => ({
      title,
      subtitle: [labelFor(CONTACT_KINDS, kind), labelFor(CONTACT_STAGES, stage)].filter(Boolean).join(", "),
    }),
  },
};

export const plannerEpisode = {
  name: "plannerEpisode",
  title: "Episode plan",
  type: "document" as const,
  fields: [
    { name: "title", title: "Working title", type: "string", validation: (rule: { required: () => unknown }) => rule.required() },
    { name: "number", title: "Number", type: "number" },
    { name: "stage", title: "Stage", type: "string", options: list(EPISODE_STAGES) },
    { name: "guests", title: "Guests", type: "array", of: [{ type: "reference", to: [{ type: "contact" }], weak: true }] },
    { name: "recordDate", title: "Recording date", type: "date" },
    { name: "recordTime", title: "Recording time (Miami)", type: "string" },
    { name: "publishDate", title: "Release date", type: "date" },
    { name: "summary", title: "What it's about", type: "text", rows: 3 },
    { name: "questions", title: "Questions & outline", type: "text", rows: 10 },
    { name: "notes", title: "Notes", type: "text", rows: 4 },
    { name: "link", title: "Link once it's live", type: "url" },
    {
      name: "checklist",
      title: "Checklist",
      type: "array",
      of: [
        {
          type: "object",
          name: "step",
          fields: [
            { name: "label", title: "Step", type: "string" },
            { name: "done", title: "Done", type: "boolean" },
          ],
          preview: {
            select: { title: "label", done: "done" },
            prepare: ({ title, done }: { title?: string; done?: boolean }) => ({ title: `${done ? "✓" : "○"} ${title ?? ""}` }),
          },
        },
      ],
    },
  ],
  orderings: [{ title: "Release date", name: "publishDesc", by: [{ field: "publishDate", direction: "desc" }] }],
  preview: {
    select: { title: "title", number: "number", stage: "stage", publishDate: "publishDate" },
    prepare: ({ title, number, stage, publishDate }: Record<string, string | number | undefined>) => ({
      title: `${number ? `${number}. ` : ""}${title ?? ""}`,
      subtitle: [labelFor(EPISODE_STAGES, stage as string), publishDate ? `out ${publishDate}` : ""].filter(Boolean).join(", "),
    }),
  },
};

export const contentPost = {
  name: "contentPost",
  title: "Social post",
  type: "document" as const,
  fields: [
    { name: "title", title: "Hook / working title", type: "string", validation: (rule: { required: () => unknown }) => rule.required() },
    { name: "platforms", title: "Where", type: "array", of: [{ type: "string" }], options: { ...list(PLATFORMS), layout: "grid" } },
    { name: "format", title: "Format", type: "string", options: list(POST_FORMATS) },
    { name: "stage", title: "Stage", type: "string", options: list(POST_STAGES) },
    { name: "date", title: "Date", type: "date" },
    { name: "time", title: "Time (Miami)", type: "string" },
    { name: "episode", title: "From episode", type: "reference", to: [{ type: "plannerEpisode" }], weak: true },
    { name: "caption", title: "Caption / script", type: "text", rows: 8 },
    { name: "notes", title: "Notes", type: "text", rows: 3 },
    { name: "link", title: "Link once it's posted", type: "url" },
  ],
  orderings: [{ title: "Date", name: "dateDesc", by: [{ field: "date", direction: "desc" }] }],
  preview: {
    select: { title: "title", date: "date", stage: "stage" },
    prepare: ({ title, date, stage }: Record<string, string | undefined>) => ({
      title,
      subtitle: [date ?? "No date", labelFor(POST_STAGES, stage)].filter(Boolean).join(", "),
    }),
  },
};
