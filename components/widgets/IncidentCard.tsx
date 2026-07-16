import { MapPin } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Surface } from "../shared/Surface";
import { cn } from "../ui/utils";

export type IncidentSeverity = "critical" | "high" | "medium" | "low";

const BORDER_COLORS: Record<IncidentSeverity, string> = {
  critical: "border-l-error",
  high:     "border-l-error",
  medium:   "border-l-warning",
  low:      "border-l-primary",
};

const BADGE_VARIANTS: Record<IncidentSeverity, "error-soft" | "warning" | "secondary"> = {
  critical: "error-soft",
  high:     "error-soft",
  medium:   "warning",
  low:      "secondary",
};

const SEVERITY_LABELS: Record<IncidentSeverity, string> = {
  critical: "CRITICAL",
  high:     "HIGH",
  medium:   "MED",
  low:      "LOW",
};

export interface IncidentAction {
  label: string;
  variant?: "default" | "destructive" | "outline";
  icon?: React.ElementType;
  onClick?: () => void;
}

export interface IncidentCardProps {
  id: string;
  type: string;
  location: string;
  severity: IncidentSeverity;
  actions?: IncidentAction[];
}

export function IncidentCard({ id, type, location, severity, actions }: IncidentCardProps) {
  return (
    <Surface className={cn("border-l-4", BORDER_COLORS[severity])}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="font-semibold text-sm text-foreground">{type}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
            <MapPin size={10} aria-hidden="true" />
            {location}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{id}</p>
        </div>
        <Badge variant={BADGE_VARIANTS[severity]}>{SEVERITY_LABELS[severity]}</Badge>
      </div>
      {actions && actions.length > 0 && (
        <div className="flex gap-2">
          {actions.map(({ label, variant = "outline", icon: Icon, onClick }) => (
            <Button
              key={label}
              size="sm"
              variant={variant}
              className="gap-1.5 flex-1"
              onClick={onClick}
            >
              {Icon && <Icon size={13} aria-hidden="true" />}
              {label}
            </Button>
          ))}
        </div>
      )}
    </Surface>
  );
}
