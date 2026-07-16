import { OrganizerDashboard } from "@/components/pages/OrganizerDashboard";
import { getSeoMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = getSeoMetadata({
  title: "Organizer Operations",
  description: "Monitor FIFA World Cup 2026 gate utilization, ticket sales analytics, and F&B sales revenue records.",
  canonicalPath: "/organizer",
  noIndex: true
});

export default function OrganizerRoute() {
  return <OrganizerDashboard />;
}
