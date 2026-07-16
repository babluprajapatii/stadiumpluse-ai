"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Zap } from "lucide-react";
import { cn } from "../ui/utils";
import { ThemeBtn } from "../shared/ThemeBtn";
import { useAuth } from "@/providers/AuthProvider";
import { useApp } from "@/providers/AppContext";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";

import {
  LayoutDashboard,
  Bot,
  UtensilsCrossed,
  Accessibility,
  User,
  Settings,
  LogOut,
  ShieldAlert,
  AlertOctagon,
  CalendarDays,
  LineChart,
  HardDrive,
  Activity,
  ClipboardList,
  LucideIcon,
} from "lucide-react";

interface SidebarProps {
  sidebarOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  label: string;
  href: string;
  Icon: LucideIcon;
  action?: () => void;
}

export function Sidebar({ sidebarOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { setEmergency } = useApp();
  const [showConfirm, setShowConfirm] = useState(false);

  const getMenuItems = (): MenuItem[] => {
    if (!user) return [];

    const common = [
      { label: "Profile", href: "/profile", Icon: User },
      { label: "Settings", href: "/settings", Icon: Settings },
      { label: "Logout", href: "#logout", Icon: LogOut, action: () => setShowConfirm(true) },
    ];

    switch (user.role) {
      case "fan":
        return [
          { label: "Dashboard", href: "/fan", Icon: LayoutDashboard },
          { label: "AI Assistant", href: "/ai", Icon: Bot },
          { label: "Order Food", href: "/feature", Icon: UtensilsCrossed },
          { label: "Accessibility", href: "/accessibility", Icon: Accessibility },
          ...common,
        ];
      case "security":
        return [
          { label: "Dashboard", href: "/security", Icon: LayoutDashboard },
          { label: "Incidents", href: "/security#incidents", Icon: ShieldAlert },
          { label: "AI Command Center", href: "/ai", Icon: Bot },
          { label: "Emergency", href: "#emergency", Icon: AlertOctagon, action: () => setEmergency(true) },
          { label: "Accessibility", href: "/accessibility", Icon: Accessibility },
          ...common,
        ];
      case "organizer":
        return [
          { label: "Dashboard", href: "/organizer", Icon: LayoutDashboard },
          { label: "Operations", href: "/organizer#operations", Icon: CalendarDays },
          { label: "Analytics", href: "/organizer#analytics", Icon: LineChart },
          { label: "AI Insights", href: "/ai", Icon: Bot },
          { label: "Accessibility", href: "/accessibility", Icon: Accessibility },
          ...common,
        ];
      case "operator":
        return [
          { label: "Dashboard", href: "/operator", Icon: LayoutDashboard },
          { label: "Facilities", href: "/operator#facilities", Icon: HardDrive },
          { label: "Live Monitoring", href: "/operator#live", Icon: Activity },
          { label: "AI Insights", href: "/ai", Icon: Bot },
          { label: "Accessibility", href: "/accessibility", Icon: Accessibility },
          ...common,
        ];
      case "volunteer":
        return [
          { label: "Dashboard", href: "/volunteer", Icon: LayoutDashboard },
          { label: "My Tasks", href: "/volunteer#tasks", Icon: ClipboardList },
          { label: "Incident Reports", href: "/volunteer#reports", Icon: ShieldAlert },
          { label: "AI Assistant", href: "/ai", Icon: Bot },
          { label: "Accessibility", href: "/accessibility", Icon: Accessibility },
          ...common,
        ];
      case "accessibility":
        return [
          { label: "Dashboard", href: "/accessibility", Icon: LayoutDashboard },
          { label: "AI Assistant", href: "/ai", Icon: Bot },
          { label: "Order Food", href: "/feature", Icon: UtensilsCrossed },
          { label: "Accessibility", href: "/accessibility", Icon: Accessibility },
          ...common,
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <aside
      id="app-sidebar"
      aria-label="Application navigation"
      className={cn(
        "fixed lg:relative z-50 lg:z-auto top-0 left-0 h-full w-56 bg-sidebar flex flex-col transition-transform duration-200 ease-in-out shrink-0 border-r border-sidebar-border/30",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      <div className="px-4 py-5 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Zap size={15} className="text-white" aria-hidden="true" />
            </div>
            <div>
              <p className="font-bold text-sidebar-foreground text-sm leading-tight">StadiumPulse</p>
              <p className="text-[9px] text-sidebar-accent-foreground/60 font-medium">FIFA WC 2026</p>
            </div>
          </div>
          <button
            className="lg:hidden p-1.5 rounded text-sidebar-accent-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <X size={15} aria-hidden="true" />
          </button>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-2" aria-label="Portal navigation">
        {menuItems.map(({ label, href, Icon, action }) => {
          const isAct = href.startsWith("#")
            ? false
            : pathname.startsWith(href);

          if (action) {
            return (
              <button
                key={label}
                onClick={() => {
                  action();
                  onClose();
                }}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left mb-0.5 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring text-sidebar-accent-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent cursor-pointer"
                )}
              >
                <Icon size={12} className="shrink-0" aria-hidden="true" />
                {label}
              </button>
            );
          }

          return (
            <Link
              key={label}
              href={href}
              onClick={onClose}
              aria-current={isAct ? "page" : undefined}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left mb-0.5 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                isAct
                  ? "bg-sidebar-accent text-sidebar-primary border-l-2 border-sidebar-primary pl-[10px]"
                  : "text-sidebar-accent-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <Icon size={12} className="shrink-0" aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-sidebar-border flex items-center justify-between">
        <p className="text-[9px] text-sidebar-accent-foreground/50">StadiumPulse AI · FIFA 2026</p>
        <ThemeBtn />
      </div>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="max-w-[340px]">
          <DialogHeader>
            <DialogTitle>Sign out</DialogTitle>
            <DialogDescription>
              Are you sure you want to sign out?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:flex-row flex-col">
            <button
              onClick={() => setShowConfirm(false)}
              className="flex-1 px-4 py-2 text-xs font-medium border border-border rounded-lg hover:bg-muted transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setShowConfirm(false);
                logout();
              }}
              className="flex-1 px-4 py-2 text-xs font-medium bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/95 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Logout
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </aside>
  );
}
