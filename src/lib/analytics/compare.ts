// Period comparison analytics (Phase 2 — Tool 7 `comparePeriods`).
//
// Compares two periods using deterministic clinic metrics; PostgreSQL computes
// every number and the module only shapes the difference. The LLM explains the
// changes — it never calculates them.

import { getClinicSummary } from "./clinic";
import type { PeriodComparison, PeriodMetrics } from "./insights-types";

export type ComparePeriodsInput = {
  currentStart: Date;
  currentEnd: Date;
  previousStart: Date;
  previousEnd: Date;
};

/**
 * Pre-calculated comparison between the current and the previous period:
 * both metric sets plus absolute differences (current - previous).
 */
export async function comparePeriods(
  input: ComparePeriodsInput,
): Promise<PeriodComparison> {
  const [current, previous] = await Promise.all([
    getClinicSummary(input.currentStart, input.currentEnd),
    getClinicSummary(input.previousStart, input.previousEnd),
  ]);

  const toMetrics = (s: {
    feedbackCount: number;
    averageRating: number;
    satisfactionRate: number;
  }): PeriodMetrics => ({
    feedbackCount: s.feedbackCount,
    averageRating: s.averageRating,
    satisfactionRate: s.satisfactionRate,
  });

  return {
    current: toMetrics(current),
    previous: toMetrics(previous),
    changes: {
      feedbackCount: current.feedbackCount - previous.feedbackCount,
      averageRating:
        Math.round((current.averageRating - previous.averageRating) * 10) / 10,
      satisfactionRate: current.satisfactionRate - previous.satisfactionRate,
    },
  };
}
