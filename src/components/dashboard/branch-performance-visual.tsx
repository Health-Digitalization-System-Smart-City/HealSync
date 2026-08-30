"use client";

import * as React from "react";
import { ArrowDownUp, Award, Building2, TrendingDown, TrendingUp } from "lucide-react";
import type { BranchComparisonItem } from "@/lib/analytics/types";
import { cn } from "@/lib/utils";

export interface BranchPerformanceVisualProps {
  branches: BranchComparisonItem[];
  onSelectBranch?: (branchId: string) => void;
  selectedBranchId?: string;
  className?: string;
}

export function BranchPerformanceVisual({
  branches,
  onSelectBranch,
  selectedBranchId,
  className,
}: BranchPerformanceVisualProps) {
  const [sortBy, setSortBy] = React.useState<"satisfaction" | "volume" | "attention">("satisfaction");

  const sortedBranches = React.useMemo(() => {
    return [...branches].sort((a, b) => {
      if (sortBy === "satisfaction") {
        return b.satisfactionRate - a.satisfactionRate || b.totalFeedback - a.totalFeedback;
      }
      if (sortBy === "volume") {
        return b.totalFeedback - a.totalFeedback || b.satisfactionRate - a.satisfactionRate;
      }
      return b.negativeCount - a.negativeCount || b.totalFeedback - a.totalFeedback;
    });
  }, [branches, sortBy]);

  const maxVolume = Math.max(...branches.map((b) => b.totalFeedback), 1);

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
            <span className="flex size-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Building2 className="size-4" aria-hidden />
            </span>
            <h3 className="text-foreground text-base font-bold tracking-tight">
              Branch Performance Comparison
            </h3>
          </div>
          <p className="text-muted-foreground mt-1 text-xs">
            Satisfaction benchmarking across healthcare clinic branches
          </p>
        </div>

        {/* Sort Controls */}
        <div className="bg-muted/60 border-border/60 flex items-center rounded-lg border p-0.5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setSortBy("satisfaction")}
            className={cn(
              "flex items-center gap-1 rounded-md px-2.5 py-1 transition",
              sortBy === "satisfaction"
                ? "bg-card text-foreground font-bold shadow-xs"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <TrendingUp className="size-3 text-emerald-500" />
            Satisfaction
          </button>
          <button
            type="button"
            onClick={() => setSortBy("volume")}
            className={cn(
              "flex items-center gap-1 rounded-md px-2.5 py-1 transition",
              sortBy === "volume"
                ? "bg-card text-foreground font-bold shadow-xs"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <ArrowDownUp className="size-3 text-blue-500" />
            Volume
          </button>
          <button
            type="button"
            onClick={() => setSortBy("attention")}
            className={cn(
              "flex items-center gap-1 rounded-md px-2.5 py-1 transition",
              sortBy === "attention"
                ? "bg-card text-foreground font-bold shadow-xs"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <TrendingDown className="size-3 text-amber-500" />
            Attention
          </button>
        </div>
      </div>

      {/* Branch List Rows */}
      <div className="mt-4 space-y-3">
        {sortedBranches.length === 0 ? (
          <p className="text-muted-foreground py-6 text-center text-xs">
            No branch data recorded in this timeframe.
          </p>
        ) : (
          sortedBranches.map((branch, index) => {
            const isSelected = selectedBranchId === branch.branchId;
            const isTopRank = index === 0 && branch.totalFeedback > 0 && branch.satisfactionRate >= 75;
            const isLowScore = branch.satisfactionRate < 60 && branch.totalFeedback > 0;

            const positivePct = branch.totalFeedback > 0 ? (branch.positiveCount / branch.totalFeedback) * 100 : 0;
            const neutralPct = branch.totalFeedback > 0 ? (branch.neutralCount / branch.totalFeedback) * 100 : 0;
            const negativePct = branch.totalFeedback > 0 ? (branch.negativeCount / branch.totalFeedback) * 100 : 0;

            return (
              <div
                key={branch.branchId}
                onClick={() => onSelectBranch?.(branch.branchId)}
                className={cn(
                  "group relative cursor-pointer rounded-xl border p-3.5 transition-all duration-200",
                  isSelected
                    ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary/30"
                    : "border-border/70 bg-card hover:border-primary/40 hover:bg-muted/30",
                )}
              >
                {/* Branch Info Row */}
                <div className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="bg-muted text-muted-foreground flex size-5.5 shrink-0 items-center justify-center rounded-lg font-mono text-[11px] font-bold">
                      {index + 1}
                    </span>
                    <span className="text-foreground truncate font-bold text-sm">
                      {branch.branchName}
                    </span>

                    {isTopRank && (
                      <span className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300 hidden items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-bold sm:inline-flex">
                        <Award className="size-3" />
                        Top Performer
                      </span>
                    )}

                    {isLowScore && (
                      <span className="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300 hidden items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-bold sm:inline-flex">
                        <TrendingDown className="size-3" />
                        Focus Area
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-muted-foreground text-xs">
                      {branch.totalFeedback} reviews
                    </span>
                    <span
                      className={cn(
                        "rounded-lg border px-2.5 py-0.5 font-mono text-xs font-bold shadow-2xs",
                        branch.satisfactionRate >= 75
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
                          : branch.satisfactionRate >= 50
                            ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300"
                            : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
                      )}
                    >
                      {branch.totalFeedback > 0 ? `${branch.satisfactionRate}%` : "No data"}
                    </span>
                  </div>
                </div>

                {/* Progress bar and score breakdown */}
                <div className="mt-2.5 flex items-center gap-3">
                  <div className="bg-muted flex h-2 flex-1 overflow-hidden rounded-full">
                    <div
                      style={{ width: `${positivePct}%` }}
                      className="bg-emerald-500 transition-all duration-300"
                      title={`Positive: ${branch.positiveCount}`}
                    />
                    <div
                      style={{ width: `${neutralPct}%` }}
                      className="bg-slate-400 transition-all duration-300"
                      title={`Neutral: ${branch.neutralCount}`}
                    />
                    <div
                      style={{ width: `${negativePct}%` }}
                      className="bg-amber-500 transition-all duration-300"
                      title={`Needs Attention: ${branch.negativeCount}`}
                    />
                  </div>

                  <span className="text-muted-foreground w-20 text-right text-[11px] font-medium">
                    Avg {branch.avgScore.toFixed(1)}/7
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Helper */}
      <div className="border-border/60 mt-4 flex items-center justify-between border-t pt-3 text-[11px] text-muted-foreground">
        <span>Click any branch to filter entire dashboard</span>
        <span>{branches.length} branches registered</span>
      </div>
    </div>
  );
}
