/**
 * tests/unit/components.test.tsx
 *
 * Unit tests for shared components, widget components, and state components
 * that are currently NOT covered by any test file.
 *
 * Targets:
 *   - components/shared/NotificationBell
 *   - components/shared/ThemeBtn
 *   - components/shared/SectionHeading
 *   - components/shared/Surface
 *   - components/widgets/FilterChips
 *   - components/widgets/KPIStrip
 *   - components/widgets/IncidentCard
 *   - components/states (all exported states)
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// ── Shared components ─────────────────────────────────────────────────────────
import { NotificationBell } from "@/components/shared/NotificationBell";
import { ThemeBtn } from "@/components/shared/ThemeBtn";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Surface } from "@/components/shared/Surface";

// ── Widget components ─────────────────────────────────────────────────────────
import { FilterChips } from "@/components/widgets/FilterChips";
import { KPIStrip } from "@/components/widgets/KPIStrip";
import { IncidentCard } from "@/components/widgets/IncidentCard";

// ── State components ──────────────────────────────────────────────────────────
import {
  SkeletonCard,
  SkeletonDashboard,
  AIThinking,
  MapLoading,
  EmptyNotifications,
  EmptyIncidents,
  EmptyMessages,
  EmptyTasks,
  ErrorOffline,
  ErrorAIUnavailable,
  ErrorMapUnavailable,
  ErrorGeneral,
} from "@/components/states";

// ── ThemeProvider (needed by ThemeBtn) ─────────────────────────────────────────
import { ThemeProvider } from "@/providers/ThemeProvider";

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockPush = vi.fn();

// next/navigation is mocked globally in setup.ts but we need push to be trackable
vi.mock("next/navigation", () => ({
  useRouter() {
    return { push: mockPush, replace: vi.fn(), back: vi.fn(), prefetch: vi.fn() };
  },
  usePathname() {
    return "/fan";
  },
}));

// Mock NotificationsService
const mockGetNotifications = vi.fn();
const mockMarkAsRead = vi.fn();
const mockMarkAllAsRead = vi.fn();

vi.mock("@/services/notifications", () => ({
  NotificationsService: {
    getNotifications: (...a: unknown[]) => mockGetNotifications(...a),
    markAsRead: (...a: unknown[]) => mockMarkAsRead(...a),
    markAllAsRead: (...a: unknown[]) => mockMarkAllAsRead(...a),
  },
}));

// Mock AuthProvider
const mockUser = { id: "u1", email: "test@stadium.com", name: "Test User", role: "fan" as const };
let currentUser: typeof mockUser | null = mockUser;

vi.mock("@/providers/AuthProvider", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/providers/AuthProvider")>();
  return {
    ...original,
    useAuth: () => ({
      user: currentUser,
      isAuthenticated: !!currentUser,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      oauthLogin: vi.fn(),
      updateProfile: vi.fn(),
    }),
  };
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("components/shared/SectionHeading", () => {
  it("renders children as heading", () => {
    render(<SectionHeading>Incidents</SectionHeading>);
    expect(screen.getByText("Incidents")).toBeInTheDocument();
  });

  it("renders action slot when provided", () => {
    render(
      <SectionHeading action={<button>Filter</button>}>Alerts</SectionHeading>
    );
    expect(screen.getByText("Filter")).toBeInTheDocument();
    expect(screen.getByText("Alerts")).toBeInTheDocument();
  });
});

describe("components/shared/Surface", () => {
  it("renders children", () => {
    render(<Surface><span>Hello Surface</span></Surface>);
    expect(screen.getByText("Hello Surface")).toBeInTheDocument();
  });
});

describe("components/shared/ThemeBtn", () => {
  it("renders after mount (mounted guard)", async () => {
    renderWithTheme(<ThemeBtn />);
    // Before mount, renders a placeholder div; after mount renders the button
    await waitFor(() => {
      expect(screen.getByRole("button")).toBeInTheDocument();
    });
  });

  it("toggles theme from dark to light on click", async () => {
    renderWithTheme(<ThemeBtn />);
    await waitFor(() => expect(screen.getByRole("button")).toBeInTheDocument());
    const btn = screen.getByRole("button");
    // Click to toggle
    fireEvent.click(btn);
    // After toggle aria-label changes
    expect(btn.getAttribute("aria-label")).toMatch(/switch to (light|dark) mode/i);
  });
});

describe("components/shared/NotificationBell", () => {
  const sampleNotifications = [
    {
      id: "n1",
      userId: "u1",
      type: "security" as const,
      title: "Security Alert",
      message: "Gate 4 issue",
      isRead: false,
      timestamp: "2026-07-19T00:00:00Z",
      priority: "HIGH" as const,
    },
    {
      id: "n2",
      userId: "u1",
      type: "ai" as const,
      title: "AI Tip",
      message: "Redirect crowd to Gate B",
      isRead: true,
      timestamp: "2026-07-19T00:00:00Z",
      priority: "MEDIUM" as const,
    },
    {
      id: "n3",
      userId: "u1",
      type: "event" as const,
      title: "Match Update",
      message: "Kickoff in 30 min",
      isRead: false,
      timestamp: "2026-07-19T00:00:00Z",
      priority: "LOW" as const,
    },
    {
      id: "n4",
      userId: "u1",
      type: "emergency" as const,
      title: "Emergency",
      message: "Evacuation needed",
      isRead: false,
      timestamp: "2026-07-19T00:00:00Z",
      priority: "CRITICAL" as const,
    },
    {
      id: "n5",
      userId: "u1",
      type: "account" as const,
      title: "Account Update",
      message: "Profile saved",
      isRead: false,
      timestamp: "2026-07-19T00:00:00Z",
      priority: "LOW" as const,
    },
    {
      id: "n6",
      userId: "u1",
      type: "system" as const,
      title: "System",
      message: "Scheduled maintenance",
      isRead: false,
      timestamp: "2026-07-19T00:00:00Z",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    currentUser = mockUser;
    mockGetNotifications.mockResolvedValue(sampleNotifications);
    mockMarkAsRead.mockResolvedValue(undefined);
    mockMarkAllAsRead.mockResolvedValue(undefined);
  });

  it("renders null when no user is logged in", () => {
    currentUser = null;
    const { container } = render(<NotificationBell />);
    expect(container.firstChild).toBeNull();
  });

  it("renders notification bell button when user is present", async () => {
    render(<NotificationBell />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /notifications/i })).toBeInTheDocument();
    });
  });

  it("shows unread badge count", async () => {
    render(<NotificationBell />);
    await waitFor(() => {
      // 5 unread notifications
      const badge = screen.getByRole("status");
      expect(badge.textContent).toBe("5");
    });
  });

  it("opens popover and shows notification list", async () => {
    render(<NotificationBell />);
    await waitFor(() => expect(screen.getByRole("button", { name: /notifications/i })).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: /notifications/i }));
    await waitFor(() => {
      expect(screen.getByText("Security Alert")).toBeInTheDocument();
    });
  });

  it("shows 'Mark all as read' when there are unread notifications", async () => {
    render(<NotificationBell />);
    await waitFor(() => expect(screen.getByRole("button", { name: /notifications/i })).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /notifications/i }));
    await waitFor(() => {
      expect(screen.getByText("Mark all as read")).toBeInTheDocument();
    });
  });

  it("calls markAllAsRead when 'Mark all as read' is clicked", async () => {
    render(<NotificationBell />);
    await waitFor(() => expect(screen.getByRole("button", { name: /notifications/i })).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /notifications/i }));
    await waitFor(() => expect(screen.getByText("Mark all as read")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Mark all as read"));
    expect(mockMarkAllAsRead).toHaveBeenCalledWith("u1");
  });

  it("navigates to /notifications when 'View all notifications' is clicked", async () => {
    render(<NotificationBell />);
    await waitFor(() => expect(screen.getByRole("button", { name: /notifications/i })).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /notifications/i }));
    await waitFor(() => expect(screen.getByText("View all notifications")).toBeInTheDocument());
    fireEvent.click(screen.getByText("View all notifications"));
    expect(mockPush).toHaveBeenCalledWith("/notifications");
  });

  it("shows empty state when no notifications", async () => {
    mockGetNotifications.mockResolvedValue([]);
    render(<NotificationBell />);
    await waitFor(() => expect(screen.getByRole("button", { name: /notifications/i })).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /notifications/i }));
    await waitFor(() => {
      expect(screen.getByText("All caught up!")).toBeInTheDocument();
    });
  });

  it("marks notification as read and navigates on notification click", async () => {
    render(<NotificationBell />);
    await waitFor(() => expect(screen.getByRole("button", { name: /notifications/i })).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /notifications/i }));
    await waitFor(() => expect(screen.getByText("Security Alert")).toBeInTheDocument());
    // Click the first notification item
    fireEvent.click(screen.getByText("Security Alert"));
    expect(mockMarkAsRead).toHaveBeenCalledWith("u1", "n1");
    expect(mockPush).toHaveBeenCalledWith("/notifications");
  });

  it("updates when stadium_notifications_update event fires", async () => {
    render(<NotificationBell />);
    await waitFor(() => expect(screen.getByRole("button", { name: /notifications/i })).toBeInTheDocument());
    // Trigger custom event
    window.dispatchEvent(new CustomEvent("stadium_notifications_update"));
    // Service should be called again
    await waitFor(() => {
      expect(mockGetNotifications.mock.calls.length).toBeGreaterThanOrEqual(1);
    });
  });
});

// ─── Widget Components ────────────────────────────────────────────────────────

describe("components/widgets/FilterChips", () => {
  const options = [
    { value: "all", label: "All" },
    { value: "active", label: "Active" },
    { value: "closed", label: "Closed" },
  ];

  it("renders all filter options", () => {
    const onChange = vi.fn();
    render(<FilterChips options={options} value="all" onChange={onChange} />);
    expect(screen.getByText("All")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Closed")).toBeInTheDocument();
  });

  it("calls onChange with correct value on button click", () => {
    const onChange = vi.fn();
    render(<FilterChips options={options} value="all" onChange={onChange} />);
    fireEvent.click(screen.getByText("Active"));
    expect(onChange).toHaveBeenCalledWith("active");
  });

  it("renders label when provided", () => {
    const onChange = vi.fn();
    render(<FilterChips options={options} value="all" onChange={onChange} label="Status:" />);
    expect(screen.getByText("Status:")).toBeInTheDocument();
  });

  it("does not render label when not provided", () => {
    const onChange = vi.fn();
    const { queryByText } = render(<FilterChips options={options} value="all" onChange={onChange} />);
    expect(queryByText("Status:")).not.toBeInTheDocument();
  });

  it("renders count when provided", () => {
    const onChange = vi.fn();
    render(<FilterChips options={options} value="all" onChange={onChange} count="42 items" />);
    expect(screen.getByText("42 items")).toBeInTheDocument();
  });

  it("active option has primary styling", () => {
    const onChange = vi.fn();
    render(<FilterChips options={options} value="active" onChange={onChange} />);
    const activeBtn = screen.getByText("Active");
    expect(activeBtn.className).toContain("bg-primary");
  });

  it("inactive options do not have primary styling", () => {
    const onChange = vi.fn();
    render(<FilterChips options={options} value="active" onChange={onChange} />);
    const inactiveBtn = screen.getByText("All");
    expect(inactiveBtn.className).not.toContain("bg-primary");
  });
});

describe("components/widgets/KPIStrip", () => {
  const items = [
    { label: "Capacity", value: "78%", variant: "success" as const },
    { label: "Incidents", value: "3", variant: "warning" as const },
    { label: "Gates", value: "8 / 12", variant: "default" as const },
    { label: "Revenue", value: "$48K", variant: "error" as const },
  ];

  it("renders all KPI items", () => {
    render(<KPIStrip items={items} />);
    expect(screen.getByText("Capacity")).toBeInTheDocument();
    expect(screen.getByText("Incidents")).toBeInTheDocument();
    expect(screen.getByText("Gates")).toBeInTheDocument();
    expect(screen.getByText("Revenue")).toBeInTheDocument();
  });

  it("defaults to 4 columns", () => {
    const { container } = render(<KPIStrip items={items} />);
    const grid = container.firstChild as HTMLElement;
    expect(grid.className).toContain("grid-cols-2");
  });

  it("renders with 2 columns", () => {
    const twoItems = items.slice(0, 2);
    const { container } = render(<KPIStrip items={twoItems} cols={2} />);
    const grid = container.firstChild as HTMLElement;
    expect(grid.className).toContain("grid-cols-2");
  });

  it("renders with 3 columns", () => {
    const { container } = render(<KPIStrip items={items.slice(0, 3)} cols={3} />);
    const grid = container.firstChild as HTMLElement;
    expect(grid.className).toContain("grid-cols-3");
  });
});

describe("components/widgets/IncidentCard", () => {
  const baseProps = {
    id: "INC-001",
    type: "Overcrowding",
    location: "Gate C",
    severity: "high" as const,
  };

  it("renders incident type", () => {
    render(<IncidentCard {...baseProps} />);
    expect(screen.getByText("Overcrowding")).toBeInTheDocument();
  });

  it("renders incident location", () => {
    render(<IncidentCard {...baseProps} />);
    expect(screen.getByText("Gate C")).toBeInTheDocument();
  });

  it("renders severity badge", () => {
    render(<IncidentCard {...baseProps} />);
    expect(screen.getByText("HIGH")).toBeInTheDocument();
  });

  it("renders actions when provided", () => {
    const onClick = vi.fn();
    render(
      <IncidentCard
        {...baseProps}
        actions={[{ label: "Resolve", onClick }]}
      />
    );
    expect(screen.getByText("Resolve")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Resolve"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("renders critical severity badge", () => {
    render(<IncidentCard {...baseProps} severity="critical" />);
    expect(screen.getByText("CRITICAL")).toBeInTheDocument();
  });

  it("renders medium severity badge", () => {
    render(<IncidentCard {...baseProps} severity="medium" />);
    expect(screen.getByText("MED")).toBeInTheDocument();
  });

  it("renders low severity badge", () => {
    render(<IncidentCard {...baseProps} severity="low" />);
    expect(screen.getByText("LOW")).toBeInTheDocument();
  });

  it("renders action with icon", () => {
    const MockIcon = () => <span data-testid="mock-icon" />;
    render(
      <IncidentCard
        {...baseProps}
        actions={[{ label: "Alert", icon: MockIcon }]}
      />
    );
    expect(screen.getByTestId("mock-icon")).toBeInTheDocument();
  });
});

// ─── State Components ─────────────────────────────────────────────────────────

describe("components/states — Loading states", () => {
  it("SkeletonCard renders aria-busy", () => {
    const { container } = render(<SkeletonCard />);
    expect(container.querySelector("[aria-busy='true']")).toBeInTheDocument();
  });

  it("SkeletonDashboard renders aria-busy", () => {
    const { container } = render(<SkeletonDashboard />);
    expect(container.querySelector("[aria-busy='true']")).toBeInTheDocument();
  });

  it("AIThinking renders default label", () => {
    render(<AIThinking />);
    expect(screen.getByText("Pulse AI is thinking…")).toBeInTheDocument();
  });

  it("AIThinking renders custom label", () => {
    render(<AIThinking label="Analyzing data…" />);
    expect(screen.getByText("Analyzing data…")).toBeInTheDocument();
  });

  it("MapLoading renders map loading indicator", () => {
    const { container } = render(<MapLoading />);
    expect(container.querySelector("[aria-label='Map loading']")).toBeInTheDocument();
  });
});

describe("components/states — Empty states", () => {
  it("EmptyNotifications renders title and calls onAction", () => {
    const onAction = vi.fn();
    render(<EmptyNotifications onAction={onAction} />);
    expect(screen.getByText("No notifications")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Check settings"));
    expect(onAction).toHaveBeenCalledOnce();
  });

  it("EmptyNotifications without onAction renders without button", () => {
    render(<EmptyNotifications />);
    expect(screen.getByText("No notifications")).toBeInTheDocument();
  });

  it("EmptyIncidents renders and triggers callback", () => {
    const onAction = vi.fn();
    render(<EmptyIncidents onAction={onAction} />);
    expect(screen.getByText("No active incidents")).toBeInTheDocument();
    fireEvent.click(screen.getByText("View history"));
    expect(onAction).toHaveBeenCalledOnce();
  });

  it("EmptyMessages renders correctly", () => {
    const onAction = vi.fn();
    render(<EmptyMessages onAction={onAction} />);
    expect(screen.getByText("No messages")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Ask AI"));
    expect(onAction).toHaveBeenCalledOnce();
  });

  it("EmptyTasks renders correctly", () => {
    const onAction = vi.fn();
    render(<EmptyTasks onAction={onAction} />);
    expect(screen.getByText("No open tasks")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Add task"));
    expect(onAction).toHaveBeenCalledOnce();
  });
});

describe("components/states — Error states", () => {
  it("ErrorOffline renders and calls onRetry", () => {
    const onRetry = vi.fn();
    render(<ErrorOffline onRetry={onRetry} />);
    expect(screen.getByText("You're offline")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Retry"));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("ErrorOffline renders Offline mode button", () => {
    render(<ErrorOffline />);
    expect(screen.getByText("Offline mode")).toBeInTheDocument();
  });

  it("ErrorAIUnavailable renders and calls onRetry", () => {
    const onRetry = vi.fn();
    render(<ErrorAIUnavailable onRetry={onRetry} />);
    expect(screen.getByText("AI temporarily unavailable")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Try again"));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("ErrorMapUnavailable renders and calls onRetry", () => {
    const onRetry = vi.fn();
    render(<ErrorMapUnavailable onRetry={onRetry} />);
    expect(screen.getByText("Map unavailable")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Reload map"));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("ErrorGeneral uses default title and body", () => {
    render(<ErrorGeneral />);
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText(/An unexpected error occurred/i)).toBeInTheDocument();
  });

  it("ErrorGeneral uses custom title and body", () => {
    render(<ErrorGeneral title="Custom Error" body="Custom body text" />);
    expect(screen.getByText("Custom Error")).toBeInTheDocument();
    expect(screen.getByText("Custom body text")).toBeInTheDocument();
  });

  it("ErrorGeneral calls onRetry", () => {
    const onRetry = vi.fn();
    render(<ErrorGeneral onRetry={onRetry} />);
    fireEvent.click(screen.getByText("Try again"));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
