import { copyDocuments, copyFieldName, type CopyFieldType } from "@/sanity/copy/definition";
import { getWebsiteText } from "@/sanity/client";

type Messages = Record<string, Record<string, unknown>>;

/* Text from the Studio may only use the {placeholders} the original has; anything
   else with braces would break message formatting, so it falls back instead. */
function keepsPlaceholders(original: unknown, text: string) {
  const allowed = new Set(typeof original === "string" ? original.match(/\{\w+\}/g) ?? [] : []);
  const rest = text.replace(/\{\w+\}/g, (token) => (allowed.has(token) ? "" : "{"));
  return !/[{}]/.test(rest);
}

function cleanValue(value: unknown, type: CopyFieldType, original: unknown) {
  if (type === "string" || type === "text") {
    if (typeof value !== "string" || !value.trim()) return undefined;
    return keepsPlaceholders(original, value.trim()) ? value.trim() : undefined;
  }
  if (!Array.isArray(value)) return undefined;
  if (type === "sections") {
    const sections = value
      .filter((section) => section && typeof section.heading === "string" && section.heading.trim())
      .map((section) => ({ heading: String(section.heading).trim(), body: String(section.body ?? "").trim() }));
    return sections.length > 0 ? sections : undefined;
  }
  if (type === "stops") {
    const stops = value
      .filter((stop) => stop && typeof stop.title === "string" && stop.title.trim())
      .map((stop) => ({
        title: String(stop.title).trim(),
        description: String(stop.description ?? "").trim(),
        search: String(stop.search ?? "").trim(),
      }));
    return stops.length > 0 ? stops : undefined;
  }
  const items = value.filter((item) => typeof item === "string" && item.trim()).map((item: string) => item.trim());
  return items.length > 0 ? items : undefined;
}

/* Lays the Studio's website text over the bundled translations for one locale.
   Empty Studio fields keep the bundled text, so the site never shows a blank. */
export async function withWebsiteText(messages: Messages, locale: string, preview: boolean): Promise<Messages> {
  const docs = await getWebsiteText(copyDocuments.map((doc) => doc.id), { preview });
  if (docs.length === 0) return messages;

  const merged: Messages = Object.fromEntries(Object.entries(messages).map(([ns, keys]) => [ns, { ...keys }]));
  for (const doc of copyDocuments) {
    const data = docs.find((candidate) => candidate._type === doc.id);
    if (!data) continue;
    for (const field of doc.fields) {
      const [namespace, key] = field.key.split(".");
      const localized = data[copyFieldName(doc, field.key)] as Record<string, unknown> | undefined;
      const value = cleanValue(localized?.[locale], field.type ?? "string", merged[namespace]?.[key]);
      if (value !== undefined) merged[namespace] = { ...merged[namespace], [key]: value };
    }
  }
  return merged;
}
