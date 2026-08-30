"use client";

import * as React from "react";
import { PieChart, Star } from "lucide-react";
import type { SatisfactionDistributionItem } from "@/lib/analytics/types";
import { cn } from "@/lib/utils";

export interface RatingDistributionVisualProps {
  distribution: SatisfactionDistributionItem[];
  totalCount: number;
  onSelectRating?: (rating: string) => void;
  selectedRating?: string;
  className?: string;
}

const TONE_BARS = {
  positive: "bg-emerald-500",
  neutral: "bg-slate-400 dark:bg-slate-500",
  needsAttention: "bg-amber-500",
};

const TONE_CHIPS = {
  positive:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300",
  neutral:
    "border-border bg-muted text-muted-foreground",
  needsAttention:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
};

export function RatingDistributionVisual({
  distribution,
  totalCount,
  onSelectRating,
  selectedRating,
  className,
}: RatingDistributionVisualProps) {
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
    <div
      className={cn(
        "border-border/80 bg-card flex flex-col justify-between overflow-hidden rounded-2xl border p-5 shadow-xs transition-all",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <PieChart className="size-4" aria-hidden />
            </span>
            <h3 className="text-foreground text-base font-bold tracking-tight">
              Rating & Sentiment Distribution
            </h3>
          </div>
          <p className="text-muted-foreground mt-1 text-xs">
            Standardized 8-point healthcare rating scale breakdown
          </p>
        </div>

        <span className="border-border bg-muted/50 text-foreground rounded-full border px-2.5 py-0.5 text-xs font-semibold">
          {totalCount.toLocaleString()} ratings
        </span>
      </div>

      {/* Aggregate Sentiment Balance Bar */}
      <div className="border-border/70 bg-muted/30 mt-4 rounded-xl border p-3.5">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-foreground">Overall Sentiment Balance</span>
          <span className="text-muted-foreground">{totalCount} total</span>
        </div>

        {/* Multi-segment Progress Bar */}
        <div className="bg-muted mt-2.5 flex h-3 w-full overflow-hidden rounded-full">
          <div
            style={{ width: `${positivePercent}%` }}
            className="bg-emerald-500 transition-all duration-500"
            title={`Positive: ${positivePercent}%`}
          />
          <div
            style={{ width: `${neutralPercent}%` }}
            className="bg-slate-400 dark:bg-slate-500 transition-all duration-500"
            title={`Neutral: ${neutralPercent}%`}
          />
          <div
            style={{ width: `${negativePercent}%` }}
            className="bg-amber-500 transition-all duration-500"
            title={`Needs Attention: ${negativePercent}%`}
          />
        </div>

        {/* Breakdown chips */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400">
            <span className="size-2 rounded-full bg-emerald-500" />
            <span>
              Positive: {positivePercent}% ({positiveTotal})
            </span>
          </div>
          <div className="flex items-center gap-1.5 font-semibold text-muted-foreground">
            <span className="size-2 rounded-full bg-slate-400" />
            <span>
              Neutral: {neutralPercent}% ({neutralTotal})
            </span>
          </div>
          <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400">
            <span className="size-2 rounded-full bg-amber-500" />
            <span>
              Attention: {negativePercent}% ({negativeTotal})
            </span>
          </div>
        </div>
      </div>

      {/* 8-tier Rating List */}
      <div className="mt-4 divide-y divide-border/60">
        {distribution.map((item) => {
          const isSelected = selectedRating === item.rating;
          const barColor = TONE_BARS[item.tone];
          const badgeStyle = TONE_CHIPS[item.tone];

          return (
            <div
              key={item.rating}
              onClick={() => onSelectRating?.(item.rating)}
              className={cn(
                "group cursor-pointer py-2.5 transition-colors duration-150 first:pt-2 last:pb-1",
                isSelected && "bg-primary/5 rounded-lg px-2",
              )}
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-foreground font-semibold group-hover:text-primary transition-colors">
                    {item.label}
                  </span>
                  <span className="bg-muted text-muted-foreground inline-flex items-center gap-1 rounded-md px-1.5 py-0.2 font-mono text-[10px] font-medium">
                    <Star className="size-2.5 fill-amber-400 text-amber-400" />
                    {item.score}/7
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground font-mono text-xs font-semibold">
                    {item.count}
                  </span>
                  <span
                    className={cn(
                      "w-12 rounded-md border px-1.5 py-0.5 text-right font-mono text-[11px] font-bold",
                      badgeStyle,
                    )}
                  >
                    {item.percentage}%
                  </span>
                </div>
              </div>

              {/* Progress Track */}
              <div className="bg-muted mt-1.5 h-1.5 w-full overflow-hidden rounded-full">
                <div
                  style={{ width: `${item.percentage}%` }}
                  className={cn("h-full rounded-full transition-all duration-300", barColor)}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Helper */}
      <div className="border-border/60 mt-3 flex items-center justify-between border-t pt-2.5 text-[11px] text-muted-foreground">
        <span>Higher ratings (5–7) drive clinic satisfaction index</span>
        <span>Standardized scale</span>
      </div>
    </div>
  );
}
