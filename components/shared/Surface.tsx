import { cn } from "../ui/utils";

interface SurfaceProps {
  children: React.ReactNode;
  className?: string;
}

export function Surface({ children, className = "" }: SurfaceProps) {
  return (
    <div className={cn("bg-card border border-border rounded-xl p-4 transition-shadow hover:shadow-sm", className)}>
      {children}
    </div>
  );
}
