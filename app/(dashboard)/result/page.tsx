import { ResultPage } from "@/components/pages/ResultPage";
import { getSeoMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = getSeoMetadata({
  title: "Event Results",
  description: "StadiumPulse live match analytics, timeline tracker, guest satisfaction indices, and key operations performance indicators.",
  canonicalPath: "/result",
  noIndex: true
});

export default function ResultRoute() {
  return <ResultPage />;
}
