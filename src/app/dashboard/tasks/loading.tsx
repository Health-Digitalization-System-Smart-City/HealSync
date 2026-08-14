export default function TasksLoading() {
  return (
    <div
      className="mx-auto flex max-w-7xl flex-col gap-6 p-4 sm:p-6"
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">Loading tasks & workflows…</span>

      {/* PageHeader skeleton */}
      <div className="space-y-1">
        <div className="h-7 w-72 animate-pulse rounded-md bg-slate-200" />
        <div className="h-4 w-full max-w-2xl animate-pulse rounded bg-slate-100" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm"
          >
            <div className="h-3.5 w-20 animate-pulse rounded bg-slate-200" />
            <div className="mt-2 h-7 w-12 animate-pulse rounded-md bg-slate-200" />
          </div>
        ))}
      </div>

      {/* Search & filter bar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="h-10 w-full max-w-md animate-pulse rounded-lg bg-slate-200" />
        <div className="h-9 w-48 animate-pulse rounded-lg bg-slate-200" />
      </div>

      {/* Task list */}
      <div className="space-y-3">
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start gap-3.5">
              <div className="size-8 shrink-0 animate-pulse rounded-full bg-slate-200" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
              </div>
              <div className="h-6 w-14 animate-pulse rounded-full bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
