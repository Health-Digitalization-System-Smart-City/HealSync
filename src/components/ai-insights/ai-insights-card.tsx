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
        <div className="flex flex-col items-start gap-4 p-6">
          <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-sm">
            <Sparkles className="size-5" aria-hidden />
          </div>
          <div>
            <h3 className="text-foreground text-base font-bold">AI Insights</h3>
            <p className="text-muted-foreground mt-1 max-w-xl text-sm leading-relaxed">
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
      className="bg-card relative flex flex-col overflow-hidden rounded-2xl border border-violet-200/60 shadow-sm dark:border-violet-500/20"
    >
      {/* Gradient hairline accent */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-violet-500"
        aria-hidden
      />
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
      <div className="bg-muted/40 flex flex-wrap items-center justify-between gap-3 border-b border-violet-200/40 px-5 py-4 dark:border-violet-500/15">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-sm">
            <Sparkles className="size-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-foreground text-sm font-bold">AI Insights</h3>
              <span className="rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-[10px] font-bold tracking-wider text-violet-700 uppercase dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300">
                Today
              </span>
            </div>
            <p className="text-muted-foreground text-[11px]">
              A quick read on today&apos;s patient feedback
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {data.cached && !refreshing ? (
            <span className="text-muted-foreground/70 flex items-center gap-1 text-[11px] font-medium">
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
      <div className="space-y-6 p-5">
        {refreshError ? (
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            <span>
              The refresh failed. Showing the last successful analysis — please
              try again in a moment.
            </span>
          </div>
        ) : null}

        {refreshing ? (
          <p className="text-xs font-medium text-violet-600 dark:text-violet-400">
            Analyzing today&apos;s feedback…
          </p>
        ) : null}

        {/* Hero summary — the headline takeaway */}
        <div className="relative overflow-hidden rounded-xl border border-violet-200/70 bg-gradient-to-br from-violet-50/90 via-fuchsia-50/50 to-violet-50/30 p-4 dark:border-violet-500/25 dark:from-violet-500/15 dark:via-fuchsia-500/5 dark:to-violet-500/5">
          <div className="flex items-center gap-1.5">
            <Sparkles
              className="size-3.5 text-violet-600 dark:text-violet-400"
              aria-hidden
            />
            <SectionLabel className="mb-0">Today at a glance</SectionLabel>
          </div>
          <p className="text-foreground mt-2 text-sm leading-relaxed">
            {insight.summary}
          </p>
        </div>

        {/* Highlights + Suggested actions, side by side on wide screens */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
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
            submission{insight.metadata.feedbackCount === 1 ? "" : "s"} today
          </span>
          <span className="text-muted-foreground/40 hidden sm:inline">·</span>
          <span>
            Generated {formatGeneratedAt(insight.metadata.generatedAt)}
          </span>
        </footer>
      </div>
    </CardShell>
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

function ErrorState({
  onRetry,
  retrying,
}: {
  onRetry: () => void;
  retrying: boolean;
}) {
  return (
    <div className="flex flex-col items-start gap-4 p-6">
      <div className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-sm">
          <Sparkles className="size-4" aria-hidden />
        </span>
        <h3 className="text-foreground text-base font-bold">AI Insights</h3>
      </div>
      <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
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
