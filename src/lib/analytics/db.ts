// Prisma-backed analytics — real dashboard metrics from PostgreSQL.
//
// `service.ts` implements the pure dashboard computation (bucketing, trends,
// comparisons) on top of a generic record set; this module feeds it with real
// rows, branches, and services from the database. Filtering is pushed down to
// SQL where possible; the pure computation is reused (single definition).
//
// The `Feedback` rows are queried server-side only — raw phone numbers are
// never selected here (API.md §19, security.md §8).

import { db } from "@/lib/db";
import {
  getRatingScore,
  isNeutralRating,
  isPositiveRating,
} from "@/lib/feedback/ratings";
import { resolveDateRange } from "@/lib/feedback/ranges";
import type { FeedbackRecord, FeedbackRating } from "@/lib/feedback/types";
import { computeAnalyticsDashboard } from "./service";
import type { AnalyticsDashboardData, AnalyticsQuery } from "./types";

// ---------------------------------------------------------------------------
// Full dashboard computation (the /api/analytics endpoint)
// ---------------------------------------------------------------------------

export async function computeAnalyticsDashboardFromDb(
  query: AnalyticsQuery,
  now: Date = new Date(),
): Promise<AnalyticsDashboardData> {
  const range = resolveDateRange(
    query.range,
    query.startDate,
    query.endDate,
    now,
  );
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999,
  );

  const [branches, services, rows, todayFeedback] = await Promise.all([
    db.branch.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    db.service.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    db.feedback.findMany({
      where: {
        deletedAt: null,
        ...(query.branchId ? { branchId: query.branchId } : {}),
        ...(query.serviceId ? { serviceId: query.serviceId } : {}),
        ...(range ? { createdAt: { gte: range.start, lte: range.end } } : {}),
      },
      select: {
        rating: true,
        createdAt: true,
        branchId: true,
        serviceId: true,
      },
    }),
    db.feedback.count({
      where: {
        deletedAt: null,
        createdAt: { gte: todayStart, lte: todayEnd },
      },
    }),
  ]);

  const records: FeedbackRecord[] = rows.map((row) => ({
    id: "",
    phoneNumber: "",
    branchId: row.branchId,
    branchName: "",
    serviceId: row.serviceId,
    serviceName: "",
    rating: row.rating,
    comment: null,
    createdAt: row.createdAt.toISOString(),
    deletedAt: null,
  }));

  const data = computeAnalyticsDashboard(
    { records, branches, services },
    query,
    now,
  );

  // Today's count is a clinic-wide metric (independent of the selected scope).
  return { ...data, summary: { ...data.summary, todayFeedback } };
}

// ---------------------------------------------------------------------------
// Dashboard overview (the /dashboard landing page)
// ---------------------------------------------------------------------------

export type DashboardOverview = {
  totalFeedback: number;
  todayFeedback: number;
  satisfactionRate: number; // 0..100
  avgRatingScore: number; // 0..7 scale
  positiveFeedback: number;
  neutralFeedback: number;
  negativeFeedback: number;
  activeBranches: number;
  activeServices: number;
};

export async function getDashboardOverviewData(
  now: Date = new Date(),
): Promise<DashboardOverview> {
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999,
  );

  const [grouped, todayFeedback, activeBranches, activeServices] =
    await Promise.all([
      db.feedback.groupBy({
        by: ["rating"],
        where: { deletedAt: null },
        _count: { _all: true },
      }),
      db.feedback.count({
        where: {
          deletedAt: null,
          createdAt: { gte: todayStart, lte: todayEnd },
        },
      }),
      db.branch.count({ where: { isActive: true } }),
      db.service.count({ where: { isActive: true } }),
    ]);

  let totalFeedback = 0;
  let positiveFeedback = 0;
  let neutralFeedback = 0;
  let negativeFeedback = 0;
  let totalScore = 0;

  for (const group of grouped) {
    const count = group._count._all;
    const rating = group.rating as FeedbackRating;
    totalFeedback += count;
    totalScore += getRatingScore(rating) * count;
    if (isPositiveRating(rating)) positiveFeedback += count;
    else if (isNeutralRating(rating)) neutralFeedback += count;
    else negativeFeedback += count;
  }

  return {
    totalFeedback,
    todayFeedback,
    satisfactionRate:
      totalFeedback > 0
        ? Math.round((positiveFeedback / totalFeedback) * 100)
        : 0,
    avgRatingScore:
      totalFeedback > 0
        ? Math.round((totalScore / totalFeedback) * 10) / 10
        : 0,
    positiveFeedback,
    neutralFeedback,
    negativeFeedback,
    activeBranches,
    activeServices,
  };
}

// ---------------------------------------------------------------------------
// Dashboard shell counts (nav badges + status pills)
// ---------------------------------------------------------------------------

export type NavCounts = {
  feedback: number;
  tasks: number;
  branches: number;
};

/** Live counts for the dashboard shell, fetched in a single batch. */
export async function getNavCounts(): Promise<NavCounts> {
  const [feedback, tasks, branches] = await Promise.all([
    db.feedback.count({ where: { deletedAt: null } }),
    db.task.count({ where: { deletedAt: null } }),
    db.branch.count({ where: { isActive: true } }),
  ]);

  return { feedback, tasks, branches };
}

// ---------------------------------------------------------------------------
// Branch & service overviews (the /dashboard/branches and /services pages)
// ---------------------------------------------------------------------------

export type BranchOverview = {
  id: string;
  name: string;
  code: string | null;
  address: string | null;
  phone: string | null;
  isActive: boolean;
  totalFeedback: number;
  satisfactionRate: number; // 0..100
  avgScore: number; // 0..7 scale
  positive: number; // satisfied (5–7) submissions
  neutral: number; // neutral (3–4) submissions
  negative: number; // needs attention (0–2) submissions
  servicesCount: number;
};

export type ServiceOverview = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  totalFeedback: number;
  satisfactionRate: number; // 0..100
  avgScore: number; // 0..7 scale
  positive: number; // satisfied (5–7) submissions
  neutral: number; // neutral (3–4) submissions
  negative: number; // needs attention (0–2) submissions
  branchesCount: number;
};

type RatingBuckets = {
  total: number;
  positive: number;
  neutral: number;
  negative: number;
  score: number;
};

function summarize(buckets: RatingBuckets): {
  totalFeedback: number;
  satisfactionRate: number;
  avgScore: number;
  positive: number;
  neutral: number;
  negative: number;
} {
  return {
    totalFeedback: buckets.total,
    satisfactionRate:
      buckets.total > 0
        ? Math.round((buckets.positive / buckets.total) * 100)
        : 0,
    avgScore:
      buckets.total > 0
        ? Math.round((buckets.score / buckets.total) * 10) / 10
        : 0,
    positive: buckets.positive,
    neutral: buckets.neutral,
    negative: buckets.negative,
  };
}

function addBucket(
  buckets: RatingBuckets,
  rating: FeedbackRating,
  count: number,
): void {
  buckets.total += count;
  buckets.score += getRatingScore(rating) * count;
  if (isPositiveRating(rating)) buckets.positive += count;
  else if (isNeutralRating(rating)) buckets.neutral += count;
  else buckets.negative += count;
}

export async function listBranchesWithAnalytics(): Promise<BranchOverview[]> {
  const [branches, grouped] = await Promise.all([
    db.branch.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        code: true,
        address: true,
        phone: true,
        isActive: true,
        _count: {
          select: { branchServices: { where: { isActive: true } } },
        },
      },
    }),
    db.feedback.groupBy({
      by: ["branchId", "rating"],
      where: { deletedAt: null },
      _count: { _all: true },
    }),
  ]);

  const byBranch = new Map<string, RatingBuckets>();
  for (const group of grouped) {
    const buckets = byBranch.get(group.branchId) ?? {
      total: 0,
      positive: 0,
      neutral: 0,
      negative: 0,
      score: 0,
    };
    addBucket(buckets, group.rating as FeedbackRating, group._count._all);
    byBranch.set(group.branchId, buckets);
  }

  return branches.map((branch) => {
    const stats = summarize(
      byBranch.get(branch.id) ?? {
        total: 0,
        positive: 0,
        neutral: 0,
        negative: 0,
        score: 0,
      },
    );
    return {
      id: branch.id,
      name: branch.name,
      code: branch.code,
      address: branch.address,
      phone: branch.phone,
      isActive: branch.isActive,
      servicesCount: branch._count.branchServices,
      ...stats,
    };
  });
}

export async function listServicesWithAnalytics(): Promise<ServiceOverview[]> {
  const [services, grouped] = await Promise.all([
    db.service.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        description: true,
        isActive: true,
        _count: {
          select: { branchServices: { where: { isActive: true } } },
        },
      },
    }),
    db.feedback.groupBy({
      by: ["serviceId", "rating"],
      where: { deletedAt: null },
      _count: { _all: true },
    }),
  ]);

  const byService = new Map<string, RatingBuckets>();
  for (const group of grouped) {
    const buckets = byService.get(group.serviceId) ?? {
      total: 0,
      positive: 0,
      neutral: 0,
      negative: 0,
      score: 0,
    };
    addBucket(buckets, group.rating as FeedbackRating, group._count._all);
    byService.set(group.serviceId, buckets);
  }

  return services.map((service) => {
    const stats = summarize(
      byService.get(service.id) ?? {
        total: 0,
        positive: 0,
        neutral: 0,
        negative: 0,
        score: 0,
      },
    );
    return {
      id: service.id,
      name: service.name,
      description: service.description,
      isActive: service.isActive,
      branchesCount: service._count.branchServices,
      ...stats,
    };
  });
}
