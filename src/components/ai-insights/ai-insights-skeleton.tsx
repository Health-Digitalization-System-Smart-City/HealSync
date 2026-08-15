import { Sparkles } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";

/** Loading state shown while the AI analysis is generated/streamed in. */
export function AiInsightsSkeleton() {
  return (
    <section
      aria-label="AI Insights"
      aria-busy="true"
      className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-violet-600 text-white shadow-xs">
            <Sparkles className="size-4" aria-hidden />
          </span>
          <div>
            <h3 className="text-sm font-bold text-slate-900">AI Insights</h3>
            <p className="text-[11px] font-medium text-violet-600">
              Analyzing today&apos;s feedback…
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-5">
        <div className="space-y-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-5/6" />
        </div>
        <div className="space-y-2.5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-32" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-7 w-28 rounded-full" />
            <Skeleton className="h-7 w-36 rounded-full" />
            <Skeleton className="h-7 w-24 rounded-full" />
          </div>
        </div>
      </div>
    </section>
  );
}
