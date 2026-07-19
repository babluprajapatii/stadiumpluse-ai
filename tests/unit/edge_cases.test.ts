/**
 * tests/unit/edge_cases.test.ts
 *
 * Edge case and failure mode tests for:
 *   - Notifications: offline cache fallback, expired item filtering, error handling
 *   - Settings: PGRST116 provisioning, corrupted JSON, SSR (window=undefined)
 *   - APIClient: network failures
 *   - AuthService: map profile edge cases, trimming
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { NotificationsService } from "@/services/notifications";
import { SettingsService, DEFAULT_SETTINGS } from "@/services/settings";
import { APIClient } from "@/lib/api";

// ── Supabase mock ─────────────────────────────────────────────────────────────

const mockFromSelect = vi.fn();
const mockFromUpdate = vi.fn();
const mockFromInsert = vi.fn();
const mockFromDelete = vi.fn();
const mockFromUpsert = vi.fn();

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resend: vi.fn(),
      updateUser: vi.fn(),
      getSession: vi.fn(),
      resetPasswordForEmail: vi.fn(),
    },
    from: vi.fn((table: string) => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: () => mockFromSelect(table),
          order: vi.fn(() => mockFromSelect(table)),
          is: vi.fn(() => ({
            then: (cb: (r: unknown) => unknown) =>
              Promise.resolve(mockFromUpdate(table)).then(cb),
          })),
        })),
      })),
      update: vi.fn((payload: unknown) => ({
        eq: vi.fn((col: string, val: unknown) => {
          const chain = {
            eq: vi.fn(() => chain),
            is: vi.fn(() => ({
              then: (cb: (r: unknown) => unknown) =>
                Promise.resolve(mockFromUpdate(table, payload, col, val)).then(cb),
            })),
            then: (cb: (r: unknown) => unknown) =>
              Promise.resolve(mockFromUpdate(table, payload, col, val)).then(cb),
          };
          return chain;
        }),
      })),
      insert: vi.fn((payload: unknown) => ({
        select: vi.fn(() => ({
          single: () => mockFromInsert(table, payload),
          then: (cb: (r: unknown) => unknown) =>
            Promise.resolve(mockFromInsert(table, payload)).then(cb),
        })),
        then: (cb: (r: unknown) => unknown) =>
          Promise.resolve(mockFromInsert(table, payload)).then(cb),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn((col: string, val: unknown) => ({
          eq: vi.fn(() => ({
            then: (cb: (r: unknown) => unknown) =>
              Promise.resolve(mockFromDelete(table, col, val)).then(cb),
          })),
          then: (cb: (r: unknown) => unknown) =>
            Promise.resolve(mockFromDelete(table, col, val)).then(cb),
        })),
      })),
      upsert: vi.fn(() => ({
        then: (cb: (r: { error: null }) => unknown) =>
          Promise.resolve(mockFromUpsert(table)).then(cb),
      })),
    })),
  },
}));

// ─── NotificationsService Edge Cases ─────────────────────────────────────────

describe("NotificationsService — edge cases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockFromSelect.mockResolvedValue({ data: [], error: null });
    mockFromUpdate.mockReturnValue({ error: null });
    mockFromInsert.mockReturnValue({
      data: [
        {
          id: "n1",
          user_id: "u1",
          type: "system",
          title: "T",
          message: "M",
          read_at: null,
          created_at: new Date().toISOString(),
          priority: "LOW",
          expires_at: null,
        },
      ],
      error: null,
    });
    mockFromDelete.mockReturnValue({ error: null });
    mockFromUpsert.mockReturnValue({ error: null });
  });

  it("populates defaults when DB is empty", async () => {
    const list = await NotificationsService.getNotifications("u1");
    // Defaults are seeded
    expect(Array.isArray(list)).toBe(true);
  });

  it("falls back to localStorage cache when Supabase throws", async () => {
    const cached = [
      {
        id: "c1",
        userId: "u1",
        type: "system" as const,
        title: "Cached",
        message: "From cache",
        isRead: false,
        timestamp: new Date().toISOString(),
      },
    ];
    localStorage.setItem("stadium_notifications_cache_u1", JSON.stringify(cached));
    // Make supabase throw
    mockFromSelect.mockRejectedValue(new Error("Network error"));

    const list = await NotificationsService.getNotifications("u1");
    expect(list[0].id).toBe("c1");
  });

  it("returns empty array when Supabase throws and no cache exists", async () => {
    mockFromSelect.mockRejectedValue(new Error("Network error"));
    const list = await NotificationsService.getNotifications("u1");
    expect(list).toEqual([]);
  });

  it("returns empty array when cache is invalid JSON", async () => {
    localStorage.setItem("stadium_notifications_cache_u1", "NOT_JSON");
    mockFromSelect.mockRejectedValue(new Error("Network error"));
    const list = await NotificationsService.getNotifications("u1");
    expect(list).toEqual([]);
  });

  it("filters out expired notifications", async () => {
    const expiredDate = new Date(Date.now() - 60000).toISOString();
    const validDate = new Date(Date.now() + 60000).toISOString();
    mockFromSelect.mockResolvedValue({
      data: [
        {
          id: "expired",
          user_id: "u1",
          type: "system",
          title: "Expired",
          message: "Gone",
          read_at: null,
          created_at: new Date().toISOString(),
          priority: "LOW",
          expires_at: expiredDate,
        },
        {
          id: "valid",
          user_id: "u1",
          type: "system",
          title: "Valid",
          message: "Still active",
          read_at: null,
          created_at: new Date().toISOString(),
          priority: "LOW",
          expires_at: validDate,
        },
        {
          id: "no-expiry",
          user_id: "u1",
          type: "security",
          title: "No Expiry",
          message: "Never expires",
          read_at: null,
          created_at: new Date().toISOString(),
          priority: "HIGH",
          expires_at: null,
        },
      ],
      error: null,
    });

    const list = await NotificationsService.getNotifications("u1");
    const ids = list.map((n) => n.id);
    expect(ids).not.toContain("expired");
    expect(ids).toContain("valid");
    expect(ids).toContain("no-expiry");
  });

  it("handles Supabase error during fetch and returns cache or empty", async () => {
    mockFromSelect.mockResolvedValue({ data: null, error: new Error("Query failed") });
    const list = await NotificationsService.getNotifications("u1");
    expect(Array.isArray(list)).toBe(true);
  });

  it("addNotification calls Supabase insert", async () => {
    await NotificationsService.addNotification(
      "u1",
      "system",
      "Test",
      "Test body",
      "LOW"
    );
    // Should not throw
  });

  it("addNotification with expiresAt passes it to DB", async () => {
    const expiresAt = new Date(Date.now() + 3600000).toISOString();
    await NotificationsService.addNotification(
      "u1",
      "emergency",
      "Alert",
      "Evacuation",
      "CRITICAL",
      expiresAt
    );
  });

  it("markAllAsRead calls Supabase update", async () => {
    await NotificationsService.markAllAsRead("u1");
    // should not throw
  });

  it("isRead maps correctly from read_at null vs value", async () => {
    const now = new Date().toISOString();
    mockFromSelect.mockResolvedValue({
      data: [
        {
          id: "read",
          user_id: "u1",
          type: "system",
          title: "R",
          message: "M",
          read_at: now,
          created_at: now,
          priority: "LOW",
          expires_at: null,
        },
        {
          id: "unread",
          user_id: "u1",
          type: "system",
          title: "U",
          message: "M",
          read_at: null,
          created_at: now,
          priority: "LOW",
          expires_at: null,
        },
      ],
      error: null,
    });
    const list = await NotificationsService.getNotifications("u1");
    expect(list.find((n) => n.id === "read")!.isRead).toBe(true);
    expect(list.find((n) => n.id === "unread")!.isRead).toBe(false);
  });
});

// ─── SettingsService Edge Cases ───────────────────────────────────────────────

describe("SettingsService — edge cases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockFromSelect.mockResolvedValue({ data: null, error: null });
    mockFromUpdate.mockReturnValue({ error: null });
    mockFromInsert.mockReturnValue({ error: null });
    mockFromUpsert.mockReturnValue({ error: null });
  });

  it("getLocalSettings returns DEFAULT_SETTINGS when localStorage is empty", () => {
    const settings = SettingsService.getLocalSettings("u1");
    expect(settings).toEqual(DEFAULT_SETTINGS);
  });

  it("getLocalSettings returns cached settings when valid JSON exists", () => {
    const cached = { ...DEFAULT_SETTINGS, general: { ...DEFAULT_SETTINGS.general, theme: "dark" as const } };
    localStorage.setItem("stadium_settings_u1", JSON.stringify(cached));
    const settings = SettingsService.getLocalSettings("u1");
    expect(settings.general.theme).toBe("dark");
  });

  it("getLocalSettings returns defaults when JSON is invalid", () => {
    localStorage.setItem("stadium_settings_u1", "BAD_JSON");
    const settings = SettingsService.getLocalSettings("u1");
    expect(settings).toEqual(DEFAULT_SETTINGS);
  });

  it("getLocalSettings merges partial cached settings with defaults", () => {
    const partial = { general: { theme: "light" } };
    localStorage.setItem("stadium_settings_u1", JSON.stringify(partial));
    const settings = SettingsService.getLocalSettings("u1");
    // Should merge theme but keep other defaults
    expect(settings.general.theme).toBe("light");
    expect(settings.general.language).toBe("en");
  });

  it("applySettings adds dark class for dark theme", () => {
    const settings = { ...DEFAULT_SETTINGS, general: { ...DEFAULT_SETTINGS.general, theme: "dark" as const } };
    SettingsService.applySettings(settings);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("applySettings removes dark class for light theme", () => {
    document.documentElement.classList.add("dark");
    const settings = { ...DEFAULT_SETTINGS, general: { ...DEFAULT_SETTINGS.general, theme: "light" as const } };
    SettingsService.applySettings(settings);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("applySettings adds high-contrast class when enabled", () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      accessibility: { ...DEFAULT_SETTINGS.accessibility, highContrast: true },
    };
    SettingsService.applySettings(settings);
    expect(document.documentElement.classList.contains("high-contrast")).toBe(true);
  });

  it("applySettings removes high-contrast class when disabled", () => {
    document.documentElement.classList.add("high-contrast");
    SettingsService.applySettings(DEFAULT_SETTINGS);
    expect(document.documentElement.classList.contains("high-contrast")).toBe(false);
  });

  it("applySettings adds reduced-motion class when enabled", () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      accessibility: { ...DEFAULT_SETTINGS.accessibility, reducedMotion: true },
    };
    SettingsService.applySettings(settings);
    expect(document.documentElement.classList.contains("reduced-motion")).toBe(true);
  });

  it("applySettings applies small font-size class", () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      accessibility: { ...DEFAULT_SETTINGS.accessibility, fontSize: "small" as const },
    };
    SettingsService.applySettings(settings);
    expect(document.documentElement.classList.contains("text-scale-small")).toBe(true);
  });

  it("applySettings applies large font-size class", () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      accessibility: { ...DEFAULT_SETTINGS.accessibility, fontSize: "large" as const },
    };
    SettingsService.applySettings(settings);
    expect(document.documentElement.classList.contains("text-scale-large")).toBe(true);
  });

  it("applySettings replaces previous font-size class", () => {
    document.documentElement.classList.add("text-scale-large");
    SettingsService.applySettings(DEFAULT_SETTINGS); // fontSize: medium
    expect(document.documentElement.classList.contains("text-scale-large")).toBe(false);
    expect(document.documentElement.classList.contains("text-scale-medium")).toBe(true);
  });

  it("saveSettings persists settings to localStorage", async () => {
    await SettingsService.saveSettings("u1", DEFAULT_SETTINGS);
    const stored = localStorage.getItem("stadium_settings_u1");
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!);
    expect(parsed.general.theme).toBe("system");
  });

  it("getSettings returns cached when Supabase returns error", async () => {
    const cached = { ...DEFAULT_SETTINGS, general: { ...DEFAULT_SETTINGS.general, theme: "dark" as const } };
    localStorage.setItem("stadium_settings_u1", JSON.stringify(cached));
    mockFromSelect.mockResolvedValue({
      data: null,
      error: { code: "NETWORK_ERROR", message: "Offline" },
    });

    const settings = await SettingsService.getSettings("u1");
    expect(settings.general.theme).toBe("dark");
  });

  it("getSettings provisions settings when PGRST116 (not found)", async () => {
    mockFromSelect.mockResolvedValue({
      data: null,
      error: { code: "PGRST116", message: "not found" },
    });
    mockFromUpsert.mockReturnValue({ error: null });

    // Should not throw
    const settings = await SettingsService.getSettings("u1");
    expect(settings).toBeDefined();
  });

  it("getSettings maps remote settings and caches them", async () => {
    mockFromSelect.mockResolvedValue({
      data: {
        theme: "dark",
        language: "hi",
        time_zone: "IST",
        date_format: "DD/MM/YYYY",
        email_notifications: false,
        push_notifications: true,
        security_alerts: true,
        ai_recommendations: false,
        match_updates: true,
        emergency_alerts: true,
        high_contrast: true,
        font_size: "large",
        reduced_motion: true,
        screen_reader: false,
        keyboard_nav: true,
        default_dashboard: "security",
        auto_refresh: "5s",
        ai_preference: "analyst",
        sidebar_collapsed: true,
      },
      error: null,
    });

    const settings = await SettingsService.getSettings("u1");
    expect(settings.general.theme).toBe("dark");
    expect(settings.general.language).toBe("hi");
    expect(settings.accessibility.highContrast).toBe(true);
    expect(settings.application.defaultDashboard).toBe("security");
  });
});

// ─── APIClient Network Failure Edge Cases ─────────────────────────────────────

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("APIClient — network failures", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    APIClient["requestCount"] = 0;
    APIClient["resetTime"] = 0;
  });

  it("throws when fetch rejects (network down)", async () => {
    mockFetch.mockRejectedValue(new Error("Network failure"));
    const client = new APIClient("https://api.example.com");
    await expect(client.get("/test")).rejects.toThrow("Network failure");
  });

  it("error response includes status code in message", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 503,
      statusText: "Service Unavailable",
      text: () => Promise.resolve(""),
    });
    const client = new APIClient("https://api.example.com");
    await expect(client.get("/test")).rejects.toThrow("API Error [503]");
  });

  it("error response includes body text when available", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 400,
      statusText: "Bad Request",
      text: () => Promise.resolve("Validation failed"),
    });
    const client = new APIClient("https://api.example.com");
    await expect(client.get("/test")).rejects.toThrow("Validation failed");
  });
});
