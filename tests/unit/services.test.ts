import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AuthService } from "@/services/auth";
import { NotificationsService } from "@/services/notifications";
import { SettingsService, DEFAULT_SETTINGS, UserSettings } from "@/services/settings";

// --- Mocks ---
const mockSignIn = vi.fn();
const mockSignUp = vi.fn();
const mockSignOut = vi.fn();
const mockSelect = vi.fn();

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      signInWithPassword: (...args: unknown[]) => mockSignIn(...args),
      signUp: (...args: unknown[]) => mockSignUp(...args),
      signOut: (...args: unknown[]) => mockSignOut(...args),
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({
            data: {
              id: "test-user-id",
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
          order: vi.fn().mockResolvedValue({
            data: [
              {
                id: "not_1",
                user_id: "test-user-id",
                type: "security",
                title: "Alert",
                message: "Incident logged",
                read_at: null,
                created_at: "2026-07-16T12:00:00Z",
                priority: "HIGH",
                expires_at: null,
              },
            ],
            error: null,
          }),
        })),
      })),
      upsert: vi.fn().mockResolvedValue({ error: null }),
      update: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ error: null }),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ error: null }),
      })),
      insert: vi.fn(() => ({
        select: vi.fn().mockResolvedValue({
          single: vi.fn().mockResolvedValue({
            data: { id: "new-user-id", name: "Bob", email: "bob@stadium.com", role: "volunteer", is_verified: true },
            error: null,
          }),
        }),
      })),
    })),
  },
}));

// --- Tests ---
describe("Services Integration Tests", () => {
  const userId = "test-user-id";

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = "";
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // 1. AuthService
  describe("AuthService", () => {
    it("signs up a user and returns registered user details on success", async () => {
      mockSignUp.mockResolvedValue({
        data: {
          user: {
            id: "test-user-id",
            identities: [{ identity_data: { email_verified: true } }],
          },
        },
        error: null,
      });

      const user = await AuthService.register("Bob", "bob@stadium.com", "Pass123!", "volunteer");
      expect(user.id).toBe("test-user-id");
      expect(user.name).toBe("Bob");
      expect(user.email).toBe("bob@stadium.com");
      expect(user.role).toBe("volunteer");
    });

    it("throws an error when signup fails in Supabase", async () => {
      mockSignUp.mockResolvedValue({
        data: { user: null },
        error: new Error("Supabase signup failed"),
      });

      await expect(
        AuthService.register("Bob", "bob@stadium.com", "Pass123!", "volunteer")
      ).rejects.toThrow("Supabase signup failed");
    });
  });

  // 2. SettingsService
  describe("SettingsService", () => {
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

    it("applies accessibility settings to DOM HTML element", () => {
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

  // 3. NotificationsService
  describe("NotificationsService", () => {
    it("retrieves list of notifications and maps database properties correctly", async () => {
      const list = await NotificationsService.getNotifications(userId);
      expect(list).toHaveLength(1);
      expect(list[0].id).toBe("not_1");
      expect(list[0].isRead).toBe(false);
      expect(list[0].priority).toBe("HIGH");
    });

    it("successfully marks notifications as read and deletes them", async () => {
      await expect(NotificationsService.markAsRead(userId, "not_1")).resolves.not.toThrow();
      await expect(NotificationsService.deleteNotification(userId, "not_1")).resolves.not.toThrow();
    });
  });
});
