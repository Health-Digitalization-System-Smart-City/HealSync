import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Info,
  MessageCircle,
  Sparkles,
  Star,
  ThumbsDown,
  ThumbsUp,
  TrendingUp,
} from "lucide-react";

import type { ClinicSummary } from "@/lib/analytics/insights-types";
import type { AiInsightsPageData } from "@/lib/ai-insights/page-data";
import { cn } from "@/lib/utils";

/** Right sidebar with quick metrics and guided action chips. */
export function QuickStatsSidebar({
  summary,
  data,
  onAsk,
}: {
  summary: ClinicSummary;
  data: AiInsightsPageData;
  onAsk: (question: string) => void;
}) {
  const items = buildQuickActions(data);

  return (
    <div className="space-y-4">
      {/* Metrics */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-700/50 dark:bg-slate-900">
        <h3 className="mb-3 flex items-center gap-2 text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
          <BarChart3 className="size-3.5 text-indigo-500" aria-hidden />
          Quick Stats
        </h3>
        <div className="space-y-3">
          <StatRow
            icon={MessageCircle}
            color="text-blue-500"
            label="Total Feedback"
            value={summary.feedbackCount.toLocaleString()}
          />
          <StatRow
            icon={Star}
            color="text-violet-500"
            label="Avg Rating"
            value={`${summary.averageRating.toFixed(1)} / 7`}
          />
          <StatRow
            icon={TrendingUp}
            color="text-emerald-500"
            label="Satisfaction"
            value={`${summary.satisfactionRate}%`}
          />
          <StatRow
            icon={ThumbsUp}
            color="text-teal-500"
            label="Positive"
            value={summary.positiveCount.toLocaleString()}
          />
          <StatRow
            icon={ThumbsDown}
            color="text-rose-500"
            label="Needs Attention"
            value={summary.negativeCount.toLocaleString()}
          />
        </div>
      </div>

      {/* Guided actions */}
      {items.length > 0 && (
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-700/50 dark:bg-slate-900">
          <h3 className="mb-3 flex items-center gap-2 text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
            <Sparkles className="size-3.5 text-violet-500" aria-hidden />
            Quick Actions
          </h3>
          <ul className="space-y-2">
            {items.map((item, index) => {
              const tone =
                item.tone === "positive"
                  ? {
                      icon: CheckCircle2,
                      bg: "bg-emerald-50 dark:bg-emerald-500/10",
                      text: "text-emerald-600 dark:text-emerald-400",
                    }
                  : item.tone === "negative"
                    ? {
                        icon: AlertTriangle,
                        bg: "bg-rose-50 dark:bg-rose-500/10",
                        text: "text-rose-600 dark:text-rose-400",
                      }
                    : {
                        icon: Info,
                        bg: "bg-slate-50 dark:bg-slate-700/50",
                        text: "text-slate-500 dark:text-slate-400",
                      };
              const Icon = tone.icon;
              return (
                <li key={index}>
                  <button
                    type="button"
                    onClick={() => onAsk(item.question)}
                    className="flex w-full items-start gap-2.5 rounded-lg border border-slate-100 bg-white/60 px-3 py-2.5 text-left transition-all hover:border-indigo-200 hover:bg-indigo-50/50 hover:shadow-sm dark:border-slate-700/50 dark:bg-slate-800/40 dark:hover:border-indigo-500/30 dark:hover:bg-indigo-500/5"
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md",
                        tone.bg,
                      )}
                    >
                      <Icon className={cn("size-3.5", tone.text)} aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] leading-relaxed text-slate-700 dark:text-slate-300">
                        {item.text}
                      </p>
                    </div>
                    <ArrowRight
                      className="mt-0.5 size-3.5 shrink-0 text-slate-300 transition group-hover:text-indigo-500 dark:text-slate-600"
                      aria-hidden
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

function StatRow({
  icon: Icon,
  color,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  color: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className={cn("size-3.5", color)} aria-hidden />
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {label}
        </span>
      </div>
      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
        {value}
      </span>
    </div>
  );
}

type QuickAction = {
  tone: "positive" | "negative" | "neutral";
  text: string;
  question: string;
};

function buildQuickActions(data: AiInsightsPageData): QuickAction[] {
  const { summary, branches, services, comparison } = data.analytics;
  const items: QuickAction[] = [];

  const satDelta = comparison?.changes.satisfactionRate;
  if (typeof satDelta === "number" && satDelta !== 0) {
    const previous = data.period.previousLabel ?? "the previous period";
    items.push({
      tone: satDelta < 0 ? "negative" : "positive",
      text:
        satDelta < 0
          ? `Satisfaction fell ${Math.abs(satDelta)} pts vs ${previous}`
          : `Satisfaction rose ${satDelta} pts vs ${previous}`,
      question:
        satDelta < 0
          ? "Why did satisfaction decrease compared with the previous period?"
          : "What improved compared with the previous period?",
    });
  }

  const ranked = [...branches]
    .filter((b) => b.feedbackCount > 0)
    .sort((a, b) => a.satisfactionRate - b.satisfactionRate);
  const worst = ranked[0];
  const best = ranked[ranked.length - 1];

  if (worst && best && worst.branchId !== best.branchId) {
    items.push({
      tone: "negative",
      text: `${worst.branchName} needs attention at ${worst.satisfactionRate}% satisfaction`,
      question: `Why is ${worst.branchName} underperforming?`,
    });
    if (best.satisfactionRate > worst.satisfactionRate) {
      items.push({
        tone: "positive",
        text: `${best.branchName} is the top performer at ${best.satisfactionRate}%`,
        question: "Which branch performed best this period?",
      });
    }
  }

  const worstService =
    services.length > 0
      ? [...services].sort((a, b) => a.satisfactionRate - b.satisfactionRate)[0]
      : undefined;
  if (worstService && worstService.satisfactionRate < 60) {
    items.push({
      tone: "negative",
      text: `${worstService.serviceName} has the lowest satisfaction at ${worstService.satisfactionRate}%`,
      question: "What services are performing poorly?",
    });
  }

  if (items.length === 0 && summary.feedbackCount > 0) {
    items.push({
      tone: "neutral",
      text: `${summary.feedbackCount.toLocaleString()} submissions with ${summary.satisfactionRate}% satisfaction`,
      question: "Summarize this period for management.",
    });
  }

  return items.slice(0, 4);
}
