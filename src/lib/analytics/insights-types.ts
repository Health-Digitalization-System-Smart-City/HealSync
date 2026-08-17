// Phase 2 analytics types — deterministic facts computed by PostgreSQL and
// consumed by the AI tools + the AI Insights page (Architecture.md "PostgreSQL
// calculates facts. AI interprets facts.").
//
// These types are deliberately simple data shapes: no PII, no patient
// identity, no free text beyond the bounded negative-feedback sample.

import type { FeedbackRating } from "@/lib/feedback/types";

/** Main clinic metrics for a period (Tool 1 — getClinicSummary). */
export type ClinicSummary = {
  feedbackCount: number;
  averageRating: number; // 0..7, one decimal
  satisfactionRate: number; // 0..100
  positiveCount: number;
  neutralCount: number;
  negativeCount: number;
};

/** Per-branch performance for a period (Tool 2 — getBranchPerformance). */
export type BranchPerformanceItem = {
  branchId: string;
  branchName: string;
  feedbackCount: number;
  averageRating: number; // 0..7, one decimal
  satisfactionRate: number; // 0..100
  /** Satisfaction rate delta vs the previous period (percentage points). */
  changeFromPreviousPeriod: number | null;
};

/** Per-service performance for a period (Tool 3 — getServicePerformance). */
export type ServicePerformanceItem = {
  serviceId: string;
  serviceName: string;
  feedbackCount: number;
  averageRating: number; // 0..7, one decimal
  satisfactionRate: number; // 0..100
  /** Satisfaction rate delta vs the previous period (percentage points). */
  changeFromPreviousPeriod: number | null;
};

/** Aggregated feedback trend point (Tool 4 — getFeedbackTrends). */
export type FeedbackTrendItem = {
  period: string; // bucket key, e.g. "2026-08-15" / "2026-W33" / "2026-08"
  label: string; // human label for the bucket
  feedbackCount: number;
  averageRating: number; // 0..7, one decimal
  satisfactionRate: number; // 0..100
};

export type TrendGranularity = "day" | "week" | "month";

/** Aggregated theme from stored AI analyses (Tool 5 — getFeedbackThemes). */
export type ThemeAggregateItem = {
  name: string;
  count: number;
  percentage: number; // 0..100, one decimal
};

export type FeedbackThemesResult = {
  themes: ThemeAggregateItem[];
  /** Feedback covered by the stored analyses the themes were aggregated from. */
  analyzedFeedbackCount: number;
  /** Total feedback in the period (may exceed analyzedFeedbackCount). */
  feedbackCountInPeriod: number;
};

/** A single de-identified negative feedback item (Tool 6 — getNegativeFeedback). */
export type NegativeFeedbackItem = {
  rating: FeedbackRating;
  ratingLabel: string;
  ratingScore: number; // 0..7
  text: string;
  branchName: string;
  serviceName: string;
  createdAt: string; // ISO
};

/** Pre-calculated current vs previous period comparison (Tool 7 — comparePeriods). */
export type PeriodMetrics = {
  feedbackCount: number;
  averageRating: number; // 0..7, one decimal
  satisfactionRate: number; // 0..100
};

export type PeriodComparison = {
  current: PeriodMetrics;
  previous: PeriodMetrics;
  /** Absolute differences (current - previous). */
  changes: {
    feedbackCount: number;
    averageRating: number; // 0..7
    satisfactionRate: number; // percentage points
  };
};

/** Aggregate rating buckets used internally by the analytics modules. */
export type RatingBuckets = {
  total: number;
  positive: number;
  neutral: number;
  negative: number;
  score: number;
};
