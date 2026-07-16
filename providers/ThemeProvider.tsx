"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: string) => void;
  themes: string[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = "theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  const applyTheme = useCallback((currentTheme: Theme) => {
    if (typeof window === "undefined") return;
    const html = document.documentElement;
    const sysTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const resolved = currentTheme === "system" ? sysTheme : currentTheme;

    setResolvedTheme(resolved);

    if (resolved === "dark") {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  }, []);

  // Update theme and persist
  const setTheme = useCallback((newTheme: string) => {
    const validTheme = (newTheme === "dark" || newTheme === "light" || newTheme === "system" ? newTheme : "system") as Theme;
    setThemeState(validTheme);
    try {
      localStorage.setItem(STORAGE_KEY, validTheme);
    } catch {
      // Storage unavailable
    }
    applyTheme(validTheme);
  }, [applyTheme]);

  // Initial load
  useEffect(() => {
    let savedTheme: Theme = "system";
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "dark" || stored === "light" || stored === "system") {
        savedTheme = stored;
      }
    } catch {
      // Storage unavailable
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setThemeState(savedTheme);
    applyTheme(savedTheme);

    // Watch system changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      // If active theme is system, re-apply
      setThemeState((prev) => {
        if (prev === "system") {
          applyTheme("system");
        }
        return prev;
      });
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [applyTheme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
        setTheme,
        themes: ["light", "dark", "system"],
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
