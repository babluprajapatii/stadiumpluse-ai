import { LandingPage } from "@/components/pages/LandingPage";
import { getSeoMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = getSeoMetadata({
  title: "FIFA World Cup 2026 Smart Stadium Platform",
  description: "GenAI-powered live crowd flow monitoring, operations control center, and real-time incident dispatching for stadiums.",
  canonicalPath: "/",
});

export default function Home() {
  return <LandingPage />;
}
