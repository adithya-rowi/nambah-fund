"use client";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Point = { month_label: string; nav: number; portfolio: number };

export default function NavChart({ data }: { data: Point[] }) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="navFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E07A3E" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#E07A3E" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="month_label"
            tick={{ fontSize: 11, fill: "#8A7A64" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={["dataMin - 50", "dataMax + 50"]}
            tick={{ fontSize: 11, fill: "#8A7A64" }}
            axisLine={false}
            tickLine={false}
            width={44}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #E9DAC3",
              fontSize: 12,
              boxShadow: "0 8px 30px -12px rgba(61,50,39,0.25)",
            }}
            formatter={(v: number) => [v.toFixed(2), "NAV"]}
          />
          <Area
            type="monotone"
            dataKey="nav"
            stroke="#C4652C"
            strokeWidth={2.5}
            fill="url(#navFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
