"use client";

import dynamic from "next/dynamic";
import React from "react";

export const EventBanner = dynamic(
  () => import("./EventBanner").then((mod) => mod.EventBanner),
  {
    ssr: false,
    loading: () => <div className="h-[120px] w-full bg-sidebar rounded-xl animate-pulse" aria-hidden="true" />,
  }
);
