import { Sparkles } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";

/** Loading state shown while the AI analysis is generated/streamed in. */
export function AiInsightsSkeleton() {
  return (
    <section
      aria-label="AI Insights"
      aria-busy="true"
      className="border-border/80 bg-card flex flex-col overflow-hidden rounded-2xl border shadow-sm"
    >
      <div className="border-border/70 bg-muted/40 flex items-center justify-between border-b px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-sm">
            <Sparkles className="size-4" aria-hidden />
          </span>
          <div>
            <h3 className="text-foreground text-sm font-bold">AI Insights</h3>
            <p className="text-[11px] font-medium text-violet-600 dark:text-violet-400">
              Analyzing today&apos;s feedback…
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-5">
        {/* Summary highlight */}
        <Skeleton className="h-20 w-full rounded-xl" />

        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-36" />
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
