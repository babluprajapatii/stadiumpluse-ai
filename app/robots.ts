import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const protectedRoutes = [
    "/fan",
    "/operator",
    "/organizer",
    "/security",
    "/volunteer",
    "/settings",
    "/profile",
    "/accessibility",
    "/ai",
    "/feature",
    "/notifications",
    "/result",
    "/reset-password",
    "/verify-email"
  ];

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/login", "/register", "/forgot-password", "/llms.txt", "/site.webmanifest", "/favicon.ico", "/og-image.png"],
        disallow: protectedRoutes,
      },
      {
        userAgent: ["GPTBot", "ClaudeBot", "PerplexityBot", "Bytespider"],
        allow: ["/", "/llms.txt", "/site.webmanifest", "/og-image.png"],
        disallow: protectedRoutes,
      }
    ],
    sitemap: `${SITE_URL}/sitemap.xml`
  };
}

