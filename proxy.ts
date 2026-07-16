import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Proxy (Next.js 16 middleware) — handles route protection, role-based
 * redirects, and security headers for all application routes.
 *
 * In Next.js 16, the middleware file is named proxy.ts (not middleware.ts).
 */

// ─── Constants ────────────────────────────────────────────────────────────────

/** Roles that have their own dashboard routes. */
const ROLE_ROUTES = ["fan", "volunteer", "security", "organizer", "operator", "accessibility"] as const;
type UserRole = (typeof ROLE_ROUTES)[number];

/** Routes that require an active session. */
const PROTECTED_PATHS = [
  "/fan",
  "/volunteer",
  "/security",
  "/organizer",
  "/operator",
  "/ai",
  "/feature",
  "/result",
  "/accessibility",
  "/profile",
  "/settings",
  "/notifications",
] as const;

/** Routes that should redirect already-authenticated users to their dashboard. */
const AUTH_ONLY_PATHS = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
] as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getUserRole(request: NextRequest): UserRole | null {
  const sessionCookie = request.cookies.get("stadium_session");
  if (!sessionCookie?.value) return null;
  try {
    const decoded = decodeURIComponent(sessionCookie.value);
    const parsed = JSON.parse(decoded) as { role?: string };
    const role = parsed?.role ?? "";
    if ((ROLE_ROUTES as readonly string[]).includes(role)) {
      return role as UserRole;
    }
    return null;
  } catch {
    return null;
  }
}

function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  return response;
}

// ─── Main proxy function ──────────────────────────────────────────────────────

export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const userRole = getUserRole(request);

  // 1. Redirect authenticated users away from auth/landing pages to their dashboard
  if ((AUTH_ONLY_PATHS as readonly string[]).includes(pathname) && userRole) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = `/${userRole}`;
    return NextResponse.redirect(dashboardUrl);
  }

  // 2. Protect dashboard & feature paths — redirect unauthenticated users to login
  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  if (isProtected && !userRole) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  // 3. Enforce role-based cross-dashboard access — redirect to the correct dashboard
  const targetDashboard = ROLE_ROUTES.find((r) => pathname.startsWith(`/${r}`));
  if (targetDashboard && userRole && userRole !== targetDashboard) {
    const correctUrl = request.nextUrl.clone();
    correctUrl.pathname = `/${userRole}`;
    return NextResponse.redirect(correctUrl);
  }

  // 4. All checks passed — add security headers to the response
  return addSecurityHeaders(NextResponse.next());
}

export const config = {
  // Apply to all routes except Next.js internals, static files, and API routes
  matcher: "/((?!_next|static|favicon\\.ico|api).*)",
};
