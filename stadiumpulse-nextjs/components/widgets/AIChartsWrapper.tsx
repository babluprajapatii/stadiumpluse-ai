"use client";

import dynamic from "next/dynamic";
import React from "react";

export const CrowdFlowChart = dynamic(
  () => import("./AICharts").then((mod) => mod.CrowdFlowChart),
  {
    ssr: false,
    loading: () => <div className="h-[104px] w-full bg-sidebar-accent/10 rounded-xl animate-pulse" aria-hidden="true" />,
  }
);

export const GateDonut = dynamic(
  () => import("./AICharts").then((mod) => mod.GateDonut),
  {
    ssr: false,
    loading: () => <div className="h-[114px] w-full bg-sidebar-accent/10 rounded-xl animate-pulse" aria-hidden="true" />,
  }
);
