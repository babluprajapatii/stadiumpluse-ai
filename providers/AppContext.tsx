"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthProvider";
import { SettingsService, DEFAULT_SETTINGS } from "@/services/settings";

interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  voiceNav: boolean;
  screenReader: boolean;
  signLanguage: boolean;
}

interface AppContextType {
  emergency: boolean;
  setEmergency: (val: boolean) => void;
  accessibilitySettings: AccessibilitySettings;
  setAccessibilitySettings: React.Dispatch<React.SetStateAction<AccessibilitySettings>>;
}

/** Safe defaults that match the server-rendered HTML. */
const DEFAULT_ACCESSIBILITY: AccessibilitySettings = {
  highContrast: false,
  largeText: false,
  reducedMotion: false,
  voiceNav: false,
  screenReader: false,
  signLanguage: false,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [emergency, setEmergency] = useState(false);
  const { user } = useAuth();

  /**
   * HYDRATION FIX: Start with safe defaults that match the server output.
   * The real values are loaded from localStorage/Supabase inside useEffect
   * (client-side only, after hydration is complete).
   */
  const [accessibilitySettings, setAccessibilitySettings] = useState<AccessibilitySettings>(
    DEFAULT_ACCESSIBILITY
  );

  useEffect(() => {
    if (user) {
      // 1. Load cached settings immediately (synchronous, no round-trip)
      const initial = SettingsService.getLocalSettings(user.id);
      // Apply CSS classes to <html> — SettingsService handles this safely
      SettingsService.applySettings(initial);

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAccessibilitySettings((prev) => ({
        ...prev,
        highContrast: initial.accessibility.highContrast,
        reducedMotion: initial.accessibility.reducedMotion,
        screenReader: initial.accessibility.screenReader,
        largeText: initial.accessibility.fontSize === "large",
      }));

      // 2. Asynchronously fetch latest from database and apply
      SettingsService.getSettings(user.id)
        .then((settings) => {
          SettingsService.applySettings(settings);
          setAccessibilitySettings((prev) => ({
            ...prev,
            highContrast: settings.accessibility.highContrast,
            reducedMotion: settings.accessibility.reducedMotion,
            screenReader: settings.accessibility.screenReader,
            largeText: settings.accessibility.fontSize === "large",
          }));
        })
        .catch(() => {
          // Ignore background fetch failures
        });
    } else {
      // Reset to defaults when logged out
      SettingsService.applySettings(DEFAULT_SETTINGS);
      setAccessibilitySettings(DEFAULT_ACCESSIBILITY);
    }
  }, [user]);

  return (
    <AppContext.Provider
      value={{
        emergency,
        setEmergency,
        accessibilitySettings,
        setAccessibilitySettings,
      }}
    >
      {/*
        HYDRATION FIX: Removed the <div className={accessibilitySettings.highContrast ? "high-contrast" : ""}> wrapper.
        It caused a hydration mismatch because:
          - Server renders: <div class="">
          - Client may read highContrast=true from localStorage before render
        The "high-contrast" class is correctly applied to <html> by
        SettingsService.applySettings() in the useEffect above.
      */}
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
