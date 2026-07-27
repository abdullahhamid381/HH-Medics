"use client";

import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { DailySalesPoint } from "@/lib/db/analytics";
import { formatCurrency } from "@/lib/utils";

export function ProfitLossChart({ data }: { data: DailySalesPoint[] }) {
  const formatted = data.map((d) => ({
    ...d,
    label: new Date(d.day).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <ComposedChart data={formatted} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueFill2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.3} />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="costFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-danger)" stopOpacity={0.2} />
            <stop offset="100%" stopColor="var(--color-danger)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "var(--color-ink-soft)" }}
          axisLine={{ stroke: "var(--color-line)" }}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 11, fill: "var(--color-ink-soft)" }}
          axisLine={false}
          tickLine={false}
          width={45}
          tickFormatter={(v) => `${Math.round(v / 1000)}k`}
        />
        <Tooltip
          contentStyle={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-line)",
            borderRadius: 12,
            fontSize: 12,
          }}
          formatter={(value, name) => [formatCurrency(Number(value)), name]}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Area
          type="monotone"
          dataKey="revenue"
          name="Revenue"
          stroke="var(--color-primary)"
          strokeWidth={2.5}
          fill="url(#revenueFill2)"
        />
        <Area
          type="monotone"
          dataKey="cost"
          name="Cost of goods"
          stroke="var(--color-danger)"
          strokeWidth={2}
          fill="url(#costFill)"
        />
        <Line
          type="monotone"
          dataKey="profit"
          name="Gross profit"
          stroke="var(--color-accent)"
          strokeWidth={2.5}
          dot={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
