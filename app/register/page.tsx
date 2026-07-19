import RegisterRouteClient from "./register-client";
import { getSeoMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = getSeoMetadata({
  title: "Create Account",
  description: "Register for your StadiumPulse AI account. Access the FIFA World Cup 2026 operations dashboards and incident reporting.",
  canonicalPath: "/register",
  noIndex: true,
});

export default function RegisterPage() {
  return <RegisterRouteClient />;
}
