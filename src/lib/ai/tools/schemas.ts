// AI tool input schemas (Phase 2, PRD §26 — "Never trust arguments generated
// by the LLM").
//
// Every tool validates its inputs with zod before touching the analytics
// layer: date ranges, optional branch/service filters, limits, granularity.
// Dates are accepted as ISO-8601 strings (what the model emits) and converted
// to `Date` by the tools. Plain string schemas (with a parse check) keep the
// JSON schema simple and provider-friendly while still rejecting garbage.

import { z } from "zod";

/** An ISO-8601 date/time string that must parse to a valid date. */
export const dateTimeStringSchema = z
  .string()
  .min(10)
  .max(40)
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "Must be a valid ISO date string.",
  });

/** Shared date-range inputs for period-scoped tools. */
export const dateRangeSchema = z.object({
  startDate: dateTimeStringSchema.describe(
    "Start of the period (inclusive), ISO-8601.",
  ),
  endDate: dateTimeStringSchema.describe(
    "End of the period (inclusive), ISO-8601.",
  ),
});

/** Shared optional branch/service filters. */
export const optionalFiltersSchema = z.object({
  branchId: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .optional()
    .describe("Optional branch ID to narrow the query."),
  serviceId: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .optional()
    .describe("Optional service ID to narrow the query."),
});

/** Granularity for trend aggregation. */
export const granularitySchema = z.enum(["day", "week", "month"]);

/** Bounded limit for feedback samples (PRD §31 — cap result sizes). */
export const sampleLimitSchema = z.number().int().min(1).max(20);
