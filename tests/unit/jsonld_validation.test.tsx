import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import {
  OrganizationSchema,
  WebSiteSchema,
  WebApplicationSchema,
  WebPageSchema,
  BreadcrumbSchema,
  ArticleSchema,
  FAQPageSchema,
  SportsEventSchema,
  HowToSchema,
  ReviewSchema,
  VideoObjectSchema,
  ProductSchema,
  LocalBusinessSchema,
} from '../../components/seo/JsonLd';

describe('JSON-LD Schema Validation', () => {
  function getJsonLdData(container: HTMLElement) {
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    return JSON.parse(script!.textContent || '{}');
  }

  it('OrganizationSchema is valid', () => {
    const { container } = render(<OrganizationSchema />);
    const data = getJsonLdData(container);
    expect(data['@context']).toBe('https://schema.org');
    expect(data['@type']).toBe('Organization');
    expect(data['name']).toBe('StadiumPulse AI');
    expect(typeof data['logo']['width']).toBe('number');
    expect(typeof data['logo']['height']).toBe('number');
  });

  it('WebSiteSchema is valid', () => {
    const { container } = render(<WebSiteSchema />);
    const data = getJsonLdData(container);
    expect(data['@type']).toBe('WebSite');
    expect(data['potentialAction']['@type']).toBe('SearchAction');
  });

  it('WebApplicationSchema is valid', () => {
    const { container } = render(<WebApplicationSchema />);
    const data = getJsonLdData(container);
    expect(data['@type']).toBe('WebApplication');
    expect(data['offers']['price']).toBe(0);
    expect(typeof data['offers']['price']).toBe('number');
  });

  it('WebPageSchema is valid', () => {
    const { container } = render(
      <WebPageSchema
        name="Test Page"
        description="Test Desc"
        url="https://stadiumpulse.ai/test"
        datePublished="2026-06-11"
        dateModified="2026-07-19"
        breadcrumb={[{ name: 'Home', item: '/' }]}
      />
    );
    const data = getJsonLdData(container);
    expect(data['@type']).toBe('WebPage');
    expect(data['datePublished']).toBe('2026-06-11');
    expect(data['breadcrumb']['@type']).toBe('BreadcrumbList');
  });

  it('BreadcrumbSchema is valid', () => {
    const { container } = render(
      <BreadcrumbSchema items={[{ name: 'Home', item: 'https://stadiumpulse.ai' }]} />
    );
    const data = getJsonLdData(container);
    expect(data['@type']).toBe('BreadcrumbList');
    expect(data['itemListElement'][0]['position']).toBe(1);
  });

  it('ArticleSchema is valid', () => {
    const { container } = render(
      <ArticleSchema
        headline="Test Article"
        description="Test Desc"
        url="https://stadiumpulse.ai/blog/test"
        datePublished="2026-06-11"
        dateModified="2026-07-19"
      />
    );
    const data = getJsonLdData(container);
    expect(data['@type']).toBe('TechArticle');
    expect(data['headline']).toBe('Test Article');
  });

  it('FAQPageSchema is valid', () => {
    const { container } = render(
      <FAQPageSchema items={[{ question: 'Q1?', answer: 'A1' }]} />
    );
    const data = getJsonLdData(container);
    expect(data['@type']).toBe('FAQPage');
    expect(data['mainEntity'][0]['@type']).toBe('Question');
  });

  it('SportsEventSchema is valid', () => {
    const { container } = render(
      <SportsEventSchema
        name="Match 1"
        startDate="2026-06-11T18:00:00-05:00"
        locationName="Stadium"
        locationAddress="1 Dr"
        description="Desc"
        homeTeam="USA"
        awayTeam="MEX"
      />
    );
    const data = getJsonLdData(container);
    expect(data['@type']).toBe('SportsEvent');
    expect(data['eventStatus']).toBe('https://schema.org/EventScheduled');
  });

  it('HowToSchema is valid', () => {
    const { container } = render(
      <HowToSchema name="How to" description="Desc" steps={[{ name: 'S1', text: 'T1' }]} />
    );
    const data = getJsonLdData(container);
    expect(data['@type']).toBe('HowTo');
    expect(data['step'][0]['position']).toBe(1);
  });

  it('ReviewSchema is valid', () => {
    const { container } = render(
      <ReviewSchema
        itemReviewedName="Platform"
        authorName="User"
        reviewRatingValue={5}
        reviewBody="Great!"
      />
    );
    const data = getJsonLdData(container);
    expect(data['@type']).toBe('Review');
    expect(data['reviewRating']['ratingValue']).toBe(5);
  });

  it('VideoObjectSchema is valid', () => {
    const { container } = render(
      <VideoObjectSchema
        name="Video"
        description="Desc"
        thumbnailUrl={['https://stadiumpulse.ai/thumb.png']}
        uploadDate="2026-06-15"
      />
    );
    const data = getJsonLdData(container);
    expect(data['@type']).toBe('VideoObject');
    expect(data['thumbnailUrl'][0]).toBe('https://stadiumpulse.ai/thumb.png');
  });

  it('ProductSchema is valid', () => {
    const { container } = render(
      <ProductSchema name="Product 1" description="Desc" price={0} priceCurrency="USD" />
    );
    const data = getJsonLdData(container);
    expect(data['@type']).toBe('Product');
    expect(data['offers']['price']).toBe(0);
  });

  it('LocalBusinessSchema is valid', () => {
    const { container } = render(<LocalBusinessSchema />);
    const data = getJsonLdData(container);
    expect(data['@type']).toBe('LocalBusiness');
    expect(data['address']['@type']).toBe('PostalAddress');
    expect(data['geo']['latitude']).toBe(40.8135);
  });
});
