"use client";

import { CalendarDays, Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import type { InsightPeriod } from "@/lib/analytics/periods";

export const PERIOD_OPTIONS: Array<{ value: InsightPeriod; label: string }> = [
  { value: "today", label: "Today" },
  { value: "7_days", label: "7 Days" },
  { value: "30_days", label: "30 Days" },
  { value: "12_months", label: "12 Months" },
  { value: "custom", label: "Custom" },
];

export type PeriodSelection = {
  period: InsightPeriod;
  startDate: string; // YYYY-MM-DD (only used when period === "custom")
  endDate: string;
};

export function PeriodSelector({
  value,
  onChange,
  disabled = false,
}: {
  value: PeriodSelection;
  onChange: (next: PeriodSelection) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
        <CalendarDays className="size-4 text-violet-500" aria-hidden />
        <span>Analysis Period</span>
      </div>

      <div
        className="flex flex-wrap items-center gap-1.5"
        role="group"
        aria-label="Analysis period"
      >
        {PERIOD_OPTIONS.map((option) => {
          const active = value.period === option.value;
          return (
            <button
              key={option.value}
              type="button"
              disabled={disabled}
              onClick={() =>
                onChange({ period: option.value, startDate: "", endDate: "" })
              }
              aria-pressed={active}
              className={cn(
                "rounded-lg border px-3.5 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
                active
                  ? "border-violet-200 bg-violet-50 text-violet-700 shadow-xs"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {value.period === "custom" && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:max-w-md">
          <label className="flex flex-col gap-1.5">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              <Clock className="size-3.5 text-slate-400" aria-hidden />
              From
            </span>
            <input
              type="date"
              value={value.startDate}
              onChange={(e) =>
                onChange({ ...value, startDate: e.target.value })
              }
              disabled={disabled}
              className="h-9.5 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-xs transition focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              <Clock className="size-3.5 text-slate-400" aria-hidden />
              To
            </span>
            <input
              type="date"
              value={value.endDate}
              onChange={(e) =>
                onChange({ ...value, endDate: e.target.value })
              }
              disabled={disabled}
              className="h-9.5 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-xs transition focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>
        </div>
      )}
    </div>
  );
}
