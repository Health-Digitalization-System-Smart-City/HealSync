"use server";

import { z } from "zod";

import { db } from "@/lib/db";
import { fail, ok, type ActionResponse } from "@/lib/actions";
import { requirePermission } from "@/lib/auth/permissions";

const ratingOrder = [
  "VERY_SATISFIED",
  "SATISFIED",
  "MOSTLY_SATISFIED",
  "GOOD",
  "NEUTRAL",
  "NOT_SATISFIED",
  "POOR",
  "VERY_POOR",
] as const;

export type FeedbackRatingName = (typeof ratingOrder)[number];

export type DashboardSummary = {
  totalFeedback: number;
  satisfactionRate: number;
  negativeRate: number;
  neutralRate: number;
  todayCount: number;
};

export type FeedbackTrendPoint = {
  bucket: string;
  label: string;
  value: number;
};

export type SatisfactionDistributionItem = {
  rating: FeedbackRatingName;
  count: number;
  percentage: number;
};

export type BranchAnalyticsEntry = {
  branchId: string;
  branchName: string;
  total: number;
  satisfactionRate: number;
  negativeRate: number;
  neutralRate: number;
};

export type ServiceAnalyticsEntry = {
  serviceId: string;
  serviceName: string;
  total: number;
  satisfactionRate: number;
  negativeRate: number;
  neutralRate: number;
};

const analyticsRangeSchema = z.enum([
  "today",
  "yesterday",
  "specific_day",
  "this_week",
  "previous_week",
  "this_month",
  "previous_month",
  "this_year",
  "previous_year",
  "custom",
]);

const getTrendInputSchema = z.object({
  branchId: z.string().optional(),
  serviceId: z.string().optional(),
  range: analyticsRangeSchema.optional(),
  interval: z.enum(["day", "week", "month", "year"]).default("day"),
  date: z.coerce.date().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

const percent = (value: number, total: number): number => {
  if (total === 0) return 0;
  return Number(((value / total) * 100).toFixed(2));
};

function bucketRating(rating: string): "satisfied" | "neutral" | "negative" {
  switch (rating) {
    case "VERY_SATISFIED":
    case "SATISFIED":
    case "MOSTLY_SATISFIED":
    case "GOOD":
      return "satisfied";
    case "NEUTRAL":
      return "neutral";
    default:
      return "negative";
  }
}

function buildBaseWhere(input?: { branchId?: string; serviceId?: string }) {
  return {
    deletedAt: null,
    ...(input?.branchId ? { branchId: input.branchId } : {}),
    ...(input?.serviceId ? { serviceId: input.serviceId } : {}),
  };
}

function summarizeRows(rows: Array<{ rating: string }>) {
  const total = rows.length;
  let satisfied = 0;
  let neutral = 0;
  let negative = 0;

  for (const row of rows) {
    const bucket = bucketRating(row.rating);
    if (bucket === "satisfied") satisfied += 1;
    if (bucket === "neutral") neutral += 1;
    if (bucket === "negative") negative += 1;
  }

  return {
    total,
    satisfactionRate: percent(satisfied, total),
    neutralRate: percent(neutral, total),
    negativeRate: percent(negative, total),
  };
}

async function getRelevantFeedbackRows(input?: {
  branchId?: string;
  serviceId?: string;
  startDate?: Date;
  endDate?: Date;
}) {
  const where = {
    ...buildBaseWhere(input),
    ...(input?.startDate || input?.endDate
      ? {
          createdAt: {
            ...(input.startDate ? { gte: input.startDate } : {}),
            ...(input.endDate ? { lte: input.endDate } : {}),
          },
        }
      : {}),
  };

  try {
    return await db.feedback.findMany({
      where,
      select: {
        rating: true,
        createdAt: true,
        branchId: true,
        serviceId: true,
      },
    });
  } catch (err) {
    // Log detailed error server-side for diagnostics and rethrow so callers
    // can return a structured failure response instead of crashing.
    console.error("getRelevantFeedbackRows db error:", err);
    throw err;
  }
}

function getDateRangeForPreset(range?: string, date?: Date) {
  const now = new Date();
  const startOfDay = (value: Date) => {
    const clone = new Date(value);
    clone.setHours(0, 0, 0, 0);
    return clone;
  };
  const endOfDay = (value: Date) => {
    const clone = new Date(value);
    clone.setHours(23, 59, 59, 999);
    return clone;
  };

  switch (range) {
    case "today": {
      return { startDate: startOfDay(now), endDate: endOfDay(now) };
    }
    case "yesterday": {
      const previous = new Date(now);
      previous.setDate(previous.getDate() - 1);
      return { startDate: startOfDay(previous), endDate: endOfDay(previous) };
    }
    case "specific_day": {
      const target = date ?? now;
      return { startDate: startOfDay(target), endDate: endOfDay(target) };
    }
    case "this_week": {
      const weekStart = new Date(now);
      const currentDay = weekStart.getDay();
      const diff = currentDay === 0 ? -6 : 1 - currentDay;
      weekStart.setDate(weekStart.getDate() + diff);
      weekStart.setHours(0, 0, 0, 0);
      return { startDate: weekStart, endDate: endOfDay(now) };
    }
    case "previous_week": {
      const current = new Date(now);
      current.setDate(current.getDate() - 7);
      const weekStart = new Date(current);
      const currentDay = weekStart.getDay();
      const diff = currentDay === 0 ? -6 : 1 - currentDay;
      weekStart.setDate(weekStart.getDate() + diff);
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      return { startDate: weekStart, endDate: weekEnd };
    }
    case "this_month": {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      return { startDate: monthStart, endDate: endOfDay(now) };
    }
    case "previous_month": {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(
        now.getFullYear(),
        now.getMonth(),
        0,
        23,
        59,
        59,
        999,
      );
      return { startDate: start, endDate: end };
    }
    case "this_year": {
      const yearStart = new Date(now.getFullYear(), 0, 1);
      return { startDate: yearStart, endDate: endOfDay(now) };
    }
    case "previous_year": {
      const yearStart = new Date(now.getFullYear() - 1, 0, 1);
      const yearEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
      return { startDate: yearStart, endDate: yearEnd };
    }
    default:
      return {};
  }
}

export async function getDashboardSummary(): Promise<
  ActionResponse<DashboardSummary>
> {
  const authResult = await requirePermission("analytics.read");
  if (!authResult.success) return authResult;

  const today = new Date();
  const todayStart = new Date(today);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(today);
  todayEnd.setHours(23, 59, 59, 999);

  let allRows: Array<{
    rating: string;
    createdAt: Date;
    branchId: string;
    serviceId: string;
  }> = [];
  let todayRows: Array<{
    rating: string;
    createdAt: Date;
    branchId: string;
    serviceId: string;
  }> = [];
  try {
    [allRows, todayRows] = await Promise.all([
      getRelevantFeedbackRows(),
      getRelevantFeedbackRows({
        startDate: todayStart,
        endDate: todayEnd,
      }),
    ]);
  } catch (err) {
    console.error("getDashboardSummary db error:", err);
    return fail("DATABASE_ERROR", "Failed to load analytics summary.");
  }

  const overall = summarizeRows(allRows);
  const todaySummary = summarizeRows(todayRows);

  return ok({
    totalFeedback: overall.total,
    satisfactionRate: overall.satisfactionRate,
    negativeRate: overall.negativeRate,
    neutralRate: overall.neutralRate,
    todayCount: todaySummary.total,
  });
}

export async function getFeedbackTrends(
  input: unknown,
): Promise<ActionResponse<FeedbackTrendPoint[]>> {
  const authResult = await requirePermission("analytics.read");
  if (!authResult.success) return authResult;

  const parsed = getTrendInputSchema.safeParse(input);
  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "Please check your analytics filter.", {
      ...parsed.error.flatten().fieldErrors,
    });
  }

  const { branchId, serviceId, range, interval, date, startDate, endDate } =
    parsed.data;

  const customRange = range === "custom" || (!range && (startDate || endDate));
  const resolvedRange = customRange
    ? { startDate, endDate }
    : getDateRangeForPreset(range, date);

  let rows: Array<{
    rating: string;
    createdAt: Date;
    branchId: string;
    serviceId: string;
  }> = [];
  try {
    rows = await getRelevantFeedbackRows({
      branchId,
      serviceId,
      startDate: resolvedRange.startDate,
      endDate: resolvedRange.endDate,
    });
  } catch (err) {
    console.error("getFeedbackTrends db error:", err);
    return fail("DATABASE_ERROR", "Failed to load analytics trends.");
  }

  const byLabel = new Map<string, { label: string; value: number }>();

  for (const row of rows) {
    const created = new Date(row.createdAt);
    const key =
      interval === "day"
        ? created.toISOString().slice(0, 10)
        : interval === "week"
          ? `W${Math.ceil((created.getDate() + new Date(created.getFullYear(), created.getMonth(), 1).getDay()) / 7)}`
          : interval === "month"
            ? `${created.getFullYear()}-${String(created.getMonth() + 1).padStart(2, "0")}`
            : `${created.getFullYear()}`;

    const bucket = byLabel.get(key) ?? { label: key, value: 0 };
    bucket.value += 1;
    byLabel.set(key, bucket);
  }

  return ok(
    Array.from(byLabel.values()).map((item) => ({
      bucket: item.label,
      label: item.label,
      value: item.value,
    })),
  );
}

export async function getSatisfactionDistribution(
  input: { branchId?: string; serviceId?: string } = {},
): Promise<ActionResponse<SatisfactionDistributionItem[]>> {
  const authResult = await requirePermission("analytics.read");
  if (!authResult.success) return authResult;

  let rows: Array<{
    rating: string;
    createdAt: Date;
    branchId: string;
    serviceId: string;
  }> = [];
  try {
    rows = await getRelevantFeedbackRows(input);
  } catch (err) {
    console.error("getSatisfactionDistribution db error:", err);
    return fail("DATABASE_ERROR", "Failed to load satisfaction distribution.");
  }
  const total = rows.length;
  const counts: Record<FeedbackRatingName, number> = {
    VERY_SATISFIED: 0,
    SATISFIED: 0,
    MOSTLY_SATISFIED: 0,
    GOOD: 0,
    NEUTRAL: 0,
    NOT_SATISFIED: 0,
    POOR: 0,
    VERY_POOR: 0,
  };

  for (const row of rows) {
    const rating = row.rating as FeedbackRatingName;
    counts[rating] = (counts[rating] ?? 0) + 1;
  }

  const distribution = ratingOrder.map((rating) => ({
    rating,
    count: counts[rating],
    percentage: percent(counts[rating], total),
  }));

  return ok(distribution);
}

export async function getBranchAnalytics(
  input: { branchId?: string } = {},
): Promise<ActionResponse<BranchAnalyticsEntry[]>> {
  const authResult = await requirePermission("analytics.read");
  if (!authResult.success) return authResult;

  let rows: Array<{ rating: string } & { branchId: string }> = [];
  try {
    rows = await getRelevantFeedbackRows(input);
  } catch (err) {
    console.error("getBranchAnalytics db error:", err);
    return fail("DATABASE_ERROR", "Failed to load branch analytics.");
  }

  const branchMap = new Map<string, string>();
  const branchIds = Array.from(new Set(rows.map((row) => row.branchId)));

  if (branchIds.length > 0) {
    const branches = await db.branch.findMany({
      where: { id: { in: branchIds } },
      select: { id: true, name: true },
    });

    for (const branch of branches) {
      branchMap.set(branch.id, branch.name);
    }
  }

  const grouped = new Map<string, Array<{ rating: string }>>();
  for (const row of rows) {
    const bucket = grouped.get(row.branchId) ?? [];
    bucket.push({ rating: row.rating });
    grouped.set(row.branchId, bucket);
  }

  const analytics = Array.from(grouped.entries()).map(
    ([branchId, branchRows]) => {
      const summary = summarizeRows(branchRows);
      return {
        branchId,
        branchName: branchMap.get(branchId) ?? "Unknown branch",
        total: summary.total,
        satisfactionRate: summary.satisfactionRate,
        negativeRate: summary.negativeRate,
        neutralRate: summary.neutralRate,
      };
    },
  );

  return ok(analytics.sort((a, b) => b.total - a.total));
}

export async function getServiceAnalytics(
  input: { serviceId?: string; branchId?: string } = {},
): Promise<ActionResponse<ServiceAnalyticsEntry[]>> {
  const authResult = await requirePermission("analytics.read");
  if (!authResult.success) return authResult;

  let rows: Array<{ rating: string } & { serviceId: string }> = [];
  try {
    rows = await getRelevantFeedbackRows(input);
  } catch (err) {
    console.error("getServiceAnalytics db error:", err);
    return fail("DATABASE_ERROR", "Failed to load service analytics.");
  }

  const serviceMap = new Map<string, string>();
  const serviceIds = Array.from(new Set(rows.map((row) => row.serviceId)));

  if (serviceIds.length > 0) {
    const services = await db.service.findMany({
      where: { id: { in: serviceIds } },
      select: { id: true, name: true },
    });

    for (const service of services) {
      serviceMap.set(service.id, service.name);
    }
  }

  const grouped = new Map<string, Array<{ rating: string }>>();
  for (const row of rows) {
    const bucket = grouped.get(row.serviceId) ?? [];
    bucket.push({ rating: row.rating });
    grouped.set(row.serviceId, bucket);
  }

  const analytics = Array.from(grouped.entries()).map(
    ([serviceId, serviceRows]) => {
      const summary = summarizeRows(serviceRows);
      return {
        serviceId,
        serviceName: serviceMap.get(serviceId) ?? "Unknown service",
        total: summary.total,
        satisfactionRate: summary.satisfactionRate,
        negativeRate: summary.negativeRate,
        neutralRate: summary.neutralRate,
      };
    },
  );

  return ok(analytics.sort((a, b) => b.total - a.total));
}

export async function generateFeedbackInsights(
  input: {
    branchId?: string;
    serviceId?: string;
    limit?: number;
  } = {},
): Promise<
  ActionResponse<{
    summary: string;
    positiveThemes: string[];
    negativeThemes: string[];
    recommendations: string[];
  }>
> {
  const authResult = await requirePermission("analytics.ai");
  if (!authResult.success) return authResult;

  let rows: Array<{
    rating: string;
    createdAt: Date;
    branchId: string;
    serviceId: string;
  }> = [];
  try {
    rows = await getRelevantFeedbackRows(input);
  } catch (err) {
    console.error("generateFeedbackInsights db error:", err);
    return fail(
      "DATABASE_ERROR",
      "Failed to generate AI insights due to DB error.",
    );
  }
  const subset = rows.slice(0, Math.min(input.limit ?? 50, 200));

  const positive = new Set<string>();
  const negative = new Set<string>();

  for (const row of subset) {
    const rating = row.rating as string;
    if (bucketRating(rating) === "satisfied") {
      positive.add("Patient experience remains broadly positive");
    }
    if (bucketRating(rating) === "negative") {
      negative.add(
        "Targeted follow-up is recommended for issue-prone touchpoints",
      );
    }
  }

  const summary =
    subset.length === 0
      ? "No recent feedback is available for AI review in the selected scope."
      : `Across ${subset.length} recent feedback entries, the experience is mostly ${
          summarizeRows(subset).satisfactionRate >= 60 ? "positive" : "mixed"
        } with follow-up opportunities in the lower-scoring areas.`;

  return ok({
    summary,
    positiveThemes: Array.from(positive),
    negativeThemes: Array.from(negative),
    recommendations: [
      "Review the lowest-scoring branch or service experience in the selected period.",
      "Look for repeated service delays, communication issues, or front-desk friction in comments.",
      "Pair trend checks with recent operational changes before making a service response.",
    ],
  });
}
