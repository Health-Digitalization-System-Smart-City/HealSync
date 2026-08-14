import type { FeedbackRange, FeedbackRating } from "@/lib/feedback/types";

export type AnalyticsQuery = {
  range?: FeedbackRange;
  startDate?: string;
  endDate?: string;
  branchId?: string;
  serviceId?: string;
  interval?: "day" | "week" | "month";
};

export type DashboardSummaryMetrics = {
  totalFeedback: number;
  todayFeedback: number;
  satisfactionRate: number; // 0..100 percentage
  negativeFeedback: number;
  negativeRate: number; // 0..100 percentage
  positiveFeedback: number;
  positiveRate: number; // 0..100 percentage
  neutralFeedback: number;
  neutralRate: number; // 0..100 percentage
  avgRatingScore: number; // 0..7 scale
};

export type FeedbackTrendPoint = {
  date: string;
  label: string;
  total: number;
  positive: number;
  neutral: number;
  negative: number;
  satisfactionRate: number;
};

export type SatisfactionDistributionItem = {
  rating: FeedbackRating;
  label: string;
  score: number;
  count: number;
  percentage: number;
  tone: "positive" | "neutral" | "needsAttention";
};

export type BranchComparisonItem = {
  branchId: string;
  branchName: string;
  totalFeedback: number;
  satisfactionRate: number;
  avgScore: number;
  positiveCount: number;
  neutralCount: number;
  negativeCount: number;
};

export type ServiceComparisonItem = {
  serviceId: string;
  serviceName: string;
  totalFeedback: number;
  satisfactionRate: number;
  avgScore: number;
  positiveCount: number;
  neutralCount: number;
  negativeCount: number;
};

export type AnalyticsDashboardData = {
  summary: DashboardSummaryMetrics;
  trends: FeedbackTrendPoint[];
  distribution: SatisfactionDistributionItem[];
  branchComparison: BranchComparisonItem[];
  serviceComparison: ServiceComparisonItem[];
  period: {
    range: FeedbackRange;
    startDate?: string;
    endDate?: string;
    label: string;
  };
  totalCountInPeriod: number;
};
