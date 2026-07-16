import { cn } from "./utils";
import { AIConfidencePill } from "./ai-badge";

interface StatCardProps {
  label: string;
  value: string;
  unit?: string;
  trend?: string;
  trendPositive?: boolean;
  icon?: React.ElementType;
  variant?: "default" | "success" | "warning" | "error";
  aiConfidence?: number;
  className?: string;
}

export function StatCard({
  label,
  value,
  unit,
  trend,
  trendPositive,
  icon: Icon,
  variant = "default",
  aiConfidence,
  className,
}: StatCardProps) {
  const borderColor = {
    default: "border-l-primary",
    success: "border-l-success",
    warning: "border-l-warning",
    error: "border-l-error",
  }[variant];

  const iconColor = {
    default: "text-primary bg-primary/10",
    success: "text-success bg-success-muted",
    warning: "text-warning bg-warning-muted",
    error: "text-error bg-error-muted",
  }[variant];

  return (
    <div
      className={cn(
        "bg-card border border-border border-l-2 rounded-xl p-4 flex flex-col gap-1.5",
        borderColor,
        className
      )}
    >
      {Icon && (
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-0.5", iconColor)}>
          <Icon size={15} />
        </div>
      )}
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
          {value}
        </span>
        {unit && (
          <span className="text-xs text-muted-foreground">{unit}</span>
        )}
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">{label}</span>
        {trend && (
          <span
            className={cn(
              "text-[10px] font-semibold",
              trendPositive ? "text-success" : "text-error"
            )}
          >
            {trend}
          </span>
        )}
      </div>
      {aiConfidence !== undefined && (
        <div className="mt-0.5">
          <AIConfidencePill value={aiConfidence} />
        </div>
      )}
    </div>
  );
}
