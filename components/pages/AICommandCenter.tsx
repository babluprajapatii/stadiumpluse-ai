"use client";

import { useState } from "react";
import {
  Users, Shield, Stethoscope, AlertTriangle, Accessibility,
  Bus, Cloud, Brain, ChevronRight, CheckCircle, TrendingUp,
  TrendingDown, Minus, RefreshCw, Zap, Eye,
  ThumbsUp, Clock, Radio,
} from "lucide-react";
import { Button } from "../ui/button";
import { LiveBadge } from "../ui/live-badge";
import { cn } from "../ui/utils";
import dynamic from "next/dynamic";

const CrowdFlowChart = dynamic(() => import("../widgets/AIChartsWrapper").then((mod) => mod.CrowdFlowChart), {
  ssr: false,
  loading: () => <div className="h-[200px] w-full bg-card/50 animate-pulse rounded-xl" />
});

const GateDonut = dynamic(() => import("../widgets/AIChartsWrapper").then((mod) => mod.GateDonut), {
  ssr: false,
  loading: () => <div className="h-[200px] w-full bg-card/50 animate-pulse rounded-xl" />
});

// ─── Types ───────────────────────────────────────────────────────────────────

type Priority = "critical" | "high" | "medium" | "low" | "ok";
type AICard = {
  id: string;
  icon: React.ElementType;
  label: string;
  status: string;
  detail: string;
  priority: Priority;
  confidence: number;
  trend?: "up" | "down" | "stable";
  action: string;
  actionLabel: string;
  acked?: boolean;
};

const PRIORITY_STYLES: Record<Priority, { badge: string; border: string; dot: string; bg: string }> = {
  critical: { badge: "bg-error-muted text-error border-transparent",   border: "border-l-error",   dot: "bg-error",   bg: "bg-error-muted/30"   },
  high:     { badge: "bg-error-muted text-error border-transparent",   border: "border-l-error",   dot: "bg-error",   bg: "bg-error-muted/20"   },
  medium:   { badge: "bg-warning-muted text-warning border-transparent",border: "border-l-warning", dot: "bg-warning", bg: "bg-warning-muted/20" },
  low:      { badge: "bg-primary/10 text-primary border-transparent",  border: "border-l-primary", dot: "bg-primary", bg: "bg-primary/5"        },
  ok:       { badge: "bg-success-muted text-success border-transparent",border: "border-l-success", dot: "bg-success", bg: "bg-success-muted/20" },
};

// ─── Initial cards ────────────────────────────────────────────────────────────

const INITIAL_CARDS: AICard[] = [
  {
    id: "crowd",
    icon: Users,
    label: "Crowd Risk",
    status: "High Congestion — Gate C",
    detail: "AI detected 18% crowd increase in 10 min. Gate C at 98% capacity.",
    priority: "high",
    confidence: 96,
    trend: "up",
    action: "Open Gate D immediately to redistribute flow.",
    actionLabel: "Open Gate D",
  },
  {
    id: "gate",
    icon: Shield,
    label: "Gate Status",
    status: "Gate C Critical · Gate D Idle",
    detail: "3 of 8 gates operating below 40% capacity. Gate C over threshold.",
    priority: "medium",
    confidence: 99,
    trend: "stable",
    action: "Redirect signage to Gates A, D, F.",
    actionLabel: "Update Signage",
  },
  {
    id: "medical",
    icon: Stethoscope,
    label: "Medical Alerts",
    status: "2 Active Responses",
    detail: "Sector A Row 4 — heat exhaustion. Sector C Row 11 — minor fall.",
    priority: "high",
    confidence: 94,
    trend: "stable",
    action: "Dispatch second medic unit to Sector A.",
    actionLabel: "Dispatch Unit",
  },
  {
    id: "emergency",
    icon: AlertTriangle,
    label: "Emergency Alerts",
    status: "No Active Emergencies",
    detail: "All evacuation routes clear. Fire systems nominal. Last drill: 09:00.",
    priority: "ok",
    confidence: 99,
    trend: "stable",
    action: "All systems nominal — no action required.",
    actionLabel: "View Routes",
  },
  {
    id: "access",
    icon: Accessibility,
    label: "Accessibility Status",
    status: "Lift B Delayed 4 min",
    detail: "Lift B experiencing slow cycle. 12 wheelchair users in Sector B queue.",
    priority: "medium",
    confidence: 88,
    trend: "up",
    action: "Assign 2 volunteers to assist manual wheelchair routing.",
    actionLabel: "Assign Volunteers",
  },
  {
    id: "transport",
    icon: Bus,
    label: "Transportation",
    status: "Metro Line 3 Delayed 8 min",
    detail: "Post-match exodus projected at 21:45. Surge pricing active on ride-share.",
    priority: "low",
    confidence: 82,
    trend: "up",
    action: "Activate overflow parking shuttle at Gate G.",
    actionLabel: "Activate Shuttle",
  },
  {
    id: "weather",
    icon: Cloud,
    label: "Weather",
    status: "Clear · 24°C · UV High",
    detail: "Roof shade covers 40% of stands. Hydration stations at 78% stock.",
    priority: "low",
    confidence: 97,
    trend: "stable",
    action: "Restock hydration stations in uncovered sectors.",
    actionLabel: "Restock Alert",
  },
  {
    id: "recommend",
    icon: Brain,
    label: "AI Recommendations",
    status: "4 Active Suggestions",
    detail: "Based on crowd pattern, historical data, and real-time sensors.",
    priority: "low",
    confidence: 91,
    trend: "stable",
    action: "Review all 4 suggestions for operational improvement.",
    actionLabel: "Review All",
  },
];

// ─── AI Insight Banner ────────────────────────────────────────────────────────

function InsightBanner() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-xl p-4 flex gap-3 items-start">
      <div className="w-9 h-9 bg-primary/15 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
        <Brain size={17} className="text-primary" aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-xs font-bold text-foreground">AI Insight — High Priority</p>
          <LiveBadge label="Real-time" />
        </div>
        <p className="text-sm text-foreground leading-relaxed">
          Congestion at <strong>Gate C</strong> predicted to worsen by{" "}
          <strong className="text-error">18%</strong> in the next 10 minutes.
          Opening Gate D is estimated to reduce wait times by <strong className="text-success">34%</strong>.
        </p>
        <div className="flex items-center gap-3 mt-3">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span className="font-semibold text-foreground">Confidence:</span>
            <span className="text-primary font-bold">96%</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <Clock size={10} aria-hidden="true" />
            <span>Updated 23s ago</span>
          </div>
        </div>
      </div>
      <button
        onClick={() => setVisible(false)}
        className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0"
        aria-label="Dismiss insight"
      >
        <CheckCircle size={16} aria-hidden="true" />
      </button>
    </div>
  );
}

// ─── KPI Row ──────────────────────────────────────────────────────────────────

function KPIRow() {
  const kpis = [
    { label: "Attendance", value: "47,300", unit: "/ 52K", trend: "+2.1K", up: true },
    { label: "AI Alerts",  value: "12",     unit: "active", trend: "-3 since 16:00", up: false },
    { label: "Gate Avg",   value: "4.2",    unit: "min",    trend: "wait time",      up: null },
    { label: "Incidents",  value: "2",      unit: "open",   trend: "14 resolved",    up: false },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {kpis.map(({ label, value, unit, trend, up }) => (
        <div key={label} className="bg-card border border-border rounded-xl p-3.5">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium mb-1.5">{label}</p>
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-2xl font-bold text-foreground tabular-nums">{value}</span>
            <span className="text-xs text-muted-foreground">{unit}</span>
          </div>
          <div className={cn("flex items-center gap-1 text-[10px] font-medium",
            up === true ? "text-success" : up === false ? "text-error" : "text-muted-foreground")}>
            {up === true  && <TrendingUp  size={10} aria-hidden="true" />}
            {up === false && <TrendingDown size={10} aria-hidden="true" />}
            {up === null  && <Minus        size={10} aria-hidden="true" />}
            <span>{trend}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Confidence Bar ───────────────────────────────────────────────────────────

function ConfidenceBar({ value }: { value: number }) {
  const color = value >= 90 ? "bg-success" : value >= 70 ? "bg-warning" : "bg-error";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${value}%` }} />
      </div>
      <span className="text-[10px] font-bold tabular-nums text-muted-foreground w-8 text-right">{value}%</span>
    </div>
  );
}

// ─── Command Card ─────────────────────────────────────────────────────────────

function CommandCard({ card, onAck }: { card: AICard; onAck: (id: string) => void }) {
  const [expanded, setExpanded] = useState(card.priority === "high" || card.priority === "critical");
  const styles = PRIORITY_STYLES[card.priority];
  const { icon: Icon } = card;

  return (
    <div className={cn(
      "bg-card border border-border border-l-4 rounded-xl overflow-hidden transition-all duration-200",
      styles.border,
      card.acked && "opacity-60"
    )}>
      {/* Header — always visible */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group"
        aria-expanded={expanded}
      >
        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors", styles.bg)}>
          <Icon size={17} className={cn(
            card.priority === "ok" ? "text-success"
            : card.priority === "medium" ? "text-warning"
            : card.priority === "low" ? "text-primary"
            : "text-error"
          )} aria-hidden="true" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-xs font-semibold text-foreground">{card.label}</p>
            <span className={cn("inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide border", styles.badge)}>
              {card.priority === "ok" ? "OK" : card.priority.toUpperCase()}
            </span>
            {card.acked && <span className="text-[9px] text-muted-foreground font-medium">Acknowledged</span>}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{card.status}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {card.trend === "up"     && <TrendingUp  size={13} className="text-error"   aria-label="Trend increasing" />}
          {card.trend === "down"   && <TrendingDown size={13} className="text-success" aria-label="Trend decreasing" />}
          {card.trend === "stable" && <Minus        size={13} className="text-muted-foreground" aria-label="Stable" />}
          <ChevronRight size={14} className={cn("text-muted-foreground transition-transform duration-200", expanded && "rotate-90")} aria-hidden="true" />
        </div>
      </button>

      {/* Expanded body */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-border/50">
          <p className="text-sm text-foreground leading-relaxed pt-3">{card.detail}</p>

          {/* Confidence */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">AI Confidence</span>
            </div>
            <ConfidenceBar value={card.confidence} />
          </div>

          {/* Recommendation */}
          <div className="bg-muted/60 rounded-lg px-3 py-2.5">
            <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-semibold mb-1">Recommended Action</p>
            <p className="text-xs text-foreground leading-relaxed">{card.action}</p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Button size="sm" className="flex-1 gap-1.5" onClick={() => onAck(card.id)}
              variant={card.priority === "high" || card.priority === "critical" ? "default" : "outline"}>
              <Zap size={12} aria-hidden="true" /> {card.actionLabel}
            </Button>
            <Button size="sm" variant="outline" onClick={() => onAck(card.id)}>
              <ThumbsUp size={12} aria-hidden="true" />
              <span className="sr-only">Acknowledge</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── AI Recommendations Panel ─────────────────────────────────────────────────

function RecommendationsPanel() {
  const recs = [
    { text: "Open Gate D to reduce Gate C load by est. 34%.", impact: "High", time: "Now" },
    { text: "Deploy 2 more volunteers to North stand queue.", impact: "Medium", time: "5 min" },
    { text: "Activate overflow parking shuttle at Gate G.", impact: "Medium", time: "15 min" },
    { text: "Restock hydration at Sector D — 22% stock remaining.", impact: "Low", time: "30 min" },
  ];
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center">
          <Brain size={14} className="text-primary" aria-hidden="true" />
        </div>
        <p className="text-xs font-semibold text-foreground">AI Recommendations</p>
        <span className="ml-auto text-[9px] bg-primary/10 text-primary rounded-full px-2 py-0.5 font-bold">4 active</span>
      </div>
      <div className="space-y-3">
        {recs.map(({ text, impact, time }, i) => (
          <div key={i} className="flex gap-3 items-start">
            <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5">
              {i + 1}
            </div>
            <div className="flex-1">
              <p className="text-xs text-foreground leading-relaxed">{text}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn("text-[9px] font-bold uppercase",
                  impact === "High" ? "text-error" : impact === "Medium" ? "text-warning" : "text-muted-foreground")}>
                  {impact} impact
                </span>
                <span className="text-[9px] text-muted-foreground">·</span>
                <span className="text-[9px] text-muted-foreground">{time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── System Health Strip ──────────────────────────────────────────────────────

function SystemHealthStrip() {
  const systems = [
    { label: "AI Engine",   ok: true  },
    { label: "CCTV Feed",   ok: true  },
    { label: "Gate Sensors",ok: true  },
    { label: "Comms",       ok: true  },
    { label: "Medical Net", ok: true  },
    { label: "PA System",   ok: false },
  ];
  return (
    <div className="flex items-center gap-1 flex-wrap">
      <span className="text-[10px] text-muted-foreground font-medium mr-1">Systems:</span>
      {systems.map(({ label, ok }) => (
        <div key={label} className="flex items-center gap-1 bg-card border border-border rounded-full px-2 py-1">
          <span className={cn("w-1.5 h-1.5 rounded-full", ok ? "bg-success" : "bg-error motion-safe:animate-pulse")} aria-hidden="true" />
          <span className="text-[9px] text-foreground font-medium">{label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────────

export function AICommandCenter() {
  const [cards, setCards] = useState(INITIAL_CARDS);
  const [lastRefresh, setLastRefresh] = useState("16:47:23");
  const [filter, setFilter] = useState<Priority | "all">("all");

  function ackCard(id: string) {
    setCards(cs => cs.map(c => c.id === id ? { ...c, acked: true } : c));
  }

  const filtered = filter === "all" ? cards : cards.filter(c => c.priority === filter);
  const criticalCount = cards.filter(c => (c.priority === "critical" || c.priority === "high") && !c.acked).length;

  return (
    <div className="bg-background min-h-full">
      {/* Command header */}
      <div className="bg-sidebar px-4 pt-10 pb-5 shrink-0">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Radio size={13} className="text-primary motion-safe:animate-pulse" aria-hidden="true" />
                <span className="text-[10px] text-sidebar-accent-foreground/60 uppercase tracking-widest font-semibold">
                  FIFA World Cup 2026 · Operations Center
                </span>
              </div>
              <h1 className="text-xl font-bold text-sidebar-foreground">AI Command Center</h1>
              <p className="text-sidebar-accent-foreground/60 text-xs mt-0.5">Champions Final · Lusail Stadium · 47,300 attending</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {criticalCount > 0 && (
                <div className="flex items-center gap-1.5 bg-error/20 border border-error/30 text-error rounded-full px-3 py-1.5 text-[11px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-error motion-safe:animate-pulse" aria-hidden="true" />
                  {criticalCount} alert{criticalCount !== 1 ? "s" : ""}
                </div>
              )}
              <LiveBadge label="LIVE" />
            </div>
          </div>

          <SystemHealthStrip />

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-1.5 text-[10px] text-sidebar-accent-foreground/60">
              <Clock size={10} aria-hidden="true" />
              <span>Last updated: {lastRefresh}</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-3 text-[10px] border-sidebar-border/40 text-sidebar-foreground/70 bg-sidebar-accent/30 hover:bg-sidebar-accent hover:text-sidebar-foreground gap-1.5"
              onClick={() => setLastRefresh(new Date().toLocaleTimeString())}
            >
              <RefreshCw size={11} aria-hidden="true" /> Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 py-5 max-w-5xl mx-auto space-y-5">
        {/* AI Insight banner */}
        <InsightBanner />

        {/* KPI row */}
        <KPIRow />

        {/* Charts row */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <CrowdFlowChart />
          </div>
          <GateDonut />
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] text-muted-foreground font-medium">Filter:</span>
          {(["all", "high", "medium", "low", "ok"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                filter === f
                  ? "bg-primary text-white border-primary"
                  : "bg-card text-muted-foreground border-border hover:text-foreground"
              )}
            >
              {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
          <span className="ml-auto text-[10px] text-muted-foreground">
            {filtered.length} of {cards.length} modules
          </span>
        </div>

        {/* Command cards */}
        <div className="grid md:grid-cols-2 gap-3">
          {filtered.map(card => (
            <CommandCard key={card.id} card={card} onAck={ackCard} />
          ))}
        </div>

        {/* Recommendations panel */}
        <RecommendationsPanel />

        {/* Operator log */}
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <Eye size={14} className="text-muted-foreground" aria-hidden="true" />
            <p className="text-xs font-semibold text-foreground">Operations Log</p>
            <span className="ml-auto text-[10px] text-muted-foreground">Today</span>
          </div>
          <div className="space-y-2.5" role="log" aria-live="polite" aria-label="Operations log">
            {[
              { time: "16:47", msg: "AI flagged Gate C congestion — alert dispatched to security.", type: "alert"   },
              { time: "16:43", msg: "Medical unit responded to Sector A Row 4.",                   type: "medical" },
              { time: "16:39", msg: "Gate D opened by AI recommendation. Flow improved 22%.",      type: "action"  },
              { time: "16:30", msg: "Halftime wave — 8,200 spectators re-entered within 8 min.",   type: "info"    },
              { time: "16:12", msg: "PA system offline — manual backup activated.",                 type: "warn"    },
            ].map(({ time, msg, type }) => (
              <div key={time + msg} className="flex gap-3 items-start">
                <span className="text-[10px] text-muted-foreground tabular-nums shrink-0 pt-0.5 w-10">{time}</span>
                <div className="flex items-start gap-2 flex-1">
                  <span className={cn("w-1.5 h-1.5 rounded-full shrink-0 mt-1.5",
                    type === "alert"  ? "bg-error"
                    : type === "medical" ? "bg-success"
                    : type === "action"  ? "bg-primary"
                    : type === "warn"    ? "bg-warning"
                    : "bg-muted-foreground"
                  )} aria-hidden="true" />
                  <p className="text-xs text-foreground leading-relaxed">{msg}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom padding */}
        <div className="h-4" />
      </div>
    </div>
  );
}
