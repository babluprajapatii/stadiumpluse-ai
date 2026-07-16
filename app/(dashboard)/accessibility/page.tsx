import { AccessibilityHub } from "@/components/pages/AccessibilityHub";
import { getSeoMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = getSeoMetadata({
  title: "Accessibility Hub",
  description: "Configure accessible stadium routes, request assistance services, and read accessibility announcements.",
  canonicalPath: "/accessibility",
  noIndex: true
});

export default function AccessibilityRoute() {
  return <AccessibilityHub />;
}
