// Tool 1 — getClinicSummary (Phase 2, PRD §8).
//
// Returns the main clinic metrics for the selected period. PostgreSQL computes
// every number (clinic.ts); this tool only validates the input and hands the
// result to the LLM.

import { tool, zodSchema } from "ai";

import type { AnalyticsPort } from "./types";
import { dateRangeSchema } from "./schemas";
import type { ToolCallRecorder } from "./recorder";

export function createGetClinicSummaryTool(
  analytics: AnalyticsPort,
  record?: ToolCallRecorder,
) {
  return tool({
    description: `Returns the clinic's main performance metrics for a date period:
feedback count, average rating (out of 7), satisfaction rate (percentage of
positive feedback), and positive/neutral/negative counts. Use this to answer
questions about overall clinic performance for a period. All numbers are
computed by the database — do not calculate them yourself.`,
    inputSchema: zodSchema(dateRangeSchema),
    execute: async ({ startDate, endDate }) => {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const result = await analytics.getClinicSummary(start, end);
      record?.("getClinicSummary", "Clinic summary for the requested period");
      return result;
    },
  });
}
