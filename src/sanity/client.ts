import { createClient, type SanityClient } from "@sanity/client";

// ---------- Client ----------

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = "2024-01-01";

function isConfigured() {
  return Boolean(projectId) && projectId !== "your_project_id_here";
}

let _publicClient: SanityClient | null = null;

function getClient(preview = false): SanityClient | null {
  if (!isConfigured()) return null;
  if (preview) {
    return createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: false,
      token: process.env.SANITY_API_TOKEN,
      perspective: "previewDrafts",
      stega: {
        enabled: true,
        studioUrl: "/studio",
      },
    });
  }
  if (_publicClient) return _publicClient;
  _publicClient = createClient({ projectId, dataset, apiVersion, useCdn: true });
  return _publicClient;
}

// ---------- Types ----------

export interface SiteSettings {
  showShop: boolean;
  showProducts: boolean;
  showCourses: boolean;
  showSessions: boolean;
  callBookingUrl: string | null;
  podcastRssUrl: string;
  buyMeCoffeeUrl: string;
  socialLinks: { platform: string; url: string }[];
  platformLinks: { platform: string; url: string }[];
}

export interface AboutPage {
  hostName: string;
  hostPhoto: { asset: { url: string }; hotspot?: unknown } | null;
  hostBio: string[];
  showMission: string;
}

export interface ShopCollection {
  _id: string;
  title: string;
  description: string;
  emoji: string;
  link: string;
}

export interface Product {
  _id: string;
  title: string;
  description: string;
  price: string;
  badge: string;
  link: string;
}

export interface Course {
  _id: string;
  title: string;
  description: string;
  duration: string;
  format: string;
  status: "coming-soon" | "available";
  link: string;
}

// ---------- Queries ----------

export async function getSiteSettings(opts?: { preview?: boolean; locale?: string }): Promise<SiteSettings | null> {
  const client = getClient(opts?.preview);
  if (!client) return null;
  const locale = opts?.locale ?? "en";
  try {
    return await client.fetch(
      `*[_type == "siteSettings"][0]{
        "showShop": coalesce(showShop, true),
        "showProducts": coalesce(showProducts, true),
        "showCourses": coalesce(showCourses, true),
        "showSessions": coalesce(showSessions, false),
        callBookingUrl,
        podcastRssUrl,
        buyMeCoffeeUrl,
        socialLinks[]{ platform, url },
        platformLinks[]{ platform, url }
      }`,
      { locale }
    );
  } catch {
    return null;
  }
}

export async function getShopCollections(opts?: { preview?: boolean; locale?: string }): Promise<ShopCollection[]> {
  const client = getClient(opts?.preview);
  if (!client) return [];
  const locale = opts?.locale ?? "en";
  try {
    return await client.fetch(
      `*[_type == "shopCollection"] | order(orderRank){
        _id,
        "title": select($locale == "es" && defined(es.title) => es.title, title),
        "description": select($locale == "es" && defined(es.description) => es.description, description),
        emoji,
        link
      }`,
      { locale }
    );
  } catch {
    return [];
  }
}

export async function getProducts(opts?: { preview?: boolean; locale?: string }): Promise<Product[]> {
  const client = getClient(opts?.preview);
  if (!client) return [];
  const locale = opts?.locale ?? "en";
  try {
    return await client.fetch(
      `*[_type == "product"] | order(orderRank){
        _id,
        "title": select($locale == "es" && defined(es.title) => es.title, title),
        "description": select($locale == "es" && defined(es.description) => es.description, description),
        price,
        "badge": select($locale == "es" && defined(es.badge) => es.badge, badge),
        link
      }`,
      { locale }
    );
  } catch {
    return [];
  }
}

export async function getAboutPage(opts?: { preview?: boolean; locale?: string }): Promise<AboutPage | null> {
  const client = getClient(opts?.preview);
  if (!client) return null;
  const locale = opts?.locale ?? "en";
  try {
    return await client.fetch(
      `*[_type == "about"][0]{
        hostName,
        "hostPhoto": hostPhoto { asset->{ url }, hotspot },
        "hostBio": select($locale == "es" && defined(es.hostBio) => es.hostBio, hostBio),
        "showMission": select($locale == "es" && defined(es.showMission) => es.showMission, showMission)
      }`,
      { locale }
    );
  } catch {
    return null;
  }
}

export async function getCourses(opts?: { preview?: boolean; locale?: string }): Promise<Course[]> {
  const client = getClient(opts?.preview);
  if (!client) return [];
  const locale = opts?.locale ?? "en";
  try {
    return await client.fetch(
      `*[_type == "course"] | order(orderRank){
        _id,
        "title": select($locale == "es" && defined(es.title) => es.title, title),
        "description": select($locale == "es" && defined(es.description) => es.description, description),
        duration,
        "format": select($locale == "es" && defined(es.format) => es.format, format),
        status,
        link
      }`,
      { locale }
    );
  } catch {
    return [];
  }
}

// Website text documents edited in the Studio (one per page); see src/sanity/copy/definition.ts
export async function getWebsiteText(types: string[], opts?: { preview?: boolean }): Promise<Record<string, unknown>[]> {
  const client = getClient(opts?.preview);
  if (!client) return [];
  try {
    return await client.fetch(`*[_type in $types && !(_id in path("drafts.**"))]`, { types });
  } catch {
    return [];
  }
}
