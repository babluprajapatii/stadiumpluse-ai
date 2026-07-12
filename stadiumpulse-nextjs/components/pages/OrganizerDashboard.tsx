"use client";

import { useState } from "react";
import { Bell, Plus, Calendar, CheckCircle, ClipboardList, Users, Settings, BarChart3 } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { StatCard } from "../ui/stat-card";
import { Checkbox } from "../ui/checkbox";
import { cn } from "../ui/utils";
import { Surface } from "../shared/Surface";
import { MobileHeader } from "../shared/MobileHeader";
import { BottomNav } from "../shared/BottomNav";
import { RevenueChart } from "../widgets/RevenueChartWrapper";

export function OrganizerDashboard() {
  const [tasks, setTasks] = useState([
    { id: "t1", task: "Confirm sponsor banners for Dec 14", due: "Dec 12", done: false },
    { id: "t2", task: "Review volunteer roster for Gate C",  due: "Dec 13", done: false },
    { id: "t3", task: "Upload setlist for NYE Concert",      due: "Dec 15", done: true  },
  ]);

  return (
    <div className="bg-background min-h-full flex flex-col">
      <MobileHeader
        title="Priya Mehta"
        subtitle="Organizer Portal"
        right={
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-muted transition-colors" aria-label="Notifications">
              <Bell size={18} className="text-muted-foreground" aria-hidden="true" />
            </button>
            <Button size="sm" className="gap-1.5">
              <Plus size={13} aria-hidden="true" />New Event
            </Button>
          </div>
        }
      />
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5 max-w-2xl mx-auto w-full">
        <div className="grid grid-cols-3 gap-3">
          <StatCard value="3" label="Upcoming" icon={Calendar} />
          <StatCard value="1" label="Sold Out"  variant="success" icon={CheckCircle} />
          <StatCard value="2" label="Draft"     variant="warning" icon={ClipboardList} />
        </div>
        <Surface>
          <div className="flex items-center justify-between mb-1">
            <p className="font-semibold text-sm text-foreground">Revenue — December</p>
            <Badge variant="success">↑ 14%</Badge>
          </div>
          <div className="flex items-baseline gap-1.5 mb-4">
            <span className="text-3xl font-bold text-foreground tabular-nums">$284,500</span>
          </div>
          <RevenueChart />
        </Surface>
        <Surface>
          <p className="font-semibold text-sm text-foreground mb-4">Open Tasks</p>
          <div className="space-y-3">
            {tasks.map(({ id, task, due, done }) => (
              <div key={id} className="flex items-start gap-3">
                <Checkbox
                  id={id}
                  checked={done}
                  onCheckedChange={v => setTasks(ts => ts.map(t => t.id === id ? { ...t, done: !!v } : t))}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <label
                    htmlFor={id}
                    className={cn("text-sm cursor-pointer", done ? "line-through text-muted-foreground" : "text-foreground")}
                  >
                    {task}
                  </label>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Due {due}</p>
                </div>
              </div>
            ))}
          </div>
        </Surface>
      </div>
      <BottomNav items={[{ label: "Events", Icon: Calendar }, { label: "Analytics", Icon: BarChart3 }, { label: "Team", Icon: Users }, { label: "Settings", Icon: Settings }]} />
    </div>
  );
}
