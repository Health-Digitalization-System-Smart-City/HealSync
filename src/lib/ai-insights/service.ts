// AI Insights orchestration (Phase 1 — today's feedback).
//
// Flow (API.md §20, §10 AI generation strategy):
//   check today's cached insight → serve cache when valid
//   → collect today's data (no AI call when there is no feedback)
//   → analyze → validate → persist → return
//
// All I/O (collection, cache, LLM) is injected so the caching/generation
// behavior is unit-testable without a database or a network call.

import {
  dailyAIInsightSchema,
  type DailyAIInsight,
  type DailyAIInsightResult,
} from "@/lib/ai/schema";
import { analyzeDailyFeedback } from "@/lib/ai/service";
import { getModelName } from "@/lib/ai/model";
import {
  AI_INSIGHT_TYPE_DAILY,
  collectTodayFeedback,
  findCachedInsight,
  getTodayRange,
  upsertInsight,
  type StoredAIInsight,
} from "./db";
import type {
  CollectedDailyFeedback,
  DailyInsightsResult,
  DailyInsightsSuccess,
} from "./types";

/** How long a forced refresh must wait before calling the AI again (ms). */
export const DEFAULT_REFRESH_COOLDOWN_MS = 60_000;

export function getRefreshCooldownMs(
  env: Partial<NodeJS.ProcessEnv> = process.env,
): number {
  const raw = Number(env.AI_REFRESH_COOLDOWN_MS);
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_REFRESH_COOLDOWN_MS;
}

export interface DailyInsightsContext {
  now: () => Date;
  collect: (now: Date) => Promise<CollectedDailyFeedback>;
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
    content: DailyAIInsightResult;
    model: string | null;
  }) => Promise<StoredAIInsight>;
  analyze: (input: CollectedDailyFeedback) => Promise<DailyAIInsight>;
  modelName: () => string;
  refreshCooldownMs: () => number;
}

export interface DailyInsightsService {
  /**
   * Reads or generates today's AI insight. Callers map failures (AI provider,
   * validation, DB) to a graceful error — the dashboard never depends on AI.
   */
  getDailyInsights(input?: { refresh?: boolean }): Promise<DailyInsightsResult>;
}

export function createDailyInsightsService(
  ctx: DailyInsightsContext,
): DailyInsightsService {
  return {
    async getDailyInsights(
      input: { refresh?: boolean } = {},
    ): Promise<DailyInsightsResult> {
      const now = ctx.now();
      const { start, end } = getTodayRange(now);
      const type = AI_INSIGHT_TYPE_DAILY;

      const cached = await ctx.findCached(type, start, end);

      // 1. A cached analysis is served without calling the AI again.
      if (cached && !input.refresh) {
        const insight = decodeCached(cached);
        if (insight) return toSuccess(cached, insight, true);
      }

      // 2. Forced refresh is throttled: within the cooldown window the cached
      //    analysis is kept, protecting the AI quota from refresh spam.
      if (
        cached &&
        input.refresh &&
        now.getTime() - cached.generatedAt.getTime() < ctx.refreshCooldownMs()
      ) {
        const insight = decodeCached(cached);
        if (insight) return toSuccess(cached, insight, true);
      }

      // 3. Collect today's feedback (deterministic stats + de-identified text).
      const data = await ctx.collect(now);

      // 4. No feedback today → do not call the AI at all.
      if (data.stats.feedbackCount === 0) {
        return { status: "no-feedback", feedbackCount: 0 };
      }

      // 5. Generate and validate the analysis.
      const body = await ctx.analyze(data);
      const insight: DailyAIInsightResult = {
        ...body,
        metadata: {
          feedbackCount: data.stats.feedbackCount,
          generatedAt: now.toISOString(),
          period: "today",
        },
      };

      // 6. Persist the validated result for later reads.
      await ctx.upsert({
        type,
        periodStart: start,
        periodEnd: end,
        feedbackCount: data.stats.feedbackCount,
        content: insight,
        model: ctx.modelName(),
      });

      return {
        status: "ok",
        insight,
        feedbackCount: data.stats.feedbackCount,
        cached: false,
      };
    },
  };
}

/** Defensive decode: never trust persisted content blindly. */
function decodeCached(stored: StoredAIInsight): DailyAIInsightResult | null {
  const parsed = dailyAIInsightSchema.safeParse(stored.content);
  if (!parsed.success) {
    console.error(
      "[ai-insights] Cached insight failed validation — treating as a cache miss",
      stored.id,
    );
    return null;
  }
  const metadata: DailyAIInsightResult["metadata"] = isDailyMetadata(
    stored.content.metadata,
  )
    ? stored.content.metadata
    : {
        feedbackCount: stored.feedbackCount,
        generatedAt: stored.generatedAt.toISOString(),
        period: "today",
      };
  return { ...parsed.data, metadata };
}

/** True when the stored metadata belongs to a daily insight. */
function isDailyMetadata(
  value: unknown,
): value is DailyAIInsightResult["metadata"] {
  return (
    typeof value === "object" &&
    value !== null &&
    "period" in value &&
    (value as { period?: unknown }).period === "today"
  );
}

function toSuccess(
  stored: StoredAIInsight,
  insight: DailyAIInsightResult,
  cached: boolean,
): DailyInsightsSuccess {
  return {
    status: "ok",
    insight,
    feedbackCount: stored.feedbackCount,
    cached,
  };
}

/** Production wiring — real Prisma/PostgreSQL + the Vercel AI SDK. */
export const dailyInsightsService: DailyInsightsService =
  createDailyInsightsService({
    now: () => new Date(),
    collect: collectTodayFeedback,
    findCached: findCachedInsight,
    upsert: upsertInsight,
    analyze: analyzeDailyFeedback,
    modelName: () => getModelName(),
    refreshCooldownMs: () => getRefreshCooldownMs(),
  });
