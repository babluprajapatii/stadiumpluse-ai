import { Plus, Minus } from "lucide-react";
import { Button } from "../ui/button";
import { Surface } from "../shared/Surface";

export interface MenuItemCardProps {
  name: string;
  desc: string;
  price: number;
  emoji: string;
  qty: number;
  onAdd: () => void;
  onRemove: () => void;
}

export function MenuItemCard({ name, desc, price, emoji, qty, onAdd, onRemove }: MenuItemCardProps) {
  return (
    <Surface className="flex items-center gap-3">
      <div
        className="w-11 h-11 bg-muted rounded-xl flex items-center justify-center text-xl shrink-0"
        aria-hidden="true"
      >
        {emoji}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-foreground">{name}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
        <p className="text-sm font-bold text-foreground mt-1">${price.toFixed(2)}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {qty > 0 ? (
          <>
            <Button
              size="icon"
              variant="outline"
              className="w-7 h-7 rounded-full"
              onClick={onRemove}
              aria-label={`Remove ${name}`}
            >
              <Minus size={12} />
            </Button>
            <span className="text-sm font-bold text-foreground w-4 text-center tabular-nums">
              {qty}
            </span>
            <Button
              size="icon"
              className="w-7 h-7 rounded-full"
              onClick={onAdd}
              aria-label={`Add ${name}`}
            >
              <Plus size={12} />
            </Button>
          </>
        ) : (
          <Button
            size="icon"
            variant="outline"
            className="w-7 h-7 rounded-full"
            onClick={onAdd}
            aria-label={`Add ${name}`}
          >
            <Plus size={12} />
          </Button>
        )}
      </div>
    </Surface>
  );
}
