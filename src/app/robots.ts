import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/siteUrl";

// Let search engines crawl the site, but not the Studio, the dashboard or the form/preview endpoints
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/studio", "/dashboard", "/api/"] },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
