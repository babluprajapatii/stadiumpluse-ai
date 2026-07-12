"use client";

import { Bell, MapPin, AlertTriangle, CheckCircle, Users, Wifi, ClipboardList } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { StatCard } from "../ui/stat-card";
import { Surface } from "../shared/Surface";
import { SectionHeading } from "../shared/SectionHeading";
import { BottomNav } from "../shared/BottomNav";
import { StadiumMap } from "../stadium-map";
import { EmergencyTrigger } from "../emergency-mode";
import { useApp } from "@/providers/AppContext";

export function SecurityDashboard() {
  const { setEmergency } = useApp();

  return (
    <div className="bg-background min-h-full flex flex-col">
      <div className="bg-sidebar px-4 pt-10 pb-4 shrink-0">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <div>
            <p className="text-[10px] text-sidebar-accent-foreground/60 mb-0.5">Security Operations · FIFA WC 2026</p>
            <h1 className="font-bold text-lg text-sidebar-foreground">Cpl. Torres</h1>
          </div>
          <div className="flex items-center gap-2">
            <EmergencyTrigger onClick={() => setEmergency(true)} />
            <Badge variant="live">
              <span className="w-1.5 h-1.5 rounded-full bg-success motion-safe:animate-pulse" aria-hidden="true" />
              On Post
            </Badge>
            <button
              className="relative p-2 rounded-lg text-sidebar-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              aria-label="Notifications"
            >
              <Bell size={18} aria-hidden="true" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5 max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-3 gap-3">
          <StatCard value="2"   label="Active Alerts"   variant="error"   icon={AlertTriangle} />
          <StatCard value="14"  label="Resolved Today"  variant="success" icon={CheckCircle} />
          <StatCard value="47K" unit="pax" label="Monitored"             icon={Users} />
        </div>
        <div>
          <SectionHeading action={<Badge variant="error-soft">2 open</Badge>}>
            Active Incidents
          </SectionHeading>
          <div className="space-y-2.5">
            {[
              { id: "INC-047", type: "Crowd Surge",    loc: "Gate C · North Wing", pri: "HIGH" as const },
              { id: "INC-046", type: "Medical Assist", loc: "Sector A · Row 4",    pri: "MED"  as const },
            ].map(({ id, type, loc, pri }) => (
              <Surface key={id} className="border-l-4 border-l-error">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="font-semibold text-sm text-foreground">{type}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin size={10} aria-hidden="true" />{loc}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{id}</p>
                  </div>
                  <Badge variant={pri === "HIGH" ? "error-soft" : "warning"}>{pri}</Badge>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="destructive" className="gap-1.5 flex-1">
                    <Users size={13} aria-hidden="true" />Dispatch
                  </Button>
                  <Button size="sm" variant="outline">Resolve</Button>
                </div>
              </Surface>
            ))}
          </div>
        </div>
        <StadiumMap />
        <div className="grid md:grid-cols-2 gap-3">
          <Button variant="destructive" className="gap-1.5" onClick={() => setEmergency(true)}>
            <AlertTriangle size={14} aria-hidden="true" />Emergency Mode
          </Button>
          <Button variant="outline" className="gap-1.5">
            <Wifi size={14} aria-hidden="true" />Dispatch Radio
          </Button>
        </div>
      </div>
      <BottomNav items={[{ label: "Alerts", Icon: AlertTriangle }, { label: "Map", Icon: MapPin }, { label: "Personnel", Icon: Users }, { label: "Reports", Icon: ClipboardList }]} />
    </div>
  );
}
