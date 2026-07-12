import { Bell, Clock, MapPin, CheckCircle, Users, Home, Calendar, User } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Surface } from "../shared/Surface";
import { SectionHeading } from "../shared/SectionHeading";
import { MobileHeader } from "../shared/MobileHeader";
import { BottomNav } from "../shared/BottomNav";
import { EmptyTasks } from "../states";

export function VolunteerDashboard() {
  return (
    <div className="bg-background min-h-full flex flex-col">
      <MobileHeader
        title="Sam Rivera"
        subtitle="Volunteer Portal"
        right={
          <div className="flex items-center gap-2">
            <Badge variant="live">
              <span className="w-1.5 h-1.5 rounded-full bg-success motion-safe:animate-pulse" aria-hidden="true" />
              On Duty
            </Badge>
            <button className="p-2 rounded-lg hover:bg-muted transition-colors" aria-label="Notifications">
              <Bell size={18} className="text-muted-foreground" aria-hidden="true" />
            </button>
          </div>
        }
      />
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5 max-w-2xl mx-auto w-full">
        <Surface className="border-l-4 border-l-primary bg-primary/5 border-primary/20">
          <p className="text-[10px] text-primary uppercase tracking-widest font-semibold mb-2">Active Assignment</p>
          <h2 className="font-bold text-base text-foreground">Gate B — Entry Coordination</h2>
          <div className="flex flex-wrap gap-4 mt-2">
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock size={12} aria-hidden="true" />14:00 – 19:00
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin size={12} aria-hidden="true" />North Wing
            </span>
          </div>
          <div className="flex gap-2 mt-4">
            <Button size="sm" className="gap-1.5"><CheckCircle size={13} aria-hidden="true" />Check In</Button>
            <Button size="sm" variant="outline">Report Issue</Button>
          </div>
        </Surface>

        <Surface>
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-sm text-foreground">Gate B Team</p>
            <span className="text-xs text-muted-foreground">7 of 10 checked in</span>
          </div>
          <Progress value={70} className="h-1.5 [&>div]:bg-success mb-3" />
          <div className="flex gap-1.5 flex-wrap">
            {["JO", "SR", "KL", "MP", "TB", "AW", "RN"].map(i => (
              <div key={i} className="w-8 h-8 bg-primary rounded-full text-white text-[10px] font-bold flex items-center justify-center">{i}</div>
            ))}
            {[1, 2, 3].map(i => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-dashed border-border" aria-label="Pending" />
            ))}
          </div>
        </Surface>

        <div>
          <SectionHeading>My Schedule</SectionHeading>
          <div className="space-y-2.5">
            {[
              { day: "TODAY", num: "14", shift: "Gate B Entry",     time: "14:00 – 19:00", active: true  },
              { day: "DEC",   num: "15", shift: "Crowd Management", time: "10:00 – 15:00", active: false },
              { day: "DEC",   num: "22", shift: "VIP Escort",       time: "17:00 – 22:00", active: false },
            ].map(({ day, num, shift, time, active }) => (
              <Surface key={shift} className="flex items-center gap-4">
                <div className="w-11 text-center shrink-0">
                  <p className="text-[8px] text-muted-foreground uppercase tracking-wide font-semibold">{day}</p>
                  <p className="text-lg font-bold text-foreground leading-tight">{num}</p>
                </div>
                <div className="w-px h-10 bg-border shrink-0" aria-hidden="true" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground">{shift}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{time}</p>
                </div>
                <Badge variant={active ? "live" : "secondary"}>
                  {active ? <><span className="w-1.5 h-1.5 rounded-full bg-success motion-safe:animate-pulse" aria-hidden="true" />Active</> : "Upcoming"}
                </Badge>
              </Surface>
            ))}
          </div>
        </div>
        <EmptyTasks />
      </div>
      <BottomNav items={[{ label: "Home", Icon: Home }, { label: "Schedule", Icon: Calendar }, { label: "Team", Icon: Users }, { label: "Profile", Icon: User }]} />
    </div>
  );
}
