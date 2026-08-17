import { AlertTriangle, ArrowRight, CheckCircle2, Info, Sparkles } from "lucide-react";

import type { AiInsightsPageData } from "@/lib/ai-insights/page-data";
import { cn } from "@/lib/utils";

export type SpotlightItem = {
  tone: "positive" | "negative" | "neutral";
  text: string;
  question: string;
  action: string;
};

const TONE_STYLES = {
  positive: {
    icon: CheckCircle2,
    chip: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  negative: { icon: AlertTriangle, chip: "text-amber-600", bg: "bg-amber-50" },
  neutral: { icon: Info, chip: "text-slate-500", bg: "bg-slate-100" },
} as const;

/**
 * Derives the "guided insights" shown at the top of the page purely from the
 * deterministic analytics (PostgreSQL facts + the period comparison) — no AI
 * call needed. Each insight carries a ready-made question the user can fire
 * into the assistant with one click, so the page guides instead of waiting.
 */
export function buildSpotlightItems(data: AiInsightsPageData): SpotlightItem[] {
  const { summary, branches, services, comparison } = data.analytics;
  const items: SpotlightItem[] = [];

  const satDelta = comparison?.changes.satisfactionRate;
  if (typeof satDelta === "number" && satDelta !== 0) {
    const previous = data.period.previousLabel ?? "the previous period";
    items.push({
      tone: satDelta < 0 ? "negative" : "positive",
      text:
        satDelta < 0
          ? `Satisfaction fell ${Math.abs(satDelta)} pts vs ${previous}.`
          : `Satisfaction rose ${satDelta} pts vs ${previous}.`,
      question:
        satDelta < 0
          ? "Why did satisfaction decrease compared with the previous period?"
          : "What improved compared with the previous period?",
      action: satDelta < 0 ? "Ask why" : "Ask what improved",
    });
  }

  const ranked = [...branches]
    .filter((branch) => branch.feedbackCount > 0)
    .sort((a, b) => a.satisfactionRate - b.satisfactionRate);
  const worst = ranked[0];
  const best = ranked[ranked.length - 1];

  // Branch insights only make sense when there is more than one branch.
  if (worst && best && worst.branchId !== best.branchId) {
    items.push({
      tone: "negative",
      text: `${worst.branchName} needs the most attention at ${worst.satisfactionRate}% satisfaction.`,
      question: `Why is ${worst.branchName} underperforming?`,
      action: "Investigate",
    });
    if (best.satisfactionRate > worst.satisfactionRate) {
      items.push({
        tone: "positive",
        text: `${best.branchName} is this period's top performer at ${best.satisfactionRate}% satisfaction.`,
        question: "Which branch performed best this period?",
        action: "Ask why",
      });
    }
  }

  const worstService =
    services.length > 0
      ? [...services].sort(
          (a, b) => a.satisfactionRate - b.satisfactionRate,
        )[0]
      : undefined;
  if (worstService && worstService.satisfactionRate < 60) {
    items.push({
      tone: "negative",
      text: `${worstService.serviceName} service has the lowest satisfaction at ${worstService.satisfactionRate}%.`,
      question: "What services are performing poorly?",
      action: "Explore services",
    });
  }

  if (items.length === 0 && summary.feedbackCount > 0) {
    items.push({
      tone: "neutral",
      text: `${summary.feedbackCount.toLocaleString()} feedback submissions with a ${summary.satisfactionRate}% satisfaction rate this period.`,
      question: "Summarize this period for management.",
      action: "Ask for a summary",
    });
  }

  return items.slice(0, 3);
}

/** Guided insights strip: what stands out, with one-click questions. */
export function AiSpotlight({
  data,
  onAsk,
}: {
  data: AiInsightsPageData;
  onAsk: (question: string) => void;
}) {
  const items = buildSpotlightItems(data);
  if (items.length === 0) return null;

  return (
    <section
      aria-label="Guided insights for this period"
      className="overflow-hidden rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50/70 via-white to-fuchsia-50/60 p-4 shadow-sm sm:p-5"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white shadow-xs">
          <Sparkles className="size-3.5" aria-hidden />
        </span>
        <h2 className="text-sm font-bold text-slate-900">
          What stands out this period?
        </h2>
        <span className="rounded-full border border-violet-100 bg-white px-2 py-0.5 text-[10px] font-bold tracking-wider text-violet-600 uppercase">
          {data.period.label}
        </span>
      </div>

      <ul className="mt-3 space-y-2">
        {items.map((item, index) => {
          const style = TONE_STYLES[item.tone];
          const Icon = style.icon;
          return (
            <li
              key={index}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-white/90 px-3.5 py-2.5 shadow-xs"
            >
              <div className="flex min-w-0 items-start gap-2.5">
                <span
                  className={cn(
                    "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md",
                    style.bg,
                  )}
                >
                  <Icon className={cn("size-3.5", style.chip)} aria-hidden />
                </span>
                <p className="text-[13px] leading-relaxed text-slate-700">
                  {item.text}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onAsk(item.question)}
                className="flex shrink-0 items-center gap-1 rounded-lg border border-violet-200 bg-violet-50 px-2.5 py-1.5 text-[11px] font-semibold text-violet-700 transition hover:bg-violet-100"
              >
                {item.action}
                <ArrowRight className="size-3" aria-hidden />
              </button>
            </li>
          );
        })}
      </ul>

      <p className="mt-2.5 text-[11px] text-slate-400">
        Guided insights are computed from real analytics — tap an action to ask
        the AI for details.
      </p>
    </section>
  );
}
