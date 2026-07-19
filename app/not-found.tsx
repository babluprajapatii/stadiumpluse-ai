import Link from "next/link";
import { Zap, Home, Key, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 border border-primary/20">
        <Zap size={32} className="text-primary" aria-hidden="true" />
      </div>
      <h1 className="text-4xl font-extrabold text-foreground mb-2 tracking-tight">404 — Page Not Found</h1>
      <p className="text-sm text-muted-foreground max-w-md mb-8 leading-relaxed">
        The requested stadium operations route or resource does not exist or has been relocated within the FIFA 2026 platform.
      </p>
      
      <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
        <Button asChild variant="default" size="lg" className="gap-2">
          <Link href="/">
            <Home size={16} aria-hidden="true" /> Return to Home
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="gap-2">
          <Link href="/login">
            <Key size={16} aria-hidden="true" /> Sign In
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="gap-2">
          <Link href="/accessibility">
            <ShieldAlert size={16} aria-hidden="true" /> Accessibility Hub
          </Link>
        </Button>
      </div>

      <div className="pt-8 border-t border-border max-w-xs w-full text-xs text-muted-foreground">
        <p>© 2026 StadiumPulse AI — FIFA World Cup Operations</p>
      </div>
    </div>
  );
}
