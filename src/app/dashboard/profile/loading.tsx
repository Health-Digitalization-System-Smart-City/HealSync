export default function ProfileLoading() {
  return (
    <div
      className="mx-auto flex max-w-7xl flex-col gap-6 p-4 sm:p-6"
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">Loading profile & security…</span>

      {/* PageHeader skeleton */}
      <div className="space-y-1">
        <div className="h-7 w-64 animate-pulse rounded-md bg-slate-200" />
        <div className="h-4 w-full max-w-2xl animate-pulse rounded bg-slate-100" />
      </div>

      {/* Identity card skeleton */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="size-16 shrink-0 animate-pulse rounded-2xl bg-slate-200" />
            <div className="space-y-1.5">
              <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
              <div className="h-3.5 w-40 animate-pulse rounded bg-slate-100" />
              <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="h-3 w-28 animate-pulse rounded bg-slate-100" />
            <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
          </div>
        </div>
        <div className="mt-5 h-9 animate-pulse rounded-lg bg-slate-100" />
      </div>

      {/* Change password + security skeletons */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="h-5 w-44 animate-pulse rounded bg-slate-200" />
          <div className="mt-4 space-y-3">
            <div className="h-9 animate-pulse rounded-lg bg-slate-100" />
            <div className="h-9 animate-pulse rounded-lg bg-slate-100" />
            <div className="h-9 animate-pulse rounded-lg bg-slate-100" />
            <div className="h-10 animate-pulse rounded-lg bg-slate-100" />
          </div>
        </div>
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="h-5 w-48 animate-pulse rounded bg-slate-200" />
          <div className="mt-4 space-y-2">
            <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
            <div className="h-3 w-5/6 animate-pulse rounded bg-slate-100" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-slate-100" />
          </div>
        </div>
      </div>

      {/* Permissions skeleton */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <div className="h-5 w-52 animate-pulse rounded bg-slate-200" />
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
              <div className="h-3 w-20 animate-pulse rounded bg-slate-200" />
              <div className="mt-3 space-y-2">
                <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
                <div className="h-3 w-4/5 animate-pulse rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
