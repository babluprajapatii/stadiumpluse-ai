"use client";

import { ForgotPasswordPage } from "@/components/pages/ForgotPasswordPage";
import { useRouter } from "next/navigation";
import type { PageId } from "@/types";
import { PageSchema } from "@/components/seo/PageSchema";

export default function ForgotPasswordRouteClient() {
  const router = useRouter();

  const navigate = (to: PageId) => {
    if (to === "landing") {
      router.push("/");
    } else {
      router.push(`/${to}`);
    }
  };

  return (
    <>
      <PageSchema breadcrumbs={[
        { name: "Home", item: "https://stadiumpulse.ai" },
        { name: "Forgot Password", item: "https://stadiumpulse.ai/forgot-password" },
      ]} />
      <ForgotPasswordPage navigate={navigate} />
    </>
  );
}
