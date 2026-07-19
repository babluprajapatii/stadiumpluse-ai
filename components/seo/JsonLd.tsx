import React from "react";

interface JsonLdProps {
  data: Record<string, unknown>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export interface WebPageSchemaProps {
  name: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified: string;
  breadcrumb?: Array<{ name: string; item: string }>;
}

export function WebPageSchema({
  name,
  description,
  url,
  datePublished,
  dateModified,
  breadcrumb,
}: WebPageSchemaProps) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    "name": name,
    "description": description,
    "url": url,
    "datePublished": datePublished,
    "dateModified": dateModified,
    "inLanguage": "en-US",
    "publisher": {
      "@id": "https://stadiumpulse.ai/#organization",
    },
    "author": {
      "@type": "Organization",
      "@id": "https://stadiumpulse.ai/#organization",
    },
    "isPartOf": {
      "@id": "https://stadiumpulse.ai/#website",
    },
  };

  if (breadcrumb && breadcrumb.length > 0) {
    schema["breadcrumb"] = {
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumb.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.name,
        "item": item.item,
      })),
    };
  }

  return <JsonLd data={schema} />;
}


// ─── Organization Schema ──────────────────────────────────────────────────────

export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://stadiumpulse.ai/#organization",
    "name": "StadiumPulse AI",
    "legalName": "StadiumPulse AI Inc.",
    "url": "https://stadiumpulse.ai",
    "logo": {
      "@type": "ImageObject",
      "@id": "https://stadiumpulse.ai/#logo",
      "url": "https://stadiumpulse.ai/icon-512x512.png",
      "width": 512,
      "height": 512,
      "caption": "StadiumPulse AI Platform Logo"
    },
    "sameAs": [
      "https://x.com/StadiumPulseAI",
      "https://github.com/babluprajapatii/stadiumpluse-ai"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-800-555-0199",
      "contactType": "customer service",
      "areaServed": "US",
      "availableLanguage": ["en", "es"]
    },
    "knowsAbout": [
      "GenAI Smart Stadium Operations",
      "Real-Time Crowd Flow Intelligence",
      "Emergency Incident Response",
      "FIFA World Cup 2026 Operations"
    ],
    "description": "GenAI-powered smart stadium operations and fan experience platform for the FIFA World Cup 2026."
  };
  return <JsonLd data={schema} />;
}

// ─── WebSite Schema ───────────────────────────────────────────────────────────

export function WebSiteSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://stadiumpulse.ai/#website",
    "name": "StadiumPulse AI",
    "url": "https://stadiumpulse.ai",
    "description": "GenAI-powered live crowd flow monitoring, operations control center, and real-time incident dispatching for smart stadiums.",
    "publisher": {
      "@id": "https://stadiumpulse.ai/#organization"
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://stadiumpulse.ai/?s={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };
  return <JsonLd data={schema} />;
}

// ─── WebApplication Schema ───────────────────────────────────────────────────

export function WebApplicationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "@id": "https://stadiumpulse.ai/#webapplication",
    "name": "StadiumPulse AI Platform",
    "url": "https://stadiumpulse.ai",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "All",
    "browserRequirements": "Requires HTML5/JavaScript, WebSockets enabled",
    "softwareVersion": "1.0.0",
    "description": "GenAI-powered smart stadium operations, real-time crowd density estimation, incident response dispatcher, and fan navigation system.",
    "featureList": [
      "Real-time crowd flow heatmaps",
      "Automated emergency incident dispatching",
      "Turnkey fan concession queue estimation",
      "WCAG 2.2 Level AA accessibility hub"
    ],
    "screenshot": "https://stadiumpulse.ai/og-image.png",
    "author": {
      "@id": "https://stadiumpulse.ai/#organization"
    },
    "offers": {
      "@type": "Offer",
      "price": 0,
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    }
  };
  return <JsonLd data={schema} />;
}

// ─── Breadcrumb Schema ───────────────────────────────────────────────────────

export interface BreadcrumbItem {
  name: string;
  item: string;
}

export function BreadcrumbSchema({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.item.startsWith("http") ? item.item : `https://stadiumpulse.ai${item.item}`
    }))
  };
  return <JsonLd data={schema} />;
}

// ─── Article / TechArticle Schema ─────────────────────────────────────────────

export interface ArticleProps {
  headline: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified: string;
  image?: string;
  authorName?: string;
}

export function ArticleSchema(props: ArticleProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "@id": `${props.url}#article`,
    "headline": props.headline,
    "description": props.description,
    "url": props.url,
    "datePublished": props.datePublished,
    "dateModified": props.dateModified,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": props.url
    },
    "image": props.image || "https://stadiumpulse.ai/og-image.png",
    "author": {
      "@type": "Organization",
      "name": props.authorName || "StadiumPulse AI Operations Team",
      "url": "https://stadiumpulse.ai"
    },
    "publisher": {
      "@id": "https://stadiumpulse.ai/#organization"
    },
    "inLanguage": "en-US"
  };
  return <JsonLd data={schema} />;
}

// ─── FAQPage Schema ──────────────────────────────────────────────────────────

export interface FAQItem {
  question: string;
  answer: string;
}

export function FAQPageSchema({ items }: { items: FAQItem[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": items.map((item) => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  };
  return <JsonLd data={schema} />;
}

// ─── SportsEvent Schema ──────────────────────────────────────────────────────

export interface SportsEventProps {
  name: string;
  startDate: string;
  endDate?: string;
  locationName: string;
  locationAddress: string;
  description: string;
  homeTeam: string;
  awayTeam: string;
}

export function SportsEventSchema(props: SportsEventProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    "name": props.name,
    "startDate": props.startDate,
    ...(props.endDate ? { "endDate": props.endDate } : {}),
    "description": props.description,
    "eventStatus": "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
    "location": {
      "@type": "Place",
      "name": props.locationName,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": props.locationAddress,
        "addressLocality": "East Rutherford",
        "addressRegion": "NJ",
        "postalCode": "07073",
        "addressCountry": "US"
      }
    },
    "competitor": [
      {
        "@type": "SportsTeam",
        "name": props.homeTeam
      },
      {
        "@type": "SportsTeam",
        "name": props.awayTeam
      }
    ],
    "organizer": {
      "@type": "Organization",
      "name": "FIFA",
      "url": "https://www.fifa.com"
    },
    "offers": {
      "@type": "Offer",
      "url": "https://stadiumpulse.ai",
      "price": 0,
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    }
  };
  return <JsonLd data={schema} />;
}

// ─── HowTo Schema ────────────────────────────────────────────────────────────

export interface HowToStep {
  name: string;
  text: string;
  url?: string;
  image?: string;
}

export interface HowToProps {
  name: string;
  description: string;
  steps: HowToStep[];
}

export function HowToSchema(props: HowToProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": props.name,
    "description": props.description,
    "step": props.steps.map((step, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": step.name,
      "text": step.text,
      ...(step.url ? { "url": step.url } : {}),
      ...(step.image ? { "image": step.image } : {})
    }))
  };
  return <JsonLd data={schema} />;
}

// ─── Review Schema ───────────────────────────────────────────────────────────

export interface ReviewProps {
  itemReviewedName: string;
  authorName: string;
  reviewRatingValue: number;
  bestRating?: number;
  worstRating?: number;
  reviewBody: string;
  publisherName?: string;
}

export function ReviewSchema(props: ReviewProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Review",
    "itemReviewed": {
      "@type": "SoftwareApplication",
      "name": props.itemReviewedName || "StadiumPulse AI Platform",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "All"
    },
    "author": {
      "@type": "Person",
      "name": props.authorName
    },
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": props.reviewRatingValue,
      "bestRating": props.bestRating || 5,
      "worstRating": props.worstRating || 1
    },
    "reviewBody": props.reviewBody,
    "publisher": {
      "@type": "Organization",
      "name": props.publisherName || "StadiumPulse AI"
    }
  };
  return <JsonLd data={schema} />;
}

// ─── VideoObject Schema ──────────────────────────────────────────────────────

export interface VideoObjectProps {
  name: string;
  description: string;
  thumbnailUrl: string[];
  uploadDate: string;
  duration?: string;
  contentUrl?: string;
  embedUrl?: string;
}

export function VideoObjectSchema(props: VideoObjectProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": props.name,
    "description": props.description,
    "thumbnailUrl": props.thumbnailUrl,
    "uploadDate": props.uploadDate,
    ...(props.duration ? { "duration": props.duration } : {}),
    ...(props.contentUrl ? { "contentUrl": props.contentUrl } : {}),
    ...(props.embedUrl ? { "embedUrl": props.embedUrl } : {}),
    "publisher": {
      "@id": "https://stadiumpulse.ai/#organization"
    }
  };
  return <JsonLd data={schema} />;
}

// ─── Product Schema ──────────────────────────────────────────────────────────

export interface ProductProps {
  name: string;
  description: string;
  image?: string;
  sku?: string;
  brandName?: string;
  price?: number;
  priceCurrency?: string;
}

export function ProductSchema(props: ProductProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": "https://stadiumpulse.ai/#product",
    "name": props.name,
    "description": props.description,
    "image": props.image || "https://stadiumpulse.ai/og-image.png",
    "sku": props.sku || "SP-AI-2026",
    "brand": {
      "@type": "Brand",
      "name": props.brandName || "StadiumPulse AI"
    },
    "offers": {
      "@type": "Offer",
      "url": "https://stadiumpulse.ai",
      "price": props.price ?? 0,
      "priceCurrency": props.priceCurrency || "USD",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@id": "https://stadiumpulse.ai/#organization"
      }
    }
  };
  return <JsonLd data={schema} />;
}

// ─── LocalBusiness Schema ───────────────────────────────────────────────────

export interface LocalBusinessProps {
  name?: string;
  description?: string;
  telephone?: string;
  addressLocality?: string;
  addressRegion?: string;
}

export function LocalBusinessSchema(props: LocalBusinessProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://stadiumpulse.ai/#localbusiness",
    "name": props.name || "StadiumPulse AI Venue Control Hub",
    "description": props.description || "FIFA World Cup 2026 smart stadium operations center and local technical support hub.",
    "url": "https://stadiumpulse.ai",
    "telephone": props.telephone || "+1-800-555-0199",
    "image": "https://stadiumpulse.ai/icon-512x512.png",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "1 MetLife Stadium Dr",
      "addressLocality": props.addressLocality || "East Rutherford",
      "addressRegion": props.addressRegion || "NJ",
      "postalCode": "07073",
      "addressCountry": "US"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 40.8135,
      "longitude": -74.0744
    },
    "priceRange": "$$",
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        "opens": "00:00",
        "closes": "23:59"
      }
    ]
  };
  return <JsonLd data={schema} />;
}
