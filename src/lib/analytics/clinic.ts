// Clinic summary analytics (Phase 2 — Tool 1 `getClinicSummary`).
//
// PostgreSQL performs all aggregation (`groupBy` + `_count`); this module only
// shapes the rows into the deterministic facts handed to the AI. The LLM never
// computes these numbers.

import { db } from "@/lib/db";
import type { FeedbackRating } from "@/lib/feedback/types";
import { aggregateRatingGroups, summarizeClinic } from "./insights-helpers";
import type { ClinicSummary } from "./insights-types";

type RatingGroupRow = { rating: FeedbackRating; _count: { _all: number } };

/**
 * Main clinic metrics for a date range: counts, average rating, satisfaction
 * rate, positive/neutral/negative split. Computed entirely by the database.
 */
export async function getClinicSummary(
  start: Date,
  end: Date,
): Promise<ClinicSummary> {
  const groups = await db.feedback.groupBy({
    by: ["rating"],
    where: { deletedAt: null, createdAt: { gte: start, lte: end } },
    _count: { _all: true },
  });

  return summarizeClinic(aggregateRatingGroups(groups as RatingGroupRow[]));
}
