"use client";

import Link from "next/link";
import {
  Search, Star, Ticket, User, ArrowRight,
  TrendingUp, Home, UtensilsCrossed, MapPin, Bot, Accessibility,
} from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { StatCard } from "../ui/stat-card";
import { LiveBadge } from "../ui/live-badge";
import { Surface } from "../shared/Surface";
import { SectionHeading } from "../shared/SectionHeading";
import { MobileHeader } from "../shared/MobileHeader";
import { BottomNav } from "../shared/BottomNav";

import dynamic from "next/dynamic";

const AttendanceChart = dynamic(() => import("../widgets/AttendanceChartWrapper").then((mod) => mod.AttendanceChart), {
  ssr: false,
  loading: () => <div className="h-[200px] w-full bg-card/50 animate-pulse rounded-xl" />
});

export function FanDashboard() {

  return (
    <div className="bg-background min-h-full flex flex-col">
      <MobileHeader
        title="Jamie O."
        subtitle="Good evening,"
      />

      <div className="flex-1 overflow-y-auto">

          <div className="px-4 lg:px-6 py-5 space-y-6 max-w-2xl lg:max-w-none mx-auto">
            <div className="bg-gradient-to-r from-sidebar to-sidebar/90 rounded-xl p-4 md:p-5 border border-white/5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <LiveBadge className="mb-2" />
                  <h2 className="font-bold text-base text-white mt-1">Champions Final 2024</h2>
                  <p className="text-sidebar-accent-foreground/60 text-xs mt-0.5">Sector B · Row 12 · Seat 7</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sidebar-accent-foreground/60 text-[10px]">Attendance</p>
                  <p className="text-white font-bold text-lg tabular-nums">47,300</p>
                  <div className="flex items-center gap-1 justify-end">
                    <TrendingUp size={10} className="text-success" aria-hidden="true" />
                    <span className="text-success text-[10px] font-semibold">91%</span>
                  </div>
                </div>
              </div>
              <div className="mt-3" aria-hidden="true">
                <AttendanceChart />
              </div>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" className="border-white/20 text-white bg-white/10 hover:bg-white/20 hover:text-white" asChild>
                  <Link href="/ai">Ask AI</Link>
                </Button>
                <Button size="sm" variant="outline" className="border-white/20 text-white bg-white/10 hover:bg-white/20 hover:text-white" asChild>
                  <Link href="/feature">Order Food</Link>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard value="4,820" label="Reward Points" variant="default" icon={Star} />
              <StatCard value="2"     label="Active Tickets" variant="success" icon={Ticket} />
              <StatCard value="4 min" label="Food Queue"     variant="warning" icon={UtensilsCrossed} />
              <StatCard value="Gold"  label="Fan Tier"        icon={Star} variant="default" />
            </div>

            <div>
              <SectionHeading>Quick Access</SectionHeading>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { Icon: Bot,             label: "Ask AI",  to: "ai"          as const },
                  { Icon: UtensilsCrossed, label: "Food",    to: "feature"     as const },
                  { Icon: MapPin,          label: "Map",     to: null               },
                  { Icon: Accessibility,   label: "Access",  to: "accessibility" as const },
                ].map(({ Icon, label, to }) => {
                  const content = (
                    <>
                      <div className="w-14 h-14 bg-card border border-border rounded-xl flex items-center justify-center group-hover:border-primary/30 group-hover:bg-primary/5 transition-all">
                        <Icon size={20} className="text-muted-foreground group-hover:text-primary transition-colors" aria-hidden="true" />
                      </div>
                      <span className="text-[10px] text-muted-foreground font-medium">{label}</span>
                    </>
                  );

                  if (to) {
                    return (
                      <Link
                        key={label}
                        href={`/${to}`}
                        aria-label={label}
                        className="flex flex-col items-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
                      >
                        {content}
                      </Link>
                    );
                  }

                  return (
                    <button
                      key={label}
                      aria-label={label}
                      disabled
                      className="flex flex-col items-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl opacity-60 cursor-not-allowed"
                    >
                      {content}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <SectionHeading action={<Button variant="ghost" size="sm" className="text-xs h-7 px-2">See all</Button>}>
                My Tickets
              </SectionHeading>
              <div className="space-y-2.5">
                {[
                  { event: "City FC vs United",  date: "Sat Dec 14 · 3:00 PM", seat: "Sec A · Row 3 · Seat 22", s: "Confirmed" as const },
                  { event: "Rugby Grand Final",  date: "Sun Dec 22 · 6:00 PM", seat: "Sec C · Row 8 · Seat 11", s: "Pending"   as const },
                ].map(({ event, date, seat, s }) => (
                  <Surface key={event} className="flex gap-3 items-center">
                    <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                      <Ticket size={18} className="text-primary" aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">{event}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{date}</p>
                      <p className="text-xs text-muted-foreground">{seat}</p>
                    </div>
                    <Badge variant={s === "Confirmed" ? "success" : "warning"}>{s}</Badge>
                  </Surface>
                ))}
              </div>
            </div>

            <Surface>
              <div className="flex items-center justify-between mb-3">
                <p className="font-semibold text-sm text-foreground">Fan Rewards</p>
                <Badge variant="warning">Gold Tier</Badge>
              </div>
              <div className="flex items-baseline gap-1.5 mb-2.5">
                <span className="text-3xl font-bold text-foreground tabular-nums">4,820</span>
                <span className="text-sm text-muted-foreground">pts</span>
                <span className="ml-auto flex items-center gap-1 text-xs text-success font-semibold">
                  <TrendingUp size={12} aria-hidden="true" />+120 today
                </span>
              </div>
              <Progress value={68} className="h-1.5 [&>div]:bg-warning mb-2" />
              <p className="text-[11px] text-muted-foreground">680 pts until Platinum</p>
            </Surface>

            <Link
              href="/ai"
              className="w-full flex items-center gap-3 bg-primary/5 border border-primary/20 hover:border-primary/40 hover:bg-primary/10 rounded-xl px-4 py-3.5 transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-left"
            >
              <div className="w-9 h-9 bg-primary/15 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary/25 transition-colors">
                <Bot size={17} className="text-primary" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">Ask Pulse AI anything</p>
                <p className="text-xs text-muted-foreground">Food queues, parking, wayfinding…</p>
              </div>
              <ArrowRight size={15} className="text-muted-foreground group-hover:text-primary transition-colors shrink-0" aria-hidden="true" />
            </Link>
          </div>
        </div>
      <BottomNav items={[{ label: "Home", Icon: Home }, { label: "Tickets", Icon: Ticket }, { label: "Explore", Icon: Search }, { label: "Profile", Icon: User }]} />
    </div>
  );
}
