// Analytics port (Phase 2, Architecture.md §7 — the tool layer).
//
// AI tools depend on this interface, never on Prisma directly. Production
// wires it to the deterministic analytics modules (`src/lib/analytics/*`);
// tests inject mocks. The LLM only ever sees structured facts computed by
// PostgreSQL — it has no database access (PRD §6, §25).

import type { ComparePeriodsInput } from "@/lib/analytics/compare";
import type { NegativeFeedbackInput } from "@/lib/analytics/feedback";
import type {
  BranchPerformanceItem,
  ClinicSummary,
  FeedbackThemesResult,
  FeedbackTrendItem,
  NegativeFeedbackItem,
  PeriodComparison,
  ServicePerformanceItem,
  TrendGranularity,
} from "@/lib/analytics/insights-types";
import { comparePeriods } from "@/lib/analytics/compare";
import { getNegativeFeedbackSample } from "@/lib/analytics/feedback";
import { getClinicSummary } from "@/lib/analytics/clinic";
import { getBranchPerformance } from "@/lib/analytics/branches";
import { getServicePerformance } from "@/lib/analytics/services";
import { getFeedbackTrends } from "@/lib/analytics/trends";
import { getFeedbackThemes } from "@/lib/analytics/themes";

export type AnalyticsPort = {
  getClinicSummary: (start: Date, end: Date) => Promise<ClinicSummary>;
  getBranchPerformance: (
    start: Date,
    end: Date,
    previousStart?: Date,
    previousEnd?: Date,
  ) => Promise<BranchPerformanceItem[]>;
  getServicePerformance: (
    start: Date,
    end: Date,
    previousStart?: Date,
    previousEnd?: Date,
  ) => Promise<ServicePerformanceItem[]>;
  getFeedbackTrends: (
    start: Date,
    end: Date,
    granularity: TrendGranularity,
  ) => Promise<FeedbackTrendItem[]>;
  getFeedbackThemes: (start: Date, end: Date) => Promise<FeedbackThemesResult>;
  getNegativeFeedback: (
    input: NegativeFeedbackInput,
  ) => Promise<NegativeFeedbackItem[]>;
  comparePeriods: (input: ComparePeriodsInput) => Promise<PeriodComparison>;
};

/** Production wiring: the deterministic analytics layer. */
export const productionAnalyticsPort: AnalyticsPort = {
  getClinicSummary,
  getBranchPerformance,
  getServicePerformance,
  getFeedbackTrends,
  getFeedbackThemes,
  getNegativeFeedback: getNegativeFeedbackSample,
  comparePeriods,
};
