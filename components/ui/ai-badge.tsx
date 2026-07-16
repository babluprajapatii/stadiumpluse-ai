import { Brain } from "lucide-react";
import { cn } from "./utils";

export function AIBadge({ label = "AI" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1 bg-primary/10 text-primary rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide">
      <Brain size={9} aria-hidden="true" />
      {label}
    </span>
  );
}

export function AIConfidencePill({ value }: { value: number }) {
  const cls =
    value >= 90
      ? "bg-success-muted text-success"
      : value >= 70
      ? "bg-warning-muted text-warning"
      : "bg-error-muted text-error";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold tabular-nums",
        cls
      )}
    >
      <Brain size={9} aria-hidden="true" />
      {value}%
    </span>
  );
}
