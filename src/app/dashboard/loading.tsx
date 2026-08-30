export default function DashboardLoading() {
  return (
    <div className="space-y-6" role="status" aria-live="polite">
      <span className="sr-only">Loading premium dashboard analytics…</span>

      {/* PageIntro skeleton */}
      <div className="border-border/70 flex flex-col gap-3 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="h-4 w-32 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="h-8 w-64 animate-pulse rounded-lg bg-slate-200 sm:h-9 dark:bg-slate-800" />
          <div className="dark:bg-slate-850 h-3.5 w-full max-w-xl animate-pulse rounded bg-slate-100" />
        </div>
      </div>

      {/* Filter Bar Skeleton */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4.5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div className="h-5 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-7 w-56 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="h-9.5 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
          <div className="h-9.5 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
          <div className="h-9.5 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between">
              <div className="h-3.5 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              <div className="size-9 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
            </div>
            <div className="mt-3.5 flex items-baseline gap-2">
              <div className="h-9 w-24 animate-pulse rounded-md bg-slate-200 dark:bg-slate-800" />
              <div className="h-5 w-16 animate-pulse rounded-md bg-slate-100 dark:bg-slate-800" />
            </div>
            <div className="mt-3 h-3 w-40 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
          </div>
        ))}
      </div>

      {/* Sentiment pulse panel skeleton */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="size-11 shrink-0 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
            <div className="min-w-0 space-y-2">
              <div className="h-3 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-5 w-64 animate-pulse rounded bg-slate-300 dark:bg-slate-700" />
              <div className="h-3.5 w-full max-w-lg animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>
          <div className="dark:bg-slate-850 w-full max-w-md shrink-0 rounded-xl border border-slate-200/60 bg-white/70 p-4 shadow-2xs dark:border-slate-800">
            <div className="mb-2.5 h-3 w-28 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-2.5 w-full animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
      </div>

      {/* Trend Chart Skeleton */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="h-5 w-64 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-7 w-48 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
        </div>
        <div className="mt-6 h-64 w-full animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
      </div>

      {/* 2-Column Analytics Skeletons */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
            <div className="h-5 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-7 w-32 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
          </div>
          <div className="mt-4 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-16 w-full animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800"
              />
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
            <div className="h-5 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-6 w-20 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
          </div>
          <div className="mt-4 space-y-2.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-10 w-full animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
