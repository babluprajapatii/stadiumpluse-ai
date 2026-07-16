import { cn } from "../ui/utils";

interface BottomNavItem {
  label: string;
  Icon: React.ElementType;
}

interface BottomNavProps {
  items: BottomNavItem[];
  active?: number;
}

export function BottomNav({ items, active = 0 }: BottomNavProps) {
  return (
    <nav
      className="lg:hidden border-t border-border bg-card flex items-center shrink-0"
      aria-label="Bottom navigation"
    >
      {items.map(({ label, Icon }, i) => {
        const on = i === active;
        return (
          <button
            key={label}
            aria-label={label}
            aria-current={on ? "page" : undefined}
            className={cn(
              "flex-1 flex flex-col items-center gap-1 py-3 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              on ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Icon size={18} strokeWidth={on ? 2.5 : 1.75} aria-hidden="true" />
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
