import { cn } from "./utils";

interface LiveBadgeProps {
  label?: string;
  className?: string;
}

export function LiveBadge({ label = "LIVE", className }: LiveBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-success-muted text-success text-[10px] font-semibold uppercase tracking-wider",
        className
      )}
    >
      <span
        className="w-1.5 h-1.5 rounded-full bg-success motion-safe:animate-pulse"
        aria-hidden="true"
      />
      {label}
    </span>
  );
}
