import { FeaturePage } from "@/components/pages/FeaturePage";
import { getSeoMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = getSeoMetadata({
  title: "Food & Beverages Order",
  description: "Browse menus, order stadium meals directly to your seat, and monitor F&B wait times.",
  canonicalPath: "/feature",
  noIndex: true
});

export default function FeatureRoute() {
  return <FeaturePage />;
}
