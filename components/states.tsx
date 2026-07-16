import { cn } from "./ui/utils";
import { Button } from "./ui/button";
import {
  Bell, Shield, MessageSquare, ClipboardList,
  WifiOff, Brain, Map, RefreshCw, AlertTriangle,
} from "lucide-react";

// ─── Skeleton primitives ──────────────────────────────────────────────────────

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-muted rounded animate-pulse",
        className
      )}
      aria-hidden="true"
    />
  );
}

// ─── Loading States ───────────────────────────────────────────────────────────

export function SkeletonCard() {
  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3" aria-busy="true" aria-label="Loading…">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-2.5 w-48" />
        </div>
      </div>
      <Skeleton className="h-2 w-full" />
      <Skeleton className="h-2 w-4/5" />
      <Skeleton className="h-2 w-3/5" />
      <div className="flex gap-2 pt-1">
        <Skeleton className="h-8 flex-1 rounded-lg" />
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="px-4 py-5 space-y-5" aria-busy="true" aria-label="Loading dashboard…">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-2.5 w-24" />
          <Skeleton className="h-5 w-36" />
        </div>
        <Skeleton className="w-9 h-9 rounded-full" />
      </div>

      {/* Banner */}
      <Skeleton className="h-32 w-full rounded-xl" />

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
      </div>

      {/* Cards */}
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}

export function AIThinking({ label = "Pulse AI is thinking…" }: { label?: string }) {
  return (
    <div className="flex gap-2.5 items-start" aria-live="polite" aria-label={label}>
      <div className="w-8 h-8 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center shrink-0">
        <Brain size={14} className="text-primary" aria-hidden="true" />
      </div>
      <div className="bg-card border border-border rounded-xl rounded-tl-none p-3.5">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="flex gap-1" aria-hidden="true">
            {[0, 1, 2].map(i => (
              <span
                key={i}
                className="w-2 h-2 bg-primary/60 rounded-full motion-safe:animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <span className="text-[10px] text-muted-foreground">{label}</span>
        </div>
        <div className="space-y-1.5" aria-hidden="true">
          <div className="h-2 bg-muted rounded-full w-3/4 animate-pulse" />
          <div className="h-2 bg-muted rounded-full w-1/2 animate-pulse" style={{ animationDelay: "0.2s" }} />
        </div>
      </div>
    </div>
  );
}

export function MapLoading() {
  return (
    <div
      className="bg-card border border-border rounded-xl overflow-hidden"
      aria-busy="true"
      aria-label="Map loading"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Skeleton className="w-28 h-3.5 rounded" />
        </div>
        <Skeleton className="w-16 h-4 rounded-full" />
      </div>
      <div className="h-64 bg-slate-900 relative flex items-center justify-center" aria-hidden="true">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
          <p className="text-xs text-slate-400">Loading map data…</p>
        </div>
        {/* Faint grid */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "32px 32px" }}
        />
      </div>
      <div className="px-4 py-3 border-t border-border">
        <Skeleton className="h-3 w-48" />
      </div>
    </div>
  );
}

// ─── Empty States ──────────────────────────────────────────────────────────────

interface EmptyProps {
  title: string;
  body: string;
  action?: string;
  onAction?: () => void;
  className?: string;
}

function EmptyBase({ icon, title, body, action, onAction, className }: EmptyProps & { icon: React.ReactNode }) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center py-12 px-6", className)}>
      <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4" aria-hidden="true">
        {icon}
      </div>
      <p className="font-semibold text-sm text-foreground mb-1.5">{title}</p>
      <p className="text-xs text-muted-foreground leading-relaxed max-w-52 mb-5">{body}</p>
      {action && onAction && (
        <Button size="sm" variant="outline" onClick={onAction}>{action}</Button>
      )}
    </div>
  );
}

export function EmptyNotifications({ onAction }: { onAction?: () => void }) {
  return (
    <EmptyBase
      icon={<Bell size={26} className="text-muted-foreground" />}
      title="No notifications"
      body="You're all caught up. New alerts and updates will appear here."
      action="Check settings"
      onAction={onAction}
    />
  );
}

export function EmptyIncidents({ onAction }: { onAction?: () => void }) {
  return (
    <EmptyBase
      icon={<Shield size={26} className="text-success" />}
      title="No active incidents"
      body="All systems are operating normally. Incidents and alerts will appear here in real time."
      action="View history"
      onAction={onAction}
    />
  );
}

export function EmptyMessages({ onAction }: { onAction?: () => void }) {
  return (
    <EmptyBase
      icon={<MessageSquare size={26} className="text-muted-foreground" />}
      title="No messages"
      body="Start a conversation with Pulse AI or your team members."
      action="Ask AI"
      onAction={onAction}
    />
  );
}

export function EmptyTasks({ onAction }: { onAction?: () => void }) {
  return (
    <EmptyBase
      icon={<ClipboardList size={26} className="text-muted-foreground" />}
      title="No open tasks"
      body="Great work — your task list is clear. New tasks assigned to you will appear here."
      action="Add task"
      onAction={onAction}
    />
  );
}

// ─── Error States ─────────────────────────────────────────────────────────────

export function ErrorOffline({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6">
      <div className="w-16 h-16 bg-error-muted rounded-2xl flex items-center justify-center mb-4" aria-hidden="true">
        <WifiOff size={26} className="text-error" />
      </div>
      <p className="font-semibold text-sm text-foreground mb-1.5">You&apos;re offline</p>
      <p className="text-xs text-muted-foreground leading-relaxed max-w-52 mb-5">
        No internet connection detected. Some features may be unavailable.
      </p>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" className="gap-1.5" onClick={onRetry}>
          <RefreshCw size={12} aria-hidden="true" /> Retry
        </Button>
        <Button size="sm" variant="ghost">
          Offline mode
        </Button>
      </div>
    </div>
  );
}

export function ErrorAIUnavailable({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6">
      <div className="w-16 h-16 bg-warning-muted rounded-2xl flex items-center justify-center mb-4" aria-hidden="true">
        <Brain size={26} className="text-warning" />
      </div>
      <p className="font-semibold text-sm text-foreground mb-1.5">AI temporarily unavailable</p>
      <p className="text-xs text-muted-foreground leading-relaxed max-w-52 mb-5">
        Pulse AI is undergoing a brief update. Estimated return in 2 minutes.
      </p>
      <div className="flex gap-2">
        <Button size="sm" className="gap-1.5" onClick={onRetry}>
          <RefreshCw size={12} aria-hidden="true" /> Try again
        </Button>
      </div>
    </div>
  );
}

export function ErrorMapUnavailable({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="h-52 flex flex-col items-center justify-center text-center gap-4 bg-muted/30 rounded-xl border border-border border-dashed">
      <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center" aria-hidden="true">
        <Map size={22} className="text-muted-foreground" />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground mb-1">Map unavailable</p>
        <p className="text-xs text-muted-foreground">Could not load stadium map data.</p>
      </div>
      <Button size="sm" variant="outline" className="gap-1.5" onClick={onRetry}>
        <RefreshCw size={12} aria-hidden="true" /> Reload map
      </Button>
    </div>
  );
}

export function ErrorGeneral({ title = "Something went wrong", body = "An unexpected error occurred. Please try again.", onRetry }: { title?: string; body?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6">
      <div className="w-16 h-16 bg-error-muted rounded-2xl flex items-center justify-center mb-4" aria-hidden="true">
        <AlertTriangle size={26} className="text-error" />
      </div>
      <p className="font-semibold text-sm text-foreground mb-1.5">{title}</p>
      <p className="text-xs text-muted-foreground leading-relaxed max-w-52 mb-5">{body}</p>
      <Button size="sm" variant="outline" className="gap-1.5" onClick={onRetry}>
        <RefreshCw size={12} aria-hidden="true" /> Try again
      </Button>
    </div>
  );
}
