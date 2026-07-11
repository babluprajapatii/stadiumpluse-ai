"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, Zap } from "lucide-react";
import { ThemeBtn } from "../shared/ThemeBtn";
import { Sidebar } from "./Sidebar";
import { FlowBar } from "./FlowBar";
import { EmergencyMode, EmergencyTrigger } from "../emergency-mode";
import { useApp } from "@/providers/AppContext";
import { NAV, FLOW } from "@/types";
import type { PageId } from "@/types";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const activePage = (pathname === "/" ? "landing" : pathname.split("/").pop() || "landing") as PageId;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { emergency, setEmergency } = useApp();

  const current  = NAV.find(n => n.id === activePage);
  const inFlow   = FLOW.includes(activePage);
  const flowIdx  = FLOW.indexOf(activePage);

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
        activePage={activePage}
        sidebarOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background rounded-tl-2xl rounded-bl-2xl lg:my-2 lg:mr-2">
        <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between shrink-0 rounded-tl-2xl">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={sidebarOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={sidebarOpen}
              aria-controls="app-sidebar"
            >
              <Menu size={17} aria-hidden="true" />
            </button>
            <div className="flex items-center gap-2">
              {current && <current.Icon size={15} className="text-muted-foreground hidden sm:block" aria-hidden="true" />}
              <span className="font-semibold text-sm text-foreground">{current?.label}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <EmergencyTrigger onClick={() => setEmergency(true)} />
            {inFlow && (
              <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-muted-foreground bg-muted rounded-full px-3 py-1">
                <Zap size={10} className="text-primary" aria-hidden="true" />
                Step {flowIdx + 1} / {FLOW.length}
              </div>
            )}
            <ThemeBtn />
          </div>
        </div>

        {inFlow && <FlowBar current={activePage} />}

        <div className="flex-1 overflow-auto bg-background">
          <div key={pathname} className="min-h-full page-enter">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
