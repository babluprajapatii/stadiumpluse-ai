"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { ResetPasswordPage } from "@/components/pages/ResetPasswordPage";
import type { PageId } from "@/types";
import { Suspense } from "react";
import { PageSchema } from "@/components/seo/PageSchema";

function ResetPasswordRouteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const navigate = (to: PageId) => {
    if (to === "landing") {
      router.push("/");
    } else {
      router.push(`/${to}`);
    }
  };

  return <ResetPasswordPage navigate={navigate} token={token} />;
}

export default function ResetPasswordRouteClient() {
  return (
    <>
      <PageSchema breadcrumbs={[
        { name: "Home", item: "https://stadiumpulse.ai" },
        { name: "Reset Password", item: "https://stadiumpulse.ai/reset-password" },
      ]} />
      <Suspense fallback={<div className="p-8 text-center text-xs text-muted-foreground">Loading reset session...</div>}>
        <ResetPasswordRouteContent />
      </Suspense>
    </>
  );
}
