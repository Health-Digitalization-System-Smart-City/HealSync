export default function FeedbackLoading() {
  return (
    <div className="space-y-6" role="status" aria-live="polite">
      <span className="sr-only">Loading feedback management…</span>

      {/* Top header */}
      <div className="space-y-2">
        <div className="h-7 w-56 animate-pulse rounded-md bg-slate-200" />
        <div className="h-4 w-full max-w-md animate-pulse rounded bg-slate-100" />
      </div>

      {/* KPI Summary Cards */}
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
            <div className="mt-3 h-8 w-16 animate-pulse rounded-md bg-slate-200" />
            <div className="mt-1 h-3 w-32 animate-pulse rounded bg-slate-100" />
          </div>
        ))}
      </div>

      {/* Filters & search */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-4.5 shadow-sm">
        <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <div className="h-3 w-16 animate-pulse rounded bg-slate-100" />
              <div className="h-9.5 w-full animate-pulse rounded-lg bg-slate-100" />
            </div>
          ))}
        </div>
      </div>

      {/* Table skeleton */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/50 px-5 py-3.5">
          <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
        </div>
        <div className="divide-y divide-slate-100">
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              className="flex animate-pulse items-center gap-4 px-5 py-4"
            >
              <div className="size-8 shrink-0 rounded-full bg-slate-200" />
              <div className="w-32 space-y-1.5">
                <div className="h-3.5 w-28 rounded bg-slate-200" />
                <div className="h-2.5 w-16 rounded bg-slate-100" />
              </div>
              <div className="hidden w-32 items-center gap-2 sm:flex">
                <div className="size-3.5 rounded bg-slate-200" />
                <div className="h-3.5 w-24 rounded bg-slate-200" />
              </div>
              <div className="hidden w-32 items-center gap-2 md:flex">
                <div className="size-3.5 rounded bg-slate-200" />
                <div className="h-3.5 w-24 rounded bg-slate-200" />
              </div>
              <div className="w-28 space-y-1.5">
                <div className="h-3 w-20 rounded bg-slate-200" />
                <div className="h-2.5 w-14 rounded bg-slate-100" />
              </div>
              <div className="hidden flex-1 lg:block">
                <div className="h-3.5 w-3/4 rounded bg-slate-200" />
              </div>
              <div className="ml-auto flex items-center gap-1">
                <div className="size-8 rounded-lg bg-slate-100" />
                <div className="size-8 rounded-lg bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/50 px-5 py-3.5">
          <div className="h-4 w-36 animate-pulse rounded bg-slate-200" />
          <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />
        </div>
      </div>
    </div>
  );
}
