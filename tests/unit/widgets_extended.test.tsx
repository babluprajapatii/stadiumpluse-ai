/**
 * tests/unit/widgets_extended.test.tsx
 *
 * Unit tests for widget and shared components not yet covered:
 *   - components/widgets/EventBanner
 *   - components/widgets/MenuItemCard
 *   - components/widgets/SystemStatusGrid
 *   - components/shared/DarkHeader
 *   - components/shared/BottomNav
 *   - components/shared/MobileHeader
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

import { EventBanner } from "@/components/widgets/EventBanner";
import { MenuItemCard } from "@/components/widgets/MenuItemCard";
import { SystemStatusGrid, SystemItem } from "@/components/widgets/SystemStatusGrid";
import { DarkHeader } from "@/components/shared/DarkHeader";
import { BottomNav } from "@/components/shared/BottomNav";
import { MobileHeader } from "@/components/shared/MobileHeader";

// ── next/navigation mock (already in setup.ts but we need push) ──────────────
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn(), back: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => "/fan",
}));

// ── AuthProvider mock ─────────────────────────────────────────────────────────
vi.mock("@/providers/AuthProvider", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/providers/AuthProvider")>();
  return {
    ...original,
    useAuth: () => ({
      user: { id: "u1", email: "t@t.com", name: "Test", role: "fan" },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      oauthLogin: vi.fn(),
      updateProfile: vi.fn(),
    }),
  };
});

// ── Recharts mock ─────────────────────────────────────────────────────────────
vi.mock("recharts", () => ({
  AreaChart: ({ children }: { children: React.ReactNode }) => <div data-testid="area-chart">{children}</div>,
  Area: () => <div data-testid="area" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
  BarChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Bar: () => <div />,
  LineChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Line: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  Legend: () => <div />,
  PieChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Pie: () => <div />,
  Cell: () => <div />,
  defs: ({ children }: { children: React.ReactNode }) => <defs>{children}</defs>,
  linearGradient: ({ children }: { children: React.ReactNode }) => <linearGradient>{children}</linearGradient>,
  stop: () => <stop />,
}));

// ── LiveBadge mock (used by EventBanner) ─────────────────────────────────────
vi.mock("@/components/ui/live-badge", () => ({
  LiveBadge: () => <span data-testid="live-badge">LIVE</span>,
}));

// ─── EventBanner ─────────────────────────────────────────────────────────────

describe("components/widgets/EventBanner", () => {
  const baseProps = {
    title: "FIFA World Cup 2026",
    location: "AT&T Stadium, Dallas",
    attendance: 47300,
    capacity: 60000,
    chartData: [
      { t: "1", v: 100 },
      { t: "2", v: 200 },
      { t: "3", v: 300 },
    ],
  };

  it("renders event title", () => {
    render(<EventBanner {...baseProps} />);
    expect(screen.getByText("FIFA World Cup 2026")).toBeInTheDocument();
  });

  it("renders location", () => {
    render(<EventBanner {...baseProps} />);
    expect(screen.getByText("AT&T Stadium, Dallas")).toBeInTheDocument();
  });

  it("renders attendance number", () => {
    render(<EventBanner {...baseProps} />);
    // 47300 formatted as locale string
    expect(screen.getByText(/47[,.]?300/)).toBeInTheDocument();
  });

  it("computes and renders attendance percentage", () => {
    render(<EventBanner {...baseProps} />);
    // 47300 / 60000 = 79%
    expect(screen.getByText("79%")).toBeInTheDocument();
  });

  it("renders Ask AI button when onAskAI provided", () => {
    const onAskAI = vi.fn();
    render(<EventBanner {...baseProps} onAskAI={onAskAI} />);
    expect(screen.getByText(/ask ai/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/ask ai/i));
    expect(onAskAI).toHaveBeenCalledOnce();
  });

  it("renders Order Food button when onOrderFood provided", () => {
    const onOrderFood = vi.fn();
    render(<EventBanner {...baseProps} onOrderFood={onOrderFood} />);
    expect(screen.getByText(/order food/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/order food/i));
    expect(onOrderFood).toHaveBeenCalledOnce();
  });

  it("does not render Ask AI or Order Food when callbacks not provided", () => {
    render(<EventBanner {...baseProps} />);
    expect(screen.queryByText(/ask ai/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/order food/i)).not.toBeInTheDocument();
  });

  it("renders LIVE badge", () => {
    render(<EventBanner {...baseProps} />);
    expect(screen.getByTestId("live-badge")).toBeInTheDocument();
  });

  it("renders Recharts AreaChart container", () => {
    render(<EventBanner {...baseProps} />);
    expect(screen.getByTestId("area-chart")).toBeInTheDocument();
  });
});

// ─── MenuItemCard ─────────────────────────────────────────────────────────────

describe("components/widgets/MenuItemCard", () => {
  const baseProps = {
    name: "Championship Burger",
    desc: "Prime beef & fries",
    price: 18.5,
    emoji: "🍔",
    qty: 0,
    onAdd: vi.fn(),
    onRemove: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders item name", () => {
    render(<MenuItemCard {...baseProps} />);
    expect(screen.getByText("Championship Burger")).toBeInTheDocument();
  });

  it("renders item description", () => {
    render(<MenuItemCard {...baseProps} />);
    expect(screen.getByText("Prime beef & fries")).toBeInTheDocument();
  });

  it("renders formatted price", () => {
    render(<MenuItemCard {...baseProps} />);
    expect(screen.getByText("$18.50")).toBeInTheDocument();
  });

  it("renders emoji", () => {
    render(<MenuItemCard {...baseProps} />);
    expect(screen.getByText("🍔")).toBeInTheDocument();
  });

  it("shows only Add button when qty is 0", () => {
    render(<MenuItemCard {...baseProps} qty={0} />);
    expect(screen.queryByRole("button", { name: /remove championship burger/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add championship burger/i })).toBeInTheDocument();
  });

  it("shows both Add and Remove buttons when qty > 0", () => {
    render(<MenuItemCard {...baseProps} qty={2} />);
    expect(screen.getByRole("button", { name: /add championship burger/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /remove championship burger/i })).toBeInTheDocument();
  });

  it("shows qty count when qty > 0", () => {
    render(<MenuItemCard {...baseProps} qty={3} />);
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("calls onAdd when add button clicked (qty=0 state)", () => {
    const onAdd = vi.fn();
    render(<MenuItemCard {...baseProps} qty={0} onAdd={onAdd} />);
    fireEvent.click(screen.getByRole("button", { name: /add championship burger/i }));
    expect(onAdd).toHaveBeenCalledOnce();
  });

  it("calls onAdd when add button clicked (qty>0 state)", () => {
    const onAdd = vi.fn();
    render(<MenuItemCard {...baseProps} qty={1} onAdd={onAdd} />);
    fireEvent.click(screen.getByRole("button", { name: /add championship burger/i }));
    expect(onAdd).toHaveBeenCalledOnce();
  });

  it("calls onRemove when remove button clicked", () => {
    const onRemove = vi.fn();
    render(<MenuItemCard {...baseProps} qty={2} onRemove={onRemove} />);
    fireEvent.click(screen.getByRole("button", { name: /remove championship burger/i }));
    expect(onRemove).toHaveBeenCalledOnce();
  });
});

// ─── SystemStatusGrid ─────────────────────────────────────────────────────────

describe("components/widgets/SystemStatusGrid", () => {
  const MockIcon = () => <span data-testid="mock-icon" />;

  const items: SystemItem[] = [
    { label: "Network", status: "Online", Icon: MockIcon, variant: "success" },
    { label: "AI Engine", status: "Degraded", Icon: MockIcon, variant: "warning" },
    { label: "Database", status: "Critical", Icon: MockIcon, variant: "error" },
    { label: "Auth", status: "Running", Icon: MockIcon, variant: "default" },
  ];

  it("renders all system items", () => {
    render(<SystemStatusGrid items={items} />);
    expect(screen.getByText("Network")).toBeInTheDocument();
    expect(screen.getByText("AI Engine")).toBeInTheDocument();
    expect(screen.getByText("Database")).toBeInTheDocument();
    expect(screen.getByText("Auth")).toBeInTheDocument();
  });

  it("renders status text for each item", () => {
    render(<SystemStatusGrid items={items} />);
    expect(screen.getByText("Online")).toBeInTheDocument();
    expect(screen.getByText("Degraded")).toBeInTheDocument();
    expect(screen.getByText("Critical")).toBeInTheDocument();
    expect(screen.getByText("Running")).toBeInTheDocument();
  });

  it("renders icon for each item", () => {
    render(<SystemStatusGrid items={items} />);
    const icons = screen.getAllByTestId("mock-icon");
    expect(icons).toHaveLength(4);
  });
});

// ─── DarkHeader ───────────────────────────────────────────────────────────────

describe("components/shared/DarkHeader", () => {
  it("renders title as h1", () => {
    render(<DarkHeader title="Security Operations" />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Security Operations");
  });

  it("renders eyebrow when provided", () => {
    render(<DarkHeader title="T" eyebrow="LIVE EVENT" />);
    expect(screen.getByText("LIVE EVENT")).toBeInTheDocument();
  });

  it("does not render eyebrow when not provided", () => {
    render(<DarkHeader title="T" />);
    // No extra text above title
    expect(screen.queryByText("LIVE EVENT")).not.toBeInTheDocument();
  });

  it("renders subtitle when provided", () => {
    render(<DarkHeader title="T" subtitle="Gate 4 - North Stand" />);
    expect(screen.getByText("Gate 4 - North Stand")).toBeInTheDocument();
  });

  it("renders right slot content", () => {
    render(<DarkHeader title="T" right={<button>Settings</button>} />);
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("renders bottom slot content", () => {
    render(<DarkHeader title="T" bottom={<div>Bottom Bar</div>} />);
    expect(screen.getByText("Bottom Bar")).toBeInTheDocument();
  });
});

// ─── BottomNav ────────────────────────────────────────────────────────────────

describe("components/shared/BottomNav", () => {
  const MockIcon = () => <span data-testid="nav-icon" />;
  const items = [
    { label: "Dashboard", Icon: MockIcon },
    { label: "Alerts", Icon: MockIcon },
    { label: "Settings", Icon: MockIcon },
  ];

  it("renders all navigation items", () => {
    render(<BottomNav items={items} />);
    expect(screen.getByRole("button", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Alerts" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Settings" })).toBeInTheDocument();
  });

  it("marks active item with aria-current=page", () => {
    render(<BottomNav items={items} active={1} />);
    const active = screen.getByRole("button", { name: "Alerts" });
    expect(active.getAttribute("aria-current")).toBe("page");
  });

  it("defaults to first item active (active=0)", () => {
    render(<BottomNav items={items} />);
    const first = screen.getByRole("button", { name: "Dashboard" });
    expect(first.getAttribute("aria-current")).toBe("page");
  });

  it("non-active items have no aria-current", () => {
    render(<BottomNav items={items} active={0} />);
    const second = screen.getByRole("button", { name: "Alerts" });
    expect(second.getAttribute("aria-current")).toBeNull();
  });

  it("renders navigation landmark", () => {
    render(<BottomNav items={items} />);
    expect(screen.getByRole("navigation", { name: "Bottom navigation" })).toBeInTheDocument();
  });
});

// ─── MobileHeader ─────────────────────────────────────────────────────────────

describe("components/shared/MobileHeader", () => {
  it("renders title as h1", () => {
    render(<MobileHeader title="Notifications Center" />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Notifications Center");
  });

  it("renders subtitle when provided", () => {
    render(<MobileHeader title="T" subtitle="12 unread" />);
    expect(screen.getByText("12 unread")).toBeInTheDocument();
  });

  it("does not render subtitle when not provided", () => {
    render(<MobileHeader title="T" />);
    expect(screen.queryByText("12 unread")).not.toBeInTheDocument();
  });

  it("renders right slot content", () => {
    render(<MobileHeader title="T" right={<button>Filter</button>} />);
    expect(screen.getByText("Filter")).toBeInTheDocument();
  });
});
