# VERIFIED CODE REVIEW

**Repository:** stadiumpluse-ai (Next.js 16 App Router, React 19, TypeScript, Tailwind v4)
**Date:** 2026-07-19
**Scope:** Full recursive audit of all source files (`app/`, `components/`, `lib/`, `services/`, `providers/`, `hooks/`, `constants/`, `types/`, `utils/`, `features/`, `styles/`, `tests/`).
**Method:** Each issue was located with exact file path + code evidence, reproduced/fixed, then verified with the mandatory suite:
`npm run typecheck` → `npm run lint` → `npm run build` → `npm run test` → `npm run test:e2e`.

**Final verification state (all commands pass):**
- `typecheck` — ✅ 0 errors
- `lint` — ✅ 0 errors, 0 warnings
- `build` — ✅ compiled, 23 static routes generated
- `test` — ✅ 294 passed (11 files)
- `test:e2e` — ✅ 32 passed (Playwright, chromium)

> Note: No Lighthouse / PageSpeed / external SEO-crawler runs were executed. SEO findings below are from static code review of `robots.ts`, `sitemap.ts`, and `lib/seo.ts`, not from a live crawl.

---

## Summary of Issues Found & Fixed

| # | File | Category | Severity | Status |
|---|------|----------|----------|--------|
| 1 | `components/layout/Sidebar.tsx` | Build-breaking JSX | **Critical** | Fixed |
| 2 | `components/layout/Sidebar.tsx` | TypeScript | High | Fixed |
| 3 | `components/layout/Sidebar.tsx` | Lint (unused var) | Low | Fixed |
| 4 | `components/emergency-mode.tsx` | Lint (unused imports) | Low | Fixed |
| 5 | `components/pages/ForgotPasswordPage.tsx` | E2E / Convention | Medium | Fixed |
| 6 | `tests/e2e/full_coverage.spec.ts` | Test correctness (x2) | Medium | Fixed |
| 7 | `services/settings.ts` | React correctness (warning) | Medium | Fixed |
| 8 | `components/pages/ProfilePage.tsx` | Runtime bug (data not loaded) | Medium | Fixed |
| 9 | `app/auth-actions.ts`, `proxy.ts` | Security (forgeable session) | **High** | Fixed |

---

## Issue 1 — Sidebar.tsx: missing `</aside>` closing tag (build-breaking)

- **File:** `components/layout/Sidebar.tsx`
- **Evidence:** The `<aside>` element opened at line 131 was never closed. The file ended with `</div></div>` and a dangling `);` with no `</aside>`. This caused a hard parse failure:
  ```
  components/layout/Sidebar.tsx(141,8): error TS17008: JSX element 'div' has no corresponding closing tag.
  components/layout/Sidebar.tsx(250,5): error TS1005: ')' expected.
  components/layout/Sidebar.tsx(251,3): error TS1109: Expression expected.
  ```
  The failure blocked `tsc --noEmit` and therefore `next build`, so **no production build was possible** and the entire app (including the sidebar nav used by every role) could not compile.
- **Fix applied:** Added the missing `</aside>` closing tag so the element hierarchy is `<aside> → <div> → … → </div> → </aside>`.
- **Verification:** `npm run typecheck` passes; `npm run build` compiles 23 routes. Sidebar (used in `app/(dashboard)/layout.tsx` → `AppShell`) renders in every role dashboard; E2E logout + navigation flows pass.

---

## Issue 2 — Sidebar.tsx: `tabindex` is not a valid React DOM prop

- **File:** `components/layout/Sidebar.tsx` (line 139)
- **Evidence:**
  ```tsx
  tabindex={0}
  ```
  TypeScript rejected it because the React DOM type for `HTMLElement` does not include `tabindex` (the correct camelCase prop is `tabIndex`):
  ```
  error TS2322: Type '{ ... tabindex: number; }' is not assignable to type 'DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>'.
  Property 'tabindex' does not exist ... Did you mean 'tabIndex'?
  ```
- **Fix applied:** Renamed `tabindex={0}` → `tabIndex={0}`.
- **Verification:** `npm run typecheck` and `npm run lint` clean.

---

## Issue 3 — Sidebar.tsx: unused variable `hasAction`

- **File:** `components/layout/Sidebar.tsx` (line 176)
- **Evidence:**
  ```tsx
  const hasAction = action ? "button" : "link";
  ```
  Assigned but never read (the branch uses `action` directly). Reported as:
  ```
  warning  'hasAction' is assigned a value but never used  @typescript-eslint/no-unused-vars
  ```
- **Fix applied:** Removed the dead `const hasAction` line.
- **Verification:** `npm run lint` — 0 warnings.

---

## Issue 4 — emergency-mode.tsx: unused icon imports

- **File:** `components/emergency-mode.tsx` (lines 15–16)
- **Evidence:**
  ```tsx
  import {
    ...
    Headphones,   // never used
    Languages,    // never used
  } from 'lucide-react';
  ```
  ```
  warning  'Headphones' is defined but never used
  warning  'Languages' is defined but never used
  ```
- **Fix applied:** Removed `Headphones` and `Languages` from the import list.
- **Verification:** `npm run lint` — 0 warnings.

---

## Issue 5 — ForgotPasswordPage.tsx: input `id` mismatch breaks E2E + contradicts convention

- **File:** `components/pages/ForgotPasswordPage.tsx`
- **Evidence:** The email `<Input>` used `id="forgot-email"` / `htmlFor="forgot-email"`, while `LoginPage.tsx` and `RegisterPage.tsx` (and every E2E selector) use `id="email"`. The E2E suite queried `input[id="email"]` and timed out:
  ```
  waiting for locator('input[id="email"]')
  ```
- **Fix applied:** Changed the component to `id="email"` / `htmlFor="email"` to match the established convention across auth pages.
- **Verification:** `npm run test:e2e` — the Forgot Password suite (renders field, empty-submit error, success state) now passes (5/5 in that group, 32/32 overall).

---

## Issue 6 — full_coverage.spec.ts: two broken test assertions (repository-controlled test bugs)

- **File:** `tests/e2e/full_coverage.spec.ts`
- **Evidence:**
  1. **Logout flow (line 379):** `await expect(page).toHaveURL(/^\//);`
     Playwright matches `toHaveURL` against the **full** URL (`http://localhost:3000/`), so the anchored regex `^/$` (which requires the string to *start* with `/`) never matches — even though the app correctly redirected to the landing page (`http://localhost:3000/`). Log output confirmed the redirect succeeded: `Received string: "http://localhost:3000/"`.
  2. **Forgot success (line 299):** `await expect(successMsg.or(page.getByRole("heading"))).toBeVisible();`
     `page.getByRole("heading")` resolved to **2** headings ("StadiumPulse AI" + "Reset Link Generated") → Playwright strict-mode violation. The success state ("Reset Link Generated") **did** render correctly.
- **Fix applied:**
  1. Replaced the regex with a pathname callback: `await expect(page).toHaveURL((url) => url.pathname === "/");`
  2. Targeted the specific success heading: `await expect(page.getByRole("heading", { name: "Reset Link Generated" })).toBeVisible();`
- **Verification:** Both tests pass; full E2E suite 32/32. (These were test defects, not source defects — fixing them validates the app behaviour that was already correct.)

---

## Issue 7 — settings.ts: `getSettings()` builds settings without null-fallbacks → React controlled/uncontrolled warning

- **File:** `services/settings.ts` (`getSettings`, async branch)
- **Evidence:** `remoteSettings` was constructed directly from DB row fields with no fallback to `DEFAULT_SETTINGS`:
  ```ts
  general: { theme: data.theme, language: data.language, timeZone: data.time_zone, dateFormat: data.date_format }
  ```
  When any column is `null`/missing (the E2E mock `settings` row omits `time_zone`, `date_format`, all notification flags, etc.), `value={settings.general.timeZone}` becomes `undefined`, and the controlled `<select>` flips to uncontrolled. This produced the browser console error during every authenticated run:
  ```
  [Browser Console] error: A component is changing a controlled input to be controlled.
  [Browser Console] error: A component is changing a controlled input to be uncontrolled.
  ```
  This is a genuine source bug: in production, any user with a partially-populated `settings` row would trigger the same warning and broken select state.
- **Fix applied:** Every field now falls back to `DEFAULT_SETTINGS`:
  ```ts
  general: {
    theme: data.theme ?? DEFAULT_SETTINGS.general.theme,
    language: data.language ?? DEFAULT_SETTINGS.general.language,
    timeZone: data.time_zone ?? DEFAULT_SETTINGS.general.timeZone,
    dateFormat: data.date_format ?? DEFAULT_SETTINGS.general.dateFormat,
  },
  // … same pattern for notifications / accessibility / application
  ```
- **Verification:** Re-ran `npm run test:e2e`; the controlled/uncontrolled warnings **no longer appear** in console output. Full suite 32/32. `npm run lint`/`typecheck`/`build` clean.

---

## Issue 8 — ProfilePage.tsx: editable profile fields never populate from the user object

- **File:** `components/pages/ProfilePage.tsx`
- **Evidence:** Editable fields were initialised from `user` at component mount:
  ```ts
  const [name, setName] = useState(user?.name || "");
  ```
  `AuthProvider` intentionally initialises `user` as `null` (hydration fix) and populates it *after* mount. So the `useState` initialiser always captured `""`. The `if (!user) return` guard means the form only mounts once `user` exists, but the state had already been frozen to `""` — the name/phone/organisation/bio inputs rendered **permanently empty** even though the user had data.
- **Fix applied:** Added a hydration effect (using the same `react-hooks/set-state-in-effect` disable pattern already established in `AuthProvider` and `SettingsPage`) that populates the fields from `user` once available:
  ```tsx
  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(user.name || "");
      setPhone(user.phone || "");
      setOrganization(user.organization || "");
      setBio(user.bio || "");
      setAvatar(user.avatar || "");
    }
  }, [user]);
  ```
- **Verification:** `npm run lint` (0 errors/warnings), `npm run typecheck`, `npm run build`, `npm run test` (294), `npm run test:e2e` (32) all pass.

---

## Issue 9 — Hardcoded `COOKIE_SECRET` fallback enables forged session cookies (security)

- **File:** `app/auth-actions.ts` (line 6) and `proxy.ts` (line 45)
- **Evidence:** Both files signed/verified session cookies with a hardcoded fallback when the env var was absent:
  ```ts
  const COOKIE_SECRET = process.env.COOKIE_SECRET || "fallback-secure-stadium-cookie-secret-key-2026";
  ```
  `.env.local` and `.env.example` set **no** `COOKIE_SECRET`. The secret string is committed to source, so in any deployment where the env var is unset (including production if misconfigured), an attacker can read the source and forge a validly-signed `stadium_session` cookie for **any role**, bypassing the Proxy/middleware role-based access control (`proxy.ts` trusts the signature). This is a privilege-escalation vulnerability.
- **Fix applied:** Require the secret in production; allow only a clearly-labelled non-production fallback (so `next dev` / E2E keep working without config):
  ```ts
  const COOKIE_SECRET =
    process.env.COOKIE_SECRET ??
    (process.env.NODE_ENV === "production"
      ? (() => { throw new Error("COOKIE_SECRET environment variable is required in production to sign session cookies."); })()
      : "dev-only-insecure-stadium-cookie-secret-key-2026");
  ```
  Applied identically to both `app/auth-actions.ts` and `proxy.ts`.
- **Verification:** E2E runs against `next dev` (NODE_ENV=development) so the fallback path is exercised — `npm run test:e2e` 32/32 pass. `npm run build`/`typecheck`/`lint` clean. In production the app now fails fast at startup if `COOKIE_SECRET` is missing instead of silently using a known secret.

---

## Areas reviewed and confirmed clean (no changes needed)

- **XSS / injection:** No `dangerouslySetInnerHTML` with user input. The two usages are safe: JSON-LD (`components/seo/JsonLd.tsx`, our own serialised schema) and the inline theme bootstrap script (`app/layout.tsx`, static). No `eval` / `new Function` / `innerHTML`.
- **External links:** All `target="_blank"` anchors include `rel="noopener noreferrer"` (verified in `LandingPage.tsx`).
- **Next.js 16 Proxy:** `proxy.ts` at repo root is the correct Next.js 16 middleware filename (confirmed against `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md` — "Middleware is now called Proxy … Create a `proxy.ts`"). Matches `AGENTS.md` warning.
- **SEO:** `lib/seo.ts` (canonical, OpenGraph, Twitter, robots), `robots.ts` (public allow / private disallow, GPTBot + ClaudeBot rules, sitemap ref), and `sitemap.ts` are correctly structured. (Static review only — no live crawler run.)
- **Type safety:** No `any` in source; `unknown` used consistently in catch blocks with `getErrorMessage`.
- **Error handling:** Service layer uses non-blocking try/catch with graceful mock/offline fallbacks; `console.error` retained, `console.log` stripped in production via `next.config.ts`.
- **Icons/images:** No raw `<img>` tags; `next/image` used where applicable (`ProfilePage.tsx`); all Lucide icons carry `aria-hidden="true"`.

## Notes / non-blocking observations (not fixed)

- `lib/api.ts` sends `Authorization: Bearer ${user.id}` — using the user ID as a bearer token. This `api` client targets non-existent `/api/*` routes and every caller catches failures and returns mock data, so it is not part of the live auth path (Supabase is used directly). Flagged as a design smell only; no production impact.
- `app/sitemap.ts` uses `lastModified: new Date()` (rebuilt each deploy) — acceptable for this project.

---

## Commands executed after every fix

```
npm run typecheck   → 0 errors
npm run lint        → 0 errors, 0 warnings
npm run build       → compiled successfully (23 static routes)
npm run test        → 294 passed
npm run test:e2e    → 32 passed
```
