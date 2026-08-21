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

const SalesChart = ({ data }: SalesChartProps) => {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
            tickFormatter={(value: string) => value.slice(5)}
            tick={{ fontSize: 11, fill: "#52525b" }}
          />
          <YAxis
            tickFormatter={(value: number) => `${Math.round(value / 1000)}k`}
            tick={{ fontSize: 11, fill: "#52525b" }}
            width={40}
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
