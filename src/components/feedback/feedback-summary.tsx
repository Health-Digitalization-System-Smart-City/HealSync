"use client";

import {
  AlertTriangle,
  CheckCircle2,
  MessageSquare,
  TrendingUp,
} from "lucide-react";
import type { FeedbackSummary as FeedbackSummaryData } from "@/lib/feedback/types";

type CardProps = {
  label: string;
  value?: number;
  total?: number;
  icon: React.ReactNode;
  iconBg: string;
  badgeColor?: string;
  badgeLabel?: string;
  loading: boolean;
};

function SummaryCard({
  label,
  value,
  total,
  icon,
  iconBg,
  badgeColor,
  badgeLabel,
  loading,
}: CardProps) {
  const percentage =
    total && total > 0 && typeof value === "number"
      ? Math.round((value / total) * 100)
      : null;

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:border-slate-300 hover:shadow">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
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
            {value?.toLocaleString() ?? "0"}
          </h2>
        )}

        {!loading && percentage !== null && (
          <span
            className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${badgeColor || "bg-slate-100 text-slate-700"}`}
          >
            {percentage}%
          </span>
        )}
      </div>

      <p className="mt-1 text-xs text-slate-400">
        {badgeLabel ??
          (loading ? "Loading metrics..." : "Based on current filters")}
      </p>
    </div>
  );
}

export function FeedbackSummary({
  summary,
  loading = false,
}: {
  summary?: FeedbackSummaryData;
  loading?: boolean;
}) {
  const total = summary?.total ?? 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <SummaryCard
        label="Total Feedback"
        value={summary?.total}
        total={undefined}
        loading={loading}
        icon={<MessageSquare className="size-4.5 text-blue-600" />}
        iconBg="bg-blue-50 text-blue-600 border border-blue-100"
        badgeLabel="All submissions in scope"
      />
      <SummaryCard
        label="Positive"
        value={summary?.positive}
        total={total}
        loading={loading}
        icon={<CheckCircle2 className="size-4.5 text-emerald-600" />}
        iconBg="bg-emerald-50 text-emerald-600 border border-emerald-100"
        badgeColor="bg-emerald-50 text-emerald-700 border border-emerald-200"
        badgeLabel="Ratings 5–7 (Satisfied)"
      />
      <SummaryCard
        label="Neutral"
        value={summary?.neutral}
        total={total}
        loading={loading}
        icon={<TrendingUp className="size-4.5 text-slate-600" />}
        iconBg="bg-slate-100 text-slate-700 border border-slate-200"
        badgeColor="bg-slate-100 text-slate-700 border border-slate-200"
        badgeLabel="Ratings 3–4 (Neutral / Good)"
      />
      <SummaryCard
        label="Needs Attention"
        value={summary?.needsAttention}
        total={total}
        loading={loading}
        icon={<AlertTriangle className="size-4.5 text-amber-600" />}
        iconBg="bg-amber-50 text-amber-600 border border-amber-100"
        badgeColor="bg-amber-50 text-amber-700 border border-amber-200"
        badgeLabel="Ratings 0–2 (Not satisfied / Poor)"
      />
    </div>
  );
}
