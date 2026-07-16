import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface NormalizedError {
  message: string;
  code?: string;
  status?: number;
  details?: string;
  hint?: string;
}

/**
 * Normalizes any thrown value into a user-safe error object.
 * In development, the full error is logged to the console.
 * In production, only a sanitized message is returned — no stack traces or internal codes.
 */
export function normalizeError(err: unknown): NormalizedError {
  // In development, log the full error for debugging purposes only
  if (process.env.NODE_ENV === "development") {
    console.error("[StadiumPulse Error]:", err);
  }

  const errorObj = (err && typeof err === "object" ? err : {}) as Record<string, unknown>;

  let message = "An unexpected error occurred.";
  if (err instanceof Error) {
    message = err.message;
  } else if (typeof err === "string") {
    message = err;
  } else if (err && typeof err === "object") {
    if (typeof errorObj.message === "string") {
      message = errorObj.message;
    } else if (typeof errorObj.error_description === "string") {
      message = errorObj.error_description;
    }
  }

  // Guard: never render "{}", "[]", or empty strings to the user
  if (!message || message === "{}" || message === "[]" || message.trim() === "") {
    message = "Connection failed or a database constraint was violated.";
  }

  return {
    message,
    code: errorObj.code ? String(errorObj.code) : undefined,
    status: typeof errorObj.status === "number" ? errorObj.status : undefined,
    details: errorObj.details ? String(errorObj.details) : undefined,
    hint: errorObj.hint ? String(errorObj.hint) : undefined,
  };
}

/**
 * Returns a human-readable error message, falling back to the provided string
 * if the error cannot be meaningfully parsed.
 */
export function getErrorMessage(err: unknown, fallback: string): string {
  const normalized = normalizeError(err);
  return normalized.message && normalized.message !== "An unexpected error occurred."
    ? normalized.message
    : fallback;
}
