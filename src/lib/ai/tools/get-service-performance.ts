// Tool 3 — getServicePerformance (Phase 2, PRD §10).
//
// Per-service performance for a period with the satisfaction-rate change
// versus the previous period of equal length. All numbers are computed by the
// database; the LLM explains the ranking.

import { tool, zodSchema } from "ai";

import { previousPeriodOfEqualLength } from "@/lib/analytics/periods";
import type { AnalyticsPort } from "./types";
import { dateRangeSchema } from "./schemas";
import type { ToolCallRecorder } from "./recorder";

export function createGetServicePerformanceTool(
  analytics: AnalyticsPort,
  record?: ToolCallRecorder,
) {
  return tool({
    description: `Returns per-service performance for a date period: feedback count,
average rating (out of 7), satisfaction rate (%), and the satisfaction-rate
change versus the previous period of equal length. Services are sorted by
feedback count, then satisfaction rate. Use this to compare services and
identify the best/lowest-performing services. Ranking is computed by the
database — do not rank or calculate yourself.`,
    inputSchema: zodSchema(dateRangeSchema),
    execute: async ({ startDate, endDate }) => {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const { previousStart, previousEnd } =
        previousPeriodOfEqualLength(start, end);
      const result = await analytics.getServicePerformance(
        start,
        end,
        previousStart,
        previousEnd,
      );
      record?.("getServicePerformance", "Per-service performance for the period");
      return result;
    },
  });
}
