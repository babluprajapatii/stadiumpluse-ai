import { VolunteerDashboard } from "@/components/pages/VolunteerDashboard";
import { getSeoMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = getSeoMetadata({
  title: "Volunteer Portal",
  description: "StadiumPulse volunteer dispatch tasks list, sector check-ins, supervisor instructions, and volunteer messaging center.",
  canonicalPath: "/volunteer",
  noIndex: true
});

export default function VolunteerRoute() {
  return <VolunteerDashboard />;
}
