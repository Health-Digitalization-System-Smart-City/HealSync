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
  high: {
    badge:
      "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300",
    label: "High",
  },
  medium: {
    badge:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
    label: "Medium",
  },
  low: {
    badge: "border-border bg-muted text-muted-foreground",
    label: "Low",
  },
};

const FINDING_STYLES: Record<
  KeyFinding["type"],
  { icon: typeof CheckCircle2; tone: string }
> = {
  positive: {
    icon: CheckCircle2,
    tone: "text-emerald-600 dark:text-emerald-400",
  },
  negative: {
    icon: AlertTriangle,
    tone: "text-amber-600 dark:text-amber-400",
  },
  neutral: { icon: Info, tone: "text-slate-500 dark:text-slate-400" },
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
      className="bg-card relative flex flex-col overflow-hidden rounded-2xl border border-violet-200/60 shadow-sm dark:border-violet-500/20"
    >
      {/* Gradient hairline accent */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-violet-500"
        aria-hidden
      />

      {/* Header */}
      <div className="bg-muted/40 flex flex-wrap items-center justify-between gap-3 border-b border-violet-200/40 px-5 py-4 dark:border-violet-500/15">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-sm">
            <Sparkles className="size-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-foreground text-sm font-bold">AI Summary</h3>
              <span className="rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-[10px] font-bold tracking-wider text-violet-700 uppercase dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300">
                {periodLabel}
              </span>
            </div>
            <p className="text-muted-foreground text-[11px]">
              A quick read on this period&apos;s patient feedback
            </p>
          </div>
        </div>

        {result?.status === "ok" ? (
          <div className="flex items-center gap-2">
            {result.cached && !isPending ? (
              <span className="text-muted-foreground/70 flex items-center gap-1 text-[11px] font-medium">
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
      <div className="space-y-6 p-5">
        {error ? (
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
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
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-sm">
              <Sparkles className="size-5" aria-hidden />
            </div>
            <div>
              <h3 className="text-foreground text-sm font-bold">
                No feedback in this period
              </h3>
              <p className="text-muted-foreground mt-1 max-w-xl text-sm leading-relaxed">
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
      <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-sm">
        <Sparkles className="size-5" aria-hidden />
      </div>
      <div>
        <h3 className="text-foreground text-sm font-bold">No AI summary yet</h3>
        <p className="text-muted-foreground mt-1 max-w-xl text-sm leading-relaxed">
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
    <div className="space-y-6">
      {analyzing ? (
        <p className="text-xs font-medium text-violet-600 dark:text-violet-400">
          Refreshing the analysis…
        </p>
      ) : null}

      {/* Hero summary */}
      <div className="rounded-xl border border-violet-200/70 bg-gradient-to-br from-violet-50/90 via-fuchsia-50/50 to-violet-50/30 p-4 dark:border-violet-500/25 dark:from-violet-500/15 dark:via-fuchsia-500/5 dark:to-violet-500/5">
        <div className="flex items-center gap-1.5">
          <Sparkles
            className="size-3.5 text-violet-600 dark:text-violet-400"
            aria-hidden
          />
          <SectionLabel className="mb-0">At a glance</SectionLabel>
        </div>
        <p className="text-foreground mt-2 text-sm leading-relaxed">
          {insight.summary}
        </p>
      </div>

      {/* Highlights + Suggested actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {insight.keyFindings.length > 0 ? (
          <div>
            <SectionLabel>Highlights</SectionLabel>
            <ul className="space-y-2.5">
              {insight.keyFindings.map((finding, index) => {
                const style = FINDING_STYLES[finding.type];
                const Icon = style.icon;
                return (
                  <li
                    key={`${finding.title}-${index}`}
                    className="border-border/70 bg-muted/40 rounded-lg border px-3 py-2.5"
                  >
                    <div className="flex items-start gap-2.5">
                      <Icon
                        className={cn("mt-0.5 size-4 shrink-0", style.tone)}
                        aria-hidden
                      />
                      <div className="min-w-0">
                        <p className="text-foreground text-[13px] font-semibold">
                          {finding.title}
                        </p>
                        <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
                          {finding.explanation}
                        </p>
                        {typeof finding.evidenceCount === "number" ? (
                          <p className="text-muted-foreground/70 mt-1 text-[11px] font-medium">
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

        {insight.recommendations.length > 0 ? (
          <div>
            <SectionLabel>Suggested actions</SectionLabel>
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
      </div>

      {/* Themes */}
      {insight.themes.length > 0 ? (
        <div>
          <SectionLabel>What patients mention</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {insight.themes.map((theme, index) => (
              <ThemeChip key={`${theme.name}-${index}`} theme={theme} />
            ))}
          </div>
        </div>
      ) : null}

      {/* Footer metadata */}
      <footer className="border-border/70 text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 border-t pt-3 text-[11px]">
        <span>
          Based on {insight.metadata.feedbackCount.toLocaleString()} feedback
          submission{insight.metadata.feedbackCount === 1 ? "" : "s"}
        </span>
        <span className="text-muted-foreground/40 hidden sm:inline">·</span>
        <span>
          {periodLabel} · generated{" "}
          {formatGeneratedAt(insight.metadata.generatedAt)}
        </span>
      </footer>
    </div>
  );
}

function SectionLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-muted-foreground mb-2 text-[11px] font-semibold tracking-wider uppercase",
        className,
      )}
    >
      {children}
    </p>
  );
}

function ThemeChip({ theme }: { theme: Theme }) {
  const tone =
    theme.sentiment === "positive"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
      : theme.sentiment === "negative"
        ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
        : "border-border bg-muted text-muted-foreground";
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
    <li className="border-border/70 bg-muted/40 flex items-start gap-3 rounded-lg border px-3 py-2.5">
      <span className="border-border/70 bg-card text-muted-foreground flex size-5 shrink-0 items-center justify-center rounded-md border text-[11px] font-bold shadow-xs">
        {index + 1}
      </span>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-foreground text-[13px] font-semibold">
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
        <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
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
      className="bg-card relative flex flex-col overflow-hidden rounded-2xl border border-violet-200/60 shadow-sm dark:border-violet-500/20"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-violet-500"
        aria-hidden
      />
      <div className="bg-muted/40 flex items-center justify-between border-b border-violet-200/40 px-5 py-4 dark:border-violet-500/15">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-sm">
            <Sparkles className="size-4" aria-hidden />
          </span>
          <div>
            <h3 className="text-foreground text-sm font-bold">AI Summary</h3>
            <p className="text-[11px] font-medium text-violet-600 dark:text-violet-400">
              Loading…
            </p>
          </div>
        </div>
      </div>
      <div className="space-y-5 p-5">
        <Skeleton className="h-20 w-full rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-36" />
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
