import { Surface } from "../shared/Surface";
import { cn } from "../ui/utils";

export function useChartTheme() {
  return {
    tooltipStyle: {
      background: "var(--color-card)",
      border: "1px solid var(--color-border)",
      borderRadius: "8px",
      fontSize: "11px",
      color: "var(--color-foreground)",
    },
    labelStyle: {
      color: "var(--color-muted-foreground)",
      fontSize: "10px",
    },
    cursorStyle: { fill: "rgba(37,99,235,0.08)" },
  };
}

interface ChartContainerProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  height?: number;
  children: React.ReactNode;
  className?: string;
}

export function ChartContainer({
  title,
  subtitle,
  right,
  height = 80,
  children,
  className,
}: ChartContainerProps) {
  return (
    <Surface className={cn(className)}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-semibold text-sm text-foreground">{title}</p>
          {subtitle && (
            <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
        {right}
      </div>
      <div style={{ height }}>{children}</div>
    </Surface>
  );
}
