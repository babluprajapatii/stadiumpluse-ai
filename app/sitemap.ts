import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastMod = new Date("2026-07-19T22:22:29Z");

  const routes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}`,
      lastModified: lastMod,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/llms.txt`,
      lastModified: lastMod,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  return routes;
}

