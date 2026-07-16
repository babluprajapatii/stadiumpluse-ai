import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NotificationsService } from "@/services/notifications";

// Mock Supabase client
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
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
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn().mockResolvedValue({ error: null }),
          is: vi.fn().mockResolvedValue({ error: null }),
        })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn().mockResolvedValue({ error: null }),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn().mockResolvedValue({ error: null }),
      })),
    })),
  },
}));

describe("NotificationsService", () => {
  const userId = "test-user-id";

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getNotifications", () => {
    it("retrieves list of notifications and maps database properties correctly", async () => {
      const list = await NotificationsService.getNotifications(userId);
      expect(list).toHaveLength(1);
      expect(list[0].id).toBe("not_1");
      expect(list[0].isRead).toBe(false);
      expect(list[0].priority).toBe("HIGH");
    });
  });

  describe("markAsRead", () => {
    it("successfully sends update trigger to database", async () => {
      await expect(NotificationsService.markAsRead(userId, "not_1")).resolves.not.toThrow();
    });
  });

  describe("deleteNotification", () => {
    it("successfully deletes notification in database", async () => {
      await expect(NotificationsService.deleteNotification(userId, "not_1")).resolves.not.toThrow();
    });
  });
});
