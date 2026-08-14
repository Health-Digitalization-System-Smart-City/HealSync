export default function ServicesLoading() {
  return (
    <div className="space-y-8" role="status" aria-live="polite">
      <span className="sr-only">Loading healthcare services…</span>

      {/* PageIntro skeleton */}
      <div className="border-border/70 flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 space-y-3">
          <div className="h-6 w-36 animate-pulse rounded-full bg-slate-200" />
          <div className="h-9 w-64 animate-pulse rounded-md bg-slate-200 sm:h-10" />
          <div className="h-4 w-full max-w-xl animate-pulse rounded bg-slate-100" />
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            className="relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm"
          >
            <div className="h-1 w-full animate-pulse rounded-t bg-slate-200" />
            <div className="flex items-center justify-between pt-4">
              <div className="h-3.5 w-24 animate-pulse rounded bg-slate-200" />
              <div className="size-9 animate-pulse rounded-xl bg-slate-100" />
            </div>
            <div className="mt-3 h-8 w-16 animate-pulse rounded-md bg-slate-200" />
            <div className="mt-1 h-3 w-32 animate-pulse rounded bg-slate-100" />
          </div>
        ))}
      </div>

      {/* Service cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="flex flex-1 flex-col p-5">
              {/* Header: avatar + name + status */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="size-11 shrink-0 animate-pulse rounded-xl bg-slate-200" />
                  <div className="min-w-0 space-y-1.5">
                    <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
                    <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
                  </div>
                </div>
                <div className="h-6 w-16 shrink-0 animate-pulse rounded-full bg-slate-100" />
              </div>

              {/* Description line */}
              <div className="mt-3 space-y-1.5">
                <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-slate-100" />
              </div>

              {/* Satisfaction headline */}
              <div className="mt-5 flex items-end justify-between gap-3">
                <div className="space-y-2">
                  <div className="h-3 w-28 animate-pulse rounded bg-slate-100" />
                  <div className="h-8 w-16 animate-pulse rounded-md bg-slate-200" />
                </div>
                <div className="h-6 w-24 animate-pulse rounded-full bg-slate-100" />
              </div>

              {/* Sentiment bar */}
              <div className="mt-3 space-y-2">
                <div className="h-2.5 w-full animate-pulse rounded-full bg-slate-100" />
                <div className="h-2.5 w-2/3 animate-pulse rounded-full bg-slate-100" />
              </div>

              {/* Mini stats */}
              <div className="mt-5 grid grid-cols-3 gap-2">
                {Array.from({ length: 3 }, (_, j) => (
                  <div key={j} className="rounded-xl bg-slate-50 p-3">
                    <div className="h-2.5 w-14 animate-pulse rounded bg-slate-200" />
                    <div className="mt-1.5 h-5 w-8 animate-pulse rounded bg-slate-200" />
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-5 py-3">
              <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
              <div className="h-3 w-16 animate-pulse rounded bg-slate-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
