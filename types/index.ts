/**
 * Global type definitions and navigation constants for StadiumPulse AI.
 * IMPORTANT: This file must NOT import heavy UI libraries (e.g., lucide-react)
 * because it is imported by many modules. Icon associations live in the components
 * that actually render them.
 */

export type PageId =
  | "landing"
  | "login"
  | "register"
  | "forgot-password"
  | "reset-password"
  | "profile"
  | "settings"
  | "notifications"
  | "verify-email"
  | "fan"
  | "volunteer"
  | "security"
  | "organizer"
  | "operator"
  | "ai"
  | "accessibility"
  | "feature"
  | "result";

/** A callable navigation function used across the application. */
export type Navigate = (to: PageId) => void;

/** An ordered list of page IDs that form the primary user flow. */
export const FLOW: PageId[] = ["landing", "login", "fan", "ai", "feature", "result"];

/** Human-readable labels for pages in the primary flow. */
export const FLOW_LABELS: Record<string, string> = {
  landing: "Home",
  login: "Sign In",
  fan: "Dashboard",
  ai: "AI Center",
  feature: "Order Food",
  result: "Confirmed",
};
