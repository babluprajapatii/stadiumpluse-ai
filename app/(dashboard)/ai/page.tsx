import { AICommandCenter } from "@/components/pages/AICommandCenter";
import { getSeoMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = getSeoMetadata({
  title: "AI Command Center",
  description: "StadiumPulse GenAI assistant. Real-time operations assistant, incident reports summarization, and spectator concierge queries.",
  canonicalPath: "/ai",
  noIndex: true
});

export default function AIRoute() {
  return <AICommandCenter />;
}
