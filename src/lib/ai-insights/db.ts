// AI Insights — PostgreSQL data collection + persistence.
//
// Deterministic metrics (counts, averages, rates, distributions) are computed
// by the database, never by the LLM (API.md §19, Architecture.md §9). Only
// de-identified feedback (no phone numbers, names, or IDs) is handed to the
// AI service (security.md §20, database.md §31).
//
// `AIInsight` rows persist validated results so the dashboard does not call
// the LLM on every render.

import { db } from "@/lib/db";
import {
  getRatingLabel,
  getRatingScore,
  isNeutralRating,
  isPositiveRating,
} from "@/lib/feedback/ratings";
import type { FeedbackRating } from "@/lib/feedback/types";
import type {
  DailyAIInsightResult,
  PeriodAIInsightResult,
} from "@/lib/ai/schema";
import type {
  AIFeedbackItem,
  BreakdownItem,
  CollectedDailyFeedback,
  DailyStats,
  RatingDistributionItem,
} from "./types";

// ---------------------------------------------------------------------------
// Period helpers
// ---------------------------------------------------------------------------

/** The AIInsight type for daily analysis (Phase 1). */
export const AI_INSIGHT_TYPE_DAILY = "daily";

export type DayRange = { start: Date; end: Date };

/**
 * Today's calendar-day boundaries in the application's timezone.
 *
 * Matches the existing analytics convention (`resolveDateRange` in
 * `src/lib/feedback/ranges.ts`): boundaries use the server's local calendar.
 */
export function getTodayRange(now: Date = new Date()): DayRange {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999,
  );
  return { start, end };
}

export function formatPeriodLabel(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

// ---------------------------------------------------------------------------
// Collection (read-only; never selects phone numbers)
// ---------------------------------------------------------------------------

type FeedbackRow = {
  id: string;
  rating: FeedbackRating;
  comment: string | null;
  createdAt: Date;
  branch: { name: string } | null;
  service: { name: string } | null;
};

type RatingGroup = {
  rating: FeedbackRating;
  count: number;
  score: number;
  positive: number;
  neutral: number;
  negative: number;
};

/** Aggregates rating groupBy rows into the deterministic stats. */
function aggregateGroups(
  groups: Array<{ rating: FeedbackRating; _count: { _all: number } }>,
): Pick<
  DailyStats,
  "feedbackCount" | "positiveCount" | "neutralCount" | "negativeCount"
> & { totalScore: number } {
  let feedbackCount = 0;
  let positiveCount = 0;
  let neutralCount = 0;
  let negativeCount = 0;
  let totalScore = 0;

  for (const group of groups) {
    const count = group._count._all;
    feedbackCount += count;
    totalScore += getRatingScore(group.rating) * count;
    if (isPositiveRating(group.rating)) positiveCount += count;
    else if (isNeutralRating(group.rating)) neutralCount += count;
    else negativeCount += count;
  }

  return {
    feedbackCount,
    positiveCount,
    neutralCount,
    negativeCount,
    totalScore,
  };
}

function buildRatingDistribution(
  groups: Array<{ rating: FeedbackRating; _count: { _all: number } }>,
): RatingDistributionItem[] {
  return groups
    .map((group) => ({
      rating: group.rating,
      label: getRatingLabel(group.rating),
      count: group._count._all,
    }))
    .sort((a, b) => getRatingScore(b.rating) - getRatingScore(a.rating));
}

function buildBreakdown(
  groups: Array<{
    key: string;
    _count: { _all: number };
    score: number;
    positive: number;
    neutral: number;
    negative: number;
  }>,
  nameOf: (key: string) => string,
): BreakdownItem[] {
  return groups
    .map((group) => ({
      name: nameOf(group.key),
      count: group._count._all,
      positiveCount: group.positive,
      negativeCount: group.negative,
      avgScore:
        group._count._all > 0
          ? Math.round((group.score / group._count._all) * 10) / 10
          : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Collects today's feedback: deterministic statistics computed by PostgreSQL
 * plus the de-identified feedback items the AI needs to understand the text.
 *
 * Never selects `phoneNumber`, `phoneNumberHash`, or patient identity fields.
 */
export async function collectTodayFeedback(
  now: Date = new Date(),
): Promise<CollectedDailyFeedback> {
  const { start, end } = getTodayRange(now);

  const [rows, ratingGroups, branchGroups, serviceGroups, branches, services] =
    await Promise.all([
      db.feedback.findMany({
        where: { deletedAt: null, createdAt: { gte: start, lte: end } },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          branch: { select: { name: true } },
          service: { select: { name: true } },
        },
      }),
      db.feedback.groupBy({
        by: ["rating"],
        where: { deletedAt: null, createdAt: { gte: start, lte: end } },
        _count: { _all: true },
      }),
      db.feedback.groupBy({
        by: ["branchId", "rating"],
        where: { deletedAt: null, createdAt: { gte: start, lte: end } },
        _count: { _all: true },
      }),
      db.feedback.groupBy({
        by: ["serviceId", "rating"],
        where: { deletedAt: null, createdAt: { gte: start, lte: end } },
        _count: { _all: true },
      }),
      db.branch.findMany({ select: { id: true, name: true } }),
      db.service.findMany({ select: { id: true, name: true } }),
    ]);

  const branchName = new Map(branches.map((b) => [b.id, b.name]));
  const serviceName = new Map(services.map((s) => [s.id, s.name]));

  const ratingAgg = aggregateGroups(ratingGroups);
  const feedbackCount = ratingAgg.feedbackCount;

  const branchAcc = new Map<string, RatingGroup>();
  for (const group of branchGroups) {
    const key = group.branchId;
    const acc = branchAcc.get(key) ?? {
      rating: group.rating,
      count: 0,
      score: 0,
      positive: 0,
      neutral: 0,
      negative: 0,
    };
    const count = group._count._all;
    acc.count += count;
    acc.score += getRatingScore(group.rating) * count;
    if (isPositiveRating(group.rating)) acc.positive += count;
    else if (isNeutralRating(group.rating)) acc.neutral += count;
    else acc.negative += count;
    branchAcc.set(key, acc);
  }

  const serviceAcc = new Map<string, RatingGroup>();
  for (const group of serviceGroups) {
    const key = group.serviceId;
    const acc = serviceAcc.get(key) ?? {
      rating: group.rating,
      count: 0,
      score: 0,
      positive: 0,
      neutral: 0,
      negative: 0,
    };
    const count = group._count._all;
    acc.count += count;
    acc.score += getRatingScore(group.rating) * count;
    if (isPositiveRating(group.rating)) acc.positive += count;
    else if (isNeutralRating(group.rating)) acc.neutral += count;
    else acc.negative += count;
    serviceAcc.set(key, acc);
  }

  const stats: DailyStats = {
    feedbackCount,
    positiveCount: ratingAgg.positiveCount,
    neutralCount: ratingAgg.neutralCount,
    negativeCount: ratingAgg.negativeCount,
    satisfactionRate:
      feedbackCount > 0
        ? Math.round((ratingAgg.positiveCount / feedbackCount) * 100)
        : 0,
    avgRatingScore:
      feedbackCount > 0
        ? Math.round((ratingAgg.totalScore / feedbackCount) * 10) / 10
        : 0,
    ratingDistribution: buildRatingDistribution(ratingGroups),
    branchStats: buildBreakdown(
      Array.from(branchAcc.entries()).map(([key, acc]) => ({
        key,
        _count: { _all: acc.count },
        score: acc.score,
        positive: acc.positive,
        neutral: acc.neutral,
        negative: acc.negative,
      })),
      (key) => branchName.get(key) ?? "Unknown branch",
    ),
    serviceStats: buildBreakdown(
      Array.from(serviceAcc.entries()).map(([key, acc]) => ({
        key,
        _count: { _all: acc.count },
        score: acc.score,
        positive: acc.positive,
        neutral: acc.neutral,
        negative: acc.negative,
      })),
      (key) => serviceName.get(key) ?? "Unknown service",
    ),
  };

  const feedback: AIFeedbackItem[] = (rows as FeedbackRow[]).map((row) => ({
    id: row.id,
    rating: row.rating,
    ratingLabel: getRatingLabel(row.rating),
    ratingScore: getRatingScore(row.rating),
    comment: row.comment,
    branch: row.branch?.name ?? "Unknown branch",
    service: row.service?.name ?? "Unknown service",
    createdAt: row.createdAt.toISOString(),
  }));

  return {
    periodLabel: formatPeriodLabel(now),
    stats,
    feedback,
  };
}

// ---------------------------------------------------------------------------
// Persistence (validated results only)
// ---------------------------------------------------------------------------

export type InsightContent = DailyAIInsightResult | PeriodAIInsightResult;

export type StoredAIInsight = {
  id: string;
  type: string;
  periodStart: Date;
  periodEnd: Date;
  feedbackCount: number;
  content: InsightContent;
  model: string | null;
  generatedAt: Date;
  updatedAt: Date;
};

export async function findCachedInsight(
  type: string,
  periodStart: Date,
  periodEnd: Date,
): Promise<StoredAIInsight | null> {
  const row = await db.aIInsight.findFirst({
    where: { type, periodStart, periodEnd },
    orderBy: { updatedAt: "desc" },
  });
  if (!row) return null;
  return toStoredInsight(row);
}

export async function upsertInsight<T extends InsightContent>(input: {
  type: string;
  periodStart: Date;
  periodEnd: Date;
  feedbackCount: number;
  content: T;
  model: string | null;
}): Promise<StoredAIInsight> {
  const existing = await db.aIInsight.findFirst({
    where: {
      type: input.type,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
    },
    select: { id: true },
  });

  const row = existing
    ? await db.aIInsight.update({
        where: { id: existing.id },
        data: {
          feedbackCount: input.feedbackCount,
          content: input.content,
          model: input.model,
        },
      })
    : await db.aIInsight.create({
        data: {
          type: input.type,
          periodStart: input.periodStart,
          periodEnd: input.periodEnd,
          feedbackCount: input.feedbackCount,
          content: input.content,
          model: input.model,
        },
      });

  return toStoredInsight(row);
}

function toStoredInsight(row: {
  id: string;
  type: string;
  periodStart: Date;
  periodEnd: Date;
  feedbackCount: number;
  content: unknown;
  model: string | null;
  generatedAt: Date;
  updatedAt: Date;
}): StoredAIInsight {
  return {
    id: row.id,
    type: row.type,
    periodStart: row.periodStart,
    periodEnd: row.periodEnd,
    feedbackCount: row.feedbackCount,
    content: row.content as InsightContent,
    model: row.model,
    generatedAt: row.generatedAt,
    updatedAt: row.updatedAt,
  };
}
