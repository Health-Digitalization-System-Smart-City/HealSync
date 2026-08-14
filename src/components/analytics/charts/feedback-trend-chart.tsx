"use client";

import { useId, useState } from "react";
import { Calendar, Layers, LineChart, Smile, TrendingUp } from "lucide-react";
import type { FeedbackTrendPoint } from "@/lib/analytics/types";
import { cn } from "@/lib/utils";

export function FeedbackTrendChart({
  data,
  title = "Feedback Volume & Satisfaction Trend",
  subtitle = "Feedback submissions and satisfaction rates across time",
}: {
  data: FeedbackTrendPoint[];
  title?: string;
  subtitle?: string;
}) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [chartMode, setChartMode] = useState<"area" | "bars">("area");
  const gradientId = useId();

  if (!data || data.length === 0) {
    return (
      <div className="flex h-72 flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-6 text-center shadow-xs">
        <TrendingUp className="size-8 text-slate-300" />
        <p className="mt-2 text-sm font-semibold text-slate-700">
          No trend data available
        </p>
        <p className="text-xs text-slate-400">
          There are no feedback records in the chosen timeframe.
        </p>
      </div>
    );
  }

  // Calculate SVG dimensions and coordinate scales
  const maxTotal = Math.max(...data.map((d) => d.total), 1);
  const chartHeight = 200;
  const paddingX = 40;
  const paddingY = 25;
  const width = Math.max(500, data.length * 50);

  const points = data.map((d, index) => {
    const x =
      data.length === 1
        ? width / 2
        : paddingX + (index / (data.length - 1)) * (width - paddingX * 2);
    const y =
      chartHeight -
      paddingY -
      (d.total / maxTotal) * (chartHeight - paddingY * 2);
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, curr, idx) => {
    if (idx === 0) return `M ${curr.x} ${curr.y}`;
    const prev = points[idx - 1];
    const cpX = (prev.x + curr.x) / 2;
    return `${acc} C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`;
  }, "");

  const areaD = `${pathD} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`;

  const activePoint = activeIdx !== null ? points[activeIdx] : null;

  return (
    <div className="flex flex-col rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
            <TrendingUp className="size-4 text-blue-600" />
            {title}
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs font-semibold text-slate-600">
          <button
            type="button"
            onClick={() => setChartMode("area")}
            className={cn(
              "flex items-center gap-1 rounded-md px-2.5 py-1 transition",
              chartMode === "area"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-slate-500 hover:text-slate-900",
            )}
          >
            <LineChart className="size-3" />
            Area Trend
          </button>
          <button
            type="button"
            onClick={() => setChartMode("bars")}
            className={cn(
              "flex items-center gap-1 rounded-md px-2.5 py-1 transition",
              chartMode === "bars"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-slate-500 hover:text-slate-900",
            )}
          >
            <Layers className="size-3" />
            Stacked Bars
          </button>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="relative mt-4 overflow-x-auto">
        <div className="min-w-[500px]">
          {chartMode === "area" ? (
            <svg
              viewBox={`0 0 ${width} ${chartHeight}`}
              className="h-56 w-full overflow-visible"
              onMouseLeave={() => setActiveIdx(null)}
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const y =
                  chartHeight - paddingY - ratio * (chartHeight - paddingY * 2);
                const val = Math.round(ratio * maxTotal);
                return (
                  <g key={ratio}>
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={width - paddingX}
                      y2={y}
                      stroke="#f1f5f9"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                    />
                    <text
                      x={paddingX - 8}
                      y={y + 3}
                      textAnchor="end"
                      fontSize="10"
                      fill="#94a3b8"
                      className="font-mono font-medium select-none"
                    >
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Fill area */}
              <path d={areaD} fill={`url(#${gradientId})`} />

              {/* Stroke Line */}
              <path
                d={pathD}
                fill="none"
                stroke="#2563eb"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Interactive Points */}
              {points.map((p, index) => {
                const isActive = activeIdx === index;
                return (
                  <g
                    key={p.date}
                    className="cursor-pointer"
                    onMouseEnter={() => setActiveIdx(index)}
                  >
                    {/* Hover vertical guide */}
                    {isActive && (
                      <line
                        x1={p.x}
                        y1={paddingY}
                        x2={p.x}
                        y2={chartHeight - paddingY}
                        stroke="#93c5fd"
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                      />
                    )}

                    {/* Outer Circle Ring */}
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isActive ? 6 : 4}
                      fill="#ffffff"
                      stroke="#2563eb"
                      strokeWidth={isActive ? 3 : 2}
                      className="transition-all"
                    />

                    {/* Date label on X axis */}
                    <text
                      x={p.x}
                      y={chartHeight - 6}
                      textAnchor="middle"
                      fontSize="10"
                      fill={isActive ? "#1e293b" : "#64748b"}
                      fontWeight={isActive ? "700" : "500"}
                      className="transition-colors select-none"
                    >
                      {p.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          ) : (
            /* Stacked Bar Chart Mode */
            <div className="flex h-56 items-end gap-3 px-8 pt-4 pb-8">
              {data.map((d, index) => {
                const heightPercent = Math.max(
                  8,
                  Math.round((d.total / maxTotal) * 100),
                );
                const posPercent =
                  d.total > 0 ? (d.positive / d.total) * 100 : 0;
                const neuPercent =
                  d.total > 0 ? (d.neutral / d.total) * 100 : 0;
                const negPercent =
                  d.total > 0 ? (d.negative / d.total) * 100 : 0;
                const isActive = activeIdx === index;

                return (
                  <div
                    key={d.date}
                    onMouseEnter={() => setActiveIdx(index)}
                    onMouseLeave={() => setActiveIdx(null)}
                    className="group flex flex-1 cursor-pointer flex-col items-center gap-2"
                  >
                    <span className="font-mono text-[10px] font-bold text-slate-500 group-hover:text-blue-600">
                      {d.total}
                    </span>

                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={cn(
                        "flex w-full max-w-[36px] flex-col justify-end overflow-hidden rounded-t-md border border-slate-200 transition-all",
                        isActive
                          ? "ring-2 ring-blue-500 ring-offset-1"
                          : "group-hover:opacity-90",
                      )}
                    >
                      {/* Positive slice */}
                      <div
                        style={{ height: `${posPercent}%` }}
                        className="bg-emerald-500 transition-all"
                        title={`Positive: ${d.positive}`}
                      />
                      {/* Neutral slice */}
                      <div
                        style={{ height: `${neuPercent}%` }}
                        className="bg-slate-400 transition-all"
                        title={`Neutral: ${d.neutral}`}
                      />
                      {/* Negative slice */}
                      <div
                        style={{ height: `${negPercent}%` }}
                        className="bg-amber-500 transition-all"
                        title={`Needs Attention: ${d.negative}`}
                      />
                    </div>

                    <span
                      className={cn(
                        "text-[10px] font-medium whitespace-nowrap transition-colors",
                        isActive
                          ? "font-bold text-slate-900"
                          : "text-slate-500",
                      )}
                    >
                      {d.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Interactive Tooltip Card */}
      {activePoint && (
        <div className="animate-in fade-in mt-3 rounded-lg border border-blue-100 bg-blue-50/70 p-3 text-xs text-slate-800 duration-150">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-200/50 pb-2">
            <span className="flex items-center gap-1.5 font-bold text-blue-950">
              <Calendar className="size-3.5 text-blue-600" />
              {activePoint.date} ({activePoint.label})
            </span>
            <span className="font-semibold text-slate-700">
              Total Submissions:{" "}
              <strong className="text-slate-900">{activePoint.total}</strong>
            </span>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="flex items-center gap-1.5 text-emerald-700">
              <span className="size-2 rounded-full bg-emerald-500" />
              <span>
                Positive: <strong>{activePoint.positive}</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-700">
              <span className="size-2 rounded-full bg-slate-400" />
              <span>
                Neutral: <strong>{activePoint.neutral}</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-700">
              <span className="size-2 rounded-full bg-amber-500" />
              <span>
                Needs Attention: <strong>{activePoint.negative}</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-semibold text-blue-700">
              <Smile className="size-3.5" />
              <span>
                Satisfaction: <strong>{activePoint.satisfactionRate}%</strong>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Legend Footer */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-emerald-500" />
            <span>Positive</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-slate-400" />
            <span>Neutral</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-amber-500" />
            <span>Needs Attention</span>
          </div>
        </div>
        <span className="text-[11px] text-slate-400">
          Hover data points to inspect breakdowns
        </span>
      </div>
    </div>
  );
}
