export default function DashboardLoading() {
  return (
    <div className="space-y-8" role="status" aria-live="polite">
      <span className="sr-only">Loading dashboard…</span>

      {/* PageIntro skeleton */}
      <div className="border-border/70 flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 space-y-3">
          <div className="h-6 w-32 animate-pulse rounded-full bg-slate-200" />
          <div className="h-9 w-64 animate-pulse rounded-md bg-slate-200 sm:h-10" />
          <div className="h-4 w-full max-w-2xl animate-pulse rounded bg-slate-100" />
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="h-3.5 w-24 animate-pulse rounded bg-slate-200" />
              <div className="size-9 animate-pulse rounded-xl bg-slate-100" />
            </div>
            <div className="mt-3 h-8 w-20 animate-pulse rounded-md bg-slate-200" />
            <div className="mt-1 h-3 w-32 animate-pulse rounded bg-slate-100" />
          </div>
        ))}
      </div>

      {/* Sentiment insight panel */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="size-11 shrink-0 animate-pulse rounded-xl bg-slate-200" />
            <div className="min-w-0 space-y-2">
              <div className="h-3 w-40 animate-pulse rounded bg-slate-100" />
              <div className="h-5 w-64 animate-pulse rounded bg-slate-200" />
              <div className="h-3.5 w-full max-w-lg animate-pulse rounded bg-slate-100" />
            </div>
          </div>
          <div className="w-full max-w-md shrink-0 rounded-xl border border-white/60 bg-white/70 p-4 shadow-xs">
            <div className="mb-2.5 h-3 w-28 animate-pulse rounded bg-slate-100" />
            <div className="h-2.5 w-full animate-pulse rounded-full bg-slate-100" />
            <div className="mt-2 h-2.5 w-2/3 animate-pulse rounded-full bg-slate-100" />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Patient Feedback feed */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
            <div className="h-4 w-44 animate-pulse rounded bg-slate-200" />
            <div className="h-3.5 w-14 animate-pulse rounded bg-slate-200" />
          </div>
          <div className="divide-y divide-slate-100">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="p-4.5">
                <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
                <div className="mt-2 h-3 w-48 animate-pulse rounded bg-slate-100" />
              </div>
            ))}
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
            <div className="h-4 w-36 animate-pulse rounded bg-slate-200" />
          </div>
          <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2">
            {Array.from({ length: 4 }, (_, i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-200/80 bg-slate-50/40 p-4"
              >
                <div className="size-9 animate-pulse rounded-lg bg-slate-200" />
                <div className="mt-2.5 h-4 w-32 animate-pulse rounded bg-slate-200" />
                <div className="mt-1.5 h-3 w-40 animate-pulse rounded bg-slate-100" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
