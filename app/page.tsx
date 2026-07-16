import { LandingPage } from "@/components/pages/LandingPage";

/**
 * Root page — renders the public landing page.
 * Authenticated users are redirected to their dashboard by middleware.ts.
 */
export default function Home() {
  return <LandingPage />;
}
