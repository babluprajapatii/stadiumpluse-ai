import SettingsRouteClient from "./settings-client";
import { getSeoMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = getSeoMetadata({
  title: "Account Settings",
  description: "Manage app settings, configure accessibility parameters, scale text fonts, reduce animation motions, and switch notifications parameters.",
  canonicalPath: "/settings",
  noIndex: true
});

export default function SettingsRoute() {
  return <SettingsRouteClient />;
}
