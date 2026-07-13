import { supabase } from "@/lib/supabase";

export interface UserSettings {
  general: {
    theme: "light" | "dark" | "system";
    language: "en" | "hi";
    timeZone: string;
    dateFormat: string;
  };
  notifications: {
    email: boolean;
    push: boolean;
    security: boolean;
    ai: boolean;
    match: boolean;
    emergency: boolean;
  };
  accessibility: {
    highContrast: boolean;
    fontSize: "small" | "medium" | "large";
    reducedMotion: boolean;
    screenReader: boolean;
    keyboardNav: boolean;
  };
  application: {
    defaultDashboard: string;
    autoRefresh: "off" | "5s" | "10s" | "30s";
    aiPreference: string;
    sidebarCollapsed: boolean;
  };
}

export const DEFAULT_SETTINGS: UserSettings = {
  general: {
    theme: "system",
    language: "en",
    timeZone: "UTC",
    dateFormat: "MM/DD/YYYY",
  },
  notifications: {
    email: true,
    push: true,
    security: true,
    ai: true,
    match: true,
    emergency: true,
  },
  accessibility: {
    highContrast: false,
    fontSize: "medium",
    reducedMotion: false,
    screenReader: false,
    keyboardNav: false,
  },
  application: {
    defaultDashboard: "fan",
    autoRefresh: "30s",
    aiPreference: "concierge",
    sidebarCollapsed: false,
  },
};

export class SettingsService {
  /**
   * Helper to fetch local cached settings synchronously.
   */
  static getLocalSettings(userId: string): UserSettings {
    if (typeof window === "undefined") return DEFAULT_SETTINGS;
    const stored = localStorage.getItem(`stadium_settings_${userId}`);
    if (!stored) return DEFAULT_SETTINGS;
    try {
      const parsed = JSON.parse(stored);
      return {
        general: { ...DEFAULT_SETTINGS.general, ...parsed.general },
        notifications: { ...DEFAULT_SETTINGS.notifications, ...parsed.notifications },
        accessibility: { ...DEFAULT_SETTINGS.accessibility, ...parsed.accessibility },
        application: { ...DEFAULT_SETTINGS.application, ...parsed.application },
      };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  /**
   * Get user settings from Supabase, falling back to local cached copy.
   */
  static async getSettings(userId: string): Promise<UserSettings> {
    const cached = this.getLocalSettings(userId);
    if (typeof window === "undefined") return cached;

    try {
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) {
        // If not found, provision it in database using defaults
        if (error.code === "PGRST116") {
          await this.saveSettings(userId, cached);
        }
        return cached;
      }

      if (data) {
        const remoteSettings: UserSettings = {
          general: {
            theme: data.theme,
            language: data.language,
            timeZone: data.time_zone,
            dateFormat: data.date_format,
          },
          notifications: {
            email: data.email_notifications,
            push: data.push_notifications,
            security: data.security_alerts,
            ai: data.ai_recommendations,
            match: data.match_updates,
            emergency: data.emergency_alerts,
          },
          accessibility: {
            highContrast: data.high_contrast,
            fontSize: data.font_size,
            reducedMotion: data.reduced_motion,
            screenReader: data.screen_reader,
            keyboardNav: data.keyboard_nav,
          },
          application: {
            defaultDashboard: data.default_dashboard,
            autoRefresh: data.auto_refresh,
            aiPreference: data.ai_preference,
            sidebarCollapsed: data.sidebar_collapsed,
          },
        };

        // Cache locally
        localStorage.setItem(`stadium_settings_${userId}`, JSON.stringify(remoteSettings));
        return remoteSettings;
      }
    } catch {
      // Ignore errors and return cached fallback
    }

    return cached;
  }

  /**
   * Save user settings to Supabase and cache locally.
   */
  static async saveSettings(userId: string, settings: UserSettings): Promise<void> {
    if (typeof window !== "undefined") {
      localStorage.setItem(`stadium_settings_${userId}`, JSON.stringify(settings));
      this.applySettings(settings);
    }

    try {
      await supabase.from("settings").upsert({
        user_id: userId,
        theme: settings.general.theme,
        language: settings.general.language,
        time_zone: settings.general.timeZone,
        date_format: settings.general.dateFormat,
        email_notifications: settings.notifications.email,
        push_notifications: settings.notifications.push,
        security_alerts: settings.notifications.security,
        ai_recommendations: settings.notifications.ai,
        match_updates: settings.notifications.match,
        emergency_alerts: settings.notifications.emergency,
        high_contrast: settings.accessibility.highContrast,
        font_size: settings.accessibility.fontSize,
        reduced_motion: settings.accessibility.reducedMotion,
        screen_reader: settings.accessibility.screenReader,
        keyboard_nav: settings.accessibility.keyboardNav,
        default_dashboard: settings.application.defaultDashboard,
        auto_refresh: settings.application.autoRefresh,
        ai_preference: settings.application.aiPreference,
        sidebar_collapsed: settings.application.sidebarCollapsed,
      });
    } catch {
      // Ignore failures, rely on offline cache
    }
  }

  /**
   * Apply settings (theme, accessibility classes) to the DOM.
   */
  static applySettings(settings: UserSettings): void {
    if (typeof window === "undefined") return;
    const html = document.documentElement;

    // Apply High Contrast
    if (settings.accessibility.highContrast) {
      html.classList.add("high-contrast");
    } else {
      html.classList.remove("high-contrast");
    }

    // Apply Reduced Motion
    if (settings.accessibility.reducedMotion) {
      html.classList.add("reduced-motion");
    } else {
      html.classList.remove("reduced-motion");
    }

    // Apply Font Size classes
    html.classList.remove("text-scale-small", "text-scale-medium", "text-scale-large");
    html.classList.add(`text-scale-${settings.accessibility.fontSize}`);
  }
}
