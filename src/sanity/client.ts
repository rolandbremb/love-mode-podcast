import { createClient, type SanityClient } from "@sanity/client";

let _client: SanityClient | null = null;

function getClient(): SanityClient | null {
  if (_client) return _client;
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  if (!projectId || projectId === "your_project_id_here") return null;
  _client = createClient({
    projectId,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
    apiVersion: "2024-01-01",
    useCdn: true,
    token: process.env.SANITY_API_TOKEN,
  });
  return _client;
}

// ---------- Types ----------

export interface SiteSettings {
  heroTagline: string;
  heroTitle: string;
  heroDescription: string;
  aboutTitle: string;
  aboutParagraphs: string[];
  buyMeCoffeeUrl: string;
  socialLinks: { platform: string; url: string }[];
}

export interface ShopCollection {
  _id: string;
  title: string;
  description: string;
  emoji: string;
  link: string;
  order: number;
}

export interface Product {
  _id: string;
  title: string;
  description: string;
  price: string;
  badge: string;
  link: string;
  order: number;
}

export interface Course {
  _id: string;
  title: string;
  description: string;
  duration: string;
  format: string;
  status: "coming-soon" | "available";
  link: string;
  order: number;
}

// ---------- Queries ----------

export async function getSiteSettings(): Promise<SiteSettings | null> {
  const client = getClient();
  if (!client) return null;
  try {
    return await client.fetch(
      `*[_type == "siteSettings"][0]{
        heroTagline,
        heroTitle,
        heroDescription,
        aboutTitle,
        aboutParagraphs,
        buyMeCoffeeUrl,
        socialLinks[]{ platform, url }
      }`
    );
  } catch {
    return null;
  }
}

export async function getShopCollections(): Promise<ShopCollection[]> {
  const client = getClient();
  if (!client) return [];
  try {
    return await client.fetch(
      `*[_type == "shopCollection"] | order(order asc){
        _id, title, description, emoji, link, order
      }`
    );
  } catch {
    return [];
  }
}

export async function getProducts(): Promise<Product[]> {
  const client = getClient();
  if (!client) return [];
  try {
    return await client.fetch(
      `*[_type == "product"] | order(order asc){
        _id, title, description, price, badge, link, order
      }`
    );
  } catch {
    return [];
  }
}

export async function getCourses(): Promise<Course[]> {
  const client = getClient();
  if (!client) return [];
  try {
    return await client.fetch(
      `*[_type == "course"] | order(order asc){
        _id, title, description, duration, format, status, link, order
      }`
    );
  } catch {
    return [];
  }
}
