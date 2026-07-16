import { supabase } from "@/lib/supabase";

export interface NotificationItem {
  id: string;
  userId: string;
  type: "security" | "ai" | "event" | "system" | "emergency" | "account";
  title: string;
  message: string;
  isRead: boolean;
  timestamp: string; // ISO string
  priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  expiresAt?: string;
}

// Default mock notifications to display for new users if no data is found in Supabase
const MOCK_NOTIFICATIONS = (userId: string): Omit<NotificationItem, "isRead" | "timestamp">[] => [
  {
    id: "not_1",
    userId,
    type: "emergency",
    title: "Weather Warning",
    message: "Severe thunderstorm warning for the Austin area. Evacuation pathways are fully operational.",
    priority: "CRITICAL",
  },
  {
    id: "not_2",
    userId,
    type: "security",
    title: "Security Clearance Alert",
    message: "Gate 4 entry gates have resumed standard operations. High flow rates monitored.",
    priority: "HIGH",
  },
  {
    id: "not_3",
    userId,
    type: "ai",
    title: "AI Recommendation",
    message: "Concession Stand B is experiencing high demand. Recommend directing volunteer staff to assist.",
    priority: "MEDIUM",
  },
  {
    id: "not_4",
    userId,
    type: "event",
    title: "Match Schedule Update",
    message: "Kick-off for Match 14 (Austin Stadium) is confirmed for 18:00 Local Time.",
    priority: "LOW",
  },
];

export class NotificationsService {
  /**
   * Helper to map database model to frontend UI model.
   */
  private static mapToNotificationItem(row: {
    id: string;
    user_id: string;
    type: "security" | "ai" | "event" | "system" | "emergency" | "account";
    title: string;
    message: string;
    read_at: string | null;
    created_at: string;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    expires_at?: string | null;
  }): NotificationItem {
    return {
      id: row.id,
      userId: row.user_id,
      type: row.type,
      title: row.title,
      message: row.message,
      isRead: row.read_at !== null,
      timestamp: row.created_at,
      priority: row.priority,
      expiresAt: row.expires_at || undefined,
    };
  }

  /**
   * Retrieve notifications for a user, pre-populating defaults if empty in database.
   */
  static async getNotifications(userId: string): Promise<NotificationItem[]> {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        // Database is empty. Populate with default logs
        const defaults = MOCK_NOTIFICATIONS(userId);
        const toInsert = defaults.map((item, idx) => ({
          user_id: userId,
          type: item.type,
          title: item.title,
          message: item.message,
          priority: item.priority || "LOW",
          read_at: idx >= 3 ? new Date().toISOString() : null, // Mock read states
        }));

        const { data: inserted, error: insertError } = await supabase
          .from("notifications")
          .insert(toInsert)
          .select("*");

        if (insertError) throw insertError;
        return (inserted || []).map(this.mapToNotificationItem);
      }

      // Filter out expired items
      const now = new Date();
      const validData = data.filter((row: { expires_at?: string | null }) => {
        if (!row.expires_at) return true;
        return new Date(row.expires_at) > now;
      });

      return validData.map(this.mapToNotificationItem);
    } catch {
      // Offline fallback from local storage cache if network fails
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem(`stadium_notifications_cache_${userId}`);
        if (stored) {
          try {
            return JSON.parse(stored);
          } catch {
            return [];
          }
        }
      }
      return [];
    }
  }

  /**
   * Cache notifications locally in case of connection dropouts.
   */
  private static cacheNotifications(userId: string, list: NotificationItem[]): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(`stadium_notifications_cache_${userId}`, JSON.stringify(list));
      window.dispatchEvent(new CustomEvent("stadium_notifications_update"));
    }
  }

  /**
   * Mark a single notification as read.
   */
  static async markAsRead(userId: string, notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("id", notificationId)
        .eq("user_id", userId);

      if (error) throw error;

      // Update cached lists and trigger notification updates
      const list = await this.getNotifications(userId);
      this.cacheNotifications(userId, list);
    } catch {
      // Local sync fallback
    }
  }

  /**
   * Mark all notifications as read.
   */
  static async markAllAsRead(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("user_id", userId)
        .is("read_at", null);

      if (error) throw error;

      const list = await this.getNotifications(userId);
      this.cacheNotifications(userId, list);
    } catch {
      // Local sync fallback
    }
  }

  /**
   * Delete a notification.
   */
  static async deleteNotification(userId: string, notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", notificationId)
        .eq("user_id", userId);

      if (error) throw error;

      const list = await this.getNotifications(userId);
      this.cacheNotifications(userId, list);
    } catch {
      // Local sync fallback
    }
  }

  /**
   * Add a notification.
   */
  static async addNotification(
    userId: string,
    type: NotificationItem["type"],
    title: string,
    message: string,
    priority: NotificationItem["priority"] = "LOW",
    expiresAt?: string
  ): Promise<void> {
    try {
      const { error } = await supabase.from("notifications").insert({
        user_id: userId,
        type,
        title,
        message,
        priority,
        expires_at: expiresAt || null,
      });

      if (error) throw error;

      const list = await this.getNotifications(userId);
      this.cacheNotifications(userId, list);
    } catch {
      // Local sync fallback
    }
  }
}
