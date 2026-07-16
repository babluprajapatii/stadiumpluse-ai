import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LoginPage } from "@/components/pages/LoginPage";
import { RegisterPage } from "@/components/pages/RegisterPage";
import { Sidebar } from "@/components/layout/Sidebar";
import { FanDashboard } from "@/components/pages/FanDashboard";
import { SecurityDashboard } from "@/components/pages/SecurityDashboard";
import { AppProvider } from "@/providers/AppContext";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { User } from "@/providers/AuthProvider";
import { AuthService } from "@/services/auth";

// --- Mocks ---
const mockNavigate = vi.fn();
const mockLogin = vi.fn();
let mockUser: User | null = null;

// Mock Auth Context
vi.mock("@/providers/AuthProvider", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/providers/AuthProvider")>();
  return {
    ...original,
    useAuth: () => ({
      login: mockLogin,
      user: mockUser,
      logout: vi.fn(),
      isAuthenticated: !!mockUser,
      isLoading: false,
    }),
  };
});

// Mock AuthService
vi.mock("@/services/auth", () => ({
  AuthService: {
    register: vi.fn(),
    generateVerificationToken: vi.fn(),
  },
}));

// Mock Recharts and stadium map
vi.mock("@/components/widgets/AttendanceChartWrapper", () => ({
  AttendanceChart: () => <div data-testid="mock-attendance-chart" />,
}));

vi.mock("@/components/widgets/AIChartsWrapper", () => ({
  CrowdFlowChart: () => <div data-testid="mock-crowd-flow-chart" />,
  GateDonut: () => <div data-testid="mock-gate-donut" />,
}));

vi.mock("@/components/widgets/RevenueChart", () => ({
  RevenueChart: () => <div data-testid="mock-revenue-chart" />,
}));

vi.mock("@/components/widgets/EventBanner", () => ({
  EventBanner: () => <div data-testid="mock-event-banner" />,
}));

vi.mock("@/components/stadium-map", () => ({
  StadiumMap: () => <div data-testid="mock-stadium-map" />,
}));

// --- Tests ---
describe("Page Components Integration Tests", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockLogin.mockClear();
    vi.clearAllMocks();
    mockUser = null;
  });

  // 1. LoginPage
  describe("LoginPage", () => {
    it("renders and submits login credentials", async () => {
      render(<LoginPage navigate={mockNavigate} />);

      expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Sign In/i })).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: /Sign In/i }));
      expect(await screen.findByText(/Please enter both your email address and password/i)).toBeInTheDocument();
    });
  });

  // 2. RegisterPage
  describe("RegisterPage", () => {
    it("renders and triggers password strength validations", async () => {
      render(<RegisterPage navigate={mockNavigate} />);

      expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
      
      fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: "John Doe" } });
      fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: "john@stadium.com" } });
      fireEvent.change(screen.getByLabelText("Password"), { target: { value: "weak" } });
      fireEvent.change(screen.getByLabelText("Confirm Password"), { target: { value: "weak" } });
      fireEvent.click(screen.getByRole("checkbox"));
      fireEvent.click(screen.getByRole("button", { name: /Create Account/i }));

      expect(await screen.findByText(/Password must be at least 8 characters/i)).toBeInTheDocument();
    });
  });

  // 3. Sidebar
  describe("Sidebar", () => {
    it("shows role-specific links for fan", () => {
      mockUser = { id: "1", email: "fan@stadium.com", name: "Alex", role: "fan" };

      render(
        <ThemeProvider>
          <AppProvider>
            <Sidebar sidebarOpen={true} onClose={vi.fn()} />
          </AppProvider>
        </ThemeProvider>
      );

      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Order Food")).toBeInTheDocument();
    });
  });

  // 4. Dashboards
  describe("Dashboards", () => {
    it("renders Fan and Security dashboards successfully", () => {
      render(
        <AppProvider>
          <FanDashboard />
        </AppProvider>
      );
      expect(screen.getByText("Jamie O.")).toBeInTheDocument();
      expect(screen.getByTestId("mock-attendance-chart")).toBeInTheDocument();

      render(
        <AppProvider>
          <SecurityDashboard />
        </AppProvider>
      );
      expect(screen.getByText(/Security Operations/i)).toBeInTheDocument();
      expect(screen.getByTestId("mock-stadium-map")).toBeInTheDocument();
    });
  });
});
