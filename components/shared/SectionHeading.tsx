interface SectionHeadingProps {
  children: React.ReactNode;
  action?: React.ReactNode;
}

export function SectionHeading({ children, action }: SectionHeadingProps) {
  return (
    <div className="flex items-center justify-between border-b border-border/40 pb-2 mb-4">
      <h2 className="font-semibold text-sm text-foreground">{children}</h2>
      {action}
    </div>
  );
}
