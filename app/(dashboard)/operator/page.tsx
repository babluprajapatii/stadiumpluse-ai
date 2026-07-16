import { OperatorDashboard } from "@/components/pages/OperatorDashboard";
import { getSeoMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = getSeoMetadata({
  title: "Operator Dashboard",
  description: "StadiumPulse operational systems status, sensor feeds, Wi-Fi networks status, and emergency overrides.",
  canonicalPath: "/operator",
  noIndex: true
});

export default function OperatorRoute() {
  return <OperatorDashboard />;
}
