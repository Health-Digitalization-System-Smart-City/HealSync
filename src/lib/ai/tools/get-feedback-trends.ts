// Tool 4 — getFeedbackTrends (Phase 2, PRD §11).
//
// Aggregated feedback trends (count, average rating, satisfaction rate) for a
// period, bucketed by day/week/month. PostgreSQL filters the rows and this
// module performs deterministic bucketing; the LLM interprets the shape.

import { tool, zodSchema } from "ai";

import type { AnalyticsPort } from "./types";
import { dateRangeSchema, granularitySchema } from "./schemas";
import type { ToolCallRecorder } from "./recorder";

const trendsInputSchema = dateRangeSchema.extend({
  granularity: granularitySchema
    .default("day")
    .describe("Bucket size: day, week, or month."),
});

export function createGetFeedbackTrendsTool(
  analytics: AnalyticsPort,
  record?: ToolCallRecorder,
) {
  return tool({
    description: `Returns aggregated feedback trends for a date period, bucketed by
day, week, or month: feedback count, average rating (out of 7), and
satisfaction rate (%) per bucket, in chronological order. Use this to answer
questions about how metrics changed over time within a period (e.g. "did
satisfaction decline near the end of the period?"). Aggregation is deterministic.`,
    inputSchema: zodSchema(trendsInputSchema),
    execute: async ({ startDate, endDate, granularity }) => {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const result = await analytics.getFeedbackTrends(start, end, granularity);
      record?.(
        "getFeedbackTrends",
        `Feedback trends (${granularity}) for the period`,
      );
      return result;
    },
  });
}
