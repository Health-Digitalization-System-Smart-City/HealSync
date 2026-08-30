"use client";

import { useState } from "react";
import { Calendar, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrendData {
  date: string;
  count: number;
  satisfactionRate: number;
}

export function FeedbackTrendChart({ data }: { data: TrendData[] }) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex h-48 flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-6 text-center shadow-xs">
        <TrendingUp className="size-8 text-slate-300" />
        <p className="mt-2 text-sm font-semibold text-slate-700">
          No trend data available
        </p>
      </div>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const chartHeight = 200;
  const paddingX = 40;
  const paddingY = 25;
  const width = Math.max(500, data.length * 60);

  const points = data.map((d, index) => {
    const x =
      data.length === 1
        ? width / 2
        : paddingX + (index / (data.length - 1)) * (width - paddingX * 2);
    const y =
      chartHeight -
      paddingY -
      (d.count / maxCount) * (chartHeight - paddingY * 2);
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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${width} ${chartHeight}`}
        className="h-56 w-full overflow-visible"
        onMouseLeave={() => setActiveIdx(null)}
      >
        <defs>
          <linearGradient id="branchTrendGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y =
            chartHeight - paddingY - ratio * (chartHeight - paddingY * 2);
          const val = Math.round(ratio * maxCount);
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
        <path d={areaD} fill="url(#branchTrendGradient)" />

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
                {formatDate(p.date)}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Interactive Tooltip Card */}
      {activePoint && (
        <div className="absolute top-2 right-2 animate-in fade-in rounded-lg border border-blue-100 bg-blue-50/70 p-3 text-xs text-slate-800 shadow-lg">
          <div className="flex items-center gap-1.5 font-bold text-blue-950">
            <Calendar className="size-3.5 text-blue-600" />
            {formatDate(activePoint.date)}
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div>
              <span className="text-slate-600">Feedback:</span>
              <strong className="ml-1 text-slate-900">{activePoint.count}</strong>
            </div>
            <div>
              <span className="text-slate-600">Satisfaction:</span>
              <strong className="ml-1 text-slate-900">{activePoint.satisfactionRate}%</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}