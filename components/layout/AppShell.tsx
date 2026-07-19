"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { ThemeBtn } from "../shared/ThemeBtn";
import { Sidebar } from "./Sidebar";
import dynamic from "next/dynamic";
import { EmergencyTrigger } from "../emergency-mode";
import { useApp } from "@/providers/AppContext";
import { useAuth } from "@/providers/AuthProvider";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { NotificationBell } from "../shared/NotificationBell";

const EmergencyMode = dynamic(
  () => import("../emergency-mode").then((mod) => mod.EmergencyMode),
  { ssr: false }
);

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { emergency, setEmergency } = useApp();
  const { user } = useAuth();

  const getRoleLabel = () => {
    if (!user) return "StadiumPulse";
    const r = user.role;
    // Capitalize role and add suffix
    const roleCapitalized = r.charAt(0).toUpperCase() + r.slice(1);
    if (r === "fan" || r === "volunteer") {
      return `${roleCapitalized} Portal`;
    }
    return `${roleCapitalized} Dashboard`;
  };

  const getInitials = () => {
    if (!user) return "U";
    if (user.name) {
      return user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
    }
    return user.email.charAt(0).toUpperCase();
  };

  return (
    <div className="flex h-screen bg-sidebar overflow-hidden">
      {emergency && (
        <EmergencyMode severity="evacuate" onClose={() => setEmergency(false)} />
      )}

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <Sidebar
        sidebarOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background rounded-tl-2xl rounded-bl-2xl lg:my-2 lg:mr-2 focus:outline-none"
      >
        <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between shrink-0 rounded-tl-2xl">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
              aria-label={sidebarOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={sidebarOpen}
              aria-controls="app-sidebar"
            >
              <Menu size={17} aria-hidden="true" />
            </button>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-foreground">{getRoleLabel()}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <EmergencyTrigger onClick={() => setEmergency(true)} />
            
            <NotificationBell />

            <ThemeBtn />

            {user && (
              <Avatar className="w-7 h-7">
                {user.avatar && (
                  <AvatarImage src={user.avatar} alt={`${user.name}'s profile photo`} className="object-cover" />
                )}
                <AvatarFallback className="text-[10px] bg-primary text-primary-foreground font-bold select-none">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-background">
          <div key={pathname} className="min-h-full page-enter">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
