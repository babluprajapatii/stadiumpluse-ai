import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { SettingsService, DEFAULT_SETTINGS, UserSettings } from "@/services/settings";

// Mock Supabase client
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({
            data: {
              theme: "dark",
              language: "hi",
              time_zone: "IST",
              date_format: "DD/MM/YYYY",
              email_notifications: false,
              push_notifications: false,
              security_alerts: true,
              ai_recommendations: true,
              match_updates: true,
              emergency_alerts: true,
              high_contrast: true,
              font_size: "large",
              reduced_motion: true,
              screen_reader: true,
              keyboard_nav: true,
              default_dashboard: "volunteer",
              auto_refresh: "5s",
              ai_preference: "concierge",
              sidebar_collapsed: true,
            },
            error: null,
          }),
        })),
      })),
      upsert: vi.fn().mockResolvedValue({ error: null }),
    })),
  },
}));

describe("SettingsService", () => {
  const userId = "test-user-id";

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = "";
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getLocalSettings", () => {
    it("returns default settings when storage is empty", () => {
      const settings = SettingsService.getLocalSettings(userId);
      expect(settings).toEqual(DEFAULT_SETTINGS);
    });

    it("returns cached settings when present in localStorage", () => {
      const cached: UserSettings = {
        ...DEFAULT_SETTINGS,
        general: { ...DEFAULT_SETTINGS.general, theme: "dark" },
      };
      localStorage.setItem(`stadium_settings_${userId}`, JSON.stringify(cached));
      const settings = SettingsService.getLocalSettings(userId);
      expect(settings.general.theme).toBe("dark");
    });
  });

  describe("getSettings", () => {
    it("caches settings in localStorage on success", async () => {
      const settings = await SettingsService.getSettings(userId);
      expect(settings.general.theme).toBe("dark");
      expect(settings.general.language).toBe("hi");

      const local = localStorage.getItem(`stadium_settings_${userId}`);
      expect(local).not.toBeNull();
      expect(JSON.parse(local!).general.theme).toBe("dark");
    });
  });

  describe("applySettings", () => {
    it("applies theme, contrast, motion and font scaling to DOM element", () => {
      const targetSettings: UserSettings = {
        ...DEFAULT_SETTINGS,
        accessibility: {
          highContrast: true,
          fontSize: "large",
          reducedMotion: true,
          screenReader: false,
          keyboardNav: false,
        },
      };

      SettingsService.applySettings(targetSettings);
      const html = document.documentElement;

      expect(html.classList.contains("high-contrast")).toBe(true);
      expect(html.classList.contains("reduced-motion")).toBe(true);
      expect(html.classList.contains("text-scale-large")).toBe(true);
    });
  });
});
