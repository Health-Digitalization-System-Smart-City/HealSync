export default function BranchesLoading() {
  return (
    <div className="space-y-8" role="status" aria-live="polite">
      <span className="sr-only">Loading clinic branches…</span>

      {/* PageIntro skeleton */}
      <div className="border-border/70 flex flex-col gap-3 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="h-5 w-32 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="h-9 w-64 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
          <div className="h-3.5 w-full max-w-xl animate-pulse rounded bg-slate-100 dark:bg-slate-850" />
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-5 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div className="h-3.5 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              <div className="size-9 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
            </div>
            <div className="mt-3.5 h-9 w-20 animate-pulse rounded-md bg-slate-200 dark:bg-slate-800" />
            <div className="mt-2 h-3 w-36 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
          </div>
        ))}
      </div>

      {/* Operations Control Bar Skeleton */}
      <div className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-4 shadow-xs space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="h-9 w-full max-w-md animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
          <div className="flex gap-2">
            <div className="h-9 w-32 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
            <div className="h-9 w-36 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
            <div className="h-9 w-24 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
            <div className="h-9 w-28 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700" />
          </div>
        </div>
        <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex justify-between">
          <div className="h-3 w-36 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
          <div className="h-3 w-48 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
        </div>
      </div>

      {/* Branch Operational Cards Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className="flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-5 shadow-xs"
          >
            {/* Top header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="size-10 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800 shrink-0" />
                <div className="space-y-1.5">
                  <div className="h-4.5 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-3 w-16 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                </div>
              </div>
              <div className="h-5.5 w-16 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800 shrink-0" />
            </div>

            {/* Stats grid */}
            <div className="mt-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-3 grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <div className="h-2.5 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                <div className="h-7 w-14 animate-pulse rounded-md bg-slate-200 dark:bg-slate-700" />
              </div>
              <div className="space-y-1">
                <div className="h-2.5 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                <div className="h-7 w-16 animate-pulse rounded-md bg-slate-200 dark:bg-slate-700" />
              </div>
            </div>

            {/* Sentiment bar */}
            <div className="mt-3 h-2.5 w-full animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />

            {/* Bottom metadata */}
            <div className="mt-3 flex items-center justify-between">
              <div className="h-3 w-24 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
              <div className="h-3 w-28 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
            </div>

            {/* Footer */}
            <div className="mt-4 border-t border-slate-100 dark:border-slate-800 pt-3 flex items-center justify-between">
              <div className="h-3 w-24 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
              <div className="flex gap-1">
                <div className="h-7 w-16 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
                <div className="h-7 w-7 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
