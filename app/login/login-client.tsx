"use client";

import { LoginPage } from "@/components/pages/LoginPage";
import { useRouter } from "next/navigation";
import type { PageId } from "@/types";

export default function LoginRouteClient() {
  const router = useRouter();

  const navigate = (to: PageId) => {
    if (to === "landing") {
      router.push("/");
    } else {
      router.push(`/${to}`);
    }
  };

  return <LoginPage navigate={navigate} />;
}
