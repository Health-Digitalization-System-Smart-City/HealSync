import { Tags } from "lucide-react";

import type { ThemeAggregateItem } from "@/lib/analytics/insights-types";

/**
 * Deterministic theme display: aggregates themes from stored AI analyses with
 * honest coverage disclosure (the themes may cover only part of the period).
 */
export function ThemesSection({
  themes,
  coverage,
}: {
  themes: ThemeAggregateItem[];
  coverage: { analyzedFeedbackCount: number; feedbackCountInPeriod: number };
}) {
  const max = themes.length > 0 ? themes[0].count : 1;
  const partial = coverage.analyzedFeedbackCount < coverage.feedbackCountInPeriod;

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-2.5 border-b border-slate-100 bg-slate-50/50 px-5 py-4">
        <span className="flex size-8 items-center justify-center rounded-lg bg-white text-slate-600 shadow-xs">
          <Tags className="size-4 text-violet-600" aria-hidden />
        </span>
        <div>
          <h3 className="text-sm font-bold text-slate-900">Feedback Themes</h3>
          <p className="text-[11px] text-slate-500">
            Aggregated from AI analyses of feedback in this period
          </p>
        </div>
      </div>

      <div className="space-y-4 p-5">
        {partial && (
          <p className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-700">
            Theme data covers {coverage.analyzedFeedbackCount} of{" "}
            {coverage.feedbackCountInPeriod} feedback submissions in this
            period. Generating daily analyses across the period improves
            coverage.
          </p>
        )}

        {themes.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-200 px-4 py-6 text-center text-xs text-slate-400">
            No aggregated themes available for this period yet. Run daily AI
            analyses (the dashboard home) to build up theme data, or ask the AI
            below.
          </p>
        ) : (
          <ul className="space-y-2.5">
            {themes.map((theme) => (
              <li key={theme.name} className="flex items-center gap-3">
                <span className="w-40 shrink-0 truncate text-xs font-semibold text-slate-700">
                  {theme.name}
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400"
                    style={{ width: `${Math.max(4, (theme.count / max) * 100)}%` }}
                  />
                </div>
                <span className="w-16 shrink-0 text-right text-xs font-semibold text-slate-500">
                  {theme.count} · {theme.percentage}%
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
