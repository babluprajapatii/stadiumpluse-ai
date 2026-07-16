import VerifyEmailRouteClient from "./verify-client";
import { getSeoMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = getSeoMetadata({
  title: "Verify Email",
  description: "Confirm and verify your secure email credentials on the StadiumPulse AI operations console.",
  canonicalPath: "/verify-email",
  noIndex: true // Registration verification links should not be crawled or indexed
});

export default function VerifyEmailPage() {
  return <VerifyEmailRouteClient />;
}
