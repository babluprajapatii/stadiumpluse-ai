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

export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://stadiumpulse.ai/#organization",
    "name": "StadiumPulse AI",
    "url": "https://stadiumpulse.ai",
    "logo": {
      "@type": "ImageObject",
      "url": "https://stadiumpulse.ai/icon-512x512.png",
      "width": 512,
      "height": 512
    },
    "sameAs": [
      "https://x.com/StadiumPulseAI",
      "https://github.com/babluprajapatii/stadiumpluse-ai"
    ],
    "description": "GenAI-powered smart stadium operations and fan experience platform for the FIFA World Cup 2026."
  };
  return <JsonLd data={schema} />;
}

export function WebSiteSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://stadiumpulse.ai/#website",
    "name": "StadiumPulse AI",
    "url": "https://stadiumpulse.ai",
    "publisher": {
      "@id": "https://stadiumpulse.ai/#organization"
    }
  };
  return <JsonLd data={schema} />;
}

export function WebApplicationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "@id": "https://stadiumpulse.ai/#webapplication",
    "name": "StadiumPulse AI Platform",
    "url": "https://stadiumpulse.ai",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "All",
    "browserRequirements": "Requires HTML5/JavaScript",
    "description": "GenAI-powered smart stadium operations, real-time crowd density estimation, incident response dispatcher, and fan navigation system.",
    "offers": {
      "@type": "Offer",
      "price": 0,
      "priceCurrency": "USD"
    }
  };
  return <JsonLd data={schema} />;
}

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
      "item": item.item
    }))
  };
  return <JsonLd data={schema} />;
}

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
    }
  };
  return <JsonLd data={schema} />;
}

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
      "@type": "Thing",
      "name": props.itemReviewedName
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
    ...(props.publisherName ? {
      "publisher": {
        "@type": "Organization",
        "name": props.publisherName
      }
    } : {})
  };
  return <JsonLd data={schema} />;
}

export interface VideoObjectProps {
  name: string;
  description: string;
  thumbnailUrl: string[];
  uploadDate: string;
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
    ...(props.contentUrl ? { "contentUrl": props.contentUrl } : {}),
    ...(props.embedUrl ? { "embedUrl": props.embedUrl } : {})
  };
  return <JsonLd data={schema} />;
}
