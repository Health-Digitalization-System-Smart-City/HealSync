export default function AppointmentsLoading() {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Loading appointments…</span>
      <div className="mb-8 space-y-2">
        <div className="h-8 w-48 animate-pulse rounded-md bg-slate-200" />
        <div className="h-4 w-64 animate-pulse rounded bg-slate-100" />
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="h-5 w-44 animate-pulse rounded bg-slate-200" />
        <div className="mt-3 h-4 w-56 animate-pulse rounded bg-slate-100" />
      </div>
    </div>
  );
}
