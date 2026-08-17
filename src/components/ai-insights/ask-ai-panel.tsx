"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Info,
  Loader2,
  Send,
  Sparkles,
} from "lucide-react";

import { askAiInsights } from "@/features/ai-insights/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { AiAssistantResult, Priority } from "@/lib/ai/schema";
import type { InsightPeriod } from "@/lib/analytics/periods";
import { cn } from "@/lib/utils";

const SUGGESTED_QUESTIONS = [
  {
    label: "Understand",
    items: [
      "Summarize this period for management.",
      "Which branch performed best this period?",
    ],
  },
  {
    label: "Find problems",
    items: [
      "Which branch needs the most attention?",
      "What services are performing poorly?",
      "What are patients complaining about?",
    ],
  },
  {
    label: "Act",
    items: [
      "Why did satisfaction change compared with the previous period?",
      "What should management focus on?",
    ],
  },
];

const PRIORITY_BADGES: Record<Priority, string> = {
  high: "bg-rose-50 text-rose-700 border-rose-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  low: "bg-slate-100 text-slate-600 border-slate-200",
};

const POINT_TONES: Record<
  AiAssistantResult["keyPoints"][number]["type"],
  string
> = {
  positive: "text-emerald-600",
  negative: "text-amber-600",
  neutral: "text-slate-500",
};

export type AskAiPrefill = { question: string; nonce: number };

/**
 * The Ask AI assistant. Lives in a right-hand sidebar on large screens (where
 * it is sticky and collapsible to a slim rail) and sits at the top of the page
 * on smaller screens. It is the always-visible entry point for the guided,
 * tool-based assistant.
 */
export function AskAiPanel({
  period,
  periodLabel,
  open = true,
  onToggle,
  prefill = null,
  ready = true,
  initialQuestion = "",
}: {
  period: { value: InsightPeriod; startDate?: string; endDate?: string };
  periodLabel: string;
  /** Expanded (panel) vs collapsed (compact rail). */
  open?: boolean;
  /** Called when the user collapses/expands the panel. */
  onToggle?: () => void;
  /** A guided question (e.g. from the spotlight) to ask automatically. */
  prefill?: AskAiPrefill | null;
  /** False until the period's date range is resolved (no questions yet). */
  ready?: boolean;
  /** Question shown in the input on mount (used with a keyed remount). */
  initialQuestion?: string;
}) {
  const [question, setQuestion] = useState(initialQuestion);
  const [result, setResult] = useState<AiAssistantResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const submitQuestion = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isPending || !ready) return;
      setError(null);
      startTransition(async () => {
        const actionResult = await askAiInsights({
          question: trimmed,
          periodLabel,
          startDate: period.startDate ?? "",
          endDate: period.endDate ?? "",
        });
        if (actionResult.success) {
          setResult(actionResult.data);
          setQuestion("");
        } else {
          setError(actionResult.error.message);
          setResult(null);
        }
      });
    },
    [isPending, period.endDate, period.startDate, periodLabel, ready],
  );

  // Auto-submit a guided question supplied by the parent (spotlight actions).
  // The `nonce` guard prevents double-submits when the panel re-renders.
  const handledPrefill = useRef<number | null>(null);
  useEffect(() => {
    if (!prefill || prefill.nonce === handledPrefill.current) return;
    handledPrefill.current = prefill.nonce;
    if (!open) onToggle?.();
    void submitQuestion(prefill.question);
  }, [prefill, open, onToggle, submitQuestion]);

  const ask = (text: string) => submitQuestion(text);
  const canSubmit = question.trim().length > 0 && !isPending && ready;

  // Collapsed: a compact, always-visible rail inviting the user to expand.
  if (!open) {
    return (
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={false}
        aria-label="Open the Ask AI assistant"
        title="Ask AI about this period"
        className="group flex w-full flex-row items-center justify-between gap-2 rounded-2xl border border-violet-200/60 bg-gradient-to-br from-violet-600 via-violet-500 to-fuchsia-500 px-4 py-3 text-left text-white shadow-lg shadow-violet-600/15 transition hover:shadow-violet-600/25 xl:w-12 xl:flex-col xl:justify-center xl:gap-3 xl:px-0 xl:py-5"
      >
        <span className="flex items-center gap-2.5 xl:flex-col xl:gap-3">
          <span className="relative flex size-8 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25">
            <Sparkles className="size-4" aria-hidden />
            <span className="absolute -top-0.5 -right-0.5 flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
            </span>
          </span>
          <span className="text-xs font-bold tracking-widest uppercase xl:text-[11px] xl:tracking-[0.2em] xl:[writing-mode:vertical-rl]">
            Ask AI
          </span>
        </span>
        <span className="flex flex-col items-end gap-0.5 xl:items-center">
          <span className="hidden text-[10px] font-medium text-white/70 xl:block">
            tap to open
          </span>
          <ChevronDown
            className="size-4 opacity-80 transition group-hover:translate-y-0.5 xl:hidden"
            aria-hidden
          />
          <ChevronRight
            className="hidden size-4 opacity-80 transition group-hover:translate-x-0.5 xl:block"
            aria-hidden
          />
        </span>
      </button>
    );
  }

  return (
    <section
      aria-label="Ask AI about your clinic"
      className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-slate-100 bg-slate-50/50 px-4 py-3.5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white shadow-xs">
          <Bot className="size-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-slate-900">
            Ask AI about your clinic
          </h3>
          <p className="flex items-center gap-1.5 text-[11px] text-slate-500">
            {isPending ? (
              <>
                <Loader2 className="size-3 animate-spin" aria-hidden />
                Analyzing…
              </>
            ) : (
              <>
                <span
                  className="size-1.5 rounded-full bg-emerald-500"
                  aria-hidden
                />
                Real analytics · {periodLabel}
              </>
            )}
          </p>
        </div>
        {onToggle ? (
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={true}
            aria-label="Collapse the Ask AI panel"
            title="Collapse"
            className="flex size-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <ChevronDown className="size-4 xl:hidden" aria-hidden />
            <ChevronRight className="hidden size-4 xl:block" aria-hidden />
          </button>
        ) : null}
      </div>

      {/* Body */}
      <div className="space-y-4 p-4 xl:max-h-[calc(100dvh-8rem)] xl:overflow-y-auto">
        {!ready ? (
          <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 text-xs text-slate-500">
            <Loader2 className="size-3.5 animate-spin" aria-hidden />
            Loading period data…
          </div>
        ) : (
          <>
            {/* Guided suggested questions */}
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
                <Sparkles className="size-3 text-violet-500" aria-hidden />
                Not sure where to start?
              </p>
              <div className="space-y-2.5">
                {SUGGESTED_QUESTIONS.map((group) => (
                  <div key={group.label}>
                    <p className="mb-1 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                      {group.label}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {group.items.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          disabled={isPending}
                          onClick={() => ask(suggestion)}
                          className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Input */}
            <form
              className="flex flex-col gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                ask(question);
              }}
            >
              <Textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask a question about this period, e.g. 'Why did satisfaction decrease?'"
                aria-label="Ask AI a question"
                disabled={isPending}
                className="min-h-20 resize-none rounded-lg text-sm"
              />
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] text-slate-400">
                  {question.trim().length > 0 && !isPending
                    ? `${question.trim().length} characters`
                    : "Answers are generated from real feedback analytics"}
                </p>
                <Button
                  type="submit"
                  size="sm"
                  disabled={!canSubmit}
                  className="h-9 gap-1.5 text-xs"
                >
                  {isPending ? (
                    <>
                      <Sparkles
                        className="size-3.5 animate-pulse"
                        aria-hidden
                      />
                      Analyzing…
                    </>
                  ) : (
                    <>
                      <Send className="size-3.5" aria-hidden />
                      Ask
                    </>
                  )}
                </Button>
              </div>
            </form>

            {/* Error */}
            {error ? (
              <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
                <AlertTriangle
                  className="mt-0.5 size-3.5 shrink-0"
                  aria-hidden
                />
                <span>{error}</span>
              </div>
            ) : null}

            {/* Answer */}
            {result ? <AnswerView result={result} /> : null}
          </>
        )}
      </div>
    </section>
  );
}

function AnswerView({ result }: { result: AiAssistantResult }) {
  return (
    <div className="space-y-4 rounded-xl border border-violet-100 bg-violet-50/40 p-4">
      <p className="text-sm leading-relaxed text-slate-800">{result.answer}</p>

      {result.keyPoints.length > 0 ? (
        <ul className="space-y-2">
          {result.keyPoints.map((point, index) => (
            <li
              key={`${point.title}-${index}`}
              className="flex items-start gap-2 rounded-lg bg-white/70 px-3 py-2"
            >
              {point.type === "positive" ? (
                <CheckCircle2
                  className={cn(
                    "mt-0.5 size-3.5 shrink-0",
                    POINT_TONES.positive,
                  )}
                  aria-hidden
                />
              ) : point.type === "negative" ? (
                <AlertTriangle
                  className={cn(
                    "mt-0.5 size-3.5 shrink-0",
                    POINT_TONES.negative,
                  )}
                  aria-hidden
                />
              ) : (
                <Info
                  className={cn(
                    "mt-0.5 size-3.5 shrink-0",
                    POINT_TONES.neutral,
                  )}
                  aria-hidden
                />
              )}
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-slate-800">
                  {point.title}
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
                  {point.explanation}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {result.recommendations.length > 0 ? (
        <div>
          <p className="mb-2 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
            Recommendations
          </p>
          <ul className="space-y-2">
            {result.recommendations.map((recommendation, index) => (
              <li
                key={`${recommendation.title}-${index}`}
                className="flex items-start gap-2.5 rounded-lg bg-white/70 px-3 py-2"
              >
                <span
                  className={cn(
                    "mt-0.5 rounded-full border px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase",
                    PRIORITY_BADGES[recommendation.priority],
                  )}
                >
                  {recommendation.priority}
                </span>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-slate-800">
                    {recommendation.title}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
                    {recommendation.explanation}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {result.sources.length > 0 ? (
        <div className="border-t border-violet-100 pt-2.5">
          <p className="mb-1.5 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
            Based on
          </p>
          <div className="flex flex-wrap gap-1.5">
            {result.sources.map((source) => (
              <span
                key={source.tool}
                className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-medium text-slate-500"
              >
                {source.tool}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
