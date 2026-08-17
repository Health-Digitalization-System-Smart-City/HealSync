// Phase 2 period data collection.
//
// Gathers the deterministic facts the AI needs to summarize a period: clinic
// summary, branch/service performance (with previous-period change), themes,
// a bounded negative-feedback sample, and the current-vs-previous comparison.
// All numbers come from the analytics layer (PostgreSQL); this module only
// assembles them into the prompt-ready `PeriodAnalysisInput`. No patient-
// identifying data is ever included (security.md §20).

import { getClinicSummary } from "@/lib/analytics/clinic";
import { getBranchPerformance } from "@/lib/analytics/branches";
import { getServicePerformance } from "@/lib/analytics/services";
import { getFeedbackThemes } from "@/lib/analytics/themes";
import { getNegativeFeedbackSample } from "@/lib/analytics/feedback";
import { comparePeriods } from "@/lib/analytics/compare";
import type { ResolvedPeriod } from "@/lib/analytics/periods";
import type { PeriodAnalysisInput } from "./types";

/** How many negative-feedback samples the AI may see per period analysis. */
export const PERIOD_NEGATIVE_SAMPLE_LIMIT = 10;

/**
 * Collects the deterministic facts for a period. This is the ONLY data the
 * period analysis prompt receives — the LLM never sees raw patient identity.
 */
export async function collectPeriodData(
  range: ResolvedPeriod,
): Promise<PeriodAnalysisInput> {
  const [clinic, branches, services, themes, negativeSamples, comparison] =
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
      getNegativeFeedbackSample({
        start: range.start,
        end: range.end,
        limit: PERIOD_NEGATIVE_SAMPLE_LIMIT,
      }),
      comparePeriods({
        currentStart: range.start,
        currentEnd: range.end,
        previousStart: range.previousStart,
        previousEnd: range.previousEnd,
      }),
    ]);

  return {
    periodLabel: range.label,
    startDate: range.start.toISOString(),
    endDate: range.end.toISOString(),
    clinic,
    branches,
    services,
    themes: themes.themes,
    themesCoverage: {
      analyzedFeedbackCount: themes.analyzedFeedbackCount,
      feedbackCountInPeriod: themes.feedbackCountInPeriod,
    },
    negativeSamples,
    comparison,
  };
}
