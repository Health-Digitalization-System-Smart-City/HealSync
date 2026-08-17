// Feedback trends analytics (Phase 2 — Tool 4 `getFeedbackTrends`).
//
// PostgreSQL filters the rows; the module buckets them by day/week/month and
// computes per-bucket deterministic metrics. Only `rating` + `createdAt` are
// selected (no phone numbers, no feedback text, no patient identity). Buckets
// without feedback are omitted (the LLM must not infer a zero from absence).

import { db } from "@/lib/db";
import type { FeedbackRating } from "@/lib/feedback/types";
import {
  addRating,
  averageScore,
  emptyBuckets,
  satisfactionRate,
} from "./insights-helpers";
import type { FeedbackTrendItem, TrendGranularity } from "./insights-types";

type Row = { rating: FeedbackRating; createdAt: Date };

function bucketKey(date: Date, granularity: TrendGranularity): string {
  switch (granularity) {
    case "day":
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    case "week": {
      // Week starts on Monday (matches ranges.ts this_week convention).
      const day = (date.getDay() + 6) % 7;
      const monday = new Date(date);
      monday.setDate(date.getDate() - day);
      return `${monday.getFullYear()}-W${String(isoWeek(monday)).padStart(2, "0")}`;
    }
    case "month":
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  }
}

function isoWeek(date: Date): number {
  const target = new Date(date);
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = new Date(target.getFullYear(), 0, 4);
  const firstDayNr = (firstThursday.getDay() + 6) % 7;
  firstThursday.setDate(firstThursday.getDate() - firstDayNr + 3);
  return (
    1 +
    Math.round(
      (target.getTime() - firstThursday.getTime()) / (7 * 24 * 60 * 60 * 1000),
    )
  );
}

function bucketLabel(key: string, granularity: TrendGranularity): string {
  const [year, monthOrDay] = key.split("-");
  if (granularity === "month") {
    const date = new Date(Number(year), Number(monthOrDay) - 1, 1);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      year: "numeric",
    }).format(date);
  }
  if (granularity === "week") {
    const week = key.split("-W")[1];
    return `Week ${week} · ${year}`;
  }
  const date = new Date(`${key}T00:00:00`);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

/**
 * Aggregated feedback trends (count, average rating, satisfaction rate) for
 * the period, bucketed by day/week/month. All aggregation is deterministic.
 */
export async function getFeedbackTrends(
  start: Date,
  end: Date,
  granularity: TrendGranularity,
): Promise<FeedbackTrendItem[]> {
  const rows = await db.feedback.findMany({
    where: { deletedAt: null, createdAt: { gte: start, lte: end } },
    orderBy: { createdAt: "asc" },
    select: { rating: true, createdAt: true },
  });

  const buckets = new Map<
    string,
    { buckets: ReturnType<typeof emptyBuckets>; key: string }
  >();
  for (const row of rows as Row[]) {
    const key = bucketKey(row.createdAt, granularity);
    const entry = buckets.get(key) ?? {
      buckets: emptyBuckets(),
      key,
    };
    addRating(entry.buckets, row.rating);
    buckets.set(key, entry);
  }

  return Array.from(buckets.values())
    .sort((a, b) => a.key.localeCompare(b.key))
    .map(({ key, buckets: b }) => ({
      period: key,
      label: bucketLabel(key, granularity),
      feedbackCount: b.total,
      averageRating: averageScore(b),
      satisfactionRate: satisfactionRate(b),
    }));
}
