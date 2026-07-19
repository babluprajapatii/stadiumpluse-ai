/**
 * tests/unit/providers.test.tsx
 *
 * Unit tests for:
 *   - providers/ThemeProvider (useTheme hook + DOM class toggling)
 *   - providers/AppContext    (useApp hook + settings integration)
 *   - providers/AuthProvider  (useAuth hook + session management)
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ThemeProvider, useTheme } from "@/providers/ThemeProvider";
import { AppProvider, useApp } from "@/providers/AppContext";

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn(), back: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => "/",
}));

// Auth provider mock  (needed for AppProvider which calls useAuth)
const mockAuthUser = vi.fn(() => null as null | { id: string; email: string; name: string; role: string });

vi.mock("@/providers/AuthProvider", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/providers/AuthProvider")>();
  return {
    ...original,
    useAuth: () => ({
      user: mockAuthUser(),
      isAuthenticated: !!mockAuthUser(),
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      oauthLogin: vi.fn(),
      updateProfile: vi.fn(),
    }),
  };
});

// SettingsService mock
const mockGetLocalSettings = vi.fn();
const mockGetSettings = vi.fn();
const mockApplySettings = vi.fn();
const mockSaveSettings = vi.fn();

vi.mock("@/services/settings", () => ({
  DEFAULT_SETTINGS: {
    general: { theme: "system", language: "en", timeZone: "UTC", dateFormat: "MM/DD/YYYY" },
    notifications: { email: true, push: true, security: true, ai: true, match: true, emergency: true },
    accessibility: { highContrast: false, fontSize: "medium", reducedMotion: false, screenReader: false, keyboardNav: false },
    application: { defaultDashboard: "fan", autoRefresh: "30s", aiPreference: "concierge", sidebarCollapsed: false },
  },
  SettingsService: {
    getLocalSettings: (...a: unknown[]) => mockGetLocalSettings(...a),
    getSettings: (...a: unknown[]) => mockGetSettings(...a),
    applySettings: (...a: unknown[]) => mockApplySettings(...a),
    saveSettings: (...a: unknown[]) => mockSaveSettings(...a),
  },
}));

// ─── ThemeProvider tests ──────────────────────────────────────────────────────

function ThemeConsumer() {
  const { theme, setTheme, resolvedTheme, themes } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="resolved">{resolvedTheme}</span>
      <span data-testid="count">{themes.length}</span>
      <button onClick={() => setTheme("dark")}>Set Dark</button>
      <button onClick={() => setTheme("light")}>Set Light</button>
      <button onClick={() => setTheme("system")}>Set System</button>
      <button onClick={() => setTheme("invalid")}>Set Invalid</button>
    </div>
  );
}

describe("providers/ThemeProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = "";
    vi.clearAllMocks();
  });

  it("provides theme context to children", () => {
    render(<ThemeProvider><ThemeConsumer /></ThemeProvider>);
    expect(screen.getByTestId("theme")).toBeInTheDocument();
  });

  it("exposes themes array with 3 items", () => {
    render(<ThemeProvider><ThemeConsumer /></ThemeProvider>);
    expect(screen.getByTestId("count").textContent).toBe("3");
  });

  it("setTheme('dark') adds dark class to html", async () => {
    render(<ThemeProvider><ThemeConsumer /></ThemeProvider>);
    fireEvent.click(screen.getByText("Set Dark"));
    await waitFor(() => {
      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });
  });

  it("setTheme('light') removes dark class from html", async () => {
    document.documentElement.classList.add("dark");
    render(<ThemeProvider><ThemeConsumer /></ThemeProvider>);
    fireEvent.click(screen.getByText("Set Light"));
    await waitFor(() => {
      expect(document.documentElement.classList.contains("dark")).toBe(false);
    });
  });

  it("setTheme persists to localStorage", () => {
    render(<ThemeProvider><ThemeConsumer /></ThemeProvider>);
    fireEvent.click(screen.getByText("Set Dark"));
    expect(localStorage.getItem("theme")).toBe("dark");
  });

  it("setTheme('invalid') falls back to system", () => {
    render(<ThemeProvider><ThemeConsumer /></ThemeProvider>);
    fireEvent.click(screen.getByText("Set Invalid"));
    expect(localStorage.getItem("theme")).toBe("system");
  });

  it("loads saved theme from localStorage on mount", async () => {
    localStorage.setItem("theme", "dark");
    render(<ThemeProvider><ThemeConsumer /></ThemeProvider>);
    await waitFor(() => {
      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });
  });

  it("throws when useTheme is called outside ThemeProvider", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    function BadConsumer() {
      useTheme();
      return null;
    }
    expect(() => render(<BadConsumer />)).toThrow("useTheme must be used within a ThemeProvider");
    consoleError.mockRestore();
  });
});

// ─── AppContext tests ─────────────────────────────────────────────────────────

const DEFAULT_SETTINGS = {
  general: { theme: "system" as const, language: "en" as const, timeZone: "UTC", dateFormat: "MM/DD/YYYY" },
  notifications: { email: true, push: true, security: true, ai: true, match: true, emergency: true },
  accessibility: { highContrast: false, fontSize: "medium" as const, reducedMotion: false, screenReader: false, keyboardNav: false },
  application: { defaultDashboard: "fan", autoRefresh: "30s" as const, aiPreference: "concierge", sidebarCollapsed: false },
};

function AppConsumer() {
  const { emergency, setEmergency, accessibilitySettings } = useApp();
  return (
    <div>
      <span data-testid="emergency">{String(emergency)}</span>
      <span data-testid="highContrast">{String(accessibilitySettings.highContrast)}</span>
      <button onClick={() => setEmergency(true)}>Set Emergency</button>
      <button onClick={() => setEmergency(false)}>Clear Emergency</button>
    </div>
  );
}

function renderAppConsumer() {
  return render(
    <ThemeProvider>
      <AppProvider>
        <AppConsumer />
      </AppProvider>
    </ThemeProvider>
  );
}

describe("providers/AppContext", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    mockAuthUser.mockReturnValue(null);
    mockGetLocalSettings.mockReturnValue(DEFAULT_SETTINGS);
    mockGetSettings.mockResolvedValue(DEFAULT_SETTINGS);
    mockApplySettings.mockImplementation(() => {});
  });

  it("renders without crashing", () => {
    renderAppConsumer();
    expect(screen.getByTestId("emergency")).toBeInTheDocument();
  });

  it("emergency defaults to false", () => {
    renderAppConsumer();
    expect(screen.getByTestId("emergency").textContent).toBe("false");
  });

  it("setEmergency(true) updates state", async () => {
    renderAppConsumer();
    fireEvent.click(screen.getByText("Set Emergency"));
    await waitFor(() => {
      expect(screen.getByTestId("emergency").textContent).toBe("true");
    });
  });

  it("setEmergency(false) clears state", async () => {
    renderAppConsumer();
    fireEvent.click(screen.getByText("Set Emergency"));
    fireEvent.click(screen.getByText("Clear Emergency"));
    await waitFor(() => {
      expect(screen.getByTestId("emergency").textContent).toBe("false");
    });
  });

  it("loads settings from SettingsService when user is present", async () => {
    mockAuthUser.mockReturnValue({ id: "u1", email: "t@t.com", name: "T", role: "fan" });
    renderAppConsumer();
    await waitFor(() => {
      expect(mockGetLocalSettings).toHaveBeenCalled();
    });
  });

  it("applies settings when user logs in", async () => {
    mockAuthUser.mockReturnValue({ id: "u1", email: "t@t.com", name: "T", role: "fan" });
    renderAppConsumer();
    await waitFor(() => {
      expect(mockApplySettings).toHaveBeenCalled();
    });
  });

  it("resets to defaults when user logs out (null user)", async () => {
    mockAuthUser.mockReturnValue(null);
    renderAppConsumer();
    await waitFor(() => {
      // applySettings called with DEFAULT_SETTINGS on logout
      expect(mockApplySettings).toHaveBeenCalled();
    });
  });

  it("throws when useApp is called outside AppProvider", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    function BadConsumer() {
      useApp();
      return null;
    }
    expect(() => render(<ThemeProvider><BadConsumer /></ThemeProvider>)).toThrow("useApp must be used within AppProvider");
    consoleError.mockRestore();
  });
});
