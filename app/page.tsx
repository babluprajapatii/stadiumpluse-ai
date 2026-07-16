"use client";

import { LandingPage } from "@/components/pages/LandingPage";
import { useRouter } from "next/navigation";
import type { PageId } from "@/types";

export default function Home() {
  const router = useRouter();

  const navigate = (to: PageId) => {
    if (to === "landing") {
      router.push("/");
    } else {
      router.push(`/${to}`);
    }
  };

  return <LandingPage navigate={navigate} />;
}
