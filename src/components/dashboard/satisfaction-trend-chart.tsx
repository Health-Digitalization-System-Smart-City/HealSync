"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Calendar,
  Layers,
  LineChart as LineChartIcon,
  Smile,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import type { FeedbackTrendPoint } from "@/lib/analytics/types";
import { cn } from "@/lib/utils";

export interface SatisfactionTrendChartProps {
  data: FeedbackTrendPoint[];
  title?: string;
  subtitle?: string;
  onSelectPoint?: (point: FeedbackTrendPoint) => void;
  className?: string;
}

type MetricMode = "satisfaction" | "volume" | "breakdown";

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: FeedbackTrendPoint;
    dataKey: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

function CustomChartTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  const point = payload[0].payload;

  return (
    <div className="border-border bg-popover/95 text-popover-foreground rounded-xl border p-3.5 shadow-xl backdrop-blur-md">
      <div className="border-border/60 flex items-center justify-between gap-3 border-b pb-2">
        <div className="flex items-center gap-1.5 font-bold text-xs">
          <Calendar className="text-primary size-3.5" aria-hidden />
          <span>{point.date}</span>
          <span className="text-muted-foreground font-normal">({point.label})</span>
        </div>
        <span className="bg-primary/10 text-primary rounded-md px-1.5 py-0.5 font-mono text-[11px] font-bold">
          {point.total} Total
        </span>
      </div>

      <div className="mt-2.5 space-y-1.5 text-xs">
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground flex items-center gap-1.5">
            <Smile className="size-3.5 text-emerald-500" />
            Satisfaction Rate:
          </span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400">
            {point.satisfactionRate}%
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-border/40 text-[11px]">
          <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
            <span className="size-2 rounded-full bg-emerald-500" />
            <span>Pos: {point.positive}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <span className="size-2 rounded-full bg-slate-400" />
            <span>Neu: {point.neutral}</span>
          </div>
          <div className="flex items-center gap-1 text-amber-700 dark:text-amber-400">
            <span className="size-2 rounded-full bg-amber-500" />
            <span>Neg: {point.negative}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SatisfactionTrendChart({
  data,
  title = "Patient Satisfaction & Feedback Volume Trend",
  subtitle = "Interactive longitudinal analysis of sentiment over time",
  onSelectPoint,
  className,
}: SatisfactionTrendChartProps) {
  const [metricMode, setMetricMode] = React.useState<MetricMode>("satisfaction");

  if (!data || data.length === 0) {
    return (
      <div
        className={cn(
          "border-border/80 bg-card flex h-80 flex-col items-center justify-center rounded-2xl border p-8 text-center shadow-xs",
          className,
        )}
      >
        <div className="bg-muted flex size-12 items-center justify-center rounded-2xl">
          <TrendingUp className="text-muted-foreground size-6" />
        </div>
        <p className="text-foreground mt-3 text-sm font-bold">
          No Trend Data for This Period
        </p>
        <p className="text-muted-foreground mt-1 max-w-sm text-xs">
          Try expanding your date range filters or selecting all clinic branches to view trend patterns.
        </p>
      </div>
    );
  }

  // Calculate average satisfaction rate in dataset
  const avgSatisfaction = Math.round(
    data.reduce((acc, curr) => acc + curr.satisfactionRate, 0) / (data.length || 1),
  );
  const totalSubmissions = data.reduce((acc, curr) => acc + curr.total, 0);

  return (
    <div
      className={cn(
        "border-border/80 bg-card flex flex-col justify-between overflow-hidden rounded-2xl border p-5 shadow-xs transition-all",
        className,
      )}
    >
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-primary/20">
              <TrendingUp className="size-4" aria-hidden />
            </span>
            <h3 className="text-foreground text-base font-bold tracking-tight">
              {title}
            </h3>
          </div>
          <p className="text-muted-foreground mt-1 text-xs">{subtitle}</p>
        </div>

        {/* View metric toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Stat Pill */}
          <div className="hidden items-center gap-2 rounded-lg border border-border/80 bg-muted/30 px-2.5 py-1 text-xs font-semibold md:flex">
            <span className="text-muted-foreground">Period Avg:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              {avgSatisfaction}%
            </span>
            <span className="text-muted-foreground/40">·</span>
            <span className="text-foreground">{totalSubmissions} Total</span>
          </div>

          <div className="bg-muted/60 border-border/60 flex items-center rounded-lg border p-0.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setMetricMode("satisfaction")}
              className={cn(
                "flex items-center gap-1 rounded-md px-2.5 py-1 transition",
                metricMode === "satisfaction"
                  ? "bg-card text-primary font-bold shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <LineChartIcon className="size-3" />
              Satisfaction %
            </button>
            <button
              type="button"
              onClick={() => setMetricMode("volume")}
              className={cn(
                "flex items-center gap-1 rounded-md px-2.5 py-1 transition",
                metricMode === "volume"
                  ? "bg-card text-primary font-bold shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <TrendingUp className="size-3" />
              Volume
            </button>
            <button
              type="button"
              onClick={() => setMetricMode("breakdown")}
              className={cn(
                "flex items-center gap-1 rounded-md px-2.5 py-1 transition",
                metricMode === "breakdown"
                  ? "bg-card text-primary font-bold shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Layers className="size-3" />
              Breakdown
            </button>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="mt-5 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {metricMode === "satisfaction" ? (
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              onClick={(state: unknown) => {
                const chartState = state as { activePayload?: Array<{ payload: FeedbackTrendPoint }> };
                if (chartState?.activePayload?.[0]?.payload && onSelectPoint) {
                  onSelectPoint(chartState.activePayload[0].payload);
                }
              }}
            >
              <defs>
                <linearGradient id="satTrendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border/40" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "currentColor" }}
                className="text-muted-foreground"
                tickLine={false}
                axisLine={{ stroke: "currentColor" }}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: "currentColor" }}
                className="text-muted-foreground"
                tickLine={false}
                tickFormatter={(val) => `${val}%`}
              />
              <Tooltip content={<CustomChartTooltip />} />
              <Area
                type="monotone"
                dataKey="satisfactionRate"
                stroke="var(--primary)"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#satTrendGrad)"
                activeDot={{ r: 6, fill: "var(--primary)", stroke: "#ffffff", strokeWidth: 2 }}
              />
            </AreaChart>
          ) : metricMode === "volume" ? (
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              onClick={(state: unknown) => {
                const chartState = state as { activePayload?: Array<{ payload: FeedbackTrendPoint }> };
                if (chartState?.activePayload?.[0]?.payload && onSelectPoint) {
                  onSelectPoint(chartState.activePayload[0].payload);
                }
              }}
            >
              <defs>
                <linearGradient id="volTrendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border/40" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "currentColor" }}
                className="text-muted-foreground"
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "currentColor" }}
                className="text-muted-foreground"
                tickLine={false}
              />
              <Tooltip content={<CustomChartTooltip />} />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#2563eb"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#volTrendGrad)"
                activeDot={{ r: 6, fill: "#2563eb", stroke: "#ffffff", strokeWidth: 2 }}
              />
            </AreaChart>
          ) : (
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              onClick={(state: unknown) => {
                const chartState = state as { activePayload?: Array<{ payload: FeedbackTrendPoint }> };
                if (chartState?.activePayload?.[0]?.payload && onSelectPoint) {
                  onSelectPoint(chartState.activePayload[0].payload);
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border/40" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "currentColor" }}
                className="text-muted-foreground"
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "currentColor" }}
                className="text-muted-foreground"
                tickLine={false}
              />
              <Tooltip content={<CustomChartTooltip />} />
              <Bar dataKey="positive" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} name="Positive" />
              <Bar dataKey="neutral" stackId="a" fill="#94a3b8" radius={[0, 0, 0, 0]} name="Neutral" />
              <Bar dataKey="negative" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Needs Attention" />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Interactive Legend & Micro-actions */}
      <div className="border-border/60 mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-3 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-emerald-500" />
            <span className="text-muted-foreground">Positive (5–7)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-slate-400" />
            <span className="text-muted-foreground">Neutral (3–4)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-amber-500" />
            <span className="text-muted-foreground">Needs Attention (0–2)</span>
          </div>
        </div>

        <span className="text-muted-foreground text-[11px]">
          Hover data points for breakdowns · Click to filter feedback
        </span>
      </div>
    </div>
  );
}
