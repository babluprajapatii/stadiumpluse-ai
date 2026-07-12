import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Simple route protection middleware for dashboard routes.
 * Checks for the presence of a `stadium_session` cookie (set by AuthProvider).
 * If missing, redirects the user to the login page.
 */
export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("stadium_session");
  const protectedPaths = [
    "/fan",
    "/volunteer",
    "/security",
    "/organizer",
    "/operator",
    "/ai",
    "/feature",
    "/result",
    "/accessibility",
  ];

  const isProtected = protectedPaths.some((p) =>
    request.nextUrl.pathname.startsWith(p)
  );

  if (isProtected && !sessionCookie) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Apply to all routes except static assets and API routes.
  matcher: "/((?!_next|static|favicon\.ico|api).*)",
};
