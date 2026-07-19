"use client";

import { RegisterPage } from "@/components/pages/RegisterPage";
import { useRouter } from "next/navigation";
import type { PageId } from "@/types";
import { PageSchema } from "@/components/seo/PageSchema";

export default function RegisterRouteClient() {
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
        { name: "Register", item: "https://stadiumpulse.ai/register" },
      ]} />
      <RegisterPage navigate={navigate} />
    </>
  );
}
