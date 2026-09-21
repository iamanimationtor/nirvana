import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/", "/account", "/checkout", "/login", "/register", "/pay/"],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
