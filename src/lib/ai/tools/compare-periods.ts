// Tool 7 — comparePeriods (Phase 2, PRD §14).
//
// Pre-calculated comparison between two periods (current vs previous):
// feedback count, average rating, satisfaction rate, plus absolute changes.
// PostgreSQL computes every number; the LLM explains what changed and why it
// might matter.

import { tool, zodSchema } from "ai";
import { z } from "zod";

import type { AnalyticsPort } from "./types";
import { dateTimeStringSchema } from "./schemas";
import type { ToolCallRecorder } from "./recorder";

const comparePeriodsInputSchema = z.object({
  currentStartDate: dateTimeStringSchema.describe(
    "Start of the current (main) period, ISO-8601.",
  ),
  currentEndDate: dateTimeStringSchema.describe(
    "End of the current (main) period, ISO-8601.",
  ),
  previousStartDate: dateTimeStringSchema.describe(
    "Start of the previous comparison period, ISO-8601.",
  ),
  previousEndDate: dateTimeStringSchema.describe(
    "End of the previous comparison period, ISO-8601.",
  ),
});

export function createComparePeriodsTool(
  analytics: AnalyticsPort,
  record?: ToolCallRecorder,
) {
  return tool({
    description: `Compares two date periods and returns pre-calculated metrics for
each (feedback count, average rating out of 7, satisfaction rate %) plus the
absolute changes between them (current - previous). Use this to answer "what
improved or declined compared with the previous period?" The differences are
computed by the database — do not calculate them yourself.`,
    inputSchema: zodSchema(comparePeriodsInputSchema),
    execute: async ({
      currentStartDate,
      currentEndDate,
      previousStartDate,
      previousEndDate,
    }) => {
      const result = await analytics.comparePeriods({
        currentStart: new Date(currentStartDate),
        currentEnd: new Date(currentEndDate),
        previousStart: new Date(previousStartDate),
        previousEnd: new Date(previousEndDate),
      });
      record?.("comparePeriods", "Current vs previous period comparison");
      return result;
    },
  });
}
