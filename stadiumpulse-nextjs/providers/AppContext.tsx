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

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [emergency, setEmergency] = useState(false);
  const { user } = useAuth();

  const [accessibilitySettings, setAccessibilitySettings] = useState<AccessibilitySettings>({
    highContrast: false,
    largeText: true,
    reducedMotion: false,
    voiceNav: false,
    screenReader: true,
    signLanguage: false,
  });

  useEffect(() => {
    if (user) {
      // 1. Synchronously load local storage cached settings to avoid layouts shift
      const initial = SettingsService.getLocalSettings(user.id);
      SettingsService.applySettings(initial);
      
      // Keep legacy accessibilitySettings object partially in sync
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAccessibilitySettings((prev) => ({
        ...prev,
        highContrast: initial.accessibility.highContrast,
        reducedMotion: initial.accessibility.reducedMotion,
        screenReader: initial.accessibility.screenReader,
        largeText: initial.accessibility.fontSize === "large",
      }));

      // 2. Asynchronously fetch latest from database and apply
      SettingsService.getSettings(user.id).then((settings) => {
        SettingsService.applySettings(settings);
        setAccessibilitySettings((prev) => ({
          ...prev,
          highContrast: settings.accessibility.highContrast,
          reducedMotion: settings.accessibility.reducedMotion,
          screenReader: settings.accessibility.screenReader,
          largeText: settings.accessibility.fontSize === "large",
        }));
      }).catch(() => {
        // Ignore background fetch failures
      });
    } else {
      SettingsService.applySettings(DEFAULT_SETTINGS);
      setAccessibilitySettings({
        highContrast: false,
        largeText: true,
        reducedMotion: false,
        voiceNav: false,
        screenReader: true,
        signLanguage: false,
      });
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
      <div className={accessibilitySettings.highContrast ? "high-contrast" : ""}>
        {children}
      </div>
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
