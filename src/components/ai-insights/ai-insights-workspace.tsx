"use client";

import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { AlertTriangle, RefreshCw } from "lucide-react";

import { getAiInsightsPageData } from "@/features/ai-insights/actions";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { AiInsightsPageData } from "@/lib/ai-insights/page-data";
import { PeriodSelector, type PeriodSelection } from "./period-selector";
import { AiChatPanel, type AskAiPrefill } from "./ai-chat-panel";
import { QuickStatsSidebar } from "./quick-stats-sidebar";
import { AnalyticsExplorablePanel } from "./analytics-explorable-panel";

const PRESET_LABELS: Record<string, string> = {
  today: "Today",
  "7_days": "Last 7 Days",
  "30_days": "Last 30 Days",
  "12_months": "Last 12 Months",
  custom: "Custom Range",
};

/**
 * AI Insights workspace — redesigned with AI chat as the hero.
 *
 * Layout:
 *  - Period selector (top, full width)
 *  - Chat (2/3) + Quick Stats (1/3) on desktop; stacked on mobile
 *  - Collapsible analytics below (branches, services, themes)
 */
export function AiInsightsWorkspace() {
  const [selection, setSelection] = useState<PeriodSelection>({
    period: "today",
    startDate: "",
    endDate: "",
  });
  const [prefill, setPrefill] = useState<AskAiPrefill | null>(null);

  const queryKey = [
    "ai-insights-page",
    selection.period,
    selection.period === "custom" ? selection.startDate : undefined,
    selection.period === "custom" ? selection.endDate : undefined,
  ];

  const customComplete =
    selection.period !== "custom" ||
    (selection.startDate.length > 0 && selection.endDate.length > 0);

  const pageQuery = useQuery({
    queryKey,
    queryFn: async () => {
      const result = await getAiInsightsPageData({
        period: selection.period,
        startDate:
          selection.period === "custom" ? selection.startDate : undefined,
        endDate: selection.period === "custom" ? selection.endDate : undefined,
      });
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
    enabled: customComplete,
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });

  const data: AiInsightsPageData | undefined = pageQuery.data;
  const periodForAsk = data
    ? {
        value: selection.period,
        startDate: data.period.startDate,
        endDate: data.period.endDate,
      }
    : { value: selection.period, startDate: "", endDate: "" };

  const periodLabel =
    data?.period.label ?? PRESET_LABELS[selection.period] ?? "This period";

  function askAbout(question: string) {
    setPrefill({ question, nonce: Date.now() });
  }

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <PeriodSelector
        value={selection}
        onChange={(next) => setSelection(next)}
        disabled={pageQuery.isFetching}
      />

      {/* Load error */}
      {pageQuery.isError && !data ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-10 text-center dark:border-amber-500/30 dark:bg-amber-500/10">
          <AlertTriangle
            className="size-6 text-amber-600 dark:text-amber-400"
            aria-hidden
          />
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Could not load analytics
            </h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              {pageQuery.error instanceof Error
                ? pageQuery.error.message
                : "Please try again."}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void pageQuery.refetch()}
            className="h-8 gap-1.5 text-xs"
          >
            <RefreshCw className="size-3.5" aria-hidden />
            Retry
          </Button>
        </div>
      ) : null}

      {/* Main layout: Chat + Sidebar */}
      {pageQuery.isLoading && !data ? (
        <WorkspaceSkeleton />
      ) : data ? (
        <>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_280px] xl:items-start">
            {/* AI Chat — hero */}
            <div className="order-2 min-w-0 xl:order-1">
              <AiChatPanel
                data={data}
                period={periodForAsk}
                periodLabel={periodLabel}
                prefill={prefill}
              />
            </div>

            {/* Sidebar: stats + collapsible analytics */}
            <aside className="order-1 min-w-0 space-y-4 xl:order-2">
              <QuickStatsSidebar
                summary={data.analytics.summary}
                data={data}
                onAsk={askAbout}
              />
              <AnalyticsExplorablePanel
                branches={data.analytics.branches}
                services={data.analytics.services}
                themes={data.analytics.themes}
                themesCoverage={data.analytics.themesCoverage}
              />
            </aside>
          </div>
        </>
      ) : null}
    </div>
  );
}

function WorkspaceSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
        {/* Chat skeleton */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700/50 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>
          <div className="mt-8 space-y-4">
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-16 w-3/4 rounded-xl" />
            <Skeleton className="h-16 w-5/6 rounded-xl" />
          </div>
        </div>

        {/* Sidebar skeleton */}
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700/50 dark:bg-slate-900">
            <Skeleton className="mb-3 h-3 w-20" />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-4 w-12" />
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700/50 dark:bg-slate-900">
            <Skeleton className="mb-3 h-3 w-24" />
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
        <RefreshCw className="size-3.5 animate-spin" aria-hidden />
        Loading analytics data…
      </div>
    </div>
  );
}
