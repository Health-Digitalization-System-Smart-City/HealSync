import { Activity, MessageSquare, Star } from "lucide-react";

import type { ServiceOverview } from "@/lib/analytics/db";
import { cn } from "@/lib/utils";

import { SatisfactionBar } from "./satisfaction-bar";

type PerformanceTone = {
  label: string;
  chip: string;
  avatar: string;
  gradient: string;
  text: string;
};

function performanceOf(satisfactionRate: number): PerformanceTone {
  if (satisfactionRate >= 75) {
    return {
      label: "Excellent",
      chip: "border-emerald-200 bg-emerald-50 text-emerald-700",
      avatar: "from-emerald-500 to-teal-600",
      gradient: "from-emerald-400 to-teal-500",
      text: "text-emerald-700",
    };
  }
  if (satisfactionRate >= 50) {
    return {
      label: "Good",
      chip: "border-teal-200 bg-teal-50 text-teal-700",
      avatar: "from-teal-500 to-cyan-600",
      gradient: "from-teal-400 to-cyan-500",
      text: "text-teal-700",
    };
  }
  return {
    label: "Needs attention",
    chip: "border-amber-200 bg-amber-50 text-amber-700",
    avatar: "from-amber-500 to-orange-600",
    gradient: "from-amber-400 to-orange-500",
    text: "text-amber-700",
  };
}

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

type ServiceCardProps = {
  service: ServiceOverview;
  rank?: number;
  /** Optional management controls rendered in the footer (Admin-only). */
  actions?: React.ReactNode;
};

export function ServiceCard({ service, rank, actions }: ServiceCardProps) {
  const tone = performanceOf(service.satisfactionRate);
  const hasFeedback = service.totalFeedback > 0;

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300",
        "hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-900/5",
      )}
    >
      {/* Performance gradient bar */}
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-1 bg-gradient-to-r",
          tone.gradient,
        )}
        aria-hidden
      />

      <div className="flex flex-1 flex-col p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className={cn(
                "relative flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-sm font-bold text-white shadow-sm transition-transform duration-300 group-hover:scale-105",
                tone.avatar,
                !service.isActive && "grayscale",
              )}
              aria-hidden
            >
              {initialsOf(service.name) || <Activity className="size-4" />}
              {rank !== undefined && rank <= 3 ? (
                <span className="absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full bg-slate-900 text-[9px] font-bold text-white shadow-sm">
                  {rank}
                </span>
              ) : null}
            </div>
            <h2 className="min-w-0 truncate text-base font-bold text-slate-900">
              {service.name}
            </h2>
          </div>

          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
              service.isActive
                ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border border-slate-200 bg-slate-50 text-slate-500",
            )}
          >
            <span
              className={cn(
                "size-1.5 rounded-full",
                service.isActive
                  ? "animate-pulse bg-emerald-500"
                  : "bg-slate-300",
              )}
              aria-hidden
            />
            {service.isActive ? "Active" : "Inactive"}
          </span>
        </div>

        {service.description ? (
          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-500">
            {service.description}
          </p>
        ) : null}

        {/* Satisfaction headline */}
        <div className="mt-5 flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
              Patient satisfaction
            </p>
            <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              {service.satisfactionRate}
              <span className="text-base font-semibold text-slate-400">%</span>
            </p>
          </div>
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold",
              tone.chip,
            )}
          >
            {tone.label}
          </span>
        </div>

        {/* Sentiment split */}
        <SatisfactionBar
          className="mt-3"
          positive={service.positive}
          neutral={service.neutral}
          negative={service.negative}
        />

        {/* Mini stats */}
        <div className="mt-5 grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
              <MessageSquare className="size-3" aria-hidden />
              Feedback
            </p>
            <p className="mt-1 text-lg font-bold text-slate-900">
              {service.totalFeedback.toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
              <Star className="size-3 text-amber-500" aria-hidden />
              Avg rating
            </p>
            <p className="mt-1 text-lg font-bold text-slate-900">
              {hasFeedback ? service.avgScore.toFixed(1) : "—"}
              {hasFeedback ? (
                <span className="text-xs font-medium text-slate-400">/7</span>
              ) : null}
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
              <Activity className="size-3" aria-hidden />
              Branches
            </p>
            <p className="mt-1 text-lg font-bold text-slate-900">
              {service.branchesCount}
            </p>
          </div>
        </div>

        {!hasFeedback && (
          <p className="mt-4 rounded-lg border border-dashed border-slate-200 bg-slate-50/60 px-3 py-2 text-xs text-slate-500">
            No patient feedback recorded yet for this service.
          </p>
        )}
      </div>

      {/* Footer summary / management actions */}
      <div className="mt-auto flex items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-3">
        <span className="text-xs text-slate-500">
          {service.totalFeedback.toLocaleString()}{" "}
          {service.totalFeedback === 1 ? "submission" : "submissions"}
        </span>
        {actions ?? (
          <span className={cn("text-xs font-semibold", tone.text)}>
            {tone.label}
          </span>
        )}
      </div>
    </article>
  );
}
