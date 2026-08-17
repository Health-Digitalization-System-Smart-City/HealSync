// Feedback themes analytics (Phase 2 — Tool 5 `getFeedbackThemes`).
//
// Themes are aggregated from the validated AI analyses already stored during
// Phase 1 (`AIInsight` rows with type "daily") — the same source the dashboard
// card renders. We do NOT re-send historical feedback text to the LLM when a
// structured analysis is already available (PRD §20.3).
//
// The daily theme counts are model-produced (Phase 1), so the result reports
// `analyzedFeedbackCount` vs `feedbackCountInPeriod` so callers (and the LLM)
// can disclose coverage honestly instead of treating gaps as zeroes.

import { db } from "@/lib/db";
import { AI_INSIGHT_TYPE_DAILY } from "@/lib/ai-insights/db";
import type { DailyAIInsightResult } from "@/lib/ai/schema";
import { percentageOf } from "./insights-helpers";
import type {
  FeedbackThemesResult,
  ThemeAggregateItem,
} from "./insights-types";

/** Normalizes a theme name so similar concepts collapse (e.g. "Waiting Time" == "waiting time"). */
function normalizeThemeName(name: string): string {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}

function displayName(name: string): string {
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Aggregates recurring themes from the stored daily AI analyses overlapping
 * the period. Returns the theme totals plus coverage metadata so the AI can
 * caveat sparse data.
 */
export async function getFeedbackThemes(
  start: Date,
  end: Date,
): Promise<FeedbackThemesResult> {
  const [insights, totalCount] = await Promise.all([
    db.aIInsight.findMany({
      where: {
        type: AI_INSIGHT_TYPE_DAILY,
        // Only fully-contained daily insights: a partial day at a boundary
        // would otherwise be double-counted across overlapping reads.
        periodStart: { gte: start },
        periodEnd: { lte: end },
      },
      select: { content: true, feedbackCount: true },
    }),
    db.feedback.count({
      where: { deletedAt: null, createdAt: { gte: start, lte: end } },
    }),
  ]);

  const counts = new Map<string, number>();
  let analyzedFeedbackCount = 0;

  for (const insight of insights) {
    const content = insight.content as Partial<DailyAIInsightResult> | null;
    const themes = Array.isArray(content?.themes) ? content.themes : [];
    analyzedFeedbackCount += insight.feedbackCount;
    for (const theme of themes) {
      const name = normalizeThemeName(theme.name);
      if (!name) continue;
      counts.set(name, (counts.get(name) ?? 0) + theme.count);
    }
  }

  const totalCounted = Array.from(counts.values()).reduce((a, b) => a + b, 0);

  const themes: ThemeAggregateItem[] = Array.from(counts.entries())
    .map(([name, count]) => ({
      name: displayName(name),
      count,
      percentage: percentageOf(count, totalCounted),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  return { themes, analyzedFeedbackCount, feedbackCountInPeriod: totalCount };
}
