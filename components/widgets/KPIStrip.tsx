import { StatCard } from "../ui/stat-card";
import { cn } from "../ui/utils";

const COLS_MAP: Record<number, string> = {
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-2 md:grid-cols-4",
};

export interface KPIItem {
  label: string;
  value: string;
  unit?: string;
  variant?: "default" | "success" | "warning" | "error";
  icon?: React.ElementType;
  aiConfidence?: number;
  trend?: string;
  trendPositive?: boolean;
}

interface KPIStripProps {
  items: KPIItem[];
  cols?: 2 | 3 | 4;
  className?: string;
}

export function KPIStrip({ items, cols = 4, className }: KPIStripProps) {
  return (
    <div className={cn("grid gap-3", COLS_MAP[cols] ?? COLS_MAP[4], className)}>
      {items.map(item => (
        <StatCard key={item.label} {...item} />
      ))}
    </div>
  );
}
