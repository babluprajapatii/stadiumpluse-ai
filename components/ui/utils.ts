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
  stack?: string;
}

export function normalizeError(err: unknown): NormalizedError {
  // Explicitly print properties as requested in Phase 4
  console.error("FULL ERROR:", err);
  try {
    console.error("JSON:", JSON.stringify(err, null, 2));
  } catch {
    console.error("JSON: [Serialization Failed]");
  }

  const errorObj = (err && typeof err === "object" ? err : {}) as Record<string, unknown>;

  console.error("Message:", errorObj.message || (err instanceof Error ? err.message : undefined));
  console.error("Code:", errorObj.code);
  console.error("Status:", errorObj.status);
  console.error("Details:", errorObj.details);
  console.error("Hint:", errorObj.hint);
  console.error("Stack:", errorObj.stack || (err instanceof Error ? err.stack : undefined));

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

  // Prevent "{}" or empty message
  if (!message || message === "{}" || message === "[]") {
    message = "Connection failed or database constraint violation.";
  }

  return {
    message,
    code: errorObj.code ? String(errorObj.code) : undefined,
    status: typeof errorObj.status === "number" ? errorObj.status : undefined,
    details: errorObj.details ? String(errorObj.details) : undefined,
    hint: errorObj.hint ? String(errorObj.hint) : undefined,
    stack: errorObj.stack ? String(errorObj.stack) : (err instanceof Error ? err.stack : undefined),
  };
}

export function getErrorMessage(err: unknown, fallback: string): string {
  const normalized = normalizeError(err);
  return normalized.message && normalized.message !== "An unexpected error occurred." ? normalized.message : fallback;
}
