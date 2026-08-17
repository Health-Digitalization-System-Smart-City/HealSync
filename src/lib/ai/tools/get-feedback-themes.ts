// Tool 5 — getFeedbackThemes (Phase 2, PRD §12).
//
// Recurring feedback themes aggregated from the validated analyses already
// stored during Phase 1 (AIInsight daily rows). It does NOT re-send historical
// feedback text to the LLM — the structured analysis is reused. Coverage
// metadata lets the AI caveat sparse data honestly.

import { tool, zodSchema } from "ai";

import type { AnalyticsPort } from "./types";
import { dateRangeSchema } from "./schemas";
import type { ToolCallRecorder } from "./recorder";

export function createGetFeedbackThemesTool(
  analytics: AnalyticsPort,
  record?: ToolCallRecorder,
) {
  return tool({
    description: `Returns recurring patient-feedback themes for a date period,
aggregated from previously generated AI analyses: theme name, mention count,
and percentage share. Also returns analyzedFeedbackCount and
feedbackCountInPeriod so you can gauge coverage. Use this to answer "what are
patients complaining about?" or "what themes dominated this period?". If
coverage is much lower than the period's total feedback, say so — do not
present partial themes as complete.`,
    inputSchema: zodSchema(dateRangeSchema),
    execute: async ({ startDate, endDate }) => {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const result = await analytics.getFeedbackThemes(start, end);
      record?.("getFeedbackThemes", "Aggregated feedback themes for the period");
      return result;
    },
  });
}
