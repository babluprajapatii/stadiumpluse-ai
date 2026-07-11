"use client";

import React, { createContext, useContext, useState } from "react";

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
  const [accessibilitySettings, setAccessibilitySettings] = useState<AccessibilitySettings>({
    highContrast: false,
    largeText: true,
    reducedMotion: false,
    voiceNav: false,
    screenReader: true,
    signLanguage: false,
  });

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
