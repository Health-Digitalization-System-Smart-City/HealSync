"use client";

import {
  AlertTriangle,
  CalendarCheck,
  MessageSquare,
  Smile,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import type { DashboardSummaryMetrics } from "@/lib/analytics/types";
import { cn } from "@/lib/utils";

type MetricCardProps = {
  label: string;
  value?: number | string;
  icon: React.ReactNode;
  iconBg: string;
  pill?: React.ReactNode;
  subtitle?: string;
  loading?: boolean;
};

function MetricCard({
  label,
  value,
  icon,
  iconBg,
  pill,
  subtitle,
  loading = false,
}: MetricCardProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all hover:border-slate-300 hover:shadow">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </p>
        <span
          className={`flex size-9 items-center justify-center rounded-xl shadow-xs ${iconBg}`}
        >
          {icon}
        </span>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        {loading ? (
          <div className="h-8 w-20 animate-pulse rounded-md bg-slate-200" />
        ) : (
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            {typeof value === "number" ? value.toLocaleString() : value ?? "—"}
          </h2>
        )}

        {!loading && pill}
      </div>

      <p className="mt-1 text-xs text-slate-400">
        {subtitle ?? (loading ? "Loading metrics..." : "In selected period")}
      </p>
    </div>
  );
}

export function AnalyticsSummary({
  summary,
  loading = false,
}: {
  summary?: DashboardSummaryMetrics;
  loading?: boolean;
}) {
  const satRate = summary?.satisfactionRate ?? 0;
  const isHighSatisfaction = satRate >= 75;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. Total Feedback */}
      <MetricCard
        label="Total Feedback"
        value={summary?.totalFeedback}
        loading={loading}
        icon={<MessageSquare className="size-4.5 text-blue-600" />}
        iconBg="bg-blue-50 text-blue-600 border border-blue-100"
        subtitle="Total patient submissions in timeframe"
        pill={
          summary && (
            <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
              Avg score: {summary.avgRatingScore}/7
            </span>
          )
        }
      />

      {/* 2. Today's Feedback */}
      <MetricCard
        label="Today's Feedback"
        value={summary?.todayFeedback}
        loading={loading}
        icon={<CalendarCheck className="size-4.5 text-purple-600" />}
        iconBg="bg-purple-50 text-purple-600 border border-purple-100"
        subtitle="New submissions logged today"
        pill={
          <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-0.5 text-xs font-semibold text-purple-700 border border-purple-200">
            <span className="size-1.5 rounded-full bg-purple-600 animate-pulse" />
            Live Feed
          </span>
        }
      />

      {/* 3. Satisfaction Rate */}
      <MetricCard
        label="Satisfaction Rate"
        value={summary ? `${summary.satisfactionRate}%` : undefined}
        loading={loading}
        icon={<Smile className="size-4.5 text-emerald-600" />}
        iconBg="bg-emerald-50 text-emerald-600 border border-emerald-100"
        subtitle={`${summary?.positiveFeedback ?? 0} positive ratings (5–7 stars)`}
        pill={
          summary && (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-bold border",
                isHighSatisfaction
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-blue-50 text-blue-700 border-blue-200",
              )}
            >
              {isHighSatisfaction ? (
                <TrendingUp className="size-3 text-emerald-600" />
              ) : (
                <TrendingDown className="size-3 text-blue-600" />
              )}
              {isHighSatisfaction ? "Target Met" : "Moderate"}
            </span>
          )
        }
      />

      {/* 4. Negative / Needs Attention */}
      <MetricCard
        label="Negative / Attention"
        value={summary?.negativeFeedback}
        loading={loading}
        icon={<AlertTriangle className="size-4.5 text-amber-600" />}
        iconBg="bg-amber-50 text-amber-600 border border-amber-100"
        subtitle={`${summary?.negativeRate ?? 0}% of all responses (0–2 stars)`}
        pill={
          summary && (
            <span
              className={cn(
                "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold border",
                summary.negativeFeedback === 0
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-amber-50 text-amber-700 border-amber-200",
              )}
            >
              {summary.negativeRate}% rate
            </span>
          )
        }
      />
    </div>
  );
}
