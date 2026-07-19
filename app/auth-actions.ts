"use server";

import { cookies } from "next/headers";
import { signRole } from "@/lib/crypto";

// A hardcoded fallback secret is a security risk: anyone with the source could
// forge a valid signed session cookie and escalate roles via the middleware.
// In production the secret MUST come from the environment. A non-production
// fallback is allowed only so local `next dev` works without configuration.
const COOKIE_SECRET =
  process.env.COOKIE_SECRET ??
  (process.env.NODE_ENV === "production"
    ? (() => {
        throw new Error(
          "COOKIE_SECRET environment variable is required in production to sign session cookies."
        );
      })()
    : "dev-only-insecure-stadium-cookie-secret-key-2026");

export async function setSessionCookie(role: string, maxAge: number) {
  const signature = await signRole(role, COOKIE_SECRET);
  const sessionData = { role, signature };
  const cookieStore = await cookies();
  cookieStore.set("stadium_session", JSON.stringify(sessionData), {
    path: "/",
    maxAge,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set("stadium_session", "", {
    path: "/",
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
}
