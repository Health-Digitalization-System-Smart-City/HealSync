"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PieChart, Star } from "lucide-react";
import type { SatisfactionDistributionItem } from "@/lib/analytics/types";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/ui/animated-number";

export interface RatingDistributionVisualProps {
  distribution: SatisfactionDistributionItem[];
  totalCount: number;
  onSelectRating?: (rating: string) => void;
  selectedRating?: string;
  className?: string;
}

const CHART_COLORS = {
  positive: "#10b981",
  neutral: "#94a3b8",
  needsAttention: "#f59e0b",
};

const TONE_LABELS = {
  positive: {
    text: "Positive",
    color: "text-emerald-600 dark:text-emerald-400",
  },
  neutral: { text: "Neutral", color: "text-muted-foreground" },
  needsAttention: {
    text: "Needs Attention",
    color: "text-amber-600 dark:text-amber-400",
  },
};

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: SatisfactionDistributionItem;
    value: number;
  }>;
}

function ChartTooltip({ active, payload }: ChartTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0].payload;

  return (
    <div className="border-border bg-popover/95 text-popover-foreground rounded-xl border p-3 shadow-xl backdrop-blur-md">
      <div className="flex items-center gap-2">
        <Star className="size-3 fill-amber-400 text-amber-400" />
        <span className="text-foreground text-xs font-bold">{item.label}</span>
        <span className="text-muted-foreground text-xs">({item.score}/7)</span>
      </div>
      <div className="mt-2 space-y-1 text-xs">
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Count:</span>
          <span className="text-foreground font-bold">{item.count}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Share:</span>
          <span className="text-foreground font-bold">{item.percentage}%</span>
        </div>
      </div>
    </div>
  );
}

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

  const positivePercent =
    totalCount > 0 ? Math.round((positiveTotal / totalCount) * 100) : 0;
  const neutralPercent =
    totalCount > 0 ? Math.round((neutralTotal / totalCount) * 100) : 0;
  const negativePercent =
    totalCount > 0 ? Math.round((negativeTotal / totalCount) * 100) : 0;

  // Calculate weighted average for the gauge
  const weightedAvg =
    totalCount > 0
      ? distribution.reduce((sum, d) => sum + d.score * d.count, 0) / totalCount
      : 0;

  const chartData = distribution.map((d) => ({
    ...d,
    barColor: CHART_COLORS[d.tone],
  }));

  return (
    <div
      className={cn(
        "border-border/80 bg-card flex flex-col overflow-hidden rounded-2xl border shadow-xs transition-all",
        className,
      )}
    >
      {/* Header */}
      <div className="border-border/60 border-b p-5 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/15 to-purple-500/10 text-violet-600 dark:text-violet-400">
              <PieChart className="size-4.5" aria-hidden />
            </span>
            <div>
              <h3 className="text-foreground text-sm font-bold tracking-tight sm:text-base">
                Rating Distribution
              </h3>
              <p className="text-muted-foreground mt-0.5 text-xs">
                8-point healthcare satisfaction scale
              </p>
            </div>
          </div>

          <span className="border-border bg-muted/50 text-foreground rounded-full border px-2.5 py-0.5 text-xs font-semibold">
            <AnimatedNumber
              value={totalCount}
              suffix=" ratings"
              duration={1000}
            />
          </span>
        </div>

        {/* Score Gauge */}
        <div className="bg-muted/40 border-border/50 mt-4 rounded-xl border p-4">
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex size-14 items-center justify-center rounded-2xl border-2 font-mono text-xl font-bold",
                  weightedAvg >= 5
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
                    : weightedAvg >= 3
                      ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300"
                      : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
                )}
              >
                {weightedAvg.toFixed(1)}
              </div>
              <span className="text-muted-foreground mt-1 text-[10px]">
                out of 7
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-foreground">
                  Overall Score Distribution
                </span>
              </div>
              <div className="bg-muted mt-2 flex h-3 w-full overflow-hidden rounded-full">
                <div
                  style={{ width: `${positivePercent}%` }}
                  className="bg-emerald-500 transition-all duration-500"
                  title={`Positive: ${positivePercent}%`}
                />
                <div
                  style={{ width: `${neutralPercent}%` }}
                  className="bg-slate-400 transition-all duration-500 dark:bg-slate-500"
                  title={`Neutral: ${neutralPercent}%`}
                />
                <div
                  style={{ width: `${negativePercent}%` }}
                  className="bg-amber-500 transition-all duration-500"
                  title={`Needs Attention: ${negativePercent}%`}
                />
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-emerald-500" />
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                    {positivePercent}% Positive
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-slate-400" />
                  <span className="text-muted-foreground font-semibold">
                    {neutralPercent}% Neutral
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-amber-500" />
                  <span className="font-semibold text-amber-700 dark:text-amber-400">
                    {negativePercent}% Attention
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="px-5 pt-4">
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 5, left: -15, bottom: 0 }}
            >
              <XAxis
                dataKey="score"
                tick={{ fontSize: 11, fill: "currentColor" }}
                className="text-muted-foreground"
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `${val}`}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "currentColor" }}
                className="text-muted-foreground"
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ fill: "currentColor", opacity: 0.05 }}
              />
              <Bar
                dataKey="count"
                radius={[6, 6, 0, 0]}
                maxBarSize={40}
                onClick={(data: unknown) => {
                  const item = data as { rating?: string };
                  if (item.rating) onSelectRating?.(item.rating);
                }}
              >
                {chartData.map((entry) => (
                  <Cell
                    key={entry.rating}
                    fill={entry.barColor}
                    fillOpacity={
                      selectedRating && selectedRating !== entry.rating
                        ? 0.3
                        : 1
                    }
                    className="cursor-pointer transition-opacity"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sentiment Breakdown Cards */}
      <div className="grid grid-cols-3 gap-2 px-5 pt-2 pb-4">
        <div className="rounded-xl border border-emerald-200/60 bg-emerald-50 p-3 text-center dark:border-emerald-500/20 dark:bg-emerald-500/10">
          <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
            <AnimatedNumber value={positivePercent} suffix="" duration={1000} />
            %
          </p>
          <p className="mt-0.5 text-[11px] font-medium text-emerald-700/70 dark:text-emerald-400/70">
            Positive (5–7)
          </p>
          <p className="text-[10px] text-emerald-700/60 dark:text-emerald-400/60">
            <AnimatedNumber
              value={positiveTotal}
              suffix=" responses"
              duration={1000}
            />
          </p>
        </div>

        <div className="border-border/60 bg-muted/30 rounded-xl border p-3 text-center">
          <p className="text-foreground text-xl font-bold">
            <AnimatedNumber
              value={neutralPercent}
              suffix=""
              duration={1000}
              delay={100}
            />
            %
          </p>
          <p className="text-muted-foreground mt-0.5 text-[11px] font-medium">
            Neutral (3–4)
          </p>
          <p className="text-muted-foreground/60 text-[10px]">
            <AnimatedNumber
              value={neutralTotal}
              suffix=" responses"
              duration={1000}
              delay={100}
            />
          </p>
        </div>

        <div className="rounded-xl border border-amber-200/60 bg-amber-50 p-3 text-center dark:border-amber-500/20 dark:bg-amber-500/10">
          <p className="text-xl font-bold text-amber-700 dark:text-amber-300">
            <AnimatedNumber
              value={negativePercent}
              suffix=""
              duration={1000}
              delay={200}
            />
            %
          </p>
          <p className="mt-0.5 text-[11px] font-medium text-amber-700/70 dark:text-amber-400/70">
            Attention (0–2)
          </p>
          <p className="text-[10px] text-amber-700/60 dark:text-amber-400/60">
            <AnimatedNumber
              value={negativeTotal}
              suffix=" responses"
              duration={1000}
              delay={200}
            />
          </p>
        </div>
      </div>

      {/* Rating Tiers */}
      <div className="border-border/60 mx-5 mb-4 rounded-xl border">
        {(["positive", "neutral", "needsAttention"] as const).map((tone) => {
          const toneItems = distribution.filter((d) => d.tone === tone);
          const toneLabel = TONE_LABELS[tone];
          const toneTotal = toneItems.reduce((sum, d) => sum + d.count, 0);
          const tonePercent =
            totalCount > 0 ? Math.round((toneTotal / totalCount) * 100) : 0;

          return (
            <div
              key={tone}
              className={cn(
                "border-border/60 last:border-b-0",
                tone !== "needsAttention" && "border-b",
              )}
            >
              <div className="flex items-center justify-between px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className={cn("text-xs font-bold", toneLabel.color)}>
                    {toneLabel.text}
                  </span>
                  <span className="text-muted-foreground text-[11px]">
                    <AnimatedNumber value={toneTotal} duration={800} /> ·{" "}
                    <AnimatedNumber
                      value={tonePercent}
                      suffix=""
                      duration={800}
                    />
                    %
                  </span>
                </div>
              </div>
              <div className="space-y-1 px-3 pb-2.5">
                {toneItems.map((item) => (
                  <div
                    key={item.rating}
                    onClick={() => onSelectRating?.(item.rating)}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 transition-colors",
                      selectedRating === item.rating
                        ? "bg-primary/5"
                        : "hover:bg-muted/50",
                    )}
                  >
                    <span className="text-foreground min-w-[40px] text-xs font-semibold">
                      {item.label}
                    </span>
                    <div className="bg-muted h-1.5 flex-1 overflow-hidden rounded-full">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-300",
                          tone === "positive"
                            ? "bg-emerald-500"
                            : tone === "neutral"
                              ? "bg-slate-400 dark:bg-slate-500"
                              : "bg-amber-500",
                        )}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="text-muted-foreground w-8 text-right font-mono text-[11px]">
                      <AnimatedNumber value={item.count} duration={600} />
                    </span>
                    <span className="text-muted-foreground w-10 text-right font-mono text-[11px] font-semibold">
                      <AnimatedNumber
                        value={item.percentage}
                        suffix=""
                        duration={600}
                      />
                      %
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="border-border/60 text-muted-foreground flex items-center justify-between border-t px-5 py-3 text-[11px]">
        <span>Higher scores (5–7) drive satisfaction index</span>
        <span>Standardized scale</span>
      </div>
    </div>
  );
}
