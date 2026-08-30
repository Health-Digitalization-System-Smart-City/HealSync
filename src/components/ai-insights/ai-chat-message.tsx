"use client";

import { useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Info,
  Sparkles,
  Wrench,
} from "lucide-react";

import type { AiAssistantResult, Priority } from "@/lib/ai/schema";
import { cn } from "@/lib/utils";

const FINDING_ICONS = {
  positive: {
    icon: CheckCircle2,
    tone: "text-emerald-600 dark:text-emerald-400",
  },
  negative: { icon: AlertTriangle, tone: "text-rose-600 dark:text-rose-400" },
  neutral: { icon: Info, tone: "text-slate-500 dark:text-slate-400" },
} as const;

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

const TOOL_LABELS: Record<string, string> = {
  getClinicSummary: "Clinic Summary",
  getBranchPerformance: "Branch Data",
  getServicePerformance: "Service Data",
  getFeedbackTrends: "Feedback Trends",
  getFeedbackThemes: "Theme Analysis",
  getNegativeFeedback: "Negative Feedback",
  comparePeriods: "Period Comparison",
};

/** A single AI response bubble with rich content. */
export function AiChatMessage({ result }: { result: AiAssistantResult }) {
  return (
    <div className="space-y-4">
      {/* Answer */}
      <div className="text-sm leading-relaxed text-slate-800 dark:text-slate-200">
        {result.answer}
      </div>

      {/* Key Findings */}
      {result.keyPoints.length > 0 && (
        <KeyFindingsList findings={result.keyPoints} />
      )}

      {/* Recommendations */}
      {result.recommendations.length > 0 && (
        <RecommendationsList recommendations={result.recommendations} />
      )}

      {/* Sources */}
      {result.sources.length > 0 && <SourcesChips sources={result.sources} />}
    </div>
  );
}

function KeyFindingsList({
  findings,
}: {
  findings: AiAssistantResult["keyPoints"];
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="rounded-xl border border-slate-100 bg-white/60 dark:border-slate-700/50 dark:bg-slate-800/40">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center justify-between gap-2 px-3.5 py-2.5 text-left"
      >
        <span className="flex items-center gap-2 text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
          <BookOpen className="size-3.5 text-indigo-500" aria-hidden />
          Key Findings ({findings.length})
        </span>
        {expanded ? (
          <ChevronDown className="size-3.5 text-slate-400" aria-hidden />
        ) : (
          <ChevronRight className="size-3.5 text-slate-400" aria-hidden />
        )}
      </button>
      {expanded && (
        <ul className="space-y-1.5 px-3.5 pb-3">
          {findings.map((finding, index) => {
            const style = FINDING_ICONS[finding.type];
            const Icon = style.icon;
            return (
              <li
                key={`${finding.title}-${index}`}
                className="flex items-start gap-2.5 rounded-lg px-2.5 py-2"
              >
                <Icon
                  className={cn("mt-0.5 size-3.5 shrink-0", style.tone)}
                  aria-hidden
                />
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-200">
                    {finding.title}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                    {finding.explanation}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function RecommendationsList({
  recommendations,
}: {
  recommendations: AiAssistantResult["recommendations"];
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="rounded-xl border border-slate-100 bg-white/60 dark:border-slate-700/50 dark:bg-slate-800/40">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center justify-between gap-2 px-3.5 py-2.5 text-left"
      >
        <span className="flex items-center gap-2 text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
          <Sparkles className="size-3.5 text-violet-500" aria-hidden />
          Recommendations ({recommendations.length})
        </span>
        {expanded ? (
          <ChevronDown className="size-3.5 text-slate-400" aria-hidden />
        ) : (
          <ChevronRight className="size-3.5 text-slate-400" aria-hidden />
        )}
      </button>
      {expanded && (
        <ul className="space-y-1.5 px-3.5 pb-3">
          {recommendations.map((rec, index) => {
            const style = PRIORITY_STYLES[rec.priority];
            return (
              <li
                key={`${rec.title}-${index}`}
                className="flex items-start gap-2.5 rounded-lg px-2.5 py-2"
              >
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-[10px] font-bold text-slate-500 shadow-xs dark:border-slate-600 dark:bg-slate-700 dark:text-slate-400">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-200">
                      {rec.title}
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
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                    {rec.explanation}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function SourcesChips({ sources }: { sources: AiAssistantResult["sources"] }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-2.5 dark:border-slate-700/50">
      <span className="flex items-center gap-1 text-[10px] font-semibold tracking-wider text-slate-400 uppercase dark:text-slate-500">
        <Wrench className="size-3" aria-hidden />
        Sources
      </span>
      {sources.map((source) => (
        <span
          key={source.tool}
          className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-400"
          title={source.description}
        >
          {TOOL_LABELS[source.tool] ?? source.tool}
        </span>
      ))}
    </div>
  );
}
