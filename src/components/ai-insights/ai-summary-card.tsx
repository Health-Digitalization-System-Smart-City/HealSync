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

import { generateAiInsight } from "@/features/ai-insights/actions";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  KeyFinding,
  PeriodAIInsightResult,
  Priority,
  Recommendation,
  Theme,
} from "@/lib/ai/schema";
import type { PeriodInsightsResult } from "@/lib/ai-insights/period-service";
import type { InsightPeriod } from "@/lib/analytics/periods";
import { cn } from "@/lib/utils";

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

export type AiSummaryCardProps = {
  /** Period currently selected by the user (drives generation). */
  period: { value: InsightPeriod; startDate?: string; endDate?: string };
  /** Initially cached insight (null when none exists yet). */
  initial: PeriodInsightsResult | null;
  /** True when the page is still loading its first data. */
  loading: boolean;
  /** Human label of the period, e.g. "Today". */
  periodLabel: string;
};

/**
 * The AI-generated summary for the selected period. Renders the cached
 * analysis immediately; when none exists (and there is feedback), the user can
 * generate one. Refreshes are cooldown-protected server-side.
 */
export function AiSummaryCard({
  period,
  initial,
  loading,
  periodLabel,
}: AiSummaryCardProps) {
  const [result, setResult] = useState<PeriodInsightsResult | null>(initial);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function run(refresh: boolean) {
    setError(null);
    startTransition(async () => {
      const actionResult = await generateAiInsight({
        period: period.value,
        startDate: period.startDate,
        endDate: period.endDate,
        refresh,
      });
      if (actionResult.success) {
        setResult(actionResult.data);
      } else {
        setError(actionResult.error.message);
      }
    });
  }

  if (loading) {
    return <SummarySkeleton />;
  }

  return (
    <section
      aria-label="AI Summary"
      className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/50 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-violet-600 text-white shadow-xs">
            <Sparkles className="size-4" aria-hidden />
          </span>
          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
              Overall AI Summary
              <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold tracking-wider text-violet-700 uppercase">
                {periodLabel}
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">
              AI-generated from analyzed feedback · review before acting
            </p>
          </div>
        </div>

        {result?.status === "ok" ? (
          <div className="flex items-center gap-2">
            {result.cached && !isPending ? (
              <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
                <Clock className="size-3.5" aria-hidden /> cached
              </span>
            ) : null}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => run(true)}
              disabled={isPending}
              className="h-8 gap-1.5 text-xs"
            >
              <RefreshCw
                className={cn("size-3.5", isPending && "animate-spin")}
                aria-hidden
              />
              {isPending ? "Analyzing…" : "Refresh Analysis"}
            </Button>
          </div>
        ) : null}
      </div>

      {/* Body */}
      <div className="space-y-5 p-5">
        {error ? (
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            <div className="flex flex-col gap-2">
              <span>{error}</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => run(false)}
                disabled={isPending}
                className="h-7 w-fit gap-1.5 text-xs"
              >
                <RefreshCw
                  className={cn("size-3", isPending && "animate-spin")}
                  aria-hidden
                />
                Try again
              </Button>
            </div>
          </div>
        ) : null}

        {result?.status === "ok" ? (
          <SummaryBody
            insight={result.insight}
            analyzing={isPending}
            periodLabel={periodLabel}
          />
        ) : result?.status === "no-feedback" ? (
          <div className="flex flex-col items-start gap-3 py-1">
            <div className="flex size-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <Sparkles className="size-5" aria-hidden />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                No feedback in this period
              </h3>
              <p className="mt-1 max-w-xl text-sm leading-relaxed text-slate-600">
                No patient feedback was submitted during this period, so there
                is nothing for the AI to analyze yet.
              </p>
            </div>
          </div>
        ) : (
          // No result yet — offer to generate (only when there is feedback).
          <EmptyOrGenerate
            isPending={isPending}
            onGenerate={() => run(false)}
          />
        )}
      </div>
    </section>
  );
}

function EmptyOrGenerate({
  isPending,
  onGenerate,
}: {
  isPending: boolean;
  onGenerate: () => void;
}) {
  return (
    <div className="flex flex-col items-start gap-3 py-1">
      <div className="flex size-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
        <Sparkles className="size-5" aria-hidden />
      </div>
      <div>
        <h3 className="text-sm font-bold text-slate-900">
          No AI summary yet
        </h3>
        <p className="mt-1 max-w-xl text-sm leading-relaxed text-slate-600">
          Generate an AI analysis of the feedback in this period — a summary,
          key findings, themes, and recommendations.
        </p>
      </div>
      <Button
        type="button"
        variant="default"
        size="sm"
        onClick={onGenerate}
        disabled={isPending}
        className="h-8 gap-1.5 text-xs"
      >
        <Sparkles
          className={cn("size-3.5", isPending && "animate-pulse")}
          aria-hidden
        />
        {isPending ? "Analyzing clinic feedback…" : "Generate AI Summary"}
      </Button>
    </div>
  );
}

function SummaryBody({
  insight,
  analyzing,
  periodLabel,
}: {
  insight: PeriodAIInsightResult;
  analyzing: boolean;
  periodLabel: string;
}) {
  return (
    <div className="space-y-5">
      {analyzing ? (
        <p className="text-xs font-medium text-violet-600">
          Refreshing the analysis…
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
      {insight.keyFindings.length > 0 ? (
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
      ) : null}

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
      {insight.recommendations.length > 0 ? (
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
      ) : null}

      {/* Footer metadata */}
      <footer className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-slate-100 pt-3 text-[11px] text-slate-400">
        <span>
          Based on {insight.metadata.feedbackCount.toLocaleString()} feedback
          submission{insight.metadata.feedbackCount === 1 ? "" : "s"}
        </span>
        <span className="hidden text-slate-200 sm:inline">·</span>
        <span>
          {periodLabel} · generated{" "}
          {formatGeneratedAt(insight.metadata.generatedAt)}
        </span>
      </footer>
    </div>
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

function SummarySkeleton() {
  return (
    <section
      aria-label="AI Summary"
      aria-busy="true"
      className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-violet-600 text-white shadow-xs">
            <Sparkles className="size-4" aria-hidden />
          </span>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Overall AI Summary
            </h3>
            <p className="text-[11px] font-medium text-violet-600">
              Loading…
            </p>
          </div>
        </div>
      </div>
      <div className="space-y-5 p-5">
        <div className="space-y-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-5/6" />
        </div>
        <div className="space-y-2.5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-32" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-7 w-28 rounded-full" />
            <Skeleton className="h-7 w-36 rounded-full" />
          </div>
        </div>
      </div>
    </section>
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
