import { FanDashboard } from "@/components/pages/FanDashboard";
import { getSeoMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = getSeoMetadata({
  title: "Fan Portal",
  description: "View digital tickets, check queue times, find food kiosks, and ask our GenAI helper for assistance.",
  canonicalPath: "/fan",
  noIndex: true
});

export default function FanRoute() {
  return <FanDashboard />;
}
