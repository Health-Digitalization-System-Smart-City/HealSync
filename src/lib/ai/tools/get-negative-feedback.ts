// Tool 6 — getNegativeFeedback (Phase 2, PRD §13).
//
// Lets the AI inspect a bounded sample of de-identified negative feedback for
// qualitative context. STRICT privacy: only rating, comment text, branch/
// service names, and timestamp are returned — never phone numbers, patient
// names, or IDs (security.md §20). `limit` is capped at 20 server-side
// (PRD §31 rate limiting).

import { tool, zodSchema } from "ai";

import { MAX_NEGATIVE_FEEDBACK_LIMIT } from "@/lib/analytics/feedback";
import type { AnalyticsPort } from "./types";
import {
  dateRangeSchema,
  optionalFiltersSchema,
  sampleLimitSchema,
} from "./schemas";
import type { ToolCallRecorder } from "./recorder";

const negativeFeedbackInputSchema = dateRangeSchema
  .merge(optionalFiltersSchema)
  .extend({
    limit: sampleLimitSchema.optional().describe(
      "Maximum number of feedback items to return (1-20, default 10).",
    ),
  });

export function createGetNegativeFeedbackTool(
  analytics: AnalyticsPort,
  record?: ToolCallRecorder,
) {
  return tool({
    description: `Returns a bounded sample of negative ("needs attention") patient
feedback for a date period, optionally filtered by branch or service. Each
item contains rating, comment text, branch name, service name, and timestamp —
de-identified: no patient names, phone numbers, or IDs are ever included. Use
this only when you need qualitative detail about complaints (e.g. what exactly
patients are unhappy about). The returned list is a sample, not every record.`,
    inputSchema: zodSchema(negativeFeedbackInputSchema),
    execute: async ({ startDate, endDate, branchId, serviceId, limit }) => {
      const start = new Date(startDate);
      const end = new Date(endDate);
      // Defense in depth: clamp even if execute is reached without schema
      // validation (the analytics layer clamps again).
      const clamped = limit
        ? Math.min(Math.max(1, Math.floor(limit)), MAX_NEGATIVE_FEEDBACK_LIMIT)
        : undefined;
      const result = await analytics.getNegativeFeedback({
        start,
        end,
        branchId,
        serviceId,
        limit: clamped,
      });
      record?.(
        "getNegativeFeedback",
        `Sample of ${result.length} negative feedback items`,
      );
      return result;
    },
  });
}
