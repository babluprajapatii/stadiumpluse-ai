import { cn } from "../ui/utils";

export interface DarkHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  bottom?: React.ReactNode;
  maxWidth?: string;
}

export function DarkHeader({
  eyebrow,
  title,
  subtitle,
  right,
  bottom,
  maxWidth = "max-w-5xl",
}: DarkHeaderProps) {
  return (
    <div className="bg-sidebar px-4 pt-10 pb-5 shrink-0">
      <div className={cn("mx-auto", maxWidth)}>
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            {eyebrow && (
              <p className="text-[11px] text-sidebar-accent-foreground/60 uppercase tracking-widest font-semibold mb-1">
                {eyebrow}
              </p>
            )}
            <h1 className="text-xl font-bold text-sidebar-foreground">{title}</h1>
            {subtitle && (
              <p className="text-sidebar-accent-foreground/60 text-xs mt-0.5">{subtitle}</p>
            )}
          </div>
          {right && (
            <div className="flex items-center gap-2 shrink-0">{right}</div>
          )}
        </div>
        {bottom}
      </div>
    </div>
  );
}
