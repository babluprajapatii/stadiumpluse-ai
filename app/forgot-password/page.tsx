import ForgotPasswordRouteClient from "./forgot-client";
import { getSeoMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = getSeoMetadata({
  title: "Reset Password Recovery",
  description: "Request a password reset verification link to recover access to your StadiumPulse AI account.",
  canonicalPath: "/forgot-password",
});

export default function ForgotPasswordPage() {
  return <ForgotPasswordRouteClient />;
}
