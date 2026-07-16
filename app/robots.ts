import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/login", "/register", "/forgot-password", "/llms.txt"],
        disallow: [
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
        ]
      },
      {
        userAgent: "GPTBot",
        allow: ["/", "/llms.txt"],
        disallow: [
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
        ]
      },
      {
        userAgent: "ClaudeBot",
        allow: ["/", "/llms.txt"],
        disallow: [
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
        ]
      }
    ],
    sitemap: `${SITE_URL}/sitemap.xml`
  };
}
