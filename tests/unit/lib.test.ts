/**
 * tests/unit/lib.test.ts
 *
 * Unit tests for:
 *   - lib/crypto.ts  (HMAC helpers — extended edge cases)
 *   - lib/seo.ts     (getSeoMetadata)
 *   - lib/api.ts     (APIClient — extended branch coverage)
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { signRole, verifyRole } from "@/lib/crypto";
import { getSeoMetadata, SITE_URL } from "@/lib/seo";
import { APIClient } from "@/lib/api";

// ─── crypto.ts ────────────────────────────────────────────────────────────────

const SECRET = "test-secret-for-lib-tests-256";

describe("lib/crypto — signRole / verifyRole", () => {
  it("produces a 64-char hex signature", async () => {
    const sig = await signRole("fan", SECRET);
    expect(sig).toHaveLength(64);
    expect(/^[0-9a-f]+$/.test(sig)).toBe(true);
  });

  it("two identical inputs produce identical signatures (deterministic)", async () => {
    const s1 = await signRole("organizer", SECRET);
    const s2 = await signRole("organizer", SECRET);
    expect(s1).toBe(s2);
  });

  it("different roles produce different signatures", async () => {
    const s1 = await signRole("fan", SECRET);
    const s2 = await signRole("operator", SECRET);
    expect(s1).not.toBe(s2);
  });

  it("different secrets produce different signatures", async () => {
    const s1 = await signRole("fan", "secret-A");
    const s2 = await signRole("fan", "secret-B");
    expect(s1).not.toBe(s2);
  });

  it("verifyRole: valid pair returns true", async () => {
    const role = "volunteer";
    const sig = await signRole(role, SECRET);
    expect(await verifyRole(role, sig, SECRET)).toBe(true);
  });

  it("verifyRole: wrong role returns false", async () => {
    const sig = await signRole("fan", SECRET);
    expect(await verifyRole("organizer", sig, SECRET)).toBe(false);
  });

  it("verifyRole: wrong secret returns false", async () => {
    const sig = await signRole("fan", "correct-secret");
    expect(await verifyRole("fan", sig, "wrong-secret")).toBe(false);
  });

  it("verifyRole: empty signature returns false", async () => {
    expect(await verifyRole("fan", "", SECRET)).toBe(false);
  });

  it("verifyRole: signature of wrong length returns false early", async () => {
    // shorter or longer string — constant-time guard
    expect(await verifyRole("fan", "abc", SECRET)).toBe(false);
    expect(await verifyRole("fan", "a".repeat(128), SECRET)).toBe(false);
  });

  it("handles all UserRole values", async () => {
    const roles = ["fan", "volunteer", "security", "organizer", "operator", "accessibility"];
    for (const role of roles) {
      const sig = await signRole(role, SECRET);
      expect(await verifyRole(role, sig, SECRET)).toBe(true);
    }
  });
});

// ─── seo.ts ──────────────────────────────────────────────────────────────────

describe("lib/seo — getSeoMetadata", () => {
  it("returns title wrapped in template", () => {
    const meta = getSeoMetadata({ title: "Dashboard" });
    expect((meta.title as { default: string }).default).toBe("Dashboard | StadiumPulse AI");
  });

  it("sets default description when not provided", () => {
    const meta = getSeoMetadata({ title: "Test" });
    expect(meta.description).toContain("GenAI-powered");
  });

  it("uses custom description when provided", () => {
    const meta = getSeoMetadata({ title: "T", description: "Custom desc" });
    expect(meta.description).toBe("Custom desc");
  });

  it("builds canonical URL from canonicalPath", () => {
    const meta = getSeoMetadata({ title: "T", canonicalPath: "/login" });
    expect(meta.alternates?.canonical).toBe(`${SITE_URL}/login`);
  });

  it("handles empty canonicalPath (root)", () => {
    const meta = getSeoMetadata({ title: "T" });
    expect(meta.alternates?.canonical).toBe(`${SITE_URL}`);
  });

  it("sets noIndex robots when noIndex=true", () => {
    const meta = getSeoMetadata({ title: "T", noIndex: true });
    expect((meta.robots as { index: boolean }).index).toBe(false);
  });

  it("sets follow robots by default", () => {
    const meta = getSeoMetadata({ title: "T" });
    expect((meta.robots as { follow: boolean }).follow).toBe(true);
  });

  it("OpenGraph title matches page title", () => {
    const meta = getSeoMetadata({ title: "Stadium Ops" });
    expect((meta.openGraph?.title as string)).toContain("Stadium Ops");
  });

  it("OpenGraph image uses absolute URL for relative paths", () => {
    const meta = getSeoMetadata({ title: "T", ogImage: "/og.png" });
    const img = meta.openGraph?.images;
    const first = Array.isArray(img) ? img[0] : img;
    const url = typeof first === "string" ? first : (first as { url: string })?.url;
    expect(url).toMatch(/^https?:\/\//);
  });

  it("OpenGraph image uses provided absolute URL as-is", () => {
    const meta = getSeoMetadata({ title: "T", ogImage: "https://cdn.example.com/img.png" });
    const img = meta.openGraph?.images;
    const first = Array.isArray(img) ? img[0] : img;
    const url = typeof first === "string" ? first : (first as { url: string })?.url;
    expect(url).toBe("https://cdn.example.com/img.png");
  });

  it("Twitter card type is summary_large_image", () => {
    const meta = getSeoMetadata({ title: "T" });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((meta.twitter as any)?.card).toBe("summary_large_image");
  });

  it("keywords are joined as comma-separated string", () => {
    const meta = getSeoMetadata({ title: "T", keywords: ["foo", "bar"] });
    expect(meta.keywords).toBe("foo, bar");
  });

  it("metadataBase is a URL object pointing to SITE_URL", () => {
    const meta = getSeoMetadata({ title: "T" });
    expect(meta.metadataBase).toBeInstanceOf(URL);
    expect((meta.metadataBase as URL).href).toContain("stadiumpulse");
  });
});

// ─── api.ts — Extended branch coverage ───────────────────────────────────────

const mockFetch = vi.fn();
global.fetch = mockFetch;

function makeOkResponse(body: unknown, status = 200) {
  return {
    ok: true,
    status,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(""),
  };
}

function makeErrorResponse(status: number, text: string) {
  return {
    ok: false,
    status,
    statusText: "Error",
    json: () => Promise.reject(new Error("no json")),
    text: () => Promise.resolve(text),
  };
}

describe("lib/api — APIClient (extended branches)", () => {
  let client: APIClient;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Reset static rate-limit state
    APIClient["requestCount"] = 0;
    APIClient["resetTime"] = 0;
    client = new APIClient("https://api.example.com");
  });

  it("GET with params builds correct query string", async () => {
    mockFetch.mockResolvedValue(makeOkResponse({ ok: true }));
    await client.get("/data", { params: { foo: "bar", x: "1" } });
    const calledUrl: string = mockFetch.mock.calls[0][0];
    expect(calledUrl).toContain("foo=bar");
    expect(calledUrl).toContain("x=1");
  });

  it("POST sets Content-Type: application/json by default", async () => {
    mockFetch.mockResolvedValue(makeOkResponse({ ok: true }));
    await client.post("/submit", { name: "test" });
    const headers: Headers = mockFetch.mock.calls[0][1].headers;
    expect(headers.get("Content-Type")).toBe("application/json");
  });

  it("POST with FormData body option skips Content-Type override when body is FormData instance", async () => {
    mockFetch.mockResolvedValue(makeOkResponse({ ok: true }));
    const form = new FormData();
    form.append("file", "data");
    // Call GET with a raw FormData body in options to hit the FormData branch of the internal request()
    await client.get("/upload", { body: form });
    const headers: Headers = mockFetch.mock.calls[0][1].headers;
    // When body is FormData, Content-Type must NOT be set by our code (browser sets it with boundary)
    expect(headers.get("Content-Type")).toBeNull();
  });

  it("PUT request works correctly", async () => {
    mockFetch.mockResolvedValue(makeOkResponse({ updated: true }));
    const result = await client.put<{ updated: boolean }>("/item/1", { val: 42 });
    expect(result.updated).toBe(true);
  });

  it("DELETE request works correctly", async () => {
    mockFetch.mockResolvedValue(makeOkResponse({ deleted: true }));
    const result = await client.delete<{ deleted: boolean }>("/item/1");
    expect(result.deleted).toBe(true);
  });

  it("returns empty object on 204 No Content", async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 204, json: vi.fn(), text: vi.fn() });
    const result = await client.get<Record<string, never>>("/empty");
    expect(result).toEqual({});
  });

  it("throws formatted error on non-ok response", async () => {
    mockFetch.mockResolvedValue(makeErrorResponse(404, "Not Found"));
    await expect(client.get("/missing")).rejects.toThrow("API Error [404]");
  });

  it("throws 429 when rate limit exceeded", async () => {
    mockFetch.mockResolvedValue(makeOkResponse({ ok: true }));
    // Saturate with more than 150 requests
    APIClient["requestCount"] = 151;
    APIClient["resetTime"] = Date.now() + 60000;
    await expect(client.get("/test")).rejects.toThrow("Too many requests");
  });

  it("rate-limit counter resets after window expires", async () => {
    mockFetch.mockResolvedValue(makeOkResponse({ ok: true }));
    // Simulate expired window
    APIClient["requestCount"] = 200;
    APIClient["resetTime"] = Date.now() - 1000; // window already expired
    const result = await client.get<{ ok: boolean }>("/test");
    expect(result.ok).toBe(true);
    expect(APIClient["requestCount"]).toBe(1);
  });

  it("adds Authorization header from localStorage session", async () => {
    localStorage.setItem("stadium_session", JSON.stringify({ id: "usr-123" }));
    mockFetch.mockResolvedValue(makeOkResponse({ ok: true }));
    await client.get("/secure");
    const headers: Headers = mockFetch.mock.calls[0][1].headers;
    expect(headers.get("Authorization")).toBe("Bearer usr-123");
  });

  it("ignores malformed localStorage session without crashing", async () => {
    localStorage.setItem("stadium_session", "NOT_VALID_JSON");
    mockFetch.mockResolvedValue(makeOkResponse({ ok: true }));
    await expect(client.get("/any")).resolves.toBeDefined();
  });

  it("skips Authorization if session has no id", async () => {
    localStorage.setItem("stadium_session", JSON.stringify({ name: "No ID" }));
    mockFetch.mockResolvedValue(makeOkResponse({ ok: true }));
    await client.get("/no-auth");
    const headers: Headers = mockFetch.mock.calls[0][1].headers;
    expect(headers.get("Authorization")).toBeNull();
  });
});
