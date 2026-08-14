export default function NewLoading() {
  return (
    <main className="p-6" role="status" aria-live="polite">
      <span className="sr-only">Loading create page…</span>
      <div className="h-8 w-40 animate-pulse rounded-md bg-slate-200" />
      <div className="mt-3 h-4 w-72 animate-pulse rounded bg-slate-100" />
    </main>
  );
}
