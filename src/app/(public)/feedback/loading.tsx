export default function FeedbackLoading() {
  return (
    <main
      className="relative min-h-screen overflow-hidden bg-[#F8FAFC] py-4 sm:py-6"
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">Loading feedback form…</span>

      {/* Decorative background blurs matching page.tsx */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-teal-100/70 blur-3xl"
      />git 
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-slate-100/80 blur-3xl"
      />

      <div className="relative mx-auto w-full max-w-6xl px-4 py-5 sm:py-8">
        <div className="grid gap-4 lg:grid-cols-[0.82fr_1.18fr] lg:items-start lg:gap-6">
          {/* Sidebar skeleton (left column on desktop, top on mobile) */}
          <aside className="surface-card rounded-[1.5rem] p-4 sm:p-6 lg:sticky lg:top-24 lg:rounded-[2rem] lg:p-8">
            {/* Header: logo + titles */}
            <div className="flex items-center gap-2.5 lg:mb-6">
              <div className="size-11 shrink-0 animate-pulse rounded-2xl bg-slate-200" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-3 w-28 animate-pulse rounded bg-slate-200" />
                <div className="h-5 w-44 animate-pulse rounded-md bg-slate-200" />
              </div>
              <div className="ml-auto h-6 w-20 animate-pulse rounded-full bg-slate-100 lg:hidden" />
            </div>

            {/* Sub-header text box placeholder */}
            <div className="mt-4 space-y-2 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5 lg:p-4">
              <div className="h-3.5 w-full animate-pulse rounded bg-slate-200" />
              <div className="h-3.5 w-4/5 animate-pulse rounded bg-slate-200" />
            </div>

            {/* Desktop feature cards */}
            <div className="mt-6 hidden space-y-4 lg:block">
              {Array.from({ length: 3 }, (_, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="size-8 shrink-0 animate-pulse rounded-xl bg-slate-100" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="h-3.5 w-28 animate-pulse rounded bg-slate-200" />
                    <div className="h-3 w-48 animate-pulse rounded bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>

            {/* Assurance pills */}
            <div className="mt-4 flex flex-wrap items-center gap-2 lg:mt-6">
              <div className="h-7 w-32 animate-pulse rounded-full bg-slate-100" />
              <div className="h-7 w-36 animate-pulse rounded-full bg-slate-100" />
              <div className="h-7 w-28 animate-pulse rounded-full bg-slate-100" />
            </div>
          </aside>

          {/* Form area skeleton (right column on desktop, bottom on mobile) */}
          <div className="surface-card rounded-[1.5rem] p-4 sm:rounded-[2rem] sm:p-6 lg:p-8">
            {/* Form title, description & step indicator */}
            <div className="mb-6 space-y-4 text-center sm:mb-8">
              <div className="mx-auto h-7 w-64 animate-pulse rounded-md bg-slate-200 sm:h-8" />
              <div className="mx-auto h-4 w-full max-w-xl animate-pulse rounded bg-slate-100" />

              {/* Fake step indicator (4 dots/circles with connector lines) */}
              <div className="flex items-center justify-center gap-1.5 pt-2 sm:gap-2">
                {Array.from({ length: 4 }, (_, i) => (
                  <div key={i} className="flex items-center gap-1.5 sm:gap-2">
                    <div className="size-9 shrink-0 animate-pulse rounded-full bg-slate-200" />
                    {i < 3 && (
                      <div className="h-1 w-7 animate-pulse rounded-full bg-slate-100 sm:w-8" />
                    )}
                  </div>
                ))}
              </div>
              <div className="mx-auto mt-2 h-3 w-28 animate-pulse rounded bg-slate-100" />
            </div>

            {/* Form card container */}
            <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-[#F8FAFC]">
              <div className="space-y-6 p-5 sm:p-6">
                {/* Step header */}
                <div className="flex items-center gap-3">
                  <div className="size-10 shrink-0 animate-pulse rounded-xl bg-slate-200" />
                  <div className="space-y-1.5">
                    <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
                    <div className="h-3 w-56 animate-pulse rounded bg-slate-100" />
                  </div>
                </div>

                {/* Phone input field placeholder */}
                <div className="space-y-2">
                  <div className="h-4 w-36 animate-pulse rounded bg-slate-200" />
                  <div className="h-12 w-full animate-pulse rounded-xl bg-slate-200" />
                  <div className="h-3.5 w-full max-w-md animate-pulse rounded bg-slate-100" />
                </div>
              </div>

              {/* Continue button placeholder */}
              <div className="px-5 pt-0 pb-5 sm:px-6 sm:pb-6">
                <div className="h-11 w-full animate-pulse rounded-xl bg-slate-200 sm:w-64" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
