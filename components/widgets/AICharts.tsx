"use client";

import React from "react";
import {
  AreaChart, Area, ResponsiveContainer, Tooltip,
  PieChart, Pie, Cell,
} from "recharts";
import { Activity } from "lucide-react";

// ─── Crowd flow sparkline data ────────────────────────────────────────────────

const crowdFlowData = [
  { t: "14:00", v: 12000 }, { t: "14:30", v: 18000 }, { t: "15:00", v: 31000 },
  { t: "15:30", v: 40000 }, { t: "16:00", v: 45000 }, { t: "16:30", v: 47300 },
  { t: "17:00", v: 47300 },
];

const gateData = [
  { name: "A", value: 62, color: "var(--color-success)" },
  { name: "B", value: 91, color: "var(--color-warning)" },
  { name: "C", value: 98, color: "var(--color-error)"   },
  { name: "D", value: 34, color: "var(--color-success)" },
];

export function CrowdFlowChart() {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs font-semibold text-foreground">Crowd Flow — Today</p>
          <p className="text-[10px] text-muted-foreground">Entry count by 30-min window</p>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <Activity size={11} className="text-primary" aria-hidden="true" />
          <span className="font-semibold text-primary">47,300 now</span>
        </div>
      </div>
      <div className="h-[72px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={crowdFlowData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="crowdGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="v" stroke="var(--color-primary)" strokeWidth={2}
              fill="url(#crowdGrad)" dot={false} />
            <Tooltip
              contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "8px", fontSize: "11px", color: "var(--color-foreground)" }}
              formatter={(value: unknown) => {
                if (typeof value === "number") {
                  return [value.toLocaleString(), "Attendees"];
                }
                if (typeof value === "string") {
                  const parsed = Number(value);
                  return [isNaN(parsed) ? value : parsed.toLocaleString(), "Attendees"];
                }
                return ["-", "Attendees"];
              }}
              labelStyle={{ color: "var(--color-muted-foreground)", fontSize: "10px" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function GateDonut() {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <p className="text-xs font-semibold text-foreground mb-1">Gate Utilisation</p>
      <p className="text-[10px] text-muted-foreground mb-3">% capacity per gate</p>
      <div className="flex items-center gap-4">
        <div className="relative w-20 h-20 shrink-0">
          {/*
            RECHARTS v3 MIGRATION: Fixed size chart (80x80) should not be wrapped
            in a ResponsiveContainer to avoid "width and height are fixed numbers" warnings.
          */}
          <PieChart width={80} height={80}>
            <Pie data={gateData} cx="50%" cy="50%" innerRadius={24} outerRadius={38}
              dataKey="value" strokeWidth={0}>
              {gateData.map(entry => <Cell key={entry.name} fill={entry.color} />)}
            </Pie>
          </PieChart>
        </div>
        <div className="space-y-1.5 flex-1">
          {gateData.map(({ name, value, color }) => (
            <div key={name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} aria-hidden="true" />
                <span className="text-[11px] text-foreground">Gate {name}</span>
              </div>
              <span className="text-[11px] font-bold tabular-nums" style={{ color }}>{value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
