import {
  MessageSquare,
  Star,
  ThumbsDown,
  ThumbsUp,
  TrendingUp,
} from "lucide-react";

import { MetricCard } from "@/components/metric-card";
import type { ClinicSummary } from "@/lib/analytics/insights-types";

/** Deterministic overview metrics for the selected period (PostgreSQL-computed). */
export function OverviewMetrics({ summary }: { summary: ClinicSummary }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
      <MetricCard
        label="Feedback"
        value={summary.feedbackCount.toLocaleString()}
        icon={MessageSquare}
        accent="blue"
        detail="submissions in period"
      />
      <MetricCard
        label="Average Rating"
        value={summary.averageRating.toFixed(1)}
        icon={Star}
        accent="violet"
        detail="out of 7"
      />
      <MetricCard
        label="Satisfaction Rate"
        value={`${summary.satisfactionRate}%`}
        icon={TrendingUp}
        accent="emerald"
        detail="share of positive feedback"
      />
      <MetricCard
        label="Positive"
        value={summary.positiveCount.toLocaleString()}
        icon={ThumbsUp}
        accent="teal"
        detail={`${summary.neutralCount.toLocaleString()} neutral`}
      />
      <MetricCard
        label="Needs Attention"
        value={summary.negativeCount.toLocaleString()}
        icon={ThumbsDown}
        accent="rose"
        detail="negative submissions"
      />
    </div>
  );
}
