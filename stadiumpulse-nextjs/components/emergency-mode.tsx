import { useState } from "react";
import {
  AlertTriangle, Phone, MapPin, Navigation, Users,
  Volume2, Radio, X, ChevronRight, Clock, Zap,
} from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "./ui/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

type Severity = "evacuate" | "shelter" | "alert";

interface EmergencyModeProps {
  severity?: Severity;
  onClose: () => void;
}

// ─── Evacuation Map (inline SVG) ─────────────────────────────────────────────

function EvacuationMap({ severity }: { severity: Severity }) {
  const routeColor = severity === "evacuate" ? "#ef4444" : severity === "shelter" ? "#f59e0b" : "#3b82f6";

  return (
    <div
      className="relative h-44 rounded-xl overflow-hidden bg-slate-900 border border-white/10"
      role="img"
      aria-label="Evacuation route map — nearest exit is Gate B, 120 metres north"
    >
      <svg viewBox="0 0 320 176" className="absolute inset-0 w-full h-full" aria-hidden="true">
        {/* Stadium outline */}
        <ellipse cx="160" cy="88" rx="145" ry="80" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
        <ellipse cx="160" cy="88" rx="95"  ry="52" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

        {/* Route to Gate B (north) */}
        <path
          d="M 160 88 L 160 60 L 160 25"
          fill="none"
          stroke={routeColor}
          strokeWidth="3"
          strokeDasharray="8 4"
          strokeLinecap="round"
          opacity={0.9}
        />
        {/* Arrowhead */}
        <polygon
          points={`${160},${14} ${154},${26} ${166},${26}`}
          fill={routeColor}
          opacity={0.9}
        />

        {/* Secondary route to Gate G (SW) */}
        <path
          d="M 160 88 L 100 120 L 70 145"
          fill="none"
          stroke={routeColor}
          strokeWidth="2"
          strokeDasharray="6 4"
          strokeLinecap="round"
          opacity={0.5}
        />

        {/* You are here */}
        <circle cx="160" cy="88" r="8"  fill="white"      />
        <circle cx="160" cy="88" r="4"  fill={routeColor} />
        <circle cx="160" cy="88" r="14" fill="none" stroke={routeColor} strokeWidth="1.5" opacity={0.4} className="motion-safe:animate-ping" style={{transformOrigin:"160px 88px"}} />

        {/* Gate B marker */}
        <circle cx="160" cy="22" r="10" fill={routeColor} />
        <text x="160" y="26" textAnchor="middle" fontSize="9" fill="white" fontWeight="bold" fontFamily="sans-serif">B</text>

        {/* Medical team marker */}
        <rect x="90" y="50" width="18" height="18" rx="3" fill="rgba(34,197,94,0.85)" />
        <text x="99" y="63" textAnchor="middle" fontSize="12" fill="white" fontWeight="bold" fontFamily="sans-serif">+</text>

        {/* Distance label */}
        <text x="178" y="58" fontSize="9" fill={routeColor} fontFamily="sans-serif" fontWeight="bold" opacity="0.9">120m</text>
        <text x="178" y="69" fontSize="8" fill="rgba(255,255,255,0.4)" fontFamily="sans-serif">Gate B</text>
      </svg>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between" aria-hidden="true">
        <div className="flex items-center gap-2 text-[9px] text-white/60">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-white" />
            You
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ background: routeColor }} />
            Exit
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-success" />
            Medical
          </span>
        </div>
        <span className="text-[9px] text-white/40">Tap to navigate</span>
      </div>
    </div>
  );
}

// ─── Live Instructions Feed ───────────────────────────────────────────────────

function LiveInstructions({ severity }: { severity: Severity }) {
  const instructions =
    severity === "evacuate"
      ? [
          "Move calmly to the nearest exit — Gate B is 120m north.",
          "Do NOT use lifts. Use marked stairways only.",
          "Follow green emergency lighting to exit points.",
          "Assist others — wheelchair users use West lift (operational).",
          "Assemble at Car Park C — North Lot. Do not leave the area.",
        ]
      : severity === "shelter"
      ? [
          "Move inside the stadium interior corridors immediately.",
          "Stay away from all outer exits and windows.",
          "Follow staff guidance — do not use mobile phones excessively.",
          "Remain seated until the all-clear is announced.",
        ]
      : [
          "Remain calm and stay in your current position.",
          "Listen for PA announcements for further instructions.",
          "Report any concerns to the nearest staff member.",
          "Emergency services are on-site and responding.",
        ];

  return (
    <div className="space-y-2" role="list" aria-label="Emergency instructions">
      {instructions.map((ins, i) => (
        <div key={i} className="flex gap-3 items-start" role="listitem">
          <span className="w-5 h-5 rounded-full bg-white/10 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
            {i + 1}
          </span>
          <p className="text-sm text-white/90 leading-relaxed">{ins}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Nearest Medical Team card ────────────────────────────────────────────────

function MedicalTeamCard() {
  return (
    <div className="bg-white/10 border border-white/15 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-success/30 rounded-lg flex items-center justify-center">
            <span className="text-success font-bold text-lg leading-none" aria-hidden="true">+</span>
          </div>
          <div>
            <p className="text-xs font-bold text-white">Medical Team Alpha</p>
            <p className="text-[10px] text-white/60">Gate B · 30 metres away</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-success font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-success motion-safe:animate-pulse" aria-hidden="true" />
          On route
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          className="flex-1 gap-1.5 bg-success hover:bg-success/90 text-white border-none"
          aria-label="Contact medical team"
        >
          <Phone size={13} aria-hidden="true" /> Contact Team
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="border-white/20 text-white hover:bg-white/10 gap-1.5"
          aria-label="Get directions to medical team"
        >
          <Navigation size={13} aria-hidden="true" /> Directions
        </Button>
      </div>
    </div>
  );
}

// ─── Main Emergency Mode Overlay ──────────────────────────────────────────────

export function EmergencyMode({ severity = "alert", onClose }: EmergencyModeProps) {
  const [calling, setCalling] = useState(false);

  const config = {
    evacuate: {
      label: "EVACUATE NOW",
      sub: "Immediate evacuation in progress. Remain calm.",
      bg: "from-red-950 via-red-900 to-slate-950",
      banner: "bg-error",
      pulse: true,
    },
    shelter: {
      label: "SHELTER IN PLACE",
      sub: "Move to interior corridors. Await further instructions.",
      bg: "from-amber-950 via-amber-900 to-slate-950",
      banner: "bg-warning",
      pulse: false,
    },
    alert: {
      label: "SECURITY ALERT",
      sub: "Security incident in progress. Stay calm and follow instructions.",
      bg: "from-blue-950 via-blue-900 to-slate-950",
      banner: "bg-primary",
      pulse: false,
    },
  }[severity];

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] bg-gradient-to-b overflow-y-auto",
        config.bg
      )}
      role="alertdialog"
      aria-modal="true"
      aria-label={`Emergency: ${config.label}`}
      aria-live="assertive"
    >
      {/* Emergency banner */}
      <div className={cn("w-full py-3 flex items-center justify-center gap-3", config.banner, config.pulse && "motion-safe:animate-pulse")}>
        <AlertTriangle size={18} className="text-white" aria-hidden="true" />
        <span className="text-sm font-black text-white tracking-widest uppercase">{config.label}</span>
        <AlertTriangle size={18} className="text-white" aria-hidden="true" />
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Radio size={13} className="text-white/60 motion-safe:animate-pulse" aria-hidden="true" />
              <span className="text-[10px] text-white/60 uppercase tracking-widest font-semibold">
                StadiumPulse · Emergency Broadcast
              </span>
            </div>
            <p className="text-white/80 text-sm leading-relaxed">{config.sub}</p>
            <div className="flex items-center gap-2 mt-2 text-[10px] text-white/50">
              <Clock size={10} aria-hidden="true" />
              <span>Issued at 16:47:23 · Updating live</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white shrink-0"
            aria-label="Exit emergency view"
          >
            <X size={15} aria-hidden="true" />
          </button>
        </div>

        {/* One-tap emergency call */}
        <button
          className={cn(
            "w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-white/30 bg-white/10 hover:bg-white/20 transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30 group",
            calling && "animate-pulse"
          )}
          onClick={() => setCalling(true)}
          aria-label="One-tap emergency call to operations centre"
        >
          <div className="w-14 h-14 rounded-full bg-error flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Phone size={24} className="text-white" aria-hidden="true" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-black text-white text-lg leading-tight">
              {calling ? "Connecting…" : "Emergency Call"}
            </p>
            <p className="text-white/60 text-xs mt-0.5">
              {calling ? "Calling Operations Centre +1-800-STADIUM" : "One-tap · Operations Centre · 24/7"}
            </p>
          </div>
          {!calling && <ChevronRight size={20} className="text-white/40 group-hover:text-white transition-colors shrink-0" aria-hidden="true" />}
        </button>

        {/* Evacuation map */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={14} className="text-white/70" aria-hidden="true" />
            <p className="text-xs font-bold text-white">Your Evacuation Route</p>
            <span className="ml-auto text-[10px] text-white/50">Sector B · Row 12 · Seat 7</span>
          </div>
          <EvacuationMap severity={severity} />
        </div>

        {/* Nearest medical */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Zap size={14} className="text-success" aria-hidden="true" />
            <p className="text-xs font-bold text-white">Nearest Medical Team</p>
          </div>
          <MedicalTeamCard />
        </div>

        {/* Live instructions */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <Volume2 size={14} className="text-white/70" aria-hidden="true" />
            <p className="text-xs font-bold text-white">Live Instructions</p>
            <span className="ml-auto flex items-center gap-1 text-[9px] text-success font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-success motion-safe:animate-pulse" aria-hidden="true" />
              Broadcasting
            </span>
          </div>
          <LiveInstructions severity={severity} />
        </div>

        {/* Staff nearby */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users size={14} className="text-white/70" aria-hidden="true" />
            <p className="text-xs font-bold text-white">Nearby Staff</p>
          </div>
          <div className="space-y-2">
            {[
              { name: "Officer M. Torres", role: "Security · 20m", status: "Available" },
              { name: "Nurse A. Patel",    role: "Medical · 35m",  status: "On route" },
              { name: "Vol. J. Kim",       role: "Guide · 12m",    status: "Available" },
            ].map(({ name, role, status }) => (
              <div key={name} className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-white">{name}</p>
                  <p className="text-[10px] text-white/50">{role}</p>
                </div>
                <span className={cn("text-[10px] font-semibold",
                  status === "Available" ? "text-success" : "text-warning")}>
                  {status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full border-white/20 text-white hover:bg-white/10 gap-2"
          onClick={onClose}
        >
          <X size={14} aria-hidden="true" /> Exit Emergency View
        </Button>

        <p className="text-center text-[10px] text-white/30">
          StadiumPulse AI Emergency System · Powered by real-time sensor data
        </p>
      </div>
    </div>
  );
}

// ─── Emergency Trigger Button ─────────────────────────────────────────────────

export function EmergencyTrigger({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-1.5 bg-error/15 hover:bg-error/25 border border-error/30 rounded-lg text-error text-[11px] font-bold uppercase tracking-wide transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error"
      aria-label="Activate emergency mode"
    >
      <AlertTriangle size={13} className="motion-safe:animate-pulse" aria-hidden="true" />
      Emergency
    </button>
  );
}
