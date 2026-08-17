// Phase 2 period insight orchestration (the AI Insights page).
//
// Same cache-first strategy as the daily service (PRD §23): a period summary
// is persisted in `AIInsight` (type "period_summary") keyed by its exact
// period range, so the page does not regenerate the same analysis on every
// visit. Forced refreshes are throttled by the shared cooldown.
//
// All I/O (collection, cache, LLM) is injected so the flow is unit-testable
// without a database or a network call.

import {
  periodAIInsightSchema,
  type PeriodAIInsight,
  type PeriodAIInsightResult,
} from "@/lib/ai/schema";
import { analyzePeriodFeedback } from "@/lib/ai/service";
import { getModelName } from "@/lib/ai/model";
import {
  resolveInsightPeriod,
  type InsightPeriodInput,
  type ResolvedPeriod,
} from "@/lib/analytics/periods";
import {
  findCachedInsight,
  upsertInsight,
  type StoredAIInsight,
} from "./db";
import { getRefreshCooldownMs } from "./service";
import { collectPeriodData } from "./period-db";
import type { PeriodAnalysisInput } from "./types";

export const AI_INSIGHT_TYPE_PERIOD = "period_summary";

export type PeriodInsightsResult =
  | {
      status: "ok";
      insight: PeriodAIInsightResult;
      feedbackCount: number;
      cached: boolean;
    }
  | {
      status: "no-feedback";
      feedbackCount: 0;
    };

export interface PeriodInsightsContext {
  now: () => Date;
  resolve: (input: InsightPeriodInput) => ResolvedPeriod;
  collect: (range: ResolvedPeriod) => Promise<PeriodAnalysisInput>;
  findCached: (
    type: string,
    periodStart: Date,
    periodEnd: Date,
  ) => Promise<StoredAIInsight | null>;
  upsert: (input: {
    type: string;
    periodStart: Date;
    periodEnd: Date;
    feedbackCount: number;
    content: PeriodAIInsightResult;
    model: string | null;
  }) => Promise<StoredAIInsight>;
  analyze: (input: PeriodAnalysisInput) => Promise<PeriodAIInsight>;
  modelName: () => string;
  refreshCooldownMs: () => number;
}

export interface PeriodInsightsService {
  getPeriodInsights(input: {
    period: InsightPeriodInput;
    refresh?: boolean;
  }): Promise<PeriodInsightsResult>;
}

export function createPeriodInsightsService(
  ctx: PeriodInsightsContext,
): PeriodInsightsService {
  return {
    async getPeriodInsights({
      period: periodInput,
      refresh = false,
    }): Promise<PeriodInsightsResult> {
      const range = ctx.resolve(periodInput);
      const type = AI_INSIGHT_TYPE_PERIOD;

      const cached = await ctx.findCached(type, range.start, range.end);

      // 1. A cached analysis is served without calling the AI again.
      if (cached && !refresh) {
        const insight = decodeCached(cached);
        if (insight) return toSuccess(cached, insight, true);
      }

      // 2. Forced refresh is throttled by the shared cooldown.
      if (
        cached &&
        refresh &&
        ctx.now().getTime() - cached.generatedAt.getTime() <
          ctx.refreshCooldownMs()
      ) {
        const insight = decodeCached(cached);
        if (insight) return toSuccess(cached, insight, true);
      }

      // 3. Collect deterministic facts (no AI call when there is no feedback).
      const data = await ctx.collect(range);
      if (data.clinic.feedbackCount === 0) {
        return { status: "no-feedback", feedbackCount: 0 };
      }

      // 4. Generate, validate, and persist the analysis.
      const body = await ctx.analyze(data);
      const insight: PeriodAIInsightResult = {
        ...body,
        metadata: {
          feedbackCount: data.clinic.feedbackCount,
          generatedAt: ctx.now().toISOString(),
          period: range.period,
          periodLabel: range.label,
          startDate: range.start.toISOString(),
          endDate: range.end.toISOString(),
        },
      };

      await ctx.upsert({
        type,
        periodStart: range.start,
        periodEnd: range.end,
        feedbackCount: data.clinic.feedbackCount,
        content: insight,
        model: ctx.modelName(),
      });

      return {
        status: "ok",
        insight,
        feedbackCount: data.clinic.feedbackCount,
        cached: false,
      };
    },
  };
}

/** Defensive decode: never trust persisted content blindly. */
function decodeCached(stored: StoredAIInsight): PeriodAIInsightResult | null {
  const parsed = periodAIInsightSchema.safeParse(stored.content);
  if (!parsed.success) {
    console.error(
      "[ai-insights] Cached period insight failed validation — treating as a cache miss",
      stored.id,
    );
    return null;
  }
  const metadata = stored.content.metadata as
    | PeriodAIInsightResult["metadata"]
    | undefined;
  return {
    ...parsed.data,
    metadata:
      metadata ??
      ({
        feedbackCount: stored.feedbackCount,
        generatedAt: stored.generatedAt.toISOString(),
        period: "custom",
        periodLabel: "Custom Range",
        startDate: stored.periodStart.toISOString(),
        endDate: stored.periodEnd.toISOString(),
      } as const),
  };
}

function toSuccess(
  stored: StoredAIInsight,
  insight: PeriodAIInsightResult,
  cached: boolean,
): PeriodInsightsResult & { status: "ok" } {
  return {
    status: "ok",
    insight,
    feedbackCount: stored.feedbackCount,
    cached,
  };
}

/** Production wiring — real Prisma/PostgreSQL + the Vercel AI SDK. */
export const periodInsightsService: PeriodInsightsService =
  createPeriodInsightsService({
    now: () => new Date(),
    resolve: (input) => resolveInsightPeriod(input),
    collect: collectPeriodData,
    findCached: findCachedInsight,
    upsert: upsertInsight,
    analyze: analyzePeriodFeedback,
    modelName: () => getModelName(),
    refreshCooldownMs: () => getRefreshCooldownMs(),
  });
