"use client";

import dynamic from "next/dynamic";
import React from "react";

export const RevenueChart = dynamic(
  () => import("./RevenueChart").then((mod) => mod.RevenueChart),
  {
    ssr: false,
    loading: () => <div className="h-[80px] w-full bg-sidebar-accent/10 rounded animate-pulse" aria-hidden="true" />,
  }
);
