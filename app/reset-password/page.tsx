import ResetPasswordRouteClient from "./reset-client";
import { getSeoMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = getSeoMetadata({
  title: "Reset Password",
  description: "Securely establish a new password for your StadiumPulse AI smart stadium operations profile.",
  canonicalPath: "/reset-password",
  noIndex: true // Password reset pages should not be indexed by search engines
});

export default function ResetPasswordPage() {
  return <ResetPasswordRouteClient />;
}
