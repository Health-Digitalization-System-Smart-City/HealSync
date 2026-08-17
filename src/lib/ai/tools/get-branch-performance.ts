// Tool 2 — getBranchPerformance (Phase 2, PRD §9).
//
// Per-branch performance for a period, including each branch's satisfaction
// change versus the previous period of equal length. The analytics layer
// computes and ranks everything; the LLM explains the significance.

import { tool, zodSchema } from "ai";

import { previousPeriodOfEqualLength } from "@/lib/analytics/periods";
import type { AnalyticsPort } from "./types";
import { dateRangeSchema } from "./schemas";
import type { ToolCallRecorder } from "./recorder";

export function createGetBranchPerformanceTool(
  analytics: AnalyticsPort,
  record?: ToolCallRecorder,
) {
  return tool({
    description: `Returns per-branch performance for a date period: feedback count,
average rating (out of 7), satisfaction rate (%), and the satisfaction-rate
change versus the previous period of equal length. Branches are sorted by
feedback count, then satisfaction rate. Use this to compare branches, identify
the best/worst-performing branch, or find the biggest improvement/decline.
Ranking is computed by the database — do not rank or calculate yourself.`,
    inputSchema: zodSchema(dateRangeSchema),
    execute: async ({ startDate, endDate }) => {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const { previousStart, previousEnd } = previousPeriodOfEqualLength(
        start,
        end,
      );
      const result = await analytics.getBranchPerformance(
        start,
        end,
        previousStart,
        previousEnd,
      );
      record?.("getBranchPerformance", "Per-branch performance for the period");
      return result;
    },
  });
}
