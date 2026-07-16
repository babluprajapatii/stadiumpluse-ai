"use client";

import { ProfilePage } from "@/components/pages/ProfilePage";
import { useRouter } from "next/navigation";
import type { PageId } from "@/types";

export default function ProfileRoute() {
  const router = useRouter();

  const navigate = (to: PageId) => {
    if (to === "landing") {
      router.push("/");
    } else {
      router.push(`/${to}`);
    }
  };

  return <ProfilePage navigate={navigate} />;
}
