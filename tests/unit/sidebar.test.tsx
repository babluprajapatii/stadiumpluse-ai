import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { Sidebar } from "@/components/layout/Sidebar";
import { AuthProvider, User } from "@/providers/AuthProvider";
import { AppProvider } from "@/providers/AppContext";
import { ThemeProvider } from "@/providers/ThemeProvider";

// Mock useAuth context values
let mockUser: User | null = null;
vi.mock("@/providers/AuthProvider", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/providers/AuthProvider")>();
  return {
    ...original,
    useAuth: () => ({
      user: mockUser,
      logout: vi.fn(),
      isAuthenticated: !!mockUser,
      isLoading: false,
    }),
  };
});

describe("Sidebar Component", () => {
  beforeEach(() => {
    mockUser = null;
  });

  it("renders empty navigation list when user is logged out", () => {
    render(
      <ThemeProvider>
        <AppProvider>
          <Sidebar sidebarOpen={true} onClose={vi.fn()} />
        </AppProvider>
      </ThemeProvider>
    );

    // Expect brand name to be rendered
    expect(screen.getByText("StadiumPulse")).toBeInTheDocument();
    
    // Links should be empty since getMenuItems returns [] for logged-out
    expect(screen.queryByText("Profile")).not.toBeInTheDocument();
    expect(screen.queryByText("Settings")).not.toBeInTheDocument();
  });

  it("renders fan navigation links when user is fan", () => {
    mockUser = {
      id: "1",
      email: "fan@stadium.com",
      name: "Alex",
      role: "fan",
    };

    render(
      <ThemeProvider>
        <AppProvider>
          <Sidebar sidebarOpen={true} onClose={vi.fn()} />
        </AppProvider>
      </ThemeProvider>
    );

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Order Food")).toBeInTheDocument();
    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.queryByText("Operations")).not.toBeInTheDocument();
  });

  it("renders security dashboard links when user is security", () => {
    mockUser = {
      id: "2",
      email: "security@stadium.com",
      name: "Officer",
      role: "security",
    };

    render(
      <ThemeProvider>
        <AppProvider>
          <Sidebar sidebarOpen={true} onClose={vi.fn()} />
        </AppProvider>
      </ThemeProvider>
    );

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Incidents")).toBeInTheDocument();
    expect(screen.getByText("AI Command Center")).toBeInTheDocument();
    expect(screen.queryByText("Order Food")).not.toBeInTheDocument();
  });
});
