"use client";

import React from "react";
import { BarChart, Bar, ResponsiveContainer, Tooltip } from "recharts";
import { useChartTheme } from "./ChartContainer";

const revenueData = [
  { day: "1",  v: 8200  },
  { day: "5",  v: 11400 },
  { day: "8",  v: 9300  },
  { day: "10", v: 16800 },
  { day: "12", v: 14200 },
  { day: "14", v: 22100 },
];

export function RevenueChart() {
  const chart = useChartTheme();
  return (
    <ResponsiveContainer width="100%" height={80}>
      <BarChart data={revenueData} barSize={10} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <Bar dataKey="v" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
        <Tooltip
          contentStyle={chart.tooltipStyle}
          formatter={(v: number) => [`$${v.toLocaleString()}`, "Revenue"]}
          cursor={chart.cursorStyle}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
