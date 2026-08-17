"use client";

import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  BarChart3,
  Loader2,
  RefreshCw,
} from "lucide-react";

import { getAiInsightsPageData } from "@/features/ai-insights/actions";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { AiInsightsPageData } from "@/lib/ai-insights/page-data";
import { cn } from "@/lib/utils";
import { PeriodSelector, type PeriodSelection } from "./period-selector";
import { OverviewMetrics } from "./overview-metrics";
import { AiSummaryCard } from "./ai-summary-card";
import { AiSpotlight } from "./ai-spotlight";
import {
  BranchPerformanceTable,
  ServicePerformanceTable,
} from "./performance-tables";
import { ThemesSection } from "./themes-section";
import { AskAiPanel, type AskAiPrefill } from "./ask-ai-panel";

const PRESET_LABELS: Record<string, string> = {
  today: "Today",
  "7_days": "Last 7 Days",
  "30_days": "Last 30 Days",
  "12_months": "Last 12 Months",
  custom: "Custom Range",
};

/**
 * AI Insights workspace (Phase 2). Owns the selected period and loads:
 *  - deterministic analytics (always rendered, even if the AI fails),
 *  - the cached/generatable AI summary,
 *  - the Ask AI assistant, in a sticky, collapsible right-hand sidebar.
 *
 * Uses React Query (same convention as the analytics dashboard) so period
 * switches keep the previous data visible while the next period loads.
 * The page-level permission check happens in the server component; every
 * server action re-checks `analytics.ai` server-side.
 */
export function AiInsightsWorkspace() {
  const [selection, setSelection] = useState<PeriodSelection>({
    period: "today",
    startDate: "",
    endDate: "",
  });
  const [askOpen, setAskOpen] = useState(true);
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
  const periodKey = `${selection.period}:${selection.startDate}:${selection.endDate}`;

  // For AI generation the action re-resolves the period itself. Custom ranges
  // must send the original YYYY-MM-DD strings (parseDateOnly format); presets
  // need no dates at all.
  const periodForGeneration = {
    value: selection.period,
    startDate: selection.period === "custom" ? selection.startDate : undefined,
    endDate: selection.period === "custom" ? selection.endDate : undefined,
  };

  // Resolved ISO dates (server-computed) so the Ask AI panel always has an
  // explicit, validated date range — even for presets like "today".
  const periodForAsk = data
    ? {
        value: selection.period,
        startDate: data.period.startDate,
        endDate: data.period.endDate,
      }
    : { value: selection.period, startDate: "", endDate: "" };

  const periodLabel =
    data?.period.label ?? PRESET_LABELS[selection.period] ?? "This period";

  /** Open the assistant and ask a guided question (e.g. from the spotlight). */
  function askAbout(question: string) {
    setAskOpen(true);
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

      {/* Load error (deterministic analytics failed — retry) */}
      {pageQuery.isError && !data ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-10 text-center">
          <AlertTriangle className="size-6 text-amber-600" aria-hidden />
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Could not load analytics
            </h3>
            <p className="mt-1 text-sm text-slate-600">
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

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
        {/* Main analytics column */}
        <div className="order-2 min-w-0 space-y-6 xl:order-1">
          {pageQuery.isLoading && !data ? (
            <OverviewSkeleton />
          ) : data ? (
            <>
              {/* Guided insights — deterministic, with one-click questions */}
              <AiSpotlight data={data} onAsk={askAbout} />

              {/* Overview metrics (deterministic) */}
              <OverviewMetrics summary={data.analytics.summary} />

              {/* AI summary */}
              <AiSummaryCard
                key={periodKey}
                period={periodForGeneration}
                initial={
                  data.insight
                    ? {
                        status: "ok",
                        insight: data.insight,
                        feedbackCount: data.feedbackCount,
                        cached: data.insightCached,
                      }
                    : data.feedbackCount === 0
                      ? { status: "no-feedback", feedbackCount: 0 }
                      : null
                }
                loading={false}
                periodLabel={data.period.label}
              />

              {/* Branch + service performance */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <BranchPerformanceTable branches={data.analytics.branches} />
                <ServicePerformanceTable services={data.analytics.services} />
              </div>

              {/* Themes */}
              <ThemesSection
                themes={data.analytics.themes}
                coverage={data.analytics.themesCoverage}
              />
            </>
          ) : null}
        </div>

        {/* Ask AI — sticky, collapsible sidebar (top of the page on mobile) */}
        <aside
          className={cn(
            "order-1 min-w-0 xl:order-2",
            askOpen
              ? "xl:sticky xl:top-16 xl:w-95"
              : "xl:w-12",
          )}
        >
          <AskAiPanel
            key={`ask-${periodKey}::${prefill?.nonce ?? ""}`}
            period={periodForAsk}
            periodLabel={periodLabel}
            open={askOpen}
            onToggle={() => setAskOpen((isOpen) => !isOpen)}
            prefill={prefill}
            ready={Boolean(periodForAsk.startDate && periodForAsk.endDate)}
            initialQuestion={prefill?.question ?? ""}
          />
        </aside>
      </div>
    </div>
  );
}

function OverviewSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-4 h-8 w-16" />
            <Skeleton className="mt-2 h-3 w-28" />
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-medium text-violet-600">
          <Loader2 className="size-3.5 animate-spin" aria-hidden />
          Analyzing clinic feedback…
        </div>
        <div className="mt-4 space-y-2.5">
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-5/6" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
        <BarChart3 className="size-3.5" aria-hidden />
        Loading branch and service analytics…
      </div>
    </div>
  );
}
