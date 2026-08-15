// AI Insights domain types (Phase 1 — "today's feedback").
//
// These types describe:
//   - what is collected from PostgreSQL (deterministic stats + de-identified
//     feedback) and handed to the AI service,
//   - the result shape returned to the dashboard.
//
// Privacy invariant: `AIFeedbackItem` deliberately contains NO patient
// phone numbers, names, or IDs — only the feedback id, rating, comment,
// branch/service names, and timestamp (security.md §20, database.md §31).

import type { FeedbackRating } from "@/lib/feedback/types";
import type { DailyAIInsightResult } from "@/lib/ai/schema";

/** A single de-identified feedback submission sent to the AI. */
export type AIFeedbackItem = {
  id: string;
  rating: FeedbackRating;
  ratingLabel: string;
  ratingScore: number; // 0..7
  comment: string | null;
  branch: string;
  service: string;
  createdAt: string; // ISO timestamp
};

export type RatingDistributionItem = {
  rating: FeedbackRating;
  label: string;
  count: number;
};

/** Per-branch / per-service breakdown (computed by PostgreSQL). */
export type BreakdownItem = {
  name: string;
  count: number;
  positiveCount: number;
  negativeCount: number;
  avgScore: number; // 0..7
};

/** Deterministic metrics computed by the database — never by the LLM. */
export type DailyStats = {
  feedbackCount: number;
  positiveCount: number;
  neutralCount: number;
  negativeCount: number;
  satisfactionRate: number; // 0..100
  avgRatingScore: number; // 0..7, one decimal
  ratingDistribution: RatingDistributionItem[];
  branchStats: BreakdownItem[];
  serviceStats: BreakdownItem[];
};

/** Everything the AI service needs to analyze today's feedback. */
export type DailyAnalysisInput = {
  periodLabel: string; // human label, e.g. "August 15, 2026"
  stats: DailyStats;
  feedback: AIFeedbackItem[];
};

/** Result of collecting today's feedback from PostgreSQL. */
export type CollectedDailyFeedback = {
  periodLabel: string;
  stats: DailyStats;
  feedback: AIFeedbackItem[];
};

/** Successful analysis (freshly generated or served from cache). */
export type DailyInsightsSuccess = {
  status: "ok";
  insight: DailyAIInsightResult;
  feedbackCount: number;
  /** true when served from the persisted cache without calling the AI. */
  cached: boolean;
};

/** No feedback today — the AI must not be called. */
export type DailyInsightsEmpty = {
  status: "no-feedback";
  feedbackCount: 0;
};

export type DailyInsightsResult = DailyInsightsSuccess | DailyInsightsEmpty;
