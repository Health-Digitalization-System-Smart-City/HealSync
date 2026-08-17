// Branch performance analytics (Phase 2 — Tool 2 `getBranchPerformance`).
//
// PostgreSQL aggregates per-branch rating groups for the current and previous
// periods; the module joins the two to compute the satisfaction-rate change.
// Only de-identified counts are produced — no feedback text, no phone numbers.

import { db } from "@/lib/db";
import type { FeedbackRating } from "@/lib/feedback/types";
import {
  addRating,
  averageScore,
  emptyBuckets,
  satisfactionRate,
} from "./insights-helpers";
import type {
  BranchPerformanceItem,
  RatingBuckets,
} from "./insights-types";

type GroupRow = {
  branchId: string;
  rating: FeedbackRating;
  _count: { _all: number };
};

type BranchMeta = { id: string; name: string };

function bucketByBranch(rows: GroupRow[]): Map<string, RatingBuckets> {
  const map = new Map<string, RatingBuckets>();
  for (const row of rows) {
    const buckets = map.get(row.branchId) ?? emptyBuckets();
    addRating(buckets, row.rating, row._count._all);
    map.set(row.branchId, buckets);
  }
  return map;
}

/**
 * Per-branch performance for the period, including the satisfaction-rate
 * change versus the previous period of equal length (when provided).
 *
 * Branches with no feedback in the period are omitted (nothing to report).
 * Sorted by feedback count (desc), then satisfaction rate (desc).
 */
export async function getBranchPerformance(
  start: Date,
  end: Date,
  previousStart?: Date,
  previousEnd?: Date,
): Promise<BranchPerformanceItem[]> {
  const [rows, previousRows, branches] = await Promise.all([
    db.feedback.groupBy({
      by: ["branchId", "rating"],
      where: { deletedAt: null, createdAt: { gte: start, lte: end } },
      _count: { _all: true },
    }),
    previousStart && previousEnd
      ? db.feedback.groupBy({
          by: ["branchId", "rating"],
          where: {
            deletedAt: null,
            createdAt: { gte: previousStart, lte: previousEnd },
          },
          _count: { _all: true },
        })
      : Promise.resolve([]),
    db.branch.findMany({ select: { id: true, name: true } }),
  ]);

  const current = bucketByBranch(rows as GroupRow[]);
  const previous = bucketByBranch(previousRows as GroupRow[]);
  const nameOf = new Map<string, string>(
    (branches as BranchMeta[]).map((b) => [b.id, b.name]),
  );

  return Array.from(current.entries())
    .map(([branchId, buckets]) => {
      const prev = previous.get(branchId);
      const currentSat = satisfactionRate(buckets);
      return {
        branchId,
        branchName: nameOf.get(branchId) ?? "Unknown branch",
        feedbackCount: buckets.total,
        averageRating: averageScore(buckets),
        satisfactionRate: currentSat,
        changeFromPreviousPeriod: prev
          ? Math.round((currentSat - satisfactionRate(prev)) * 10) / 10
          : null,
      };
    })
    .sort(
      (a, b) =>
        b.feedbackCount - a.feedbackCount ||
        b.satisfactionRate - a.satisfactionRate,
    );
}
