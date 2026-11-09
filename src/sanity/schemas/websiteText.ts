import esMessages from "../../../messages/es.json";
import { copyDocuments, copyFieldName, type CopyDocument, type CopyField } from "../copy/definition";

/* ---------- Bilingual field types: a Spanish and an English box side by side ---------- */

const bilingual = (name: string, title: string, of: Record<string, unknown>) => ({
  name,
  title,
  type: "object" as const,
  options: { columns: 2 },
  fields: [
    { name: "es", title: "Español", ...of },
    { name: "en", title: "English", ...of },
  ],
});

const journeyStop = {
  name: "journeyStop",
  title: "Stop",
  type: "object" as const,
  fields: [
    { name: "title", title: "Name", type: "string" },
    { name: "description", title: "Description", type: "string" },
    {
      name: "search",
      title: "Episode search",
      type: "string",
      description: "Word the episodes page searches for when this stop is clicked. Episodes are in Spanish.",
    },
  ],
  preview: { select: { title: "title", subtitle: "description" } },
};

export const bilingualTypes = [
  bilingual("localeString", "Text", { type: "string" }),
  bilingual("localeText", "Text", { type: "text", rows: 3 }),
  bilingual("localeStringList", "List", { type: "array", of: [{ type: "string" }] }),
  bilingual("localeTextList", "Paragraphs", { type: "array", of: [{ type: "text", rows: 3 }] }),
  bilingual("localeStops", "Stops", { type: "array", of: [{ type: "journeyStop" }] }),
  journeyStop,
];

const fieldType = {
  string: "localeString",
  text: "localeText",
  stringList: "localeStringList",
  textList: "localeTextList",
  stops: "localeStops",
};

/* Placeholders like {name} are filled in by the site, so editors are told to keep them */
function placeholderHint(key: string) {
  const [namespace, name] = key.split(".");
  const text = (esMessages as Record<string, Record<string, unknown>>)[namespace]?.[name];
  const placeholders = typeof text === "string" ? text.match(/\{\w+\}/g) : null;
  if (!placeholders) return undefined;
  return `Keep ${placeholders.join(" and ")} exactly as written: the site fills it in.`;
}

export function websiteTextFields(doc: CopyDocument, fieldset?: string) {
  return doc.fields.map((field: CopyField) => ({
    name: copyFieldName(doc, field.key),
    title: field.title,
    type: fieldType[field.type ?? "string"],
    description: [field.description, placeholderHint(field.key)].filter(Boolean).join(" ") || undefined,
    fieldset: field.section ?? fieldset,
  }));
}

/* ---------- One singleton document per page (the About page text lives in "about") ---------- */

export const websiteTextDocuments = copyDocuments
  .filter((doc) => doc.id !== "about")
  .map((doc) => ({
    name: doc.id,
    title: doc.title,
    type: "document" as const,
    fieldsets: doc.sections?.map((section, index) => ({
      name: section.name,
      title: section.title,
      options: { collapsible: true, collapsed: index > 0 },
    })),
    fields: websiteTextFields(doc),
    preview: { prepare: () => ({ title: doc.title }) },
  }));

export const aboutTextDocument = copyDocuments.find((doc) => doc.id === "about")!;
