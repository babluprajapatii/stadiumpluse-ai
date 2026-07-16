"use client";

import { useState } from "react";
import {
  Users, Shield, Stethoscope, Utensils, Accessibility,
  AlertTriangle, Navigation, Eye, EyeOff,
} from "lucide-react";
import { Badge } from "./ui/badge";
import { LiveBadge } from "./ui/live-badge";
import { cn } from "./ui/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

type Layer = "crowd" | "gates" | "medical" | "volunteers" | "emergency" | "access" | "food" | "restrooms";

const LAYERS: { id: Layer; label: string; Icon: React.ElementType; color: string }[] = [
  { id: "crowd",      label: "Crowd Density",    Icon: Users,        color: "bg-orange-500" },
  { id: "gates",      label: "Gates",            Icon: Shield,       color: "bg-primary" },
  { id: "medical",    label: "Medical",          Icon: Stethoscope,  color: "bg-success" },
  { id: "volunteers", label: "Volunteers",       Icon: Users,        color: "bg-purple-500" },
  { id: "emergency",  label: "Emergency Routes", Icon: AlertTriangle,color: "bg-error" },
  { id: "access",     label: "Accessible Routes",Icon: Accessibility,color: "bg-sky-500" },
  { id: "food",       label: "Food Courts",      Icon: Utensils,     color: "bg-amber-500" },
  { id: "restrooms",  label: "Restrooms",        Icon: Navigation,   color: "bg-slate-500" },
];

// ─── Stadium Map SVG ──────────────────────────────────────────────────────────
// ViewBox 600 × 400. Coordinate system:
//   Centre pitch:   cx=300, cy=200
//   Outer oval:     rx=270, ry=185
//   Stand inner:    rx=200, ry=135

function StadiumSVG({ layers }: { layers: Set<Layer> }) {
  return (
    <svg
      viewBox="0 0 600 400"
      className="w-full h-full"
      aria-label="Live stadium map"
      role="img"
    >
      {/* ── Background ───────────────────────────────────────────────── */}
      <rect width="600" height="400" fill="#0f172a" rx="12" />

      {/* ── Pitch ────────────────────────────────────────────────────── */}
      <rect x="120" y="95" width="360" height="210" rx="4" fill="#166534" stroke="#15803d" strokeWidth="1.5" />
      {/* Centre circle */}
      <circle cx="300" cy="200" r="40" fill="none" stroke="#15803d" strokeWidth="1.5" />
      <circle cx="300" cy="200" r="3"  fill="#15803d" />
      {/* Centre line */}
      <line x1="300" y1="95" x2="300" y2="305" stroke="#15803d" strokeWidth="1.5" />
      {/* Penalty boxes */}
      <rect x="120" y="148" width="60"  height="104" fill="none" stroke="#15803d" strokeWidth="1" />
      <rect x="420" y="148" width="60"  height="104" fill="none" stroke="#15803d" strokeWidth="1" />
      <rect x="120" y="168" width="25"  height="64"  fill="none" stroke="#15803d" strokeWidth="1" />
      <rect x="455" y="168" width="25"  height="64"  fill="none" stroke="#15803d" strokeWidth="1" />

      {/* ── Stands (outer oval) ───────────────────────────────────────── */}
      <ellipse cx="300" cy="200" rx="270" ry="185" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

      {/* ── Crowd Density heatmap ─────────────────────────────────────── */}
      {layers.has("crowd") && <>
        {/* North stand — HIGH */}
        <ellipse cx="300" cy="52"  rx="190" ry="40" fill="rgba(239,68,68,0.45)"  />
        {/* South stand — HIGH */}
        <ellipse cx="300" cy="348" rx="190" ry="40" fill="rgba(245,158,11,0.40)" />
        {/* East stand — MED */}
        <ellipse cx="542" cy="200" rx="45"  ry="130" fill="rgba(37,99,235,0.30)" />
        {/* West stand — LOW */}
        <ellipse cx="58"  cy="200" rx="45"  ry="130" fill="rgba(34,197,94,0.25)" />
        {/* Legend hint */}
        <text x="16" y="390" fontSize="8" fill="rgba(255,255,255,0.4)" fontFamily="sans-serif">
          Crowd density heatmap
        </text>
      </>}

      {/* ── Gates ────────────────────────────────────────────────────── */}
      {layers.has("gates") && <>
        {/* Gate A — North-West — open */}
        <GateMarker cx={148} cy={58}  label="A" open={true}  />
        {/* Gate B — North — open */}
        <GateMarker cx={300} cy={22}  label="B" open={true}  />
        {/* Gate C — North-East — CONGESTED */}
        <GateMarker cx={452} cy={58}  label="C" open={true}  warn />
        {/* Gate D — East — closed */}
        <GateMarker cx={570} cy={200} label="D" open={false} />
        {/* Gate E — South-East — open */}
        <GateMarker cx={452} cy={342} label="E" open={true}  />
        {/* Gate F — South — open */}
        <GateMarker cx={300} cy={378} label="F" open={true}  />
        {/* Gate G — South-West — open */}
        <GateMarker cx={148} cy={342} label="G" open={true}  />
        {/* Gate H — West — open */}
        <GateMarker cx={30}  cy={200} label="H" open={true}  />
      </>}

      {/* ── Medical stations ─────────────────────────────────────────── */}
      {layers.has("medical") && <>
        <MedicalMarker cx={110} cy={130} active />
        <MedicalMarker cx={490} cy={130} active={false} />
        <MedicalMarker cx={300} cy={370} active={false} />
        <MedicalMarker cx={110} cy={270} active={false} />
      </>}

      {/* ── Volunteer positions ───────────────────────────────────────── */}
      {layers.has("volunteers") && <>
        <VolunteerMarker cx={200} cy={65}  />
        <VolunteerMarker cx={400} cy={65}  />
        <VolunteerMarker cx={520} cy={160} />
        <VolunteerMarker cx={520} cy={240} />
        <VolunteerMarker cx={200} cy={335} />
        <VolunteerMarker cx={400} cy={335} />
        <VolunteerMarker cx={80}  cy={160} />
        <VolunteerMarker cx={80}  cy={240} />
      </>}

      {/* ── Emergency evacuation routes ───────────────────────────────── */}
      {layers.has("emergency") && <>
        {/* Arrows along outer corridors */}
        <RouteArrow x1={300} y1={50}  x2={300} y2={25}  color="#ef4444" />
        <RouteArrow x1={540} y1={200} x2={570} y2={200} color="#ef4444" />
        <RouteArrow x1={300} y1={350} x2={300} y2={375} color="#ef4444" />
        <RouteArrow x1={60}  y1={200} x2={30}  y2={200} color="#ef4444" />
        {/* Emergency route lines */}
        <path d="M 300 95 L 300 50 L 148 50 L 148 25" fill="none" stroke="rgba(239,68,68,0.5)" strokeWidth="2" strokeDasharray="4 3" />
        <path d="M 480 200 L 542 200" fill="none" stroke="rgba(239,68,68,0.5)" strokeWidth="2" strokeDasharray="4 3" />
        <text x="8" y="390" fontSize="8" fill="rgba(239,68,68,0.7)" fontFamily="sans-serif">
          Evacuation routes
        </text>
      </>}

      {/* ── Accessible routes ─────────────────────────────────────────── */}
      {layers.has("access") && <>
        <path d="M 30 200 L 110 200 L 120 130" fill="none" stroke="rgba(56,189,248,0.6)" strokeWidth="3" strokeDasharray="6 3" strokeLinecap="round" />
        <path d="M 570 200 L 490 200 L 480 130" fill="none" stroke="rgba(56,189,248,0.6)" strokeWidth="3" strokeDasharray="6 3" strokeLinecap="round" />
        <path d="M 300 378 L 300 340" fill="none" stroke="rgba(56,189,248,0.6)" strokeWidth="3" strokeDasharray="6 3" strokeLinecap="round" />
        {/* Lifts */}
        <LiftMarker cx={58}  cy={200} />
        <LiftMarker cx={542} cy={200} />
        <LiftMarker cx={300} cy={22}  />
      </>}

      {/* ── Food courts ───────────────────────────────────────────────── */}
      {layers.has("food") && <>
        <FoodMarker cx={195} cy={50}  label="1" />
        <FoodMarker cx={405} cy={50}  label="2" />
        <FoodMarker cx={195} cy={350} label="3" />
        <FoodMarker cx={405} cy={350} label="4" />
        <FoodMarker cx={550} cy={170} label="5" />
        <FoodMarker cx={50}  cy={170} label="6" />
        <FoodMarker cx={50}  cy={230} label="7" />
      </>}

      {/* ── Restrooms ────────────────────────────────────────────────── */}
      {layers.has("restrooms") && <>
        <RestroomMarker cx={160} cy={100} />
        <RestroomMarker cx={440} cy={100} />
        <RestroomMarker cx={160} cy={300} />
        <RestroomMarker cx={440} cy={300} />
        <RestroomMarker cx={550} cy={200} />
        <RestroomMarker cx={50}  cy={200} />
      </>}

      {/* ── You are here ─────────────────────────────────────────────── */}
      <circle cx="300" cy="65" r="6"  fill="white" />
      <circle cx="300" cy="65" r="3"  fill="#2563eb" />
      <circle cx="300" cy="65" r="10" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" className="motion-safe:animate-ping" style={{transformOrigin:"300px 65px"}} />
    </svg>
  );
}

// ─── Map Markers ─────────────────────────────────────────────────────────────

function GateMarker({ cx, cy, label, open, warn }: { cx: number; cy: number; label: string; open: boolean; warn?: boolean }) {
  const fill = !open ? "#64748b" : warn ? "#ef4444" : "#22c55e";
  return (
    <g>
      <circle cx={cx} cy={cy} r="14" fill={fill} fillOpacity={0.25} />
      <circle cx={cx} cy={cy} r="9"  fill={fill} />
      <text x={cx} y={cy + 3.5} textAnchor="middle" fontSize="8" fill="white" fontWeight="bold" fontFamily="sans-serif">{label}</text>
      {warn && <circle cx={cx} cy={cy} r="14" fill="none" stroke="#ef4444" strokeWidth="1.5" className="motion-safe:animate-ping" style={{transformOrigin:`${cx}px ${cy}px`}} />}
    </g>
  );
}

function MedicalMarker({ cx, cy, active }: { cx: number; cy: number; active: boolean }) {
  return (
    <g>
      <rect x={cx - 9} y={cy - 9} width="18" height="18" rx="4" fill={active ? "rgba(34,197,94,0.8)" : "rgba(100,116,139,0.6)"} />
      <text x={cx} y={cy + 4.5} textAnchor="middle" fontSize="12" fill="white" fontWeight="bold" fontFamily="sans-serif">+</text>
      {active && <circle cx={cx + 7} cy={cy - 7} r="4" fill="#22c55e" />}
    </g>
  );
}

function VolunteerMarker({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r="8" fill="rgba(168,85,247,0.8)" />
      <text x={cx} y={cy + 3} textAnchor="middle" fontSize="8" fill="white" fontWeight="bold" fontFamily="sans-serif">V</text>
    </g>
  );
}

function LiftMarker({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <rect x={cx - 8} y={cy - 8} width="16" height="16" rx="3" fill="rgba(56,189,248,0.85)" />
      <text x={cx} y={cy + 4} textAnchor="middle" fontSize="9" fill="white" fontWeight="bold" fontFamily="sans-serif">L</text>
    </g>
  );
}

function FoodMarker({ cx, cy, label }: { cx: number; cy: number; label: string }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r="9" fill="rgba(245,158,11,0.85)" />
      <text x={cx} y={cy + 3.5} textAnchor="middle" fontSize="8" fill="white" fontWeight="bold" fontFamily="sans-serif">{label}</text>
    </g>
  );
}

function RestroomMarker({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <rect x={cx - 8} y={cy - 8} width="16" height="16" rx="3" fill="rgba(100,116,139,0.8)" />
      <text x={cx} y={cy + 4} textAnchor="middle" fontSize="9" fill="white" fontWeight="bold" fontFamily="sans-serif">R</text>
    </g>
  );
}

function RouteArrow({ x1, y1, x2, y2, color }: { x1: number; y1: number; x2: number; y2: number; color: string }) {
  return (
    <line x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={color} strokeWidth="2.5" strokeLinecap="round"
      markerEnd="url(#arrow)" opacity={0.8} />
  );
}

// ─── Layer Toggle Button ──────────────────────────────────────────────────────

function LayerBtn({
  layer, active, onToggle,
}: { layer: typeof LAYERS[number]; active: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      aria-pressed={active}
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active
          ? "bg-card border-primary/30 text-foreground"
          : "bg-muted border-border text-muted-foreground hover:text-foreground hover:border-border/80"
      )}
    >
      <span className={cn("w-2 h-2 rounded-full shrink-0", layer.color, !active && "opacity-40")} aria-hidden="true" />
      {layer.label}
      {active ? <Eye size={10} aria-hidden="true" /> : <EyeOff size={10} aria-hidden="true" />}
    </button>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function StadiumMap({ compact = false }: { compact?: boolean }) {
  const [activeLayers, setActiveLayers] = useState<Set<Layer>>(
    new Set(["crowd", "gates", "medical"])
  );

  function toggleLayer(id: Layer) {
    setActiveLayers(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-sm text-foreground">Live Stadium Map</p>
          <LiveBadge />
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-white" aria-hidden="true" />
          You are here
        </div>
      </div>

      {/* Layer toggles */}
      {!compact && (
        <div className="px-4 py-3 border-b border-border bg-muted/30">
          <div className="flex flex-wrap gap-1.5">
            {LAYERS.map(layer => (
              <LayerBtn
                key={layer.id}
                layer={layer}
                active={activeLayers.has(layer.id)}
                onToggle={() => toggleLayer(layer.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Map */}
      <div className={cn("relative", compact ? "h-52" : "h-72 md:h-96")}>
        <StadiumSVG layers={activeLayers} />
      </div>

      {/* Status bar */}
      <div className="px-4 py-3 border-t border-border bg-muted/20">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
          {/* Gate summary */}
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-error motion-safe:animate-pulse" aria-hidden="true" />
            <span className="text-[10px] text-foreground font-medium">Gate C — Congested</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-success" aria-hidden="true" />
            <span className="text-[10px] text-foreground font-medium">6 gates open</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-muted-foreground" aria-hidden="true" />
            <span className="text-[10px] text-muted-foreground">Gate D closed</span>
          </div>
          <div className="ml-auto">
            <Badge variant="default" className="text-[9px]">47,300 / 52,000</Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
