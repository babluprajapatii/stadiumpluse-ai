import LoginRouteClient from "./login-client";
import { getSeoMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = getSeoMetadata({
  title: "Sign In",
  description: "Access your StadiumPulse AI FIFA World Cup 2026 operations portal. Role-based access for fans, organizers, security, and volunteers.",
  canonicalPath: "/login",
});

export default function LoginPage() {
  return <LoginRouteClient />;
}
