"use client";

import { useEffect } from "react";
import { ErrorGeneral } from "@/components/states";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="p-6 max-w-5xl mx-auto flex items-center justify-center min-h-[50vh]">
      <ErrorGeneral
        title="Something went wrong!"
        body={error.message || "An unexpected error occurred in this dashboard module."}
        onRetry={reset}
      />
    </div>
  );
}
