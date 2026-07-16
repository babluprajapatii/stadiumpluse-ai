import { SecurityDashboard } from "@/components/pages/SecurityDashboard";
import { getSeoMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = getSeoMetadata({
  title: "Security Command",
  description: "Monitor active stadium incident logs, dispatch security personnel, check CCTV alerts, and verify sector statuses.",
  canonicalPath: "/security",
  noIndex: true
});

export default function SecurityRoute() {
  return <SecurityDashboard />;
}
