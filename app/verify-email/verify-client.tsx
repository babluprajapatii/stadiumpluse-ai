"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { VerifyEmailPage } from "@/components/pages/VerifyEmailPage";
import type { PageId } from "@/types";
import { Suspense } from "react";

function VerifyEmailRouteContent() {
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

  return <VerifyEmailPage navigate={navigate} token={token} />;
}

export default function VerifyEmailRouteClient() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-muted-foreground">Verifying secure token...</div>}>
      <VerifyEmailRouteContent />
    </Suspense>
  );
}
