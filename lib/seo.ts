import type { Metadata } from "next";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://stadiumpulse.ai";

interface SeoMetadataInput {
  title: string;
  description?: string;
  keywords?: string[];
  canonicalPath?: string;
  ogImage?: string;
  noIndex?: boolean;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  prevPath?: string;
  nextPath?: string;
}

export function getSeoMetadata({
  title,
  description = "GenAI-powered smart stadium operations, live crowd intelligence, incident response dispatcher, and fan experience platform for the FIFA World Cup 2026.",
  keywords = [
    "StadiumPulse AI",
    "FIFA World Cup 2026",
    "stadium operations",
    "crowd flow AI",
    "stadium analytics",
    "smart stadium",
    "stadium security",
    "real-time crowd intelligence",
    "fan concierge",
    "GenAI stadium platform",
    "WCAG 2.2 accessibility"
  ],
  canonicalPath = "",
  ogImage = "/og-image.png",
  noIndex = false,
  type = "website",
  publishedTime,
  modifiedTime,
  prevPath,
  nextPath,
}: SeoMetadataInput): Metadata {
  // Normalize canonical URL (avoid double slashes while retaining root slash)
  const normalizedPath = canonicalPath.startsWith("/") ? canonicalPath : `/${canonicalPath}`;
  const canonicalUrl = canonicalPath === "" ? SITE_URL : `${SITE_URL}${normalizedPath}`;
  const ogImageUrl = ogImage.startsWith("http") ? ogImage : `${SITE_URL}${ogImage}`;

  const robotsConfig: Metadata["robots"] = noIndex
    ? { index: false, follow: false, nocache: true }
    : {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1
        }
      };

  const alternates: Metadata["alternates"] = {
    canonical: canonicalUrl,
  };

  const otherMeta: Record<string, string> = {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent"
  };

  if (prevPath) {
    const normPrev = prevPath.startsWith("/") ? prevPath : `/${prevPath}`;
    otherMeta["prev"] = `${SITE_URL}${normPrev}`;
  }

  if (nextPath) {
    const normNext = nextPath.startsWith("/") ? nextPath : `/${nextPath}`;
    otherMeta["next"] = `${SITE_URL}${normNext}`;
  }

  return {
    title: {
      default: `${title} | StadiumPulse AI`,
      template: `%s | StadiumPulse AI`
    },
    description,
    keywords: keywords.join(", "),
    applicationName: "StadiumPulse AI",
    category: "Technology & Operations",
    metadataBase: new URL(SITE_URL),
    manifest: "/site.webmanifest",
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
        { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" }
      ],
      shortcut: "/favicon.ico",
      apple: [
        { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" }
      ]
    },
    alternates,
    robots: robotsConfig,
    authors: [{ name: "StadiumPulse AI Operations Team", url: "https://stadiumpulse.ai" }],
    creator: "StadiumPulse AI Operations Team",
    publisher: "StadiumPulse AI",
    openGraph: {
      type,
      locale: "en_US",
      url: canonicalUrl,
      title: `${title} | StadiumPulse AI`,
      description,
      siteName: "StadiumPulse AI",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          type: "image/png",
          alt: `${title} - StadiumPulse AI Platform Preview`
        }
      ],
      ...(publishedTime ? { publishedTime } : {}),
      ...(modifiedTime ? { modifiedTime } : {})
    },
    twitter: {
      card: "summary_large_image",
      site: "@StadiumPulseAI",
      title: `${title} | StadiumPulse AI`,
      description,
      creator: "@StadiumPulseAI",
      images: [ogImageUrl]
    },
    other: otherMeta
  };
}

