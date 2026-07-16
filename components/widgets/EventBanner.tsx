import { TrendingUp, Bot, UtensilsCrossed } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { Button } from "../ui/button";
import { LiveBadge } from "../ui/live-badge";

export interface ChartPoint {
  t: string;
  v: number;
}

interface EventBannerProps {
  title: string;
  location: string;
  attendance: number;
  capacity: number;
  chartData: ChartPoint[];
  onAskAI?: () => void;
  onOrderFood?: () => void;
}

export function EventBanner({
  title,
  location,
  attendance,
  capacity,
  chartData,
  onAskAI,
  onOrderFood,
}: EventBannerProps) {
  const pct = Math.round((attendance / capacity) * 100);

  return (
    <div className="bg-gradient-to-r from-sidebar to-sidebar/90 rounded-xl p-4 md:p-5 border border-white/5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <LiveBadge className="mb-2" />
          <h2 className="font-bold text-base text-sidebar-foreground mt-1">{title}</h2>
          <p className="text-sidebar-accent-foreground/60 text-xs mt-0.5">{location}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sidebar-accent-foreground/60 text-[11px]">Attendance</p>
          <p className="text-sidebar-foreground font-bold text-lg tabular-nums">
            {attendance.toLocaleString()}
          </p>
          <div className="flex items-center gap-1 justify-end">
            <TrendingUp size={10} className="text-success" aria-hidden="true" />
            <span className="text-success text-[11px] font-semibold">{pct}%</span>
          </div>
        </div>
      </div>

      {/*
        RECHARTS v3 MIGRATION: Wrapped ResponsiveContainer in a parent div with
        explicit height (36px) and set ResponsiveContainer to 100% height to avoid warnings.
      */}
      <div className="mt-3 h-[36px] w-full" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="eventBannerGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="var(--color-primary)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}    />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="v"
              stroke="var(--color-primary)"
              strokeWidth={1.5}
              fill="url(#eventBannerGrad)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex gap-2 mt-3">
        {onAskAI && (
          <Button
            size="sm"
            variant="outline"
            className="border-white/20 text-sidebar-foreground bg-white/10 hover:bg-white/20 hover:text-sidebar-foreground"
            onClick={onAskAI}
          >
            <Bot size={13} aria-hidden="true" /> Ask AI
          </Button>
        )}
        {onOrderFood && (
          <Button
            size="sm"
            variant="outline"
            className="border-white/20 text-sidebar-foreground bg-white/10 hover:bg-white/20 hover:text-sidebar-foreground"
            onClick={onOrderFood}
          >
            <UtensilsCrossed size={13} aria-hidden="true" /> Order Food
          </Button>
        )}
      </div>
    </div>
  );
}
