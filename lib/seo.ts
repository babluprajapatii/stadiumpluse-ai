import type { Metadata } from "next";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://stadiumpulse.ai";

interface SeoMetadataInput {
  title: string;
  description?: string;
  keywords?: string[];
  canonicalPath?: string;
  ogImage?: string;
  noIndex?: boolean;
}

export function getSeoMetadata({
  title,
  description = "GenAI-powered smart stadium operations and fan experience platform for the FIFA World Cup 2026.",
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
    "GenAI stadium platform"
  ],
  canonicalPath = "",
  ogImage = "/og-image.png",
  noIndex = false
}: SeoMetadataInput): Metadata {
  const canonicalUrl = `${SITE_URL}${canonicalPath}`;
  const ogImageUrl = ogImage.startsWith("http") ? ogImage : `${SITE_URL}${ogImage}`;

  const robotsConfig: Metadata["robots"] = noIndex
    ? { index: false, follow: false }
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

  return {
    title: {
      default: `${title} | StadiumPulse AI`,
      template: `%s | StadiumPulse AI`
    },
    description,
    keywords: keywords.join(", "),
    metadataBase: new URL(SITE_URL),
    manifest: "/site.webmanifest",
    icons: {
      icon: "/favicon.ico",
      shortcut: "/favicon.ico",
      apple: "/icon-192x192.png",
    },
    alternates: {
      canonical: canonicalUrl
    },
    robots: robotsConfig,
    authors: [{ name: "StadiumPulse Team", url: "https://stadiumpulse.ai/about" }],
    creator: "StadiumPulse Team",
    publisher: "StadiumPulse AI",
    openGraph: {
      type: "website",
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
          alt: `${title} - StadiumPulse AI Platform Preview`
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | StadiumPulse AI`,
      description,
      creator: "@StadiumPulseAI",
      images: [ogImageUrl]
    }
  };
}
