"use client";

import { PieChart, Star } from "lucide-react";
import type { SatisfactionDistributionItem } from "@/lib/analytics/types";
import { cn } from "@/lib/utils";

const TONE_BAR_COLORS = {
  positive: "bg-emerald-500",
  neutral: "bg-slate-400",
  needsAttention: "bg-amber-500",
};

const TONE_BADGES = {
  positive: "text-emerald-700 bg-emerald-50 border-emerald-200",
  neutral: "text-slate-700 bg-slate-100 border-slate-200",
  needsAttention: "text-amber-700 bg-amber-50 border-amber-200",
};

export function SatisfactionDistributionChart({
  distribution,
  totalCount,
}: {
  distribution: SatisfactionDistributionItem[];
  totalCount: number;
}) {
  const positiveTotal = distribution
    .filter((d) => d.tone === "positive")
    .reduce((sum, d) => sum + d.count, 0);

  const neutralTotal = distribution
    .filter((d) => d.tone === "neutral")
    .reduce((sum, d) => sum + d.count, 0);

  const negativeTotal = distribution
    .filter((d) => d.tone === "needsAttention")
    .reduce((sum, d) => sum + d.count, 0);

  const positivePercent = totalCount > 0 ? Math.round((positiveTotal / totalCount) * 100) : 0;
  const neutralPercent = totalCount > 0 ? Math.round((neutralTotal / totalCount) * 100) : 0;
  const negativePercent = totalCount > 0 ? Math.round((negativeTotal / totalCount) * 100) : 0;

  return (
    <div className="flex flex-col rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="border-b border-slate-100 pb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <PieChart className="size-4 text-emerald-600" />
            Satisfaction Distribution
          </h3>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
            {totalCount.toLocaleString()} ratings
          </span>
        </div>
        <p className="mt-0.5 text-xs text-slate-500">
          Distribution across 8 standardized patient satisfaction levels
        </p>
      </div>

      {/* Sentiment Aggregate Bar */}
      <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-600">Overall Sentiment Balance</span>
          <span className="text-slate-800 font-bold">{totalCount} total</span>
        </div>

        {/* Multi-segment Progress Bar */}
        <div className="mt-2 flex h-3 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            style={{ width: `${positivePercent}%` }}
            className="bg-emerald-500 transition-all duration-500"
            title={`Positive: ${positivePercent}%`}
          />
          <div
            style={{ width: `${neutralPercent}%` }}
            className="bg-slate-400 transition-all duration-500"
            title={`Neutral: ${neutralPercent}%`}
          />
          <div
            style={{ width: `${negativePercent}%` }}
            className="bg-amber-500 transition-all duration-500"
            title={`Needs Attention: ${negativePercent}%`}
          />
        </div>

        {/* Proportions Breakdown */}
        <div className="mt-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
            <span className="size-2 rounded-full bg-emerald-500" />
            <span>Positive: {positivePercent}% ({positiveTotal})</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
            <span className="size-2 rounded-full bg-slate-400" />
            <span>Neutral: {neutralPercent}% ({neutralTotal})</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-700 font-semibold">
            <span className="size-2 rounded-full bg-amber-500" />
            <span>Needs Attention: {negativePercent}% ({negativeTotal})</span>
          </div>
        </div>
      </div>

      {/* Detailed Rating Scale List */}
      <div className="mt-4 divide-y divide-slate-100">
        {distribution.map((item) => {
          const barColor = TONE_BAR_COLORS[item.tone];
          const badgeStyle = TONE_BADGES[item.tone];

          return (
            <div key={item.rating} className="py-2.5 first:pt-0 last:pb-0">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800">{item.label}</span>
                  <span className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.2 text-[10px] font-mono font-medium text-slate-500 bg-slate-100">
                    <Star className="size-2.5 fill-amber-400 text-amber-400" />
                    {item.score}/7
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-slate-700">
                    {item.count}
                  </span>
                  <span
                    className={cn(
                      "w-12 text-right rounded px-1.5 py-0.5 text-[11px] font-bold border",
                      badgeStyle,
                    )}
                  >
                    {item.percentage}%
                  </span>
                </div>
              </div>

              {/* Progress Track */}
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  style={{ width: `${item.percentage}%` }}
                  className={cn("h-full rounded-full transition-all duration-300", barColor)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
