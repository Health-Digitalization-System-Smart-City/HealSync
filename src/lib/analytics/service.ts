import {
  RATING_OPTIONS,
  getRatingScore,
  isNeedsAttentionRating,
  isNeutralRating,
  isPositiveRating,
} from "@/lib/feedback/ratings";
import { resolveDateRange } from "@/lib/feedback/ranges";
import type { FeedbackStore } from "@/lib/feedback/store";
import type { FeedbackRecord } from "@/lib/feedback/types";
import type {
  AnalyticsDashboardData,
  AnalyticsQuery,
  BranchComparisonItem,
  DashboardSummaryMetrics,
  FeedbackTrendPoint,
  SatisfactionDistributionItem,
  ServiceComparisonItem,
} from "./types";

function formatShortDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

export function computeAnalyticsDashboard(
  store: FeedbackStore,
  query: AnalyticsQuery = {},
  now: Date = new Date(),
): AnalyticsDashboardData {
  const range = resolveDateRange(query.range, query.startDate, query.endDate, now);

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).getTime();

  // All active records
  const allActiveRecords = store.records.filter((r) => r.deletedAt === null);

  // Today's total count in clinic
  const todayCount = allActiveRecords.filter((r) => {
    const time = new Date(r.createdAt).getTime();
    return time >= todayStart && time <= todayEnd;
  }).length;

  // Filter records by branch, service, and date range
  let records = allActiveRecords;

  if (query.branchId) {
    records = records.filter((r) => r.branchId === query.branchId);
  }
  if (query.serviceId) {
    records = records.filter((r) => r.serviceId === query.serviceId);
  }
  if (range) {
    const start = range.start.getTime();
    const end = range.end.getTime();
    records = records.filter((r) => {
      const time = new Date(r.createdAt).getTime();
      return time >= start && time <= end;
    });
  }

  const total = records.length;

  // 1. Compute Summary Metrics
  let positive = 0;
  let neutral = 0;
  let negative = 0;
  let totalScore = 0;

  for (const r of records) {
    const score = getRatingScore(r.rating);
    totalScore += score;
    if (isPositiveRating(r.rating)) positive += 1;
    else if (isNeutralRating(r.rating)) neutral += 1;
    else if (isNeedsAttentionRating(r.rating)) negative += 1;
  }

  const satisfactionRate = total > 0 ? Math.round((positive / total) * 100) : 0;
  const positiveRate = total > 0 ? Math.round((positive / total) * 100) : 0;
  const neutralRate = total > 0 ? Math.round((neutral / total) * 100) : 0;
  const negativeRate = total > 0 ? Math.round((negative / total) * 100) : 0;
  const avgRatingScore = total > 0 ? Math.round((totalScore / total) * 10) / 10 : 0;

  const summary: DashboardSummaryMetrics = {
    totalFeedback: total,
    todayFeedback: todayCount,
    satisfactionRate,
    negativeFeedback: negative,
    negativeRate,
    positiveFeedback: positive,
    positiveRate,
    neutralFeedback: neutral,
    neutralRate,
    avgRatingScore,
  };

  // 2. Compute Trends (Feedback volume & satisfaction over time)
  const trends = computeTrends(records);

  // 3. Compute Satisfaction Distribution
  const distribution: SatisfactionDistributionItem[] = RATING_OPTIONS.map((option) => {
    const count = records.filter((r) => r.rating === option.value).length;
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
    const tone: "positive" | "neutral" | "needsAttention" = isPositiveRating(option.value)
      ? "positive"
      : isNeutralRating(option.value)
        ? "neutral"
        : "needsAttention";

    return {
      rating: option.value,
      label: option.label,
      score: option.score,
      count,
      percentage,
      tone,
    };
  });

  // 4. Compute Branch Comparison
  const branchComparison: BranchComparisonItem[] = store.branches.map((branch) => {
    const branchRecords = records.filter((r) => r.branchId === branch.id);
    const bTotal = branchRecords.length;
    let bPos = 0;
    let bNeu = 0;
    let bNeg = 0;
    let bScore = 0;

    for (const r of branchRecords) {
      const score = getRatingScore(r.rating);
      bScore += score;
      if (isPositiveRating(r.rating)) bPos += 1;
      else if (isNeutralRating(r.rating)) bNeu += 1;
      else if (isNeedsAttentionRating(r.rating)) bNeg += 1;
    }

    return {
      branchId: branch.id,
      branchName: branch.name,
      totalFeedback: bTotal,
      satisfactionRate: bTotal > 0 ? Math.round((bPos / bTotal) * 100) : 0,
      avgScore: bTotal > 0 ? Math.round((bScore / bTotal) * 10) / 10 : 0,
      positiveCount: bPos,
      neutralCount: bNeu,
      negativeCount: bNeg,
    };
  }).sort((a, b) => b.totalFeedback - a.totalFeedback || b.satisfactionRate - a.satisfactionRate);

  // 5. Compute Service Comparison
  const serviceComparison: ServiceComparisonItem[] = store.services.map((service) => {
    const serviceRecords = records.filter((r) => r.serviceId === service.id);
    const sTotal = serviceRecords.length;
    let sPos = 0;
    let sNeu = 0;
    let sNeg = 0;
    let sScore = 0;

    for (const r of serviceRecords) {
      const score = getRatingScore(r.rating);
      sScore += score;
      if (isPositiveRating(r.rating)) sPos += 1;
      else if (isNeutralRating(r.rating)) sNeu += 1;
      else if (isNeedsAttentionRating(r.rating)) sNeg += 1;
    }

    return {
      serviceId: service.id,
      serviceName: service.name,
      totalFeedback: sTotal,
      satisfactionRate: sTotal > 0 ? Math.round((sPos / sTotal) * 100) : 0,
      avgScore: sTotal > 0 ? Math.round((sScore / sTotal) * 10) / 10 : 0,
      positiveCount: sPos,
      neutralCount: sNeu,
      negativeCount: sNeg,
    };
  }).sort((a, b) => b.totalFeedback - a.totalFeedback || b.satisfactionRate - a.satisfactionRate);

  return {
    summary,
    trends,
    distribution,
    branchComparison,
    serviceComparison,
    period: {
      range: query.range || "all",
      startDate: query.startDate,
      endDate: query.endDate,
      label: query.range ? query.range.replace("_", " ") : "All time",
    },
    totalCountInPeriod: total,
  };
}

function computeTrends(
  records: FeedbackRecord[],
): FeedbackTrendPoint[] {
  if (records.length === 0) {
    return [];
  }

  // Group records by YYYY-MM-DD
  const dateMap = new Map<string, { total: number; pos: number; neu: number; neg: number }>();

  for (const r of records) {
    const d = new Date(r.createdAt);
    const key = d.toISOString().slice(0, 10);
    const curr = dateMap.get(key) || { total: 0, pos: 0, neu: 0, neg: 0 };
    curr.total += 1;
    if (isPositiveRating(r.rating)) curr.pos += 1;
    else if (isNeutralRating(r.rating)) curr.neu += 1;
    else if (isNeedsAttentionRating(r.rating)) curr.neg += 1;
    dateMap.set(key, curr);
  }

  // Sort keys chronologically
  const sortedDates = Array.from(dateMap.keys()).sort();

  return sortedDates.map((dateStr) => {
    const item = dateMap.get(dateStr)!;
    const dateObj = new Date(dateStr);
    const satRate = item.total > 0 ? Math.round((item.pos / item.total) * 100) : 0;

    return {
      date: dateStr,
      label: formatShortDate(dateObj),
      total: item.total,
      positive: item.pos,
      neutral: item.neu,
      negative: item.neg,
      satisfactionRate: satRate,
    };
  });
}
