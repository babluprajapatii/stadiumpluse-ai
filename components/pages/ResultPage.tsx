import { CheckCircle, Home, Bot } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Surface } from "../shared/Surface";
import Link from "next/link";

export function ResultPage() {
  return (
    <div className="bg-background min-h-full flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="max-w-sm w-full">
        <div className="w-20 h-20 bg-success-muted rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={38} className="text-success" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Order placed!</h1>
        <p className="text-muted-foreground text-sm leading-relaxed mb-8">
          Being prepared at Stand 7. Delivery to{" "}
          <strong className="text-foreground">Sector B · Row 12 · Seat 7</strong> in ~8 minutes.
        </p>
        <Surface className="text-left mb-4">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-sm text-foreground">Order #SP-8841</p>
            <Badge variant="live">
              <span className="w-1.5 h-1.5 rounded-full bg-success motion-safe:animate-pulse" aria-hidden="true" />
              Preparing
            </Badge>
          </div>
          <div className="space-y-2">
            {[
              { name: "Stadium Burger", qty: 1, price: 14.50 },
              { name: "Loaded Nachos",  qty: 1, price: 11.00 },
              { name: "Craft Beer",     qty: 2, price: 18.00 },
            ].map(({ name, qty, price }) => (
              <div key={name} className="flex items-center justify-between text-sm">
                <span className="text-foreground">{qty}× {name}</span>
                <span className="text-muted-foreground tabular-nums">${price.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-border mt-4 pt-4 flex items-center justify-between">
            <span className="font-semibold text-sm text-foreground">Total</span>
            <span className="font-bold text-foreground tabular-nums">$43.50</span>
          </div>
        </Surface>
        <div className="space-y-3">
          <Button className="w-full gap-2" asChild>
            <Link href="/fan">
              <Home size={15} aria-hidden="true" />Back to Dashboard
            </Link>
          </Button>
          <Button variant="outline" className="w-full gap-2" asChild>
            <Link href="/ai">
              <Bot size={15} aria-hidden="true" />Ask AI about my order
            </Link>
          </Button>
          <Button variant="ghost" className="w-full" asChild>
            <Link href="/">
              Return to home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
