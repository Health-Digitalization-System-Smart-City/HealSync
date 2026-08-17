// Internal helpers shared by the analytics modules (Phase 2).
//
// Rating bucketing is the same operation everywhere (count, average, positive/
// neutral/negative split, satisfaction rate) — kept here so each analytics
// module stays tiny and consistent. These helpers are pure: they consume
// Prisma groupBy-shaped rows and produce deterministic facts.

import {
  getRatingScore,
  isNeutralRating,
  isPositiveRating,
} from "@/lib/feedback/ratings";
import type { FeedbackRating } from "@/lib/feedback/types";
import type { ClinicSummary, RatingBuckets } from "./insights-types";

export function emptyBuckets(): RatingBuckets {
  return { total: 0, positive: 0, neutral: 0, negative: 0, score: 0 };
}

/** Adds one rating occurrence (or `count` occurrences) into the buckets. */
export function addRating(
  buckets: RatingBuckets,
  rating: FeedbackRating,
  count = 1,
): void {
  const score = getRatingScore(rating);
  buckets.total += count;
  buckets.score += score * count;
  if (isPositiveRating(rating)) buckets.positive += count;
  else if (isNeutralRating(rating)) buckets.neutral += count;
  else buckets.negative += count;
}

/** Sums Prisma groupBy rows (`{ rating, _count }`) into rating buckets. */
export function aggregateRatingGroups(
  groups: Array<{ rating: FeedbackRating; _count: { _all: number } }>,
): RatingBuckets {
  const buckets = emptyBuckets();
  for (const group of groups) {
    addRating(buckets, group.rating, group._count._all);
  }
  return buckets;
}

export function satisfactionRate(buckets: RatingBuckets): number {
  return buckets.total > 0
    ? Math.round((buckets.positive / buckets.total) * 100)
    : 0;
}

export function averageScore(buckets: RatingBuckets): number {
  return buckets.total > 0
    ? Math.round((buckets.score / buckets.total) * 10) / 10
    : 0;
}

/** Converts rating buckets into the deterministic clinic summary. */
export function summarizeClinic(buckets: RatingBuckets): ClinicSummary {
  return {
    feedbackCount: buckets.total,
    averageRating: averageScore(buckets),
    satisfactionRate: satisfactionRate(buckets),
    positiveCount: buckets.positive,
    neutralCount: buckets.neutral,
    negativeCount: buckets.negative,
  };
}

/** One-decimal percentage used for theme aggregation results. */
export function percentageOf(part: number, whole: number): number {
  if (whole <= 0) return 0;
  return Math.round((part / whole) * 1000) / 10;
}
