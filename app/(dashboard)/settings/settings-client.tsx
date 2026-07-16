"use client";

import { SettingsPage } from "@/components/pages/SettingsPage";
import { useRouter } from "next/navigation";
import type { PageId } from "@/types";

export default function SettingsRouteClient() {
  const router = useRouter();

  const navigate = (to: PageId) => {
    if (to === "landing") {
      router.push("/");
    } else {
      router.push(`/${to}`);
    }
  };

  return <SettingsPage navigate={navigate} />;
}
