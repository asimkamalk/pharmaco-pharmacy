"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatPrice } from "@/lib/utils";

interface SalesChartProps {
  data: { date: string; revenue: number; profit: number; orders: number }[];
}

function formatAxisValue(value: number) {
  const amount = Number(value) || 0;
  if (amount === 0) return "0";
  if (Math.abs(amount) >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(amount % 1_000_000 === 0 ? 0 : 1)}M`;
  }
  if (Math.abs(amount) >= 10_000) {
    return `${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}k`;
  }
  if (Math.abs(amount) >= 1000) {
    return `${(amount / 1000).toFixed(1)}k`;
  }
  return String(Math.round(amount));
}

function formatTickLabel(value: string, pointCount: number) {
  if (!value) return "";
  // Monthly buckets: 2025-07-01 → Jul 2025
  if (pointCount <= 14 && value.endsWith("-01") && value.length === 10) {
    const date = new Date(value);
    return date.toLocaleDateString("en-PK", {
      month: "short",
      year: "2-digit",
    });
  }
  // Default: MM-DD
  return value.slice(5);
}

const SalesChart = ({ data }: SalesChartProps) => {
  const maxValue = Math.max(
    0,
    ...data.map((point) => Math.max(point.revenue, point.profit)),
  );

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 4, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b9c3c" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#3b9c3c" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="profitFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#fb6c08" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#fb6c08" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            tickFormatter={(value: string) =>
              formatTickLabel(value, data.length)
            }
            tick={{ fontSize: 11, fill: "#52525b" }}
            minTickGap={28}
          />
          <YAxis
            tickFormatter={formatAxisValue}
            tick={{ fontSize: 11, fill: "#52525b" }}
            width={52}
            domain={[0, maxValue === 0 ? 100 : "auto"]}
            allowDecimals={false}
          />
          <Tooltip
            formatter={(value, name) => [
              formatPrice(Number(value ?? 0)),
              name === "revenue" ? "Revenue" : "Profit",
            ]}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#063c28"
            fill="url(#revenueFill)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="profit"
            stroke="#fb6c08"
            fill="url(#profitFill)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalesChart;
