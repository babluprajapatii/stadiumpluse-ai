"use server";

import { cookies } from "next/headers";
import { signRole } from "@/lib/crypto";

const COOKIE_SECRET = process.env.COOKIE_SECRET || "fallback-secure-stadium-cookie-secret-key-2026";

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
