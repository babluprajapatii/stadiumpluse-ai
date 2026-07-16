import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const sessionCookie = request.cookies.get("stadium_session");
  const path = request.nextUrl.pathname;

  let userRole = "";
  if (sessionCookie) {
    try {
      const user = JSON.parse(decodeURIComponent(sessionCookie.value));
      userRole = user?.role || "";
    } catch {
      // Ignored
    }
  }

  // 1. Redirect authenticated users away from Login, Register, Forgot, Reset, Verify, and Landing page to their dashboard
  if ((path === "/" || path === "/login" || path === "/register" || path === "/forgot-password" || path === "/reset-password" || path === "/verify-email") && userRole) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = `/${userRole}`;
    return NextResponse.redirect(dashboardUrl);
  }

  // 2. Protect dashboard paths
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
    "/profile",
    "/settings",
    "/notifications",
  ];

  const isProtected = protectedPaths.some((p) => path.startsWith(p));

  if (isProtected && !userRole) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  // 3. Enforce role-based cross-access protection for dashboards
  const roles = ["fan", "volunteer", "security", "organizer", "operator", "accessibility"];
  const targetDashboard = roles.find((r) => path.startsWith(`/${r}`));

  if (targetDashboard && userRole && userRole !== targetDashboard) {
    const correctUrl = request.nextUrl.clone();
    correctUrl.pathname = `/${userRole}`;
    return NextResponse.redirect(correctUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Apply to all routes except static assets and API routes.
  matcher: "/((?!_next|static|favicon\\.ico|api).*)",
};
