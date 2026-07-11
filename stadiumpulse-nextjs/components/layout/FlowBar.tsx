"use client";

import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { cn } from "../ui/utils";
import { FLOW, FLOW_LABELS } from "@/types";
import type { PageId } from "@/types";

interface FlowBarProps {
  current: PageId;
}

export function FlowBar({ current }: FlowBarProps) {
  const idx = FLOW.indexOf(current);
  if (idx === -1) return null;

  const getHref = (id: PageId) => {
    return id === "landing" ? "/" : `/${id}`;
  };

  return (
    <div className="bg-card border-b border-border px-4 py-2.5 shrink-0" role="navigation" aria-label="Prototype flow">
      <div className="flex items-center max-w-lg mx-auto">
        {FLOW.map((id, i) => {
          const isActive = id === current;
          const isDone   = i < idx;
          const isLast   = i === FLOW.length - 1;
          return (
            <div key={id} className={cn("flex items-center", !isLast && "flex-1")}>
              <Link
                href={getHref(id)}
                aria-current={isActive ? "step" : undefined}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive ? "bg-primary text-white"
                  : isDone  ? "text-success hover:opacity-80"
                  :           "text-muted-foreground/60 hover:text-muted-foreground"
                )}
              >
                {isDone   && <CheckCircle size={10} aria-hidden="true" />}
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white/70" aria-hidden="true" />}
                {FLOW_LABELS[id]}
              </Link>
              {!isLast && (
                <div className={cn("flex-1 h-px mx-1", isDone ? "bg-success/40" : "bg-border")} aria-hidden="true" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
