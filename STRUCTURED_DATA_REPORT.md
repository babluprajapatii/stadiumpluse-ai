# StadiumPulse AI — Structured Data & Full Repository Audit Report

**Audit Date:** 2026-07-19
**Auditor:** Antigravity AI
**Repository:** babluprajapatii/stadiumpluse-ai
**Next.js Version:** 16.2.10 (Turbopack)
**React Version:** 19.2.4

---

## Executive Summary

A complete, iterative audit was performed across TypeScript, ESLint, build, unit tests, E2E tests, JSON-LD/structured data, SEO metadata, webmanifest, and runtime warnings. **5 issues were found and fixed.** All verification commands pass cleanly after fixes.

---

## Audit Methodology

Each pass ran the following commands in order:

```
npm run typecheck   --> TypeScript strict-mode check
npm run lint        --> ESLint (eslint-config-next/core-web-vitals + typescript)
npm run build       --> Next.js production build (Turbopack)
npm test            --> Vitest unit test suite
npm run test:e2e    --> Playwright browser tests
```

---

## Issues Found

---

### Issue 1 — ESLint Warning: Unused Import VideoObjectSchema

| Field | Detail |
|---|---|
| **Severity** | Warning |
| **Category** | ESLint - @typescript-eslint/no-unused-vars |
| **File** | components/pages/LandingPage.tsx Line 8 |

**Root Cause:**
VideoObjectSchema was imported from @/components/seo/JsonLd but never used anywhere in LandingPage.tsx. The component is defined (and exported) in JsonLd.tsx for use in other pages, but the import was accidentally left in the landing page from an earlier draft.

**Fix:** Removed VideoObjectSchema from the import statement.

**Evidence Before Fix:**
```
D:\coding\github\stadiumpluse-ai\components\pages\LandingPage.tsx
  8:71  warning  'VideoObjectSchema' is defined but never used  @typescript-eslint/no-unused-vars
x 1 problem (0 errors, 1 warning)
```

**Evidence After Fix:**
```
> npm run lint
> eslint
(no output - 0 errors, 0 warnings)
```

---

### Issue 2 — JSON-LD Schema.org: ImageObject Dimensions as Strings

| Field | Detail |
|---|---|
| **Severity** | Schema.org Validation Error |
| **Category** | JSON-LD / Structured Data / Rich Results |
| **File** | components/seo/JsonLd.tsx Lines 25-26 (OrganizationSchema) |

**Root Cause:**
The OrganizationSchema logo ImageObject had width and height set as string values ("512"). Schema.org ImageObject requires integer values. Google Rich Results Test flags string values for numeric properties.

**Fix:** Changed width and height from "512" (string) to 512 (integer).

---

### Issue 3 — JSON-LD Schema.org: Offer.price as String

| Field | Detail |
|---|---|
| **Severity** | Schema.org Validation Warning |
| **Category** | JSON-LD / Structured Data / Rich Results |
| **File** | components/seo/JsonLd.tsx Lines 64-66 (WebApplicationSchema) |

**Root Cause:**
The WebApplicationSchema had offers.price set as "0" (string). Per Schema.org Offer, the price property expects a Number value. Using a string causes validation warnings.

**Fix:** Changed price from "0" (string) to 0 (number).

---

### Issue 4 — React Test Warnings: SVG Elements Rendered in jsdom

| Field | Detail |
|---|---|
| **Severity** | React Warning (Console Noise) |
| **Category** | React Warnings / Test Quality |
| **File** | tests/unit/widgets_extended.test.tsx Lines 49-68 |

**Root Cause:**
The recharts mock exported defs, linearGradient, and stop as React function components using lowercase JSX tag names. When jsdom processes these, it emits React "unrecognized tag" warnings. Additionally, the AreaChart mock rendered its children (which include JSX defs/linearGradient/stop elements from EventBanner), causing these unrecognised tags to be injected into jsdom.

**Fix:**
1. Removed unused lowercase SVG mock entries (defs, linearGradient, stop).
2. Changed AreaChart mock to intentionally ignore its children (_children), preventing SVG JSX from being rendered.

**Evidence Before Fix:**
```
stderr | tests/unit/widgets_extended.test.tsx > EventBanner > renders event title
The tag <stop> is unrecognized in this browser.
<linearGradient /> is using incorrect casing. Use PascalCase for React components...
The tag <linearGradient> is unrecognized in this browser.
The tag <defs> is unrecognized in this browser.
```

**Evidence After Fix:**
```
OK tests/unit/widgets_extended.test.tsx (37 tests) 272ms
(no stderr output)
```

---

### Issue 5 — Web App Manifest: Deprecated purpose Syntax

| Field | Detail |
|---|---|
| **Severity** | PWA / Lighthouse Warning |
| **Category** | Web App Manifest / PWA |
| **File** | public/site.webmanifest |

**Root Cause:**
Both icon entries used "purpose": "any maskable" (space-separated). The current W3C Web App Manifest Level 3 spec and Lighthouse recommend separate icon entries for "any" and "maskable" purposes.

**Fix:** Split each icon entry into two separate entries - one with purpose "any" and one with purpose "maskable".

---

## Files Modified

| File | Change |
|---|---|
| components/pages/LandingPage.tsx | Removed unused VideoObjectSchema import |
| components/seo/JsonLd.tsx | Fixed ImageObject width/height to integers; fixed Offer.price to number |
| tests/unit/widgets_extended.test.tsx | Fixed recharts mock to eliminate React SVG warnings |
| public/site.webmanifest | Split "any maskable" purpose into separate icon entries |

---

## Verification Results (Post-Fix)

### TypeScript
```
> npm run typecheck
> tsc --noEmit

PASS: 0 errors
```

### ESLint
```
> npm run lint
> eslint

PASS: 0 errors, 0 warnings
```

### Next.js Production Build
```
> npm run build
> next build

Next.js 16.2.10 (Turbopack)
Compiled successfully in 3.5s
Running TypeScript ... finished in 5.8s
Generating static pages (23/23)
All 21 routes generated successfully.
PASS: Build succeeded - 0 errors, 0 warnings
```

### Unit Tests (Vitest)
```
> npm test

Test Files  11 passed (11)
      Tests  294 passed (294)
   Duration  4.13s

PASS: 294/294 tests passing - 0 stderr warnings
```

### E2E Tests (Playwright)
```
> npm run test:e2e

Running 32 tests using 8 workers
  32 passed (15.6s)

PASS: 32/32 tests passing
```

---

## No-Issue Checks

| Check | Result |
|---|---|
| TypeScript strict compilation | PASS |
| ESLint after fix | PASS - 0 warnings |
| Next.js build | PASS |
| Hydration warnings | PASS - suppressHydrationWarning correctly applied |
| Next.js experimental config warnings | PASS - all options valid |
| Duplicate JSON-LD schemas | PASS - each schema has unique @id |
| Invalid JSON-LD @context | PASS - all use https://schema.org |
| Broken internal links | PASS - all Link components point to valid routes |
| Broken external links | PASS - all use rel=noopener noreferrer |
| robots.txt syntax | PASS - correct syntax, sitemap URL present |
| sitemap.xml | PASS - public pages correctly listed |
| og-image.png present | PASS - exists at /og-image.png |
| favicon.ico present | PASS - exists at /favicon.ico |
| site.webmanifest | PASS - valid JSON after purpose fix |
| llms.txt present | PASS - AI crawler guidance file present |
| aria-label on interactive elements | PASS |
| Skip-to-content link | PASS - present in root layout |
| lang attribute on html | PASS - lang=en set |
| Canonical URL | PASS - metadataBase + alternates.canonical correctly set |
| OpenGraph metadata | PASS - all required OG properties present |
| Twitter card metadata | PASS - summary_large_image with creator handle |
| Security headers | PASS - CSP, X-Frame-Options configured |
| SportsEvent PostalAddress | PASS - correct PostalAddress structure |
| FAQPage structure | PASS - valid Question/acceptedAnswer/Answer chain |
| HowToSchema positions | PASS - 1-indexed, correct HowToStep type |
| ReviewSchema rating values | PASS - numeric ratingValue, bestRating, worstRating |
| BreadcrumbList positions | PASS - 1-indexed, correct ListItem structure |

---

## Remaining Issues

None. All identified issues have been fixed and verified.

---

## Evidence Summary Table

| Command | Before Fixes | After Fixes |
|---|---|---|
| npm run lint | 1 warning | 0 warnings |
| npm run typecheck | 0 errors | 0 errors |
| npm run build | Success | Success |
| npm test | 294 pass, 9 stderr lines | 294 pass, 0 stderr |
| npm run test:e2e | 32 pass | 32 pass |
