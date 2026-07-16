import { Surface } from "../shared/Surface";
import { cn } from "../ui/utils";

export type StatusVariant = "success" | "warning" | "error" | "default";

const ICON_BG: Record<StatusVariant, string> = {
  success: "bg-success-muted",
  warning: "bg-warning-muted",
  error:   "bg-error-muted",
  default: "bg-primary/10",
};

const ICON_COLOR: Record<StatusVariant, string> = {
  success: "text-success",
  warning: "text-warning",
  error:   "text-error",
  default: "text-primary",
};

const STATUS_COLOR: Record<StatusVariant, string> = {
  success: "text-success",
  warning: "text-warning",
  error:   "text-error",
  default: "text-foreground",
};

const DOT_COLOR: Record<StatusVariant, string> = {
  success: "bg-success",
  warning: "bg-warning",
  error:   "bg-error motion-safe:animate-pulse",
  default: "bg-primary",
};

export interface SystemItem {
  label: string;
  status: string;
  Icon: React.ElementType;
  variant: StatusVariant;
}

export function SystemStatusGrid({ items }: { items: SystemItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map(({ label, status, Icon, variant }) => (
        <Surface key={label} className="flex items-center gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
              ICON_BG[variant]
            )}
          >
            <Icon size={18} className={ICON_COLOR[variant]} aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">
              {label}
            </p>
            <p className={cn("text-sm font-semibold mt-0.5", STATUS_COLOR[variant])}>
              {status}
            </p>
          </div>
          <span
            className={cn("w-2 h-2 rounded-full shrink-0", DOT_COLOR[variant])}
            aria-hidden="true"
          />
        </Surface>
      ))}
    </div>
  );
}
