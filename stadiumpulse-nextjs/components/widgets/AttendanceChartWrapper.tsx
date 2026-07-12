"use client";

import dynamic from "next/dynamic";
import React from "react";

export const AttendanceChart = dynamic(
  () => import("./AttendanceChart").then((mod) => mod.AttendanceChart),
  {
    ssr: false,
    loading: () => <div className="h-[36px] w-full bg-sidebar-accent/10 rounded animate-pulse" aria-hidden="true" />,
  }
);
