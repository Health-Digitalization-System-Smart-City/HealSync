"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import {
  AlertTriangle,
  Lightbulb,
  Loader2,
  MessageCircle,
  Search,
  Sparkles,
  TrendingUp,
  BarChart3,
} from "lucide-react";

import { askAiInsights } from "@/features/ai-insights/actions";
import { Button } from "@/components/ui/button";
import type { AiAssistantResult } from "@/lib/ai/schema";
import type { InsightPeriod } from "@/lib/analytics/periods";
import type { AiInsightsPageData } from "@/lib/ai-insights/page-data";
import { cn } from "@/lib/utils";
import { AiChatMessage } from "./ai-chat-message";
import { AiChatInput } from "./ai-chat-input";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  question?: string;
  result?: AiAssistantResult;
  error?: string;
  timestamp: number;
};

const SUGGESTION_GROUPS = [
  {
    label: "Understand",
    icon: Search,
    color: "text-blue-500",
    items: [
      "Summarize this period for management.",
      "Which branch performed best this period?",
    ],
  },
  {
    label: "Find problems",
    icon: AlertTriangle,
    color: "text-rose-500",
    items: [
      "Which branch needs the most attention?",
      "What services are performing poorly?",
      "What are patients complaining about?",
    ],
  },
  {
    label: "Act",
    icon: Lightbulb,
    color: "text-amber-500",
    items: [
      "Why did satisfaction change vs the previous period?",
      "What should management focus on next?",
    ],
  },
];

export type AskAiPrefill = { question: string; nonce: number };

/**
 * Premium AI chat panel — the hero of the AI Insights page.
 * Shows a welcome screen when empty, conversation thread with rich responses,
 * and a polished input area.
 */
export function AiChatPanel({
  data,
  period,
  periodLabel,
  prefill,
}: {
  data: AiInsightsPageData | undefined;
  period: { value: InsightPeriod; startDate?: string; endDate?: string };
  periodLabel: string;
  prefill: AskAiPrefill | null;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [isPending, startTransition] = useTransition();
  const scrollRef = useRef<HTMLDivElement>(null);
  const handledPrefill = useRef<number | null>(null);

  const ready = Boolean(period.startDate && period.endDate);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    const el = scrollRef.current;
    if (el && typeof el.scrollTo === "function") {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isPending]);

  // Auto-focus on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      document
        .querySelector<HTMLTextAreaElement>("[aria-label='Ask AI a question']")
        ?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const submitQuestion = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isPending || !ready) return;

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        question: trimmed,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setQuestion("");

      startTransition(async () => {
        const actionResult = await askAiInsights({
          question: trimmed,
          periodLabel,
          startDate: period.startDate ?? "",
          endDate: period.endDate ?? "",
        });

        const aiMessage: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: "assistant",
          timestamp: Date.now(),
          ...(actionResult.success
            ? { result: actionResult.data }
            : { error: actionResult.error.message }),
        };

        setMessages((prev) => [...prev, aiMessage]);
      });
    },
    [isPending, period.endDate, period.startDate, periodLabel, ready],
  );

  // Use a ref to hold the latest submitQuestion so the prefill effect
  // always calls the current version without needing it as a dependency.
  const submitRef = useRef<(text: string) => void>(() => {});
  useEffect(() => {
    submitRef.current = submitQuestion;
  });

  // Handle prefilled questions from spotlight/external
  useEffect(() => {
    if (!prefill || prefill.nonce === handledPrefill.current) return;
    handledPrefill.current = prefill.nonce;
    submitRef.current(prefill.question);
  }, [prefill]);

  const ask = (text: string) => submitQuestion(text);
  const canSubmit = question.trim().length > 0 && !isPending && ready;
  const hasMessages = messages.length > 0;

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-700/50 dark:bg-slate-900">
      {/* Chat header */}
      <div className="flex items-center gap-3 border-b border-slate-100 bg-gradient-to-r from-indigo-50/80 via-violet-50/50 to-indigo-50/80 px-5 py-4 dark:border-slate-700/50 dark:from-indigo-500/10 dark:via-violet-500/5 dark:to-indigo-500/10">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25">
          <Sparkles className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            AI Assistant
          </h2>
          <p className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
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
        {hasMessages && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setMessages([])}
            className="h-8 gap-1.5 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            New chat
          </Button>
        )}
      </div>

      {/* Messages area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto"
        style={{ maxHeight: "calc(100dvh - 20rem)" }}
      >
        {!hasMessages ? (
          <AiWelcomeScreen
            onAsk={ask}
            isPending={isPending}
            ready={ready}
            data={data}
          />
        ) : (
          <div className="space-y-4 p-5">
            {messages.map((msg) =>
              msg.role === "user" ? (
                <UserBubble key={msg.id} question={msg.question ?? ""} />
              ) : msg.error ? (
                <ErrorBubble key={msg.id} error={msg.error} />
              ) : msg.result ? (
                <AiBubble key={msg.id} result={msg.result} />
              ) : null,
            )}
            {isPending && (
              <div className="flex items-start gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm">
                  <Sparkles className="size-4" aria-hidden />
                </span>
                <div className="rounded-2xl rounded-tl-md border border-slate-100 bg-white px-4 py-3 shadow-sm dark:border-slate-700/50 dark:bg-slate-800">
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <Loader2
                      className="size-3.5 animate-spin text-indigo-500"
                      aria-hidden
                    />
                    <span>Analyzing your clinic&apos;s data…</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input */}
      <AiChatInput
        question={question}
        onQuestionChange={setQuestion}
        onSubmit={() => ask(question)}
        isPending={isPending}
        canSubmit={canSubmit}
        ready={ready}
      />
    </div>
  );
}

/** Welcome screen when no messages exist yet. */
function AiWelcomeScreen({
  onAsk,
  isPending,
  ready,
  data,
}: {
  onAsk: (q: string) => void;
  isPending: boolean;
  ready: boolean;
  data: AiInsightsPageData | undefined;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-10 text-center">
      {/* Hero icon */}
      <div className="relative mb-5">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 shadow-xl shadow-indigo-500/20">
          <Sparkles className="size-8 text-white" aria-hidden />
        </div>
        <div className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-emerald-400 shadow-sm">
          <span className="size-2 rounded-full bg-white" />
        </div>
      </div>

      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
        Ask me about your clinic
      </h3>
      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        I analyze real patient feedback to answer your questions about
        performance, satisfaction, and areas for improvement.
      </p>

      {/* Quick stats preview */}
      {data && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <QuickStatPill
            icon={MessageCircle}
            value={data.analytics.summary.feedbackCount.toLocaleString()}
            label="feedback"
          />
          <QuickStatPill
            icon={TrendingUp}
            value={`${data.analytics.summary.satisfactionRate}%`}
            label="satisfaction"
          />
          <QuickStatPill
            icon={BarChart3}
            value={data.analytics.summary.averageRating.toFixed(1)}
            label="avg rating"
          />
        </div>
      )}

      {/* Suggestion groups */}
      <div className="mt-8 w-full max-w-lg space-y-4">
        {SUGGESTION_GROUPS.map((group) => {
          const Icon = group.icon;
          return (
            <div key={group.label}>
              <p className="mb-2 flex items-center justify-center gap-1.5 text-[11px] font-semibold tracking-wider text-slate-400 uppercase dark:text-slate-500">
                <Icon className={cn("size-3.5", group.color)} aria-hidden />
                {group.label}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {group.items.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    disabled={isPending || !ready}
                    onClick={() => onAsk(suggestion)}
                    className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 shadow-sm transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-indigo-500/30 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-300"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function QuickStatPill({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm dark:border-slate-600 dark:bg-slate-800">
      <Icon className="size-3.5 text-indigo-500" aria-hidden />
      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
        {value}
      </span>
      <span className="text-[10px] text-slate-400 dark:text-slate-500">
        {label}
      </span>
    </div>
  );
}

/** User message bubble (right-aligned). */
function UserBubble({ question }: { question: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[80%] rounded-2xl rounded-tr-md bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-3 text-sm text-white shadow-lg shadow-indigo-500/15">
        {question}
      </div>
    </div>
  );
}

/** AI response bubble (left-aligned). */
function AiBubble({ result }: { result: AiAssistantResult }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm">
        <Sparkles className="size-4" aria-hidden />
      </span>
      <div className="min-w-0 flex-1 rounded-2xl rounded-tl-md border border-slate-100 bg-white px-4 py-3.5 shadow-sm dark:border-slate-700/50 dark:bg-slate-800">
        <AiChatMessage result={result} />
      </div>
    </div>
  );
}

/** Error message bubble. */
function ErrorBubble({ error }: { error: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm">
        <Sparkles className="size-4" aria-hidden />
      </span>
      <div className="rounded-2xl rounded-tl-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 shadow-sm dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
        <div className="flex items-start gap-2">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>{error}</span>
        </div>
      </div>
    </div>
  );
}
