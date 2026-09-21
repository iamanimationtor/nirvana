import type { MetadataRoute } from "next";
import { isDatabaseConfigured } from "@/db";
import { getProducts } from "@/db/queries";
import { fallbackProducts } from "@/lib/seed-data";
import { siteUrl } from "@/lib/site-url";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const now = new Date();
  let products: Product[] = fallbackProducts();
  if (isDatabaseConfigured) {
    try {
      products = await getProducts();
    } catch {
      // Keep the durable starter URLs indexed while the catalog database recovers.
    }
  }

  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/shop`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    ...products.map((product) => ({
      url: `${base}/product/${product.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
