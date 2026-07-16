import React from "react";

interface JsonLdProps {
  data: Record<string, any>;
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
      "width": "512",
      "height": "512"
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
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://stadiumpulse.ai/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
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
      "price": "0",
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
