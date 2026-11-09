import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

/* Sends addresses without a language (lovemodepod.com/episodes) to the Spanish
   version (/es/episodes), the same way the home page already does. Spanish is
   always the default, whatever language the visitor's browser is set to. */
// No language cookie either: it would only matter with browser-language detection
export default createMiddleware({ ...routing, localeDetection: false, localeCookie: false });

export const config = {
  // Everything except the Studio, API routes, Next/Vercel internals, the generated
  // icons and files with an extension (images, sitemap.xml, robots.txt)
  matcher: ["/((?!api|studio|_next|_vercel|apple-icon|icon|.*\\..*).*)"],
};
