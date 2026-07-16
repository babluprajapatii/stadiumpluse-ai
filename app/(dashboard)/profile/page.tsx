import ProfileRouteClient from "./profile-client";
import { getSeoMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = getSeoMetadata({
  title: "My Profile",
  description: "View and edit your personal account profile, contact details, organization, and match credentials.",
  canonicalPath: "/profile",
  noIndex: true
});

export default function ProfileRoute() {
  return <ProfileRouteClient />;
}
