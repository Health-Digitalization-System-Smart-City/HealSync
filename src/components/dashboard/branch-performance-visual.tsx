"use client";

import * as React from "react";
import {
  Award,
  Building2,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  List,
  Minus,
  Star,
  ThumbsDown,
  ThumbsUp,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import type { BranchComparisonItem } from "@/lib/analytics/types";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/ui/animated-number";

export interface BranchPerformanceVisualProps {
  branches: BranchComparisonItem[];
  onSelectBranch?: (branchId: string) => void;
  selectedBranchId?: string;
  className?: string;
}

type SortKey = "satisfaction" | "volume" | "negative";
type ViewMode = "table" | "grid";

const RANK_STYLES = [
  {
    medal:
      "bg-gradient-to-br from-amber-400 to-yellow-500 text-white shadow-amber-300/40 shadow-md",
    label: "Top",
  },
  {
    medal:
      "bg-gradient-to-br from-slate-300 to-slate-400 text-white shadow-slate-300/30 shadow-md",
    label: "2nd",
  },
  {
    medal:
      "bg-gradient-to-br from-orange-300 to-orange-400 text-white shadow-orange-300/30 shadow-md",
    label: "3rd",
  },
];

function SentimentPill({
  value,
  label,
  color,
}: {
  value: number;
  label: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={cn("size-2 rounded-full", color)} />
      <span className="text-foreground text-xs font-semibold">
        <AnimatedNumber value={value} duration={800} />
      </span>
      <span className="text-muted-foreground text-[11px]">{label}</span>
    </div>
  );
}

function getSatisfactionBadge(rate: number) {
  if (rate >= 75)
    return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300";
  if (rate >= 50)
    return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300";
  return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300";
}

function getSatisfactionColor(rate: number) {
  if (rate >= 75) return "from-emerald-500 to-emerald-400";
  if (rate >= 50) return "from-blue-500 to-blue-400";
  return "from-amber-500 to-orange-400";
}

export function BranchPerformanceVisual({
  branches,
  onSelectBranch,
  selectedBranchId,
  className,
}: BranchPerformanceVisualProps) {
  const [sortBy, setSortBy] = React.useState<SortKey>("satisfaction");
  const [viewMode, setViewMode] = React.useState<ViewMode>("table");
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  const sortedBranches = React.useMemo(() => {
    return [...branches].sort((a, b) => {
      if (sortBy === "satisfaction") {
        return (
          b.satisfactionRate - a.satisfactionRate ||
          b.totalFeedback - a.totalFeedback
        );
      }
      if (sortBy === "volume") {
        return (
          b.totalFeedback - a.totalFeedback ||
          b.satisfactionRate - a.satisfactionRate
        );
      }
      return (
        b.negativeCount - a.negativeCount ||
        b.satisfactionRate - a.satisfactionRate
      );
    });
  }, [branches, sortBy]);

  const maxVolume = React.useMemo(
    () => Math.max(...branches.map((b) => b.totalFeedback), 1),
    [branches],
  );

  const avgSatisfaction = React.useMemo(
    () =>
      branches.length > 0
        ? Math.round(
            branches.reduce((sum, b) => sum + b.satisfactionRate, 0) /
              branches.length,
          )
        : 0,
    [branches],
  );

  const toggleExpand = (branchId: string) => {
    setExpandedId((prev) => (prev === branchId ? null : branchId));
  };

  return (
    <div
      className={cn(
        "border-border/80 bg-card flex flex-col overflow-hidden rounded-2xl border shadow-xs transition-all",
        className,
      )}
    >
      {/* Header */}
      <div className="border-border/60 border-b p-5 pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/15 to-indigo-500/10 text-blue-600 dark:text-blue-400">
              <Building2 className="size-4.5" aria-hidden />
            </span>
            <div>
              <h3 className="text-foreground text-sm font-bold tracking-tight sm:text-base">
                Branch Performance
              </h3>
              <p className="text-muted-foreground mt-0.5 text-xs">
                Satisfaction ranking across {branches.length} branches
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Sort Controls */}
            <div className="bg-muted/60 border-border/60 flex items-center rounded-xl border p-0.5 text-[11px] font-semibold">
              {(
                [
                  {
                    key: "satisfaction" as SortKey,
                    label: "Rating",
                    icon: TrendingUp,
                  },
                  { key: "volume" as SortKey, label: "Volume", icon: Minus },
                  {
                    key: "negative" as SortKey,
                    label: "Issues",
                    icon: TrendingDown,
                  },
                ] as const
              ).map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSortBy(key)}
                  className={cn(
                    "flex items-center gap-1 rounded-lg px-2.5 py-1.5 transition-all",
                    sortBy === key
                      ? "bg-card text-foreground font-bold shadow-xs"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="size-3" />
                  {label}
                </button>
              ))}
            </div>

            {/* View Toggle */}
            <div className="bg-muted/60 border-border/60 flex items-center rounded-xl border p-0.5">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={cn(
                  "flex size-7 items-center justify-center rounded-lg transition-all",
                  viewMode === "table"
                    ? "bg-card text-foreground font-bold shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
                title="Table view"
              >
                <List className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={cn(
                  "flex size-7 items-center justify-center rounded-lg transition-all",
                  viewMode === "grid"
                    ? "bg-card text-foreground font-bold shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
                title="Grid view"
              >
                <LayoutGrid className="size-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Average Indicator */}
        <div className="bg-muted/40 border-border/50 mt-3 flex items-center gap-3 rounded-xl border px-3.5 py-2">
          <span className="text-muted-foreground text-xs">Benchmark avg:</span>
          <span className="text-foreground text-xs font-bold">
            <AnimatedNumber value={avgSatisfaction} suffix="%" duration={800} />
          </span>
          <div className="bg-border/60 mx-1 h-3 w-px" />
          <span className="text-muted-foreground text-xs">
            {
              branches.filter((b) => b.satisfactionRate >= avgSatisfaction)
                .length
            }{" "}
            above ·{" "}
            {
              branches.filter((b) => b.satisfactionRate < avgSatisfaction)
                .length
            }{" "}
            below
          </span>
        </div>
      </div>

      {/* ===== TABLE VIEW ===== */}
      {viewMode === "table" && (
        <div className="p-4">
          {sortedBranches.length === 0 ? (
            <div className="border-border/60 bg-muted/20 flex flex-col items-center justify-center rounded-xl border border-dashed py-10 text-center">
              <Building2 className="text-muted-foreground size-8" />
              <p className="text-muted-foreground mt-2 text-xs">
                No branch data available for this period
              </p>
            </div>
          ) : (
            <div className="border-border/60 overflow-hidden rounded-xl border">
              {/* Table Header */}
              <div className="bg-muted/50 border-border/60 text-muted-foreground flex items-center gap-2 border-b px-3 py-2 text-[11px] font-semibold tracking-wider uppercase">
                <span className="w-7 text-center">#</span>
                <span className="flex-1">Branch</span>
                <span className="hidden w-24 sm:block">Volume</span>
                <span className="hidden w-20 text-center md:block">Score</span>
                <span className="w-16 text-right">Rate</span>
              </div>

              {/* Table Rows */}
              {sortedBranches.map((branch, index) => {
                const isSelected = selectedBranchId === branch.branchId;
                const isExpanded = expandedId === branch.branchId;
                const rank = RANK_STYLES[index];
                const isAboveAvg = branch.satisfactionRate >= avgSatisfaction;
                const positivePct =
                  branch.totalFeedback > 0
                    ? (branch.positiveCount / branch.totalFeedback) * 100
                    : 0;
                const neutralPct =
                  branch.totalFeedback > 0
                    ? (branch.neutralCount / branch.totalFeedback) * 100
                    : 0;
                const negativePct =
                  branch.totalFeedback > 0
                    ? (branch.negativeCount / branch.totalFeedback) * 100
                    : 0;
                const volumeBarWidth =
                  maxVolume > 0 ? (branch.totalFeedback / maxVolume) * 100 : 0;

                return (
                  <div key={branch.branchId}>
                    <div
                      onClick={() => {
                        onSelectBranch?.(branch.branchId);
                        toggleExpand(branch.branchId);
                      }}
                      className={cn(
                        "group border-border/40 flex cursor-pointer items-center gap-2 border-b px-3 py-2.5 transition-all duration-150 last:border-b-0",
                        isSelected ? "bg-primary/[0.04]" : "hover:bg-muted/30",
                      )}
                    >
                      {/* Rank */}
                      {rank ? (
                        <span
                          className={cn(
                            "flex size-6 shrink-0 items-center justify-center rounded-md text-[10px] font-bold",
                            rank.medal,
                          )}
                        >
                          {index + 1}
                        </span>
                      ) : (
                        <span className="bg-muted text-muted-foreground flex size-6 shrink-0 items-center justify-center rounded-md font-mono text-[10px] font-bold">
                          {index + 1}
                        </span>
                      )}

                      {/* Branch Name + Tags */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-foreground truncate text-sm font-semibold">
                            {branch.branchName}
                          </span>
                          {rank && index === 0 && branch.totalFeedback > 0 && (
                            <span className="hidden items-center gap-0.5 rounded border border-amber-200 bg-amber-50 px-1 py-0 text-[9px] font-bold text-amber-700 sm:inline-flex dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                              <Award className="size-2.5" />
                              Best
                            </span>
                          )}
                          {branch.totalFeedback > 0 && !isAboveAvg && (
                            <span className="hidden items-center gap-0.5 rounded border border-amber-200 bg-amber-50 px-1 py-0 text-[9px] font-bold text-amber-700 sm:inline-flex dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                              Below avg
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Volume — compact bar */}
                      <div className="hidden w-24 items-center gap-1.5 sm:flex">
                        <div className="bg-muted h-1.5 flex-1 overflow-hidden rounded-full">
                          <div
                            className="from-primary to-primary/70 h-full rounded-full bg-gradient-to-r transition-all duration-500"
                            style={{ width: `${volumeBarWidth}%` }}
                          />
                        </div>
                        <span className="text-muted-foreground w-5 text-right font-mono text-[11px]">
                          {branch.totalFeedback}
                        </span>
                      </div>

                      {/* Avg Score */}
                      <div className="hidden w-20 text-center md:block">
                        <span className="text-foreground font-mono text-xs font-semibold">
                          <AnimatedNumber
                            value={branch.avgScore}
                            decimals={1}
                            duration={600}
                          />
                          <span className="text-muted-foreground">/7</span>
                        </span>
                      </div>

                      {/* Satisfaction Badge + Expand */}
                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            "rounded-lg border px-2 py-0.5 font-mono text-xs font-bold shadow-2xs",
                            getSatisfactionBadge(branch.satisfactionRate),
                          )}
                        >
                          {branch.totalFeedback > 0 ? (
                            <AnimatedNumber
                              value={branch.satisfactionRate}
                              suffix="%"
                              duration={600}
                            />
                          ) : (
                            "—"
                          )}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="text-muted-foreground size-3.5" />
                        ) : (
                          <ChevronDown className="text-muted-foreground size-3.5" />
                        )}
                      </div>
                    </div>

                    {/* Expanded Detail (inline) */}
                    {isExpanded && (
                      <div className="bg-muted/20 border-border/40 border-b px-3 py-3">
                        {/* Sentiment bar */}
                        <div className="bg-muted flex h-1.5 overflow-hidden rounded-full">
                          <div
                            style={{ width: `${positivePct}%` }}
                            className="bg-emerald-500 transition-all duration-500"
                          />
                          <div
                            style={{ width: `${neutralPct}%` }}
                            className="bg-slate-300 transition-all duration-500 dark:bg-slate-500"
                          />
                          <div
                            style={{ width: `${negativePct}%` }}
                            className="bg-amber-500 transition-all duration-500"
                          />
                        </div>

                        <div className="mt-2.5 grid grid-cols-3 gap-2">
                          <div className="bg-card border-border/50 rounded-lg border p-2 text-center">
                            <div className="mx-auto flex size-6 items-center justify-center rounded-md bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                              <ThumbsUp className="size-3" />
                            </div>
                            <p className="text-foreground mt-1 text-sm font-bold">
                              <AnimatedNumber
                                value={branch.positiveCount}
                                duration={800}
                              />
                            </p>
                            <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                              <AnimatedNumber
                                value={Math.round(positivePct)}
                                suffix="%"
                                duration={600}
                              />
                            </p>
                          </div>
                          <div className="bg-card border-border/50 rounded-lg border p-2 text-center">
                            <div className="mx-auto flex size-6 items-center justify-center rounded-md bg-slate-100 text-slate-500 dark:bg-slate-500/10 dark:text-slate-400">
                              <Minus className="size-3" />
                            </div>
                            <p className="text-foreground mt-1 text-sm font-bold">
                              <AnimatedNumber
                                value={branch.neutralCount}
                                duration={800}
                                delay={50}
                              />
                            </p>
                            <p className="text-muted-foreground text-[10px] font-semibold">
                              <AnimatedNumber
                                value={Math.round(neutralPct)}
                                suffix="%"
                                duration={600}
                                delay={50}
                              />
                            </p>
                          </div>
                          <div className="bg-card border-border/50 rounded-lg border p-2 text-center">
                            <div className="mx-auto flex size-6 items-center justify-center rounded-md bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                              <ThumbsDown className="size-3" />
                            </div>
                            <p className="text-foreground mt-1 text-sm font-bold">
                              <AnimatedNumber
                                value={branch.negativeCount}
                                duration={800}
                                delay={100}
                              />
                            </p>
                            <p className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                              <AnimatedNumber
                                value={Math.round(negativePct)}
                                suffix="%"
                                duration={600}
                                delay={100}
                              />
                            </p>
                          </div>
                        </div>

                        <div className="bg-card border-border/50 mt-2 rounded-lg border p-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <Star className="size-3 fill-amber-400 text-amber-400" />
                              <span className="text-foreground text-[11px] font-semibold">
                                Average Score
                              </span>
                            </div>
                            <span className="text-foreground font-mono text-xs font-bold">
                              <AnimatedNumber
                                value={branch.avgScore}
                                decimals={1}
                                duration={800}
                              />
                              {" / 7"}
                            </span>
                          </div>
                          <div className="bg-muted mt-1.5 h-1.5 overflow-hidden rounded-full">
                            <div
                              className={cn(
                                "h-full rounded-full bg-gradient-to-r transition-all duration-500",
                                getSatisfactionColor(branch.satisfactionRate),
                              )}
                              style={{
                                width: `${(branch.avgScore / 7) * 100}%`,
                              }}
                            />
                          </div>
                        </div>

                        <div className="mt-2 flex items-center justify-center gap-4">
                          <SentimentPill
                            value={branch.positiveCount}
                            label="Positive"
                            color="bg-emerald-500"
                          />
                          <SentimentPill
                            value={branch.neutralCount}
                            label="Neutral"
                            color="bg-slate-400"
                          />
                          <SentimentPill
                            value={branch.negativeCount}
                            label="Attention"
                            color="bg-amber-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ===== GRID VIEW ===== */}
      {viewMode === "grid" && (
        <div className="space-y-2.5 p-4">
          {sortedBranches.length === 0 ? (
            <div className="border-border/60 bg-muted/20 flex flex-col items-center justify-center rounded-xl border border-dashed py-10 text-center">
              <Building2 className="text-muted-foreground size-8" />
              <p className="text-muted-foreground mt-2 text-xs">
                No branch data available for this period
              </p>
            </div>
          ) : (
            sortedBranches.map((branch, index) => {
              const isSelected = selectedBranchId === branch.branchId;
              const isExpanded = expandedId === branch.branchId;
              const rank = RANK_STYLES[index];
              const isAboveAvg = branch.satisfactionRate >= avgSatisfaction;

              const positivePct =
                branch.totalFeedback > 0
                  ? (branch.positiveCount / branch.totalFeedback) * 100
                  : 0;
              const neutralPct =
                branch.totalFeedback > 0
                  ? (branch.neutralCount / branch.totalFeedback) * 100
                  : 0;
              const negativePct =
                branch.totalFeedback > 0
                  ? (branch.negativeCount / branch.totalFeedback) * 100
                  : 0;
              const volumeBarWidth =
                maxVolume > 0 ? (branch.totalFeedback / maxVolume) * 100 : 0;

              return (
                <div key={branch.branchId}>
                  <div
                    onClick={() => {
                      onSelectBranch?.(branch.branchId);
                      toggleExpand(branch.branchId);
                    }}
                    className={cn(
                      "group relative cursor-pointer rounded-xl border p-4 transition-all duration-200",
                      isSelected
                        ? "border-primary/50 bg-primary/[0.03] ring-primary/20 shadow-sm ring-1"
                        : "border-border/60 hover:border-primary/30 hover:bg-muted/20",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {rank ? (
                        <span
                          className={cn(
                            "flex size-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold",
                            rank.medal,
                          )}
                        >
                          {index + 1}
                        </span>
                      ) : (
                        <span className="bg-muted text-muted-foreground flex size-7 shrink-0 items-center justify-center rounded-lg font-mono text-[11px] font-bold">
                          {index + 1}
                        </span>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-foreground truncate text-sm font-bold">
                            {branch.branchName}
                          </span>
                          {rank && index === 0 && branch.totalFeedback > 0 && (
                            <span className="hidden items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 sm:inline-flex dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                              <Award className="size-3" />
                              Best
                            </span>
                          )}
                          {branch.totalFeedback > 0 && !isAboveAvg && (
                            <span className="hidden items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 sm:inline-flex dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                              <TrendingDown className="size-3" />
                              Below avg
                            </span>
                          )}
                        </div>

                        <div className="mt-1.5 flex items-center gap-2.5">
                          <div className="bg-muted h-1.5 flex-1 overflow-hidden rounded-full">
                            <div
                              className="from-primary to-primary/70 h-full rounded-full bg-gradient-to-r transition-all duration-500"
                              style={{ width: `${volumeBarWidth}%` }}
                            />
                          </div>
                          <span className="text-muted-foreground w-16 text-right text-[11px] font-medium">
                            <AnimatedNumber
                              value={branch.totalFeedback}
                              suffix=" reviews"
                              duration={800}
                            />
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "rounded-xl border px-3 py-1 font-mono text-sm font-bold shadow-xs",
                            getSatisfactionBadge(branch.satisfactionRate),
                          )}
                        >
                          {branch.totalFeedback > 0 ? (
                            <AnimatedNumber
                              value={branch.satisfactionRate}
                              suffix="%"
                              duration={800}
                            />
                          ) : (
                            "—"
                          )}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="text-muted-foreground size-4 transition-transform" />
                        ) : (
                          <ChevronDown className="text-muted-foreground size-4 transition-transform" />
                        )}
                      </div>
                    </div>

                    <div className="bg-muted mt-3 flex h-2 overflow-hidden rounded-full">
                      <div
                        style={{ width: `${positivePct}%` }}
                        className="bg-emerald-500 transition-all duration-500"
                      />
                      <div
                        style={{ width: `${neutralPct}%` }}
                        className="bg-slate-300 transition-all duration-500 dark:bg-slate-500"
                      />
                      <div
                        style={{ width: `${negativePct}%` }}
                        className="bg-amber-500 transition-all duration-500"
                      />
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-border/60 bg-muted/20 mx-2 mb-1 rounded-b-xl border border-t-0 px-4 py-3.5">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-card border-border/50 rounded-xl border p-3 text-center">
                          <div className="mx-auto flex size-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                            <ThumbsUp className="size-4" />
                          </div>
                          <p className="text-foreground mt-2 text-lg font-bold">
                            <AnimatedNumber
                              value={branch.positiveCount}
                              duration={1000}
                            />
                          </p>
                          <p className="text-muted-foreground text-[11px]">
                            Positive
                          </p>
                          <p className="mt-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                            <AnimatedNumber
                              value={Math.round(positivePct)}
                              suffix="%"
                              duration={800}
                            />
                          </p>
                        </div>

                        <div className="bg-card border-border/50 rounded-xl border p-3 text-center">
                          <div className="mx-auto flex size-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-500/10 dark:text-slate-400">
                            <Minus className="size-4" />
                          </div>
                          <p className="text-foreground mt-2 text-lg font-bold">
                            <AnimatedNumber
                              value={branch.neutralCount}
                              duration={1000}
                              delay={50}
                            />
                          </p>
                          <p className="text-muted-foreground text-[11px]">
                            Neutral
                          </p>
                          <p className="text-muted-foreground mt-0.5 text-[11px] font-semibold">
                            <AnimatedNumber
                              value={Math.round(neutralPct)}
                              suffix="%"
                              duration={800}
                              delay={50}
                            />
                          </p>
                        </div>

                        <div className="bg-card border-border/50 rounded-xl border p-3 text-center">
                          <div className="mx-auto flex size-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                            <ThumbsDown className="size-4" />
                          </div>
                          <p className="text-foreground mt-2 text-lg font-bold">
                            <AnimatedNumber
                              value={branch.negativeCount}
                              duration={1000}
                              delay={100}
                            />
                          </p>
                          <p className="text-muted-foreground text-[11px]">
                            Attention
                          </p>
                          <p className="mt-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                            <AnimatedNumber
                              value={Math.round(negativePct)}
                              suffix="%"
                              duration={800}
                              delay={100}
                            />
                          </p>
                        </div>
                      </div>

                      <div className="bg-card border-border/50 mt-3 rounded-xl border p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Star className="size-3.5 fill-amber-400 text-amber-400" />
                            <span className="text-foreground text-xs font-semibold">
                              Average Score
                            </span>
                          </div>
                          <span className="text-foreground font-mono text-sm font-bold">
                            <AnimatedNumber
                              value={branch.avgScore}
                              decimals={1}
                              duration={1000}
                            />
                            {" / 7"}
                          </span>
                        </div>
                        <div className="bg-muted mt-2 h-2 overflow-hidden rounded-full">
                          <div
                            className={cn(
                              "h-full rounded-full bg-gradient-to-r transition-all duration-500",
                              getSatisfactionColor(branch.satisfactionRate),
                            )}
                            style={{ width: `${(branch.avgScore / 7) * 100}%` }}
                          />
                        </div>
                        <div className="text-muted-foreground mt-1.5 flex justify-between text-[10px]">
                          <span>0</span>
                          <span>1</span>
                          <span>2</span>
                          <span>3</span>
                          <span>4</span>
                          <span>5</span>
                          <span>6</span>
                          <span>7</span>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-center gap-4">
                        <SentimentPill
                          value={branch.positiveCount}
                          label="Positive"
                          color="bg-emerald-500"
                        />
                        <SentimentPill
                          value={branch.neutralCount}
                          label="Neutral"
                          color="bg-slate-400"
                        />
                        <SentimentPill
                          value={branch.negativeCount}
                          label="Attention"
                          color="bg-amber-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Footer */}
      <div className="border-border/60 text-muted-foreground flex items-center justify-between border-t px-5 py-3 text-[11px]">
        <span>Click any branch to expand details</span>
        <span>{branches.length} branches tracked</span>
      </div>
    </div>
  );
}
