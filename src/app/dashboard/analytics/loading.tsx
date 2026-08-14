export default function AnalyticsLoading() {
  return (
    <div className="space-y-6" role="status" aria-live="polite">
      <span className="sr-only">Loading analytics…</span>

      {/* Top header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="size-7 animate-pulse rounded-lg bg-slate-200" />
            <div className="h-7 w-52 animate-pulse rounded-md bg-slate-200" />
          </div>
          <div className="h-4 w-full max-w-md animate-pulse rounded bg-slate-100" />
        </div>
        <div className="h-8 w-56 animate-pulse rounded-lg bg-slate-200" />
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="h-3.5 w-24 animate-pulse rounded bg-slate-200" />
              <div className="size-9 animate-pulse rounded-xl bg-slate-100" />
            </div>
            <div className="mt-3 h-8 w-16 animate-pulse rounded-md bg-slate-200" />
            <div className="mt-1 h-3 w-32 animate-pulse rounded bg-slate-100" />
          </div>
        ))}
      </div>

      {/* Scope & timeframe filters */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-4.5 shadow-sm">
        <div className="h-4 w-48 animate-pulse rounded bg-slate-200" />
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <div className="h-3 w-16 animate-pulse rounded bg-slate-100" />
              <div className="h-9.5 w-full animate-pulse rounded-lg bg-slate-100" />
            </div>
          ))}
        </div>
      </div>

      {/* Chart grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
            <div className="mt-2 h-3 w-56 max-w-full animate-pulse rounded bg-slate-100" />
            <div className="mt-6 h-64 animate-pulse rounded-lg bg-slate-100/60" />
          </div>
        ))}
      </div>
    </div>
  );
}
