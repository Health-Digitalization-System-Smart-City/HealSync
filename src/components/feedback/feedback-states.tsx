"use client";

import {
  AlertCircle,
  Inbox,
  RefreshCw,
  RotateCcw,
  SearchX,
} from "lucide-react";

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/50 px-5 py-3.5">
        <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
      </div>

      {/* Row skeletons */}
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }, (_, index) => (
          <div
            key={index}
            className="flex items-center gap-4 px-5 py-4 animate-pulse"
          >
            {/* Phone avatar */}
            <div className="size-8 shrink-0 rounded-full bg-slate-200" />

            {/* Phone + subtitle */}
            <div className="space-y-1.5 w-32">
              <div className="h-3.5 w-28 rounded bg-slate-200" />
              <div className="h-2.5 w-16 rounded bg-slate-100" />
            </div>

            {/* Branch */}
            <div className="hidden sm:flex items-center gap-2 w-32">
              <div className="size-3.5 rounded bg-slate-200" />
              <div className="h-3.5 w-24 rounded bg-slate-200" />
            </div>

            {/* Service */}
            <div className="hidden md:flex items-center gap-2 w-32">
              <div className="size-3.5 rounded bg-slate-200" />
              <div className="h-3.5 w-24 rounded bg-slate-200" />
            </div>

            {/* Stars */}
            <div className="space-y-1.5 w-28">
              <div className="h-3 w-20 rounded bg-slate-200" />
              <div className="h-2.5 w-14 rounded bg-slate-100" />
            </div>

            {/* Comment */}
            <div className="hidden lg:block flex-1">
              <div className="h-3.5 w-3/4 rounded bg-slate-200" />
            </div>

            {/* Date */}
            <div className="hidden sm:block w-24">
              <div className="h-3 w-20 rounded bg-slate-200" />
            </div>

            {/* Action buttons */}
            <div className="ml-auto flex items-center gap-1">
              <div className="size-8 rounded-lg bg-slate-100" />
              <div className="size-8 rounded-lg bg-slate-100" />
            </div>
          </div>
        ))}
      </div>

      {/* Footer skeleton */}
      <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/50 px-5 py-3.5">
        <div className="h-4 w-36 animate-pulse rounded bg-slate-200" />
        <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />
      </div>
    </div>
  );
}

export function EmptyState({
  hasFilters,
  onClear,
}: {
  hasFilters: boolean;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-xs">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 shadow-xs">
        {hasFilters ? (
          <SearchX className="size-7" />
        ) : (
          <Inbox className="size-7" />
        )}
      </div>

      <h3 className="mt-4 text-base font-bold text-slate-900">
        {hasFilters ? "No matching feedback found" : "No feedback records yet"}
      </h3>

      <p className="mt-1.5 max-w-md text-sm text-slate-500 leading-relaxed">
        {hasFilters
          ? "We couldn't find any feedback records matching your active filters or search criteria. Try broadening your dates or clearing specific filters."
          : "There are currently no patient feedback submissions recorded in the database."}
      </p>

      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700 active:scale-98"
        >
          <RotateCcw className="size-3.5" />
          Reset all filters
        </button>
      )}
    </div>
  );
}

export function ErrorState({
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
        Failed to load feedback
      </h3>

      <p className="mt-1.5 max-w-md text-sm text-red-700 leading-relaxed">
        {message || "An unexpected error occurred while fetching feedback records."}
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
