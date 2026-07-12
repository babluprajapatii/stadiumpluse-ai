import { cn } from "../ui/utils";

interface FilterOption<T extends string> {
  value: T;
  label: string;
}

interface FilterChipsProps<T extends string> {
  label?: string;
  options: FilterOption<T>[];
  value: T;
  onChange: (v: T) => void;
  count?: string;
  className?: string;
}

export function FilterChips<T extends string>({
  label,
  options,
  value,
  onChange,
  count,
  className,
}: FilterChipsProps<T>) {
  return (
    <div className={cn("flex items-center gap-2 flex-wrap", className)}>
      {label && (
        <span className="text-[11px] text-muted-foreground font-medium">{label}</span>
      )}
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            value === opt.value
              ? "bg-primary text-white border-primary"
              : "bg-card text-muted-foreground border-border hover:text-foreground"
          )}
        >
          {opt.label}
        </button>
      ))}
      {count && (
        <span className="ml-auto text-[11px] text-muted-foreground">{count}</span>
      )}
    </div>
  );
}
