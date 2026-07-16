"use client";

import { ForgotPasswordPage } from "@/components/pages/ForgotPasswordPage";
import { useRouter } from "next/navigation";
import type { PageId } from "@/types";

export default function ForgotPasswordRoute() {
  const router = useRouter();

  const navigate = (to: PageId) => {
    if (to === "landing") {
      router.push("/");
    } else {
      router.push(`/${to}`);
    }
  };

  return <ForgotPasswordPage navigate={navigate} />;
}
