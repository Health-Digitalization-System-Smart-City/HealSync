export default function UsersLoading() {
  return (
    <div className="space-y-8" role="status" aria-live="polite">
      <span className="sr-only">Loading user management…</span>

      {/* PageIntro skeleton */}
      <div className="border-border/70 flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 space-y-3">
          <div className="h-6 w-36 animate-pulse rounded-full bg-slate-200" />
          <div className="h-9 w-64 animate-pulse rounded-md bg-slate-200 sm:h-10" />
          <div className="h-4 w-full max-w-xl animate-pulse rounded bg-slate-100" />
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[360px_1fr]">
        {/* Create user form */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="h-5 w-36 animate-pulse rounded bg-slate-200" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i}>
                <div className="mb-1.5 h-3 w-20 animate-pulse rounded bg-slate-100" />
                <div className="h-9.5 w-full animate-pulse rounded-lg bg-slate-100" />
              </div>
            ))}
            <div className="pt-2">
              <div className="h-9.5 w-28 animate-pulse rounded-lg bg-slate-200" />
            </div>
          </div>
        </div>

        {/* Users table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-3.5">
            <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
          </div>
          <div className="divide-y divide-slate-100">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <div className="size-10 animate-pulse rounded-full bg-slate-200" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="h-3.5 w-40 max-w-full animate-pulse rounded bg-slate-200" />
                  <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
                </div>
                <div className="h-5 w-16 animate-pulse rounded-full bg-slate-100" />
                <div className="hidden size-8 animate-pulse rounded-lg bg-slate-100 sm:block" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
