// AI Insights page data (Phase 2).
//
// Assembles everything the page needs for a period: deterministic analytics
// (always) plus the cached AI summary (when available). Shared by the server
// page (initial render) and the `getAiInsightsPageData` server action (period
// changes). Generation is a separate action — this stays fast.

import { getClinicSummary } from "@/lib/analytics/clinic";
import { getBranchPerformance } from "@/lib/analytics/branches";
import { getServicePerformance } from "@/lib/analytics/services";
import { getFeedbackThemes } from "@/lib/analytics/themes";
import { comparePeriods } from "@/lib/analytics/compare";
import type { ResolvedPeriod } from "@/lib/analytics/periods";
import type {
  BranchPerformanceItem,
  ClinicSummary,
  PeriodComparison,
  ServicePerformanceItem,
  ThemeAggregateItem,
} from "@/lib/analytics/insights-types";
import type { PeriodAIInsightResult } from "@/lib/ai/schema";
import { AI_INSIGHT_TYPE_PERIOD } from "./period-service";
import { findCachedInsight } from "./db";

export type AiInsightsPageAnalytics = {
  summary: ClinicSummary;
  branches: BranchPerformanceItem[];
  services: ServicePerformanceItem[];
  themes: ThemeAggregateItem[];
  themesCoverage: {
    analyzedFeedbackCount: number;
    feedbackCountInPeriod: number;
  };
  comparison: PeriodComparison;
};

export type AiInsightsPageData = {
  period: {
    value: ResolvedPeriod["period"];
    label: string;
    startDate: string;
    endDate: string;
    previousLabel: string;
  };
  analytics: AiInsightsPageAnalytics;
  feedbackCount: number;
  /** Cached AI summary (may be null — generation is a separate action). */
  insight: PeriodAIInsightResult | null;
  insightCached: boolean;
};

/** Decodes a cached period insight defensively (invalid cache = miss). */
function decodeCached(
  stored: Awaited<ReturnType<typeof findCachedInsight>>,
): PeriodAIInsightResult | null {
  if (!stored) return null;
  return stored.content as PeriodAIInsightResult;
}

/**
 * Builds the page data for a resolved period. Deterministic analytics never
 * fail (a DB error is surfaced to the caller, which maps it to a graceful
 * error); the insight is best-effort from cache only.
 */
export async function buildAiInsightsPageData(
  range: ResolvedPeriod,
): Promise<AiInsightsPageData> {
  const [summary, branches, services, themes, comparison, cached] =
    await Promise.all([
      getClinicSummary(range.start, range.end),
      getBranchPerformance(
        range.start,
        range.end,
        range.previousStart,
        range.previousEnd,
      ),
      getServicePerformance(
        range.start,
        range.end,
        range.previousStart,
        range.previousEnd,
      ),
      getFeedbackThemes(range.start, range.end),
      comparePeriods({
        currentStart: range.start,
        currentEnd: range.end,
        previousStart: range.previousStart,
        previousEnd: range.previousEnd,
      }),
      findCachedInsight(AI_INSIGHT_TYPE_PERIOD, range.start, range.end),
    ]);

  const insight = decodeCached(cached);

  return {
    period: {
      value: range.period,
      label: range.label,
      startDate: range.start.toISOString(),
      endDate: range.end.toISOString(),
      previousLabel: range.previousLabel,
    },
    analytics: {
      summary,
      branches,
      services,
      themes: themes.themes,
      themesCoverage: {
        analyzedFeedbackCount: themes.analyzedFeedbackCount,
        feedbackCountInPeriod: themes.feedbackCountInPeriod,
      },
      comparison,
    },
    feedbackCount: summary.feedbackCount,
    insight: insight ?? null,
    insightCached: insight !== null,
  };
}
