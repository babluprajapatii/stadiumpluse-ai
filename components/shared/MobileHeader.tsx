interface MobileHeaderProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}

export function MobileHeader({ title, subtitle, right }: MobileHeaderProps) {
  return (
    <div className="bg-card border-b border-border px-4 pt-10 pb-4 shrink-0">
      <div className="flex items-center justify-between">
        <div>
          {subtitle && (
            <p className="text-[11px] text-muted-foreground mb-0.5">{subtitle}</p>
          )}
          <h1 className="font-bold text-lg text-foreground leading-tight">{title}</h1>
        </div>
        {right}
      </div>
    </div>
  );
}
