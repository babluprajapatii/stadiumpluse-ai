"use client";

import { RegisterPage } from "@/components/pages/RegisterPage";
import { useRouter } from "next/navigation";
import type { PageId } from "@/types";

export default function RegisterRouteClient() {
  const router = useRouter();

  const navigate = (to: PageId) => {
    if (to === "landing") {
      router.push("/");
    } else {
      router.push(`/${to}`);
    }
  };

  return <RegisterPage navigate={navigate} />;
}
