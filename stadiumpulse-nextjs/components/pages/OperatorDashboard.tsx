import { Bell, AlertTriangle, Activity, Wifi, CheckCircle, Users, Settings, ClipboardList, Zap } from "lucide-react";
import { StatCard } from "../ui/stat-card";
import { cn } from "../ui/utils";
import { Surface } from "../shared/Surface";
import { SectionHeading } from "../shared/SectionHeading";
import { MobileHeader } from "../shared/MobileHeader";
import { BottomNav } from "../shared/BottomNav";
import { StadiumMap } from "../stadium-map";
import { EmptyIncidents } from "../states";

export function OperatorDashboard() {
  return (
    <div className="bg-background min-h-full flex flex-col">
      <MobileHeader
        title="David Chen"
        subtitle="Facility Operations"
        right={
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-muted transition-colors" aria-label="Alerts">
              <AlertTriangle size={18} className="text-warning" aria-hidden="true" />
            </button>
            <button className="p-2 rounded-lg hover:bg-muted transition-colors" aria-label="Notifications">
              <Bell size={18} className="text-muted-foreground" aria-hidden="true" />
            </button>
          </div>
        }
      />
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5 max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard value="91%"   label="Capacity" variant="warning" icon={Users} />
          <StatCard value="99.8%" label="Uptime"   variant="success" icon={Activity} />
          <StatCard value="3"     label="Alerts"   variant="error"   icon={AlertTriangle} />
          <StatCard value="8/8"   label="HVAC Zones" variant="success" icon={Wifi} />
        </div>
        <div>
          <SectionHeading>System Status</SectionHeading>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "HVAC",       status: "Optimal",    Icon: Activity,    v: "success" as const, dot: "bg-success" },
              { label: "Power Grid", status: "Warning",    Icon: Zap,         v: "warning" as const, dot: "bg-warning" },
              { label: "Network",    status: "Optimal",    Icon: Wifi,        v: "success" as const, dot: "bg-success" },
              { label: "Gates",      status: "3 / 8 Open", Icon: CheckCircle, v: "default" as const, dot: "bg-primary" },
            ].map(({ label, status, Icon, v, dot }) => (
              <Surface key={label} className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    v === "success" ? "bg-success-muted" : v === "warning" ? "bg-warning-muted" : "bg-primary/10"
                  )}
                >
                  <Icon
                    size={18}
                    className={v === "success" ? "text-success" : v === "warning" ? "text-warning" : "text-primary"}
                    aria-hidden="true"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">{label}</p>
                  <p className={cn("text-sm font-semibold mt-0.5", v === "success" ? "text-success" : v === "warning" ? "text-warning" : "text-foreground")}>
                    {status}
                  </p>
                </div>
                <span className={cn("w-2 h-2 rounded-full shrink-0", dot)} aria-hidden="true" />
              </Surface>
            ))}
          </div>
        </div>
        <StadiumMap compact />
        <EmptyIncidents />
      </div>
      <BottomNav items={[{ label: "Status", Icon: Activity }, { label: "Crowd", Icon: Users }, { label: "Maintain", Icon: Settings }, { label: "Logs", Icon: ClipboardList }]} />
    </div>
  );
}
