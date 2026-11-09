import { draftMode } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import { withWebsiteText } from "./websiteText";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !([...routing.locales] as string[]).includes(locale)) {
    locale = routing.defaultLocale;
  }

  // In the Studio's preview, show unpublished edits to the website text too
  let preview = false;
  try {
    preview = (await draftMode()).isEnabled;
  } catch {
    // Outside a request (e.g. at build time) there is no preview
  }

  const messages = (await import(`../../messages/${locale}.json`)).default;
  return {
    locale,
    messages: await withWebsiteText(messages, locale, preview),
  };
});
