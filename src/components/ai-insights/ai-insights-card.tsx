"use client";

import { useState, useTransition } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Info,
  RefreshCw,
  Sparkles,
} from "lucide-react";

import { generateFeedbackInsights } from "@/features/analytics/actions";
import { Button } from "@/components/ui/button";
import type {
  DailyInsightsResult,
  DailyInsightsSuccess,
} from "@/lib/ai-insights/types";
import type {
  KeyFinding,
  Priority,
  Recommendation,
  Theme,
} from "@/lib/ai/schema";
import { cn } from "@/lib/utils";

export type AiInsightsCardProps = {
  /** Server-fetched initial result; null when the server-side fetch failed. */
  initial: DailyInsightsResult | null;
};

const PRIORITY_STYLES: Record<Priority, { badge: string; label: string }> = {
  high: { badge: "bg-rose-50 text-rose-700 border-rose-200", label: "High" },
  medium: {
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    label: "Medium",
  },
  low: { badge: "bg-slate-100 text-slate-600 border-slate-200", label: "Low" },
};

const FINDING_STYLES: Record<
  KeyFinding["type"],
  { icon: typeof CheckCircle2; tone: string }
> = {
  positive: { icon: CheckCircle2, tone: "text-emerald-600" },
  negative: { icon: AlertTriangle, tone: "text-amber-600" },
  neutral: { icon: Info, tone: "text-slate-500" },
};

export function AiInsightsCard({ initial }: AiInsightsCardProps) {
  const [data, setData] = useState<DailyInsightsResult | null>(initial);
  const [refreshError, setRefreshError] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleRefresh() {
    setRefreshError(false);
    startTransition(async () => {
      const result = await generateFeedbackInsights({ refresh: true });
      if (result.success) {
        setData(result.data);
      } else {
        setRefreshError(true);
      }
    });
  }

  function handleRetry() {
    setRefreshError(false);
    startTransition(async () => {
      const result = await generateFeedbackInsights();
      if (result.success) {
        setData(result.data);
      } else {
        setRefreshError(true);
      }
    });
  }

  // No initial data (server-side fetch failed) — offer a retry that triggers
  // a fresh analysis (the service caches the result server-side).
  if (!data) {
    return (
      <CardShell>
        <ErrorState onRetry={handleRetry} retrying={isPending} />
      </CardShell>
    );
  }

  if (data.status === "no-feedback") {
    return (
      <CardShell>
        <div className="flex flex-col items-start gap-3 py-1">
          <div className="flex size-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
            <Sparkles className="size-5" aria-hidden />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">AI Insights</h3>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-slate-600">
              No patient feedback has been submitted today yet. AI insights will
              become available once feedback is received.
            </p>
          </div>
        </div>
      </CardShell>
    );
  }

  return (
    <SuccessView
      data={data}
      refreshing={isPending}
      onRefresh={handleRefresh}
      refreshError={refreshError}
    />
  );
}

function CardShell({ children }: { children: React.ReactNode }) {
  return (
    <section
      aria-label="AI Insights"
      className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      {children}
    </section>
  );
}

function SuccessView({
  data,
  refreshing,
  onRefresh,
  refreshError,
}: {
  data: DailyInsightsSuccess;
  refreshing: boolean;
  onRefresh: () => void;
  refreshError: boolean;
}) {
  const { insight } = data;

  return (
    <CardShell>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/50 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-violet-600 text-white shadow-xs">
            <Sparkles className="size-4" aria-hidden />
          </span>
          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
              AI Insights
              <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold tracking-wider text-violet-700 uppercase">
                Today
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">
              AI-generated from today&apos;s patient feedback · review before
              acting
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {data.cached && !refreshing ? (
            <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
              <Clock className="size-3.5" aria-hidden /> cached
            </span>
          ) : null}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={refreshing}
            className="h-8 gap-1.5 text-xs"
          >
            <RefreshCw
              className={cn("size-3.5", refreshing && "animate-spin")}
              aria-hidden
            />
            {refreshing ? "Analyzing…" : "Refresh Analysis"}
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="space-y-5 p-5">
        {refreshError ? (
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            <span>
              The refresh failed. Showing the last successful analysis — please
              try again in a moment.
            </span>
          </div>
        ) : null}

        {refreshing ? (
          <p className="text-xs font-medium text-violet-600">
            Analyzing today&apos;s feedback…
          </p>
        ) : null}

        {/* Overall summary */}
        <div>
          <SectionLabel>Overall Insight</SectionLabel>
          <p className="text-sm leading-relaxed text-slate-700">
            {insight.summary}
          </p>
        </div>

        {/* Key findings */}
        <div>
          <SectionLabel>Key Findings</SectionLabel>
          <ul className="space-y-2.5">
            {insight.keyFindings.map((finding, index) => {
              const style = FINDING_STYLES[finding.type];
              const Icon = style.icon;
              return (
                <li
                  key={`${finding.title}-${index}`}
                  className="rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2.5"
                >
                  <div className="flex items-start gap-2.5">
                    <Icon
                      className={cn("mt-0.5 size-4 shrink-0", style.tone)}
                      aria-hidden
                    />
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-slate-800">
                        {finding.title}
                      </p>
                      <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
                        {finding.explanation}
                      </p>
                      {typeof finding.evidenceCount === "number" ? (
                        <p className="mt-1 text-[11px] font-medium text-slate-400">
                          Mentioned in {finding.evidenceCount} submission
                          {finding.evidenceCount === 1 ? "" : "s"}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Themes */}
        {insight.themes.length > 0 ? (
          <div>
            <SectionLabel>Main Themes</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {insight.themes.map((theme, index) => (
                <ThemeChip key={`${theme.name}-${index}`} theme={theme} />
              ))}
            </div>
          </div>
        ) : null}

        {/* Recommendations */}
        <div>
          <SectionLabel>Recommendations</SectionLabel>
          <ul className="space-y-2.5">
            {insight.recommendations.map((recommendation, index) => (
              <RecommendationItem
                key={`${recommendation.title}-${index}`}
                recommendation={recommendation}
                index={index}
              />
            ))}
          </ul>
        </div>

        {/* Footer metadata */}
        <footer className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-slate-100 pt-3 text-[11px] text-slate-400">
          <span>
            Based on {insight.metadata.feedbackCount.toLocaleString()} feedback
            submission{insight.metadata.feedbackCount === 1 ? "" : "s"} today
          </span>
          <span className="hidden text-slate-200 sm:inline">·</span>
          <span>
            Generated {formatGeneratedAt(insight.metadata.generatedAt)}
          </span>
        </footer>
      </div>
    </CardShell>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
      {children}
    </p>
  );
}

function ThemeChip({ theme }: { theme: Theme }) {
  const tone =
    theme.sentiment === "positive"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : theme.sentiment === "negative"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : "border-slate-200 bg-slate-50 text-slate-600";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        tone,
      )}
    >
      {theme.name}
      {theme.count > 0 ? (
        <span className="font-bold opacity-80">×{theme.count}</span>
      ) : null}
    </span>
  );
}

function RecommendationItem({
  recommendation,
  index,
}: {
  recommendation: Recommendation;
  index: number;
}) {
  const style = PRIORITY_STYLES[recommendation.priority];
  return (
    <li className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2.5">
      <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-white text-[11px] font-bold text-slate-500 shadow-xs">
        {index + 1}
      </span>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[13px] font-semibold text-slate-800">
            {recommendation.title}
          </p>
          <span
            className={cn(
              "rounded-full border px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase",
              style.badge,
            )}
          >
            {style.label}
          </span>
        </div>
        <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
          {recommendation.explanation}
        </p>
      </div>
    </li>
  );
}

function ErrorState({
  onRetry,
  retrying,
}: {
  onRetry: () => void;
  retrying: boolean;
}) {
  return (
    <div className="flex flex-col items-start gap-3 p-5">
      <div className="flex items-center gap-2.5">
        <span className="flex size-8 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
          <Sparkles className="size-4" aria-hidden />
        </span>
        <h3 className="text-sm font-bold text-slate-900">AI Insights</h3>
      </div>
      <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
        <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        <p>
          Today&apos;s AI analysis is temporarily unavailable. Your dashboard
          statistics are still available. Try again later.
        </p>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onRetry}
        disabled={retrying}
        className="h-8 gap-1.5 text-xs"
      >
        <RefreshCw
          className={cn("size-3.5", retrying && "animate-spin")}
          aria-hidden
        />
        {retrying ? "Retrying…" : "Try again"}
      </Button>
    </div>
  );
}

function formatGeneratedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "recently";
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
