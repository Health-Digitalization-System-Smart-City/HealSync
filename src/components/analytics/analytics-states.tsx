"use client";

import {
  AlertCircle,
  BarChart3,
  CalendarX2,
  RefreshCw,
  RotateCcw,
} from "lucide-react";

export function AnalyticsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* KPI Cards Skeletons */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div className="h-3.5 w-24 rounded bg-slate-200" />
              <div className="size-9 rounded-xl bg-slate-100" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <div className="h-8 w-20 rounded-md bg-slate-200" />
              <div className="h-5 w-14 rounded-md bg-slate-100" />
            </div>
            <div className="mt-2 h-3 w-32 rounded bg-slate-100" />
          </div>
        ))}
      </div>

      {/* Main Charts Grid Skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Trend chart skeleton */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="h-4 w-48 rounded bg-slate-200" />
            <div className="h-7 w-32 rounded-lg bg-slate-100" />
          </div>
          <div className="mt-6 h-56 w-full rounded-lg bg-slate-100" />
        </div>

        {/* Satisfaction Distribution skeleton */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="h-4 w-44 rounded bg-slate-200" />
            <div className="h-5 w-20 rounded-full bg-slate-100" />
          </div>
          <div className="mt-4 space-y-3">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between">
                  <div className="h-3 w-28 rounded bg-slate-200" />
                  <div className="h-3 w-10 rounded bg-slate-200" />
                </div>
                <div className="h-2 w-full rounded bg-slate-100" />
              </div>
            ))}
          </div>
        </div>

        {/* Branch comparison skeleton */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="h-4 w-44 rounded bg-slate-200" />
            <div className="h-7 w-28 rounded-lg bg-slate-100" />
          </div>
          <div className="mt-4 space-y-3">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-10 w-full rounded-lg bg-slate-100" />
            ))}
          </div>
        </div>

        {/* Service comparison skeleton */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="h-4 w-44 rounded bg-slate-200" />
            <div className="h-7 w-28 rounded-lg bg-slate-100" />
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-20 w-full rounded-xl bg-slate-100" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AnalyticsEmptyState({
  hasFilters = false,
  onReset,
}: {
  hasFilters?: boolean;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-xs">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 shadow-xs">
        {hasFilters ? (
          <CalendarX2 className="size-7" />
        ) : (
          <BarChart3 className="size-7" />
        )}
      </div>

      <h3 className="mt-4 text-base font-bold text-slate-900">
        {hasFilters
          ? "No data for selected period"
          : "No analytics data recorded"}
      </h3>

      <p className="mt-1.5 max-w-md text-sm text-slate-500 leading-relaxed">
        {hasFilters
          ? "No feedback submissions match the selected date timeframe, branch, or clinical service. Try adjusting your filter parameters."
          : "There are currently no patient feedback records in the system to generate analytics and trends."}
      </p>

      {hasFilters && (
        <button
          type="button"
          onClick={onReset}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700 active:scale-98"
        >
          <RotateCcw className="size-3.5" />
          Reset to All Time
        </button>
      )}
    </div>
  );
}

export function AnalyticsErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50/40 px-6 py-16 text-center shadow-xs">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-red-100 text-red-600 border border-red-200 shadow-xs">
        <AlertCircle className="size-7" />
      </div>

      <h3 className="mt-4 text-base font-bold text-slate-900">
        Failed to load analytics
      </h3>

      <p className="mt-1.5 max-w-md text-sm text-red-700 leading-relaxed">
        {message || "An unexpected error occurred while computing analytics metrics."}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 hover:text-slate-900 active:scale-98"
      >
        <RefreshCw className="size-3.5" />
        Retry Request
      </button>
    </div>
  );
}
