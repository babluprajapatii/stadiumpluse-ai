import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { FanDashboard } from "@/components/pages/FanDashboard";
import { SecurityDashboard } from "@/components/pages/SecurityDashboard";
import { AppProvider } from "@/providers/AppContext";

// Mock Recharts charts inside widgets to prevent canvas context issues & heap limits
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

// Mock StadiumMap to bypass SVG path processing heap exhaustion
vi.mock("@/components/stadium-map", () => ({
  StadiumMap: () => <div data-testid="mock-stadium-map" />,
}));

// Mock Auth context
vi.mock("@/providers/AuthProvider", () => ({
  useAuth: () => ({
    user: { id: "1", name: "Alex", role: "fan" },
  }),
}));

describe("Dashboard Components", () => {
  describe("FanDashboard", () => {
    it("renders fan portal details correctly", () => {
      render(
        <AppProvider>
          <FanDashboard />
        </AppProvider>
      );

      expect(screen.getByText("Jamie O.")).toBeInTheDocument();
      expect(screen.getByText("Active Tickets")).toBeInTheDocument();
      expect(screen.getByTestId("mock-attendance-chart")).toBeInTheDocument();
    });
  });

  describe("SecurityDashboard", () => {
    it("renders security operations logs correctly", () => {
      render(
        <AppProvider>
          <SecurityDashboard />
        </AppProvider>
      );

      expect(screen.getByText("Security Operations")).toBeInTheDocument();
      expect(screen.getByText("Gate Utilisation")).toBeInTheDocument();
      expect(screen.getByTestId("mock-crowd-flow-chart")).toBeInTheDocument();
      expect(screen.getByTestId("mock-gate-donut")).toBeInTheDocument();
      expect(screen.getByTestId("mock-stadium-map")).toBeInTheDocument();
    });
  });
});
