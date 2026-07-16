"use client";

import React from "react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

const attendanceData = [
  { t: "13:00", v: 8000 },
  { t: "14:00", v: 22000 },
  { t: "15:00", v: 38000 },
  { t: "16:00", v: 45000 },
  { t: "16:30", v: 47300 },
];

export function AttendanceChart() {
  return (
    /*
      RECHARTS v3 MIGRATION: Wrapped ResponsiveContainer in a parent div with
      explicit height (36px) and set ResponsiveContainer to 100% height to avoid warnings.
    */
    <div className="h-[36px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={attendanceData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="fanAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}    />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="v" stroke="#3b82f6" strokeWidth={1.5} fill="url(#fanAreaGrad)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
