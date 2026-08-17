"use server";

import { z } from "zod";

import { fail, ok, type ActionResponse } from "@/lib/actions";
import { requirePermission } from "@/lib/auth/permissions";
import { AiError } from "@/lib/ai/errors";
import {
  askAiRateLimiter,
  getAskAiMaxLength,
} from "@/lib/ai/rate-limit";
import { askAiInsightsQuestion } from "@/lib/ai/assistant";
import type { AiAssistantResult } from "@/lib/ai/schema";
import { productionAnalyticsPort } from "@/lib/ai/tools";
import {
  periodInsightsService,
  type PeriodInsightsResult,
} from "@/lib/ai-insights/period-service";
import {
  buildAiInsightsPageData,
  type AiInsightsPageData,
} from "@/lib/ai-insights/page-data";
import {
  INSIGHT_PERIODS,
  resolveInsightPeriod,
} from "@/lib/analytics/periods";

const periodInputSchema = z.object({
  period: z.enum(INSIGHT_PERIODS),
  startDate: z.string().trim().optional(),
  endDate: z.string().trim().optional(),
});

type PeriodInput = z.infer<typeof periodInputSchema>;

/** Resolves the period or returns a VALIDATION_ERROR response. */
function resolvePeriod(
  input: PeriodInput,
): ActionResponse<ReturnType<typeof resolveInsightPeriod>> {
  try {
    return ok(resolveInsightPeriod(input));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Invalid period selection.";
    return fail("VALIDATION_ERROR", message);
  }
}

/**
 * Loads the AI Insights page data for a period: deterministic analytics
 * (always) + cached AI summary (when available). Requires `analytics.ai`.
 * Generation is NOT performed here — see `generateAiInsight`.
 */
export async function getAiInsightsPageData(
  input: unknown,
): Promise<ActionResponse<AiInsightsPageData>> {
  const authResult = await requirePermission("analytics.ai");
  if (!authResult.success) return authResult;

  const parsed = periodInputSchema.safeParse(input);
  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "Invalid period selection.");
  }

  const range = resolvePeriod(parsed.data);
  if (!range.success) return range;

  try {
    return ok(await buildAiInsightsPageData(range.data));
  } catch (error) {
    console.error("[ai-insights] Failed to load page data:", error);
    return fail("DATABASE_ERROR", "Failed to load analytics for this period.");
  }
}

/**
 * Generates (or returns the cached) AI summary for a period. Persisted in
 * `AIInsight` (type "period_summary") so the page doesn't call the LLM on
 * every render; forced refreshes are throttled by the service cooldown.
 */
export async function generateAiInsight(
  input: unknown,
): Promise<ActionResponse<PeriodInsightsResult>> {
  const authResult = await requirePermission("analytics.ai");
  if (!authResult.success) return authResult;

  const parsed = periodInputSchema
    .extend({ refresh: z.boolean().optional().default(false) })
    .safeParse(input);
  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "Invalid period selection.");
  }

  const range = resolvePeriod(parsed.data);
  if (!range.success) return range;

  try {
    return ok(
      await periodInsightsService.getPeriodInsights({
        period: {
          period: parsed.data.period,
          startDate: parsed.data.startDate,
          endDate: parsed.data.endDate,
        },
        refresh: parsed.data.refresh,
      }),
    );
  } catch (error) {
    // AI is an enhancement, never a dependency — surface a graceful error.
    if (error instanceof AiError) {
      console.error("[ai-insights] generateAiInsight AI error:", error);
      return fail(
        "AI_ERROR",
        "The AI analysis is temporarily unavailable. Please try again later.",
      );
    }
    console.error("[ai-insights] generateAiInsight unexpected error:", error);
    return fail(
      "INTERNAL_ERROR",
      "Something went wrong while generating the analysis.",
    );
  }
}

const askAiInputSchema = z.object({
  question: z.string().trim().min(1),
  periodLabel: z.string().trim().min(1).max(200),
  startDate: z.string().trim().min(1),
  endDate: z.string().trim().min(1),
});

/**
 * Asks the AI assistant a natural-language clinic question, answered through
 * the predefined tools. Server-side rate limiting protects the AI quota
 * (PRD §31); the question length is capped from the environment.
 */
export async function askAiInsights(
  input: unknown,
): Promise<ActionResponse<AiAssistantResult>> {
  const authResult = await requirePermission("analytics.ai");
  if (!authResult.success) return authResult;

  const maxLength = getAskAiMaxLength();
  const parsed = askAiInputSchema
    .extend({
      question: z
        .string()
        .trim()
        .min(1)
        .max(maxLength, {
          message: `Please keep questions under ${maxLength} characters.`,
        }),
    })
    .safeParse(input);
  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "Please check your question.", {
      ...parsed.error.flatten().fieldErrors,
    });
  }

  const key = authResult.data.user.id;
  if (!askAiRateLimiter.allow(key)) {
    return fail(
      "RATE_LIMITED",
      "Too many questions — please wait a moment before asking again.",
    );
  }

  try {
    const result = await askAiInsightsQuestion(
      {
        question: parsed.data.question,
        periodLabel: parsed.data.periodLabel,
        startDate: parsed.data.startDate,
        endDate: parsed.data.endDate,
      },
      { analytics: productionAnalyticsPort },
    );
    return ok(result);
  } catch (error) {
    if (error instanceof AiError) {
      console.error("[ai-insights] askAiInsights AI error:", error);
      return fail(
        "AI_ERROR",
        "The AI assistant is temporarily unavailable. Please try again later.",
      );
    }
    console.error("[ai-insights] askAiInsights unexpected error:", error);
    return fail(
      "INTERNAL_ERROR",
      "Something went wrong while answering your question.",
    );
  }
}
