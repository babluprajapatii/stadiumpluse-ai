"use client";

import { useState } from "react";
import { ChevronLeft, MapPin, ShoppingBag, ArrowRight, Plus, Minus } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Surface } from "../shared/Surface";
import { SectionHeading } from "../shared/SectionHeading";
import Link from "next/link";
import { useRouter } from "next/navigation";

const MENU_ITEMS = [
  { id: "f1", name: "Stadium Burger",   desc: "Double beef, cheddar, pickles",  price: 14.50 },
  { id: "f2", name: "Loaded Nachos",    desc: "Jalapeños, sour cream, salsa",   price: 11.00 },
  { id: "f3", name: "Craft Beer 500ml", desc: "Local IPA on draught",           price: 9.00  },
  { id: "f4", name: "Soft Drink",       desc: "Coke, Sprite or Fanta",          price: 4.00  },
  { id: "f5", name: "Hot Dog",          desc: "Beef sausage, mustard, ketchup", price: 8.00  },
];
const MENU_EMOJIS: Record<string, string> = { f1: "🍔", f2: "🧀", f3: "🍺", f4: "🥤", f5: "🌭" };

export function FeaturePage() {
  const router = useRouter();
  const [cart, setCart] = useState<Record<string, number>>({});
  const add    = (id: string) => setCart(c => ({ ...c, [id]: (c[id] ?? 0) + 1 }));
  const remove = (id: string) => setCart(c => { const n = { ...c }; if ((n[id] ?? 0) <= 1) delete n[id]; else n[id]--; return n; });
  const total  = MENU_ITEMS.reduce((s, m) => s + (cart[m.id] ?? 0) * m.price, 0);
  const count  = Object.values(cart).reduce((s, v) => s + v, 0);

  return (
    <div className="bg-background min-h-full flex flex-col">
      <div className="bg-card border-b border-border px-4 pt-10 pb-4 shrink-0">
        <div className="flex items-center gap-3 max-w-2xl mx-auto">
          <Link
            href="/fan"
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Back"
          >
            <ChevronLeft size={16} aria-hidden="true" />
          </Link>
          <div className="flex-1">
            <h1 className="font-bold text-lg text-foreground leading-tight">Order Food</h1>
            <p className="text-[10px] text-muted-foreground">Stand 7 · Gate B · Delivered to Seat B-12-7</p>
          </div>
          {count > 0 && (
            <div className="flex items-center gap-1.5 bg-primary/10 text-primary rounded-full px-3 py-1.5">
              <ShoppingBag size={13} aria-hidden="true" />
              <span className="text-xs font-bold tabular-nums">{count}</span>
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5 max-w-2xl mx-auto w-full">
        <Surface className="flex items-center gap-3 border-primary/20 bg-primary/5">
          <div className="w-10 h-10 bg-primary/15 rounded-xl flex items-center justify-center shrink-0">
            <MapPin size={18} className="text-primary" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm text-foreground">Seat delivery enabled</p>
            <p className="text-xs text-muted-foreground">Sector B · Row 12 · Seat 7 · ~8 min</p>
          </div>
          <Badge variant="success">Active</Badge>
        </Surface>
        <div>
          <SectionHeading>Menu — Stand 7</SectionHeading>
          <div className="space-y-2.5">
            {MENU_ITEMS.map(({ id, name, desc, price }) => {
              const qty = cart[id] ?? 0;
              return (
                <Surface key={id} className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-muted rounded-xl flex items-center justify-center text-xl shrink-0" aria-hidden="true">
                    {MENU_EMOJIS[id]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground">{name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                    <p className="text-sm font-bold text-foreground mt-1">${price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {qty > 0 ? (
                      <>
                        <Button size="icon" variant="outline" className="w-7 h-7 rounded-full" onClick={() => remove(id)} aria-label={`Remove ${name}`}>
                          <Minus size={12} />
                        </Button>
                        <span className="text-sm font-bold text-foreground w-4 text-center tabular-nums">{qty}</span>
                        <Button size="icon" className="w-7 h-7 rounded-full" onClick={() => add(id)} aria-label={`Add ${name}`}>
                          <Plus size={12} />
                        </Button>
                      </>
                    ) : (
                      <Button size="icon" variant="outline" className="w-7 h-7 rounded-full" onClick={() => add(id)} aria-label={`Add ${name}`}>
                        <Plus size={12} />
                      </Button>
                    )}
                  </div>
                </Surface>
              );
            })}
          </div>
        </div>
      </div>
      <div className="bg-card border-t border-border px-4 py-4 shrink-0">
        <div className="max-w-2xl mx-auto">
          {total > 0 && (
            <div className="flex items-center justify-between mb-3 text-sm">
              <span className="text-muted-foreground">{count} item{count !== 1 ? "s" : ""}</span>
              <span className="font-bold text-foreground tabular-nums">${total.toFixed(2)}</span>
            </div>
          )}
          <Button className="w-full gap-2" size="lg" disabled={count === 0} onClick={() => count > 0 && router.push("/result")}>
            {count === 0 ? "Add items to continue" : `Place Order · $${total.toFixed(2)}`}
            {count > 0 && <ArrowRight size={16} aria-hidden="true" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
