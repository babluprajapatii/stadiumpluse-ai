import { NotificationsPage } from "@/components/pages/NotificationsPage";
import { getSeoMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = getSeoMetadata({
  title: "Notifications Center",
  description: "View real-time match operations logs, emergency alerts, and system announcements.",
  canonicalPath: "/notifications",
  noIndex: true
});

export default function NotificationsRoute() {
  return <NotificationsPage />;
}
