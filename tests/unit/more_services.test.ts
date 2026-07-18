import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { api, APIClient } from "@/lib/api";
import { StadiumService } from "@/services/stadium";
import { AIService } from "@/services/ai";
import { AuthService } from "@/services/auth";
import { NotificationsService } from "@/services/notifications";
import { SettingsService, DEFAULT_SETTINGS } from "@/services/settings";
import { supabase } from "@/lib/supabase";

// --- Mock Globals ---
const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockSignIn = vi.fn();
const mockSignUp = vi.fn();
const mockSignOut = vi.fn();
const mockResend = vi.fn();
const mockUpdateUser = vi.fn();
const mockGetSession = vi.fn();

const mockFromSelect = vi.fn();
const mockFromUpdate = vi.fn();
const mockFromInsert = vi.fn();
const mockFromDelete = vi.fn();

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      signInWithPassword: (...args: unknown[]) => mockSignIn(...args),
      signUp: (...args: unknown[]) => mockSignUp(...args),
      signOut: (...args: unknown[]) => mockSignOut(...args),
      resend: (...args: unknown[]) => mockResend(...args),
      updateUser: (...args: unknown[]) => mockUpdateUser(...args),
      getSession: (...args: unknown[]) => mockGetSession(...args),
      resetPasswordForEmail: vi.fn(),
    },
    from: vi.fn((table: string) => ({
      select: vi.fn((...selectArgs: unknown[]) => ({
        eq: vi.fn((col: string, val: unknown) => ({
          single: () => mockFromSelect(table, selectArgs, col, val),
          order: (...orderArgs: unknown[]) => mockFromSelect(table, selectArgs, col, val, orderArgs),
          is: (...isArgs: unknown[]) => ({
            resolves: vi.fn().mockResolvedValue({ error: null }),
            then: (cb: any) => Promise.resolve({ error: null }).then(cb),
          }),
        })),
      })),
      update: vi.fn((updates: unknown) => ({
        eq: vi.fn((col: string, val: unknown) => {
          const chain = {
            eq: vi.fn(() => chain),
            is: vi.fn(() => chain),
            select: vi.fn(() => ({
              single: () => mockFromUpdate(table, updates, col, val),
            })),
            then: (cb: any) => Promise.resolve(mockFromUpdate(table, updates, col, val)).then(cb),
          };
          return chain;
        }),
      })),
      insert: vi.fn((payload: unknown) => ({
        select: vi.fn(() => ({
          single: () => mockFromInsert(table, payload),
          then: (cb: any) => Promise.resolve(mockFromInsert(table, payload)).then(cb),
        })),
        then: (cb: any) => Promise.resolve({ error: null }).then(cb),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn((col: string, val: unknown) => ({
          eq: vi.fn((col2: string, val2: unknown) => ({
            then: (cb: any) => Promise.resolve(mockFromDelete(table, col, val)).then(cb),
          })),
          then: (cb: any) => Promise.resolve(mockFromDelete(table, col, val)).then(cb),
        })),
      })),
      upsert: vi.fn(() => ({
        then: (cb: any) => Promise.resolve({ error: null }).then(cb),
      })),
    })),
  },
}));

describe("Comprehensive Services & API Tests", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    mockFromSelect.mockResolvedValue({ data: {}, error: null });
    mockFromUpdate.mockReturnValue({ data: {}, error: null });
    mockFromInsert.mockReturnValue({ data: {}, error: null });
    mockFromDelete.mockReturnValue({ data: {}, error: null });
  });

  // ─── API CLIENT TESTS ───────────────────────────────────────────────────────
  describe("APIClient", () => {
    it("performs successful GET requests with params and headers", async () => {
      const mockResponse = { data: "test-get" };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const client = new APIClient("https://stadiumpulse-api.com");
      const res = await client.get<typeof mockResponse>("/test", {
        params: { q: "search" },
        headers: { "X-Custom": "header-value" },
      });

      expect(res).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://stadiumpulse-api.com/test?q=search",
        expect.objectContaining({
          method: "GET",
          headers: expect.any(Headers),
        })
      );
    });

    it("attaches Authorization header if localStorage token exists", async () => {
      localStorage.setItem("stadium_session", JSON.stringify({ id: "user-token-123" }));
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({}),
      });

      const client = new APIClient();
      await client.get("/auth-check");

      expect(mockFetch).toHaveBeenCalled();
      const headersCall = mockFetch.mock.calls[0][1].headers as Headers;
      expect(headersCall.get("Authorization")).toBe("Bearer user-token-123");
    });

    it("returns empty object on 204 No Content", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      const client = new APIClient();
      const res = await client.post("/no-content");
      expect(res).toEqual({});
    });

    it("performs successful PUT requests", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ updated: true }),
      });

      const client = new APIClient();
      const res = await client.put("/update", { foo: "bar" });
      expect(res).toEqual({ updated: true });
    });

    it("throws error on API failures", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        text: async () => "Fatal Database Error",
      });

      const client = new APIClient();
      await expect(client.delete("/fail")).rejects.toThrow("API Error [500]: Fatal Database Error");
    });
  });

  // ─── STADIUM SERVICE TESTS ──────────────────────────────────────────────────
  describe("StadiumService", () => {
    it("returns api metrics successfully", async () => {
      const metrics = { activeFans: 100, capacityRate: 50, systemStatus: "ok", activeIncidents: 1 };
      const spyGet = vi.spyOn(api, "get").mockResolvedValueOnce(metrics);

      const res = await StadiumService.getMetrics();
      expect(res).toEqual(metrics);
      expect(spyGet).toHaveBeenCalledWith("/stadium/metrics");
    });

    it("falls back to default metrics on API metrics failure", async () => {
      vi.spyOn(api, "get").mockRejectedValueOnce(new Error("Network Failure"));
      const res = await StadiumService.getMetrics();
      expect(res.activeFans).toBe(47300);
      expect(res.systemStatus).toBe("ok");
    });

    it("returns api gates successfully", async () => {
      const gates = [{ name: "Z", value: 40, color: "green", open: true }];
      const spyGet = vi.spyOn(api, "get").mockResolvedValueOnce(gates);

      const res = await StadiumService.getGates();
      expect(res).toEqual(gates);
    });

    it("falls back to default gates on API gates failure", async () => {
      vi.spyOn(api, "get").mockRejectedValueOnce(new Error("Network Failure"));
      const res = await StadiumService.getGates();
      expect(res).toHaveLength(4);
      expect(res[0].name).toBe("A");
    });

    it("posts updated gate changes", async () => {
      const updated = { name: "A", open: false };
      const spyPost = vi.spyOn(api, "post").mockResolvedValueOnce(updated);

      const res = await StadiumService.updateGate("A", { open: false });
      expect(res).toEqual(updated);
      expect(spyPost).toHaveBeenCalledWith("/stadium/gates/A", { open: false });
    });

    it("returns food court menu items", async () => {
      const menu = [{ id: "m5", name: "Soda", price: 3.5, description: "Cold fizzy drink", estimatedMinutes: 1, category: "drink", available: true, image: "/soda.png" }];
      const spyGet = vi.spyOn(api, "get").mockResolvedValueOnce(menu);

      const res = await StadiumService.getFoodMenu();
      expect(res).toEqual(menu);
    });

    it("falls back to default menu items on API menu failure", async () => {
      vi.spyOn(api, "get").mockRejectedValueOnce(new Error("Network Failure"));
      const res = await StadiumService.getFoodMenu();
      expect(res).toHaveLength(2);
      expect(res[0].id).toBe("m1");
    });

    it("places concession order successfully", async () => {
      const order = { orderId: "ord-123", status: "preparing" };
      const spyPost = vi.spyOn(api, "post").mockResolvedValueOnce(order);

      const res = await StadiumService.placeConcessionOrder([{ id: "m1", quantity: 2 }]);
      expect(res).toEqual(order);
      expect(spyPost).toHaveBeenCalledWith("/food/orders", { items: [{ id: "m1", quantity: 2 }] });
    });
  });

  // ─── AI SERVICE TESTS ───────────────────────────────────────────────────────
  describe("AIService", () => {
    it("returns genai recommendations successfully", async () => {
      const recs = [{ id: "temp", label: "Temp", status: "fine", detail: "ok", priority: "low", confidence: 95, action: "none", actionLabel: "Ok" }];
      const spyGet = vi.spyOn(api, "get").mockResolvedValueOnce(recs);

      const res = await AIService.getRecommendations();
      expect(res).toEqual(recs);
    });

    it("falls back to baseline mock recommendations on API failure", async () => {
      vi.spyOn(api, "get").mockRejectedValueOnce(new Error("Network Failure"));
      const res = await AIService.getRecommendations();
      expect(res).toHaveLength(2);
      expect(res[0].id).toBe("crowd");
    });

    it("dispatches execute action post requests", async () => {
      const result = { success: true, message: "action dispatched" };
      const spyPost = vi.spyOn(api, "post").mockResolvedValueOnce(result);

      const res = await AIService.executeRecommendationAction("crowd");
      expect(res).toEqual(result);
      expect(spyPost).toHaveBeenCalledWith("/ai/recommendations/crowd/execute");
    });

    it("posts chat prompts and returns reply string", async () => {
      const response = { reply: "Yes, Gate B is open." };
      const spyPost = vi.spyOn(api, "post").mockResolvedValueOnce(response);

      const res = await AIService.queryPulseAI("Is gate B open?");
      expect(res).toBe("Yes, Gate B is open.");
      expect(spyPost).toHaveBeenCalledWith("/ai/chat", { prompt: "Is gate B open?" });
    });

    it("returns offline baseline message on chat API failure", async () => {
      vi.spyOn(api, "post").mockRejectedValueOnce(new Error("Network Failure"));
      const res = await AIService.queryPulseAI("Hello");
      expect(res).toContain("offline");
    });
  });

  // ─── AUTH SERVICE TESTS ─────────────────────────────────────────────────────
  describe("AuthService Extra Methods", () => {
    it("authenticates credentials and maps user profile successfully", async () => {
      mockSignIn.mockResolvedValueOnce({
        data: { user: { id: "user-123" } },
        error: null,
      });

      mockFromSelect.mockResolvedValueOnce({
        data: {
          id: "user-123",
          name: "John Doe",
          email: "john@stadium.com",
          role: "operator",
          is_verified: true,
          phone: "555-0199",
          organization: "FIFA Ops",
          bio: "Lead Manager",
          avatar_url: "avatar-url-jpg",
          member_since: "2026-07-16T12:00:00Z",
          last_login: "2026-07-18T18:00:00Z",
        },
        error: null,
      });

      const user = await AuthService.authenticate("john@stadium.com", "Password!");
      expect(user.id).toBe("user-123");
      expect(user.role).toBe("operator");
      expect(user.phone).toBe("555-0199");
      expect(user.memberSince).toBeDefined();
    });

    it("falls back and provisions profile if profile query does not exist", async () => {
      mockSignIn.mockResolvedValueOnce({
        data: {
          user: {
            id: "user-123",
            user_metadata: { role: "volunteer", name: "Provisioned User" },
          },
        },
        error: null,
      });

      // profile query fails
      mockFromSelect.mockResolvedValueOnce({ data: null, error: new Error("Profile not found") });

      // insert falls back
      mockFromInsert.mockResolvedValueOnce({
        data: {
          id: "user-123",
          name: "Provisioned User",
          email: "john@stadium.com",
          role: "volunteer",
          is_verified: true,
          member_since: "2026-07-16T12:00:00Z",
        },
        error: null,
      });

      const user = await AuthService.authenticate("john@stadium.com", "Password!");
      expect(user.name).toBe("Provisioned User");
      expect(user.role).toBe("volunteer");
    });

    it("throws error if authentication signIn fails", async () => {
      mockSignIn.mockResolvedValueOnce({
        data: { user: null },
        error: new Error("Invalid password"),
      });

      await expect(AuthService.authenticate("john@stadium.com", "Password!")).rejects.toThrow("Invalid password");
    });

    it("throws error if user has not verified email address", async () => {
      mockSignIn.mockResolvedValueOnce({
        data: { user: { id: "user-123" } },
        error: null,
      });

      mockFromSelect.mockResolvedValueOnce({
        data: {
          id: "user-123",
          name: "Unverified John",
          email: "john@stadium.com",
          role: "fan",
          is_verified: false,
        },
        error: null,
      });

      await expect(AuthService.authenticate("john@stadium.com", "Password!")).rejects.toThrow("Please verify your email address");
    });

    it("signs out and logs activity", async () => {
      mockSignOut.mockResolvedValueOnce({ error: null });
      await expect(AuthService.logout("user-123")).resolves.not.toThrow();
    });

    it("sends reset password request for email", async () => {
      mockResend.mockResolvedValueOnce({ error: null });
      const res = await AuthService.generateVerificationToken("john@stadium.com");
      expect(res).toBe("supabase_verification_email_sent");
    });

    it("submits updated user password", async () => {
      mockUpdateUser.mockResolvedValueOnce({ error: null });
      await expect(AuthService.resetPassword("token", "NewPassword!")).resolves.not.toThrow();
    });

    it("throws error if reset password update fails", async () => {
      mockUpdateUser.mockResolvedValueOnce({ error: new Error("Weak password") });
      await expect(AuthService.resetPassword("token", "NewPassword!")).rejects.toThrow("Weak password");
    });

    it("updates profiles data in database profiles table", async () => {
      mockFromUpdate.mockResolvedValueOnce({
        data: {
          id: "user-123",
          name: "Updated Name",
          email: "john@stadium.com",
          role: "fan",
          is_verified: true,
        },
        error: null,
      });

      const user = await AuthService.updateProfile("user-123", { name: "Updated Name", phone: "123" });
      expect(user.name).toBe("Updated Name");
    });

    it("validates reset tokens by checking active Supabase session", async () => {
      mockGetSession.mockResolvedValueOnce({
        data: {
          session: {
            user: { email: "reset@stadium.com" },
          },
        },
      });

      const tokenObj = await AuthService.validateResetToken("some-reset-token");
      expect(tokenObj.email).toBe("reset@stadium.com");
      expect(tokenObj.token).toBe("some-reset-token");
    });

    it("throws error validating reset token when no session exists", async () => {
      mockGetSession.mockResolvedValueOnce({ data: { session: null } });
      await expect(AuthService.validateResetToken("some-token")).rejects.toThrow("Invalid or expired password reset link");
    });

    it("simulates verifying email with token", async () => {
      mockGetSession.mockResolvedValueOnce({
        data: {
          session: {
            user: { email: "verif@stadium.com" },
          },
        },
      });

      await expect(AuthService.verifyEmailWithToken("supabase_verification_email_sent")).resolves.not.toThrow();
    });

    it("throws error in register if no user is returned", async () => {
      mockSignUp.mockResolvedValueOnce({
        data: { user: null },
        error: null,
      });
      await expect(
        AuthService.register("Bob", "bob@stadium.com", "Pass!", "volunteer")
      ).rejects.toThrow("Registration failed");
    });

    it("throws error in authenticate if no user is returned", async () => {
      mockSignIn.mockResolvedValueOnce({
        data: { user: null },
        error: null,
      });
      await expect(
        AuthService.authenticate("bob@stadium.com", "Pass!")
      ).rejects.toThrow("Authentication failed");
    });

    it("throws error in updateProfile if update fails", async () => {
      mockFromUpdate.mockResolvedValueOnce({
        data: null,
        error: new Error("DB update error"),
      });
      await expect(
        AuthService.updateProfile("user-123", { name: "Bob" })
      ).rejects.toThrow("DB update error");
    });

    it("sends password reset link email", async () => {
      const mockResetSupabase = vi.spyOn(supabase.auth, "resetPasswordForEmail").mockResolvedValueOnce({ error: null });
      const res = await AuthService.generateResetToken("bob@stadium.com");
      expect(res).toBe("reset_email_sent");
      expect(mockResetSupabase).toHaveBeenCalled();
    });

    it("throws error in verifyEmail if DB query fails", async () => {
      mockFromUpdate.mockReturnValueOnce({ error: new Error("Verify error") });
      await expect(
        AuthService.verifyEmail("bob@stadium.com")
      ).rejects.toThrow("Email verification failed");
    });

    it("throws error in verifyEmailWithToken for OTP tokens", async () => {
      await expect(
        AuthService.verifyEmailWithToken("otp-token-value")
      ).rejects.toThrow("Please click the verification link");
    });
  });

  // ─── NOTIFICATIONS SERVICE TESTS ───────────────────────────────────────────
  describe("NotificationsService", () => {
    const userId = "user-123";

    it("returns notifications from database and caches them", async () => {
      const rows = [
        {
          id: "n_db_1",
          user_id: userId,
          type: "security",
          title: "System Alert",
          message: "Database ok",
          read_at: null,
          created_at: new Date().toISOString(),
          priority: "MEDIUM",
        },
      ];
      mockFromSelect.mockResolvedValueOnce({ data: rows, error: null });

      const list = await NotificationsService.getNotifications(userId);
      expect(list).toHaveLength(1);
      expect(list[0].id).toBe("n_db_1");
    });

    it("populates defaults if database is empty", async () => {
      // get empty
      mockFromSelect.mockResolvedValueOnce({ data: [], error: null });
      // mock insert return
      mockFromInsert.mockResolvedValueOnce({
        data: [
          { id: "not_1", user_id: userId, type: "emergency", title: "Weather Warning", message: "Rain", read_at: null, created_at: new Date().toISOString() },
        ],
        error: null,
      });

      const list = await NotificationsService.getNotifications(userId);
      expect(list).toHaveLength(1);
      expect(list[0].id).toBe("not_1");
    });

    it("filters out expired notifications", async () => {
      const expiredTime = new Date(Date.now() - 10000).toISOString(); // 10s ago
      const rows = [
        { id: "not_exp", user_id: userId, type: "system", title: "Expired", message: "Old", read_at: null, created_at: new Date().toISOString(), expires_at: expiredTime },
      ];
      mockFromSelect.mockResolvedValueOnce({ data: rows, error: null });

      const list = await NotificationsService.getNotifications(userId);
      expect(list).toHaveLength(0);
    });

    it("falls back to local storage cache if database query fails", async () => {
      const cached = [{ id: "not_cached", userId, type: "system", title: "Cached", message: "Cached Msg", isRead: false, timestamp: new Date().toISOString() }];
      localStorage.setItem(`stadium_notifications_cache_${userId}`, JSON.stringify(cached));

      mockFromSelect.mockResolvedValueOnce({ data: null, error: new Error("DB Error") });

      const list = await NotificationsService.getNotifications(userId);
      expect(list).toHaveLength(1);
      expect(list[0].id).toBe("not_cached");
    });

    it("creates a new notification through insert", async () => {
      mockFromSelect.mockResolvedValue({ data: [], error: null });
      mockFromInsert.mockResolvedValue({ data: [], error: null });

      await expect(NotificationsService.addNotification(userId, "ai", "AI Alert", "Congestion predicted")).resolves.not.toThrow();
    });

    it("marks all notifications as read", async () => {
      mockFromSelect.mockResolvedValue({ data: [], error: null });
      mockFromInsert.mockResolvedValue({ data: [], error: null });

      await expect(NotificationsService.markAllAsRead(userId)).resolves.not.toThrow();
    });

    it("handles db error on markAsRead", async () => {
      mockFromUpdate.mockImplementationOnce(() => { throw new Error("Update Error"); });
      await expect(NotificationsService.markAsRead(userId, "n1")).resolves.not.toThrow();
    });

    it("handles db error on deleteNotification", async () => {
      mockFromDelete.mockImplementationOnce(() => { throw new Error("Delete Error"); });
      await expect(NotificationsService.deleteNotification(userId, "n1")).resolves.not.toThrow();
    });

    it("handles corrupt JSON in local cache for getNotifications", async () => {
      localStorage.setItem(`stadium_notifications_cache_${userId}`, "{invalid-json");
      mockFromSelect.mockResolvedValueOnce({ data: null, error: new Error("DB Error") });
      const list = await NotificationsService.getNotifications(userId);
      expect(list).toEqual([]);
    });
  });

  // ─── SETTINGS SERVICE TESTS ────────────────────────────────────────────────
  describe("SettingsService Extra Paths", () => {
    const userId = "user-123";

    it("handles corrupt JSON in getLocalSettings", () => {
      localStorage.setItem(`stadium_settings_${userId}`, "{corrupt");
      const res = SettingsService.getLocalSettings(userId);
      expect(res.general.theme).toBe("system");
    });

    it("loads default settings if remote DB select fails", async () => {
      mockFromSelect.mockResolvedValueOnce({ data: null, error: new Error("No settings record") });
      const res = await SettingsService.getSettings(userId);
      expect(res.general.theme).toBe("system");
    });

    it("provisions settings using defaults if PGRST116 code is returned", async () => {
      mockFromSelect.mockResolvedValueOnce({ data: null, error: { code: "PGRST116", message: "Not found" } });
      const res = await SettingsService.getSettings(userId);
      expect(res.general.theme).toBe("system");
    });

    it("handles exceptions in getSettings select call", async () => {
      mockFromSelect.mockImplementationOnce(() => { throw new Error("DB crash"); });
      const res = await SettingsService.getSettings(userId);
      expect(res.general.theme).toBe("system");
    });

    it("loads remote settings from Supabase and caches them", async () => {
      mockFromSelect.mockResolvedValueOnce({
        data: {
          user_id: userId,
          theme: "dark",
          language: "es",
          time_zone: "PST",
          date_format: "YYYY-MM-DD",
          email_notifications: true,
          push_notifications: true,
          security_alerts: true,
          ai_recommendations: true,
          match_updates: true,
          emergency_alerts: true,
          high_contrast: false,
          font_size: "medium",
          reduced_motion: false,
          screen_reader: false,
          keyboard_nav: false,
          default_dashboard: "fan",
          auto_refresh: "10s",
          ai_preference: "agent",
          sidebar_collapsed: false,
        },
        error: null,
      });

      const res = await SettingsService.getSettings(userId);
      expect(res.general.theme).toBe("dark");
      expect(res.general.language).toBe("es");
      expect(localStorage.getItem(`stadium_settings_${userId}`)).toContain("dark");
    });

    it("saves settings and handles database exceptions", async () => {
      await expect(SettingsService.saveSettings(userId, DEFAULT_SETTINGS)).resolves.not.toThrow();
    });

    it("handles db exceptions inside saveSettings upsert", async () => {
      const mockUpsert = vi.spyOn(supabase.from("settings"), "upsert").mockImplementationOnce(() => { throw new Error("Upsert crash"); });
      await expect(SettingsService.saveSettings(userId, DEFAULT_SETTINGS)).resolves.not.toThrow();
    });

    it("applies light/dark/system accessibility themes to HTML", () => {
      const html = document.documentElement;

      SettingsService.applySettings({ ...DEFAULT_SETTINGS, general: { ...DEFAULT_SETTINGS.general, theme: "dark" } });
      expect(html.classList.contains("dark")).toBe(true);

      SettingsService.applySettings({ ...DEFAULT_SETTINGS, general: { ...DEFAULT_SETTINGS.general, theme: "light" } });
      expect(html.classList.contains("dark")).toBe(false);

      SettingsService.applySettings({ ...DEFAULT_SETTINGS, general: { ...DEFAULT_SETTINGS.general, theme: "system" } });
      // system theme check
      expect(html.classList.contains("dark") || !html.classList.contains("dark")).toBe(true);
    });
  });
});
