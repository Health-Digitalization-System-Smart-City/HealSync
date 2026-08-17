// Service performance analytics (Phase 2 — Tool 3 `getServicePerformance`).
//
// Same pattern as `branches.ts`: PostgreSQL aggregates per-service rating
// groups for the current and previous periods; the module joins them to
// compute the satisfaction-rate change. De-identified counts only.

import { db } from "@/lib/db";
import type { FeedbackRating } from "@/lib/feedback/types";
import {
  addRating,
  averageScore,
  emptyBuckets,
  satisfactionRate,
} from "./insights-helpers";
import type { RatingBuckets, ServicePerformanceItem } from "./insights-types";

type GroupRow = {
  serviceId: string;
  rating: FeedbackRating;
  _count: { _all: number };
};

type ServiceMeta = { id: string; name: string };

function bucketByService(rows: GroupRow[]): Map<string, RatingBuckets> {
  const map = new Map<string, RatingBuckets>();
  for (const row of rows) {
    const buckets = map.get(row.serviceId) ?? emptyBuckets();
    addRating(buckets, row.rating, row._count._all);
    map.set(row.serviceId, buckets);
  }
  return map;
}

/**
 * Per-service performance for the period, including the satisfaction-rate
 * change versus the previous period of equal length (when provided).
 *
 * Services with no feedback in the period are omitted. Sorted by feedback
 * count (desc), then satisfaction rate (desc).
 */
export async function getServicePerformance(
  start: Date,
  end: Date,
  previousStart?: Date,
  previousEnd?: Date,
): Promise<ServicePerformanceItem[]> {
  const [rows, previousRows, services] = await Promise.all([
    db.feedback.groupBy({
      by: ["serviceId", "rating"],
      where: { deletedAt: null, createdAt: { gte: start, lte: end } },
      _count: { _all: true },
    }),
    previousStart && previousEnd
      ? db.feedback.groupBy({
          by: ["serviceId", "rating"],
          where: {
            deletedAt: null,
            createdAt: { gte: previousStart, lte: previousEnd },
          },
          _count: { _all: true },
        })
      : Promise.resolve([]),
    db.service.findMany({ select: { id: true, name: true } }),
  ]);

  const current = bucketByService(rows as GroupRow[]);
  const previous = bucketByService(previousRows as GroupRow[]);
  const nameOf = new Map<string, string>(
    (services as ServiceMeta[]).map((s) => [s.id, s.name]),
  );

  return Array.from(current.entries())
    .map(([serviceId, buckets]) => {
      const prev = previous.get(serviceId);
      const currentSat = satisfactionRate(buckets);
      return {
        serviceId,
        serviceName: nameOf.get(serviceId) ?? "Unknown service",
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
