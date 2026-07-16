import {
  Home, LogIn, Users, Shield, ClipboardList, Settings,
  Bot, Star, Accessibility, UtensilsCrossed, PartyPopper,
} from "lucide-react";

export type PageId =
  | "landing" | "login" | "register" | "forgot-password" | "reset-password" | "profile" | "settings" | "notifications" | "verify-email" | "fan" | "volunteer"
  | "security" | "organizer" | "operator" | "ai"
  | "accessibility" | "feature" | "result";

export type Navigate = (to: PageId) => void;

export const NAV = [
  { id: "landing"       as PageId, label: "Landing Page",      Icon: Home          },
  { id: "login"         as PageId, label: "Login",             Icon: LogIn         },
  { id: "fan"           as PageId, label: "Fan Dashboard",     Icon: Star          },
  { id: "volunteer"     as PageId, label: "Volunteer",         Icon: Users         },
  { id: "security"      as PageId, label: "Security",          Icon: Shield        },
  { id: "organizer"     as PageId, label: "Organizer",         Icon: ClipboardList },
  { id: "operator"      as PageId, label: "Operator",          Icon: Settings      },
  { id: "ai"            as PageId, label: "AI Command Center", Icon: Bot           },
  { id: "accessibility" as PageId, label: "Accessibility Hub", Icon: Accessibility },
  { id: "feature"       as PageId, label: "Order Food",        Icon: UtensilsCrossed },
  { id: "result"        as PageId, label: "Order Confirmed",   Icon: PartyPopper   },
];

export const FLOW: PageId[] = ["landing", "login", "fan", "ai", "feature", "result"];

export const FLOW_LABELS: Record<string, string> = {
  landing: "Home",
  login:   "Sign In",
  fan:     "Dashboard",
  ai:      "AI Center",
  feature: "Order Food",
  result:  "Confirmed",
};
