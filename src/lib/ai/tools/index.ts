// AI tool set assembly (Phase 2, Architecture.md §6 — "Tool Selection").
//
// The assistant's `generateText` call receives exactly these seven tools. Each
// tool validates its input, fetches deterministic facts from the analytics
// layer (never Prisma directly), and reports what it did for source tracking.

import type { ToolSet } from "ai";

import type { AnalyticsPort } from "./types";
import type { ToolCallRecorder } from "./recorder";
import { createGetClinicSummaryTool } from "./get-clinic-summary";
import { createGetBranchPerformanceTool } from "./get-branch-performance";
import { createGetServicePerformanceTool } from "./get-service-performance";
import { createGetFeedbackTrendsTool } from "./get-feedback-trends";
import { createGetFeedbackThemesTool } from "./get-feedback-themes";
import { createGetNegativeFeedbackTool } from "./get-negative-feedback";
import { createComparePeriodsTool } from "./compare-periods";

export { productionAnalyticsPort, type AnalyticsPort } from "./types";
export type { ToolCallRecord, ToolCallRecorder } from "./recorder";
export { createToolCallRecorder, dedupeToolRecords } from "./recorder";

export const TOOL_NAMES = [
  "getClinicSummary",
  "getBranchPerformance",
  "getServicePerformance",
  "getFeedbackTrends",
  "getFeedbackThemes",
  "getNegativeFeedback",
  "comparePeriods",
] as const;

/**
 * Builds the assistant ToolSet over a given analytics port. `record` (when
 * provided) receives one entry per executed tool for server-side sources.
 */
export function createInsightTools(
  analytics: AnalyticsPort,
  record?: ToolCallRecorder,
): ToolSet {
  return {
    getClinicSummary: createGetClinicSummaryTool(analytics, record),
    getBranchPerformance: createGetBranchPerformanceTool(analytics, record),
    getServicePerformance: createGetServicePerformanceTool(analytics, record),
    getFeedbackTrends: createGetFeedbackTrendsTool(analytics, record),
    getFeedbackThemes: createGetFeedbackThemesTool(analytics, record),
    getNegativeFeedback: createGetNegativeFeedbackTool(analytics, record),
    comparePeriods: createComparePeriodsTool(analytics, record),
  };
}
