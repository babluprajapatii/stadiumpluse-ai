"use client";

import Link from "next/link";
import { X, CheckCircle, Zap } from "lucide-react";
import { cn } from "../ui/utils";
import { ThemeBtn } from "../shared/ThemeBtn";
import { NAV, FLOW, FLOW_LABELS } from "@/types";
import type { PageId } from "@/types";

interface SidebarProps {
  activePage: PageId;
  sidebarOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ activePage, sidebarOpen, onClose }: SidebarProps) {
  const inFlow  = FLOW.includes(activePage);
  const flowIdx = FLOW.indexOf(activePage);

  const getHref = (id: PageId) => {
    return id === "landing" ? "/" : `/${id}`;
  };

  return (
    <aside
      id="app-sidebar"
      aria-label="Application navigation"
      className={cn(
        "fixed lg:relative z-50 lg:z-auto top-0 left-0 h-full w-56 bg-sidebar flex flex-col transition-transform duration-200 ease-in-out shrink-0",
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

      {inFlow && (
        <div className="px-3 pt-4 pb-2">
          <p className="text-[8px] font-semibold text-sidebar-accent-foreground/40 uppercase tracking-[0.18em] px-2 mb-2">
            Prototype Flow
          </p>
          {FLOW.map((id, i) => {
            const nav    = NAV.find(n => n.id === id)!;
            const isAct  = activePage === id;
            const isDone = inFlow && i < flowIdx;
            return (
              <Link
                key={id}
                href={getHref(id)}
                onClick={onClose}
                aria-current={isAct ? "page" : undefined}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left mb-0.5 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                  isAct
                    ? "bg-sidebar-accent text-sidebar-primary border-l-2 border-sidebar-primary pl-[10px]"
                    : isDone
                    ? "text-success/80 hover:bg-sidebar-accent"
                    : "text-sidebar-accent-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
                )}
              >
                {isDone
                  ? <CheckCircle size={12} className="shrink-0 text-success" aria-hidden="true" />
                  : <nav.Icon   size={12} className="shrink-0" aria-hidden="true" />
                }
                {FLOW_LABELS[id]}
              </Link>
            );
          })}
          <div className="mx-1 mt-3 border-t border-sidebar-border/50" aria-hidden="true" />
        </div>
      )}

      <nav className="flex-1 overflow-y-auto py-3 px-2" aria-label="All pages">
        <p className="text-[8px] font-semibold text-sidebar-accent-foreground/40 uppercase tracking-[0.18em] px-2 mb-2">
          All Pages
        </p>
        {NAV.map(({ id, label, Icon }) => {
          const isAct = activePage === id;
          return (
            <Link
              key={id}
              href={getHref(id)}
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
    </aside>
  );
}
