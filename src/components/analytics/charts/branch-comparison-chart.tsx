"use client";

import { useState } from "react";
import {
  ArrowDownUp,
  Award,
  Building2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import type { BranchComparisonItem } from "@/lib/analytics/types";
import { cn } from "@/lib/utils";

export function BranchComparisonChart({
  branches,
  onSelectBranch,
  selectedBranchId,
}: {
  branches: BranchComparisonItem[];
  onSelectBranch?: (branchId: string) => void;
  selectedBranchId?: string;
}) {
  const [sortBy, setSortBy] = useState<"satisfaction" | "volume">("satisfaction");

  const sortedBranches = [...branches].sort((a, b) => {
    if (sortBy === "satisfaction") {
      return b.satisfactionRate - a.satisfactionRate || b.totalFeedback - a.totalFeedback;
    }
    return b.totalFeedback - a.totalFeedback || b.satisfactionRate - a.satisfactionRate;
  });

  return (
    <div className="flex flex-col rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="size-4 text-blue-600" />
            Branch Performance Comparison
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Compare satisfaction rates and feedback volume across healthcare clinics
          </p>
        </div>

        {/* Sorting Controls */}
        <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setSortBy("satisfaction")}
            className={cn(
              "flex items-center gap-1 rounded-md px-2.5 py-1 transition",
              sortBy === "satisfaction"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-slate-500 hover:text-slate-900",
            )}
          >
            <TrendingUp className="size-3" />
            Satisfaction %
          </button>
          <button
            type="button"
            onClick={() => setSortBy("volume")}
            className={cn(
              "flex items-center gap-1 rounded-md px-2.5 py-1 transition",
              sortBy === "volume"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-slate-500 hover:text-slate-900",
            )}
          >
            <ArrowDownUp className="size-3" />
            Total Volume
          </button>
        </div>
      </div>

      {/* Branch List */}
      <div className="mt-4 space-y-3.5 divide-y divide-slate-100">
        {sortedBranches.map((branch, index) => {
          const isSelected = selectedBranchId === branch.branchId;
          const isTopThree = index < 3 && branch.totalFeedback > 0;
          const isLowScore = branch.satisfactionRate < 60 && branch.totalFeedback > 0;

          return (
            <div
              key={branch.branchId}
              onClick={() => onSelectBranch && onSelectBranch(branch.branchId)}
              className={cn(
                "group rounded-lg p-2.5 transition cursor-pointer pt-3.5 first:pt-0",
                isSelected
                  ? "bg-blue-50/80 border border-blue-200"
                  : "hover:bg-slate-50/80",
              )}
            >
              {/* Branch Title Row */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-slate-100 font-mono text-[11px] font-bold text-slate-600">
                    {index + 1}
                  </span>
                  <span className="font-bold text-slate-800 text-sm">
                    {branch.branchName}
                  </span>

                  {isTopThree && (
                    <span className="inline-flex items-center gap-0.5 rounded bg-emerald-50 px-1.5 py-0.2 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                      <Award className="size-2.5" />
                      Top Rank
                    </span>
                  )}

                  {isLowScore && (
                    <span className="inline-flex items-center gap-0.5 rounded bg-amber-50 px-1.5 py-0.2 text-[10px] font-bold text-amber-700 border border-amber-200">
                      <TrendingDown className="size-2.5" />
                      Needs Focus
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 font-medium">
                    {branch.totalFeedback} reviews
                  </span>
                  <span
                    className={cn(
                      "font-mono font-bold text-xs rounded px-2 py-0.5 border",
                      branch.satisfactionRate >= 75
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : branch.satisfactionRate >= 50
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-amber-50 text-amber-700 border-amber-200",
                    )}
                  >
                    {branch.totalFeedback > 0 ? `${branch.satisfactionRate}%` : "No data"}
                  </span>
                </div>
              </div>

              {/* Multi-tier Progress Bars */}
              <div className="mt-2 flex items-center gap-3">
                <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div
                    style={{ width: `${branch.satisfactionRate}%` }}
                    className={cn(
                      "h-full rounded-full transition-all duration-300",
                      branch.satisfactionRate >= 75
                        ? "bg-emerald-500"
                        : branch.satisfactionRate >= 50
                          ? "bg-blue-600"
                          : "bg-amber-500",
                    )}
                  />
                </div>

                <span className="w-16 text-right text-[11px] font-medium text-slate-400">
                  Avg {branch.avgScore}/7
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
