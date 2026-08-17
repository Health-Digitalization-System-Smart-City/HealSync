import { describe, expect, it, vi } from "vitest";

import { AiProviderError } from "@/lib/ai/errors";
import {
  periodAIInsightSchema,
  type PeriodAIInsight,
  type PeriodAIInsightResult,
} from "@/lib/ai/schema";
import {
  createPeriodInsightsService,
  AI_INSIGHT_TYPE_PERIOD,
  type PeriodInsightsContext,
  type PeriodInsightsResult,
} from "@/lib/ai-insights/period-service";
import type { PeriodAnalysisInput } from "@/lib/ai-insights/types";
import { resolveInsightPeriod } from "@/lib/analytics/periods";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const NOW = new Date("2026-08-15T10:00:00");

const VALID_PERIOD_INSIGHT: PeriodAIInsight = {
  summary:
    "Patient satisfaction remained stable this period, while waiting-time complaints were the most common concern.",
  overallSentiment: "positive",
  keyFindings: [
    {
      type: "negative",
      title: "Waiting time",
      explanation:
        "Waiting-time complaints were the most common negative theme.",
      evidenceCount: 18,
    },
  ],
  recommendations: [
    {
      priority: "high",
      title: "Review outpatient waiting times",
      explanation:
        "Waiting-time complaints were the most common negative theme this period.",
    },
  ],
  themes: [
    { name: "Waiting Time", sentiment: "negative", count: 18, percentage: 14 },
  ],
};

function periodData(
  overrides: Partial<PeriodAnalysisInput> = {},
): PeriodAnalysisInput {
  return {
    periodLabel: "Last 30 Days",
    startDate: "2026-07-17T00:00:00.000Z",
    endDate: "2026-08-15T23:59:59.999Z",
    clinic: {
      feedbackCount: 127,
      averageRating: 4.1,
      satisfactionRate: 72,
      positiveCount: 91,
      neutralCount: 20,
      negativeCount: 16,
    },
    branches: [],
    services: [],
    themes: [],
    themesCoverage: { analyzedFeedbackCount: 0, feedbackCountInPeriod: 127 },
    negativeSamples: [],
    comparison: {
      current: {
        feedbackCount: 127,
        averageRating: 4.1,
        satisfactionRate: 72,
      },
      previous: {
        feedbackCount: 110,
        averageRating: 4.3,
        satisfactionRate: 78,
      },
      changes: { feedbackCount: 17, averageRating: -0.2, satisfactionRate: -6 },
    },
    ...overrides,
  };
}

type CacheEntry = {
  type: string;
  periodStart: Date;
  periodEnd: Date;
  feedbackCount: number;
  content: PeriodAIInsightResult;
  model: string | null;
  generatedAt: Date;
};

function makeContext(overrides: Partial<PeriodInsightsContext> = {}) {
  let currentTime = NOW.getTime();
  const cache = new Map<string, CacheEntry>();
  const analyze = overrides.analyze
    ? vi.fn(overrides.analyze)
    : vi.fn(async () => VALID_PERIOD_INSIGHT);
  const collect = overrides.collect
    ? vi.fn(overrides.collect)
    : vi.fn(async () => periodData());
  const key = (start: Date, end: Date) => `${start.getTime()}:${end.getTime()}`;

  const ctx: PeriodInsightsContext = {
    now: () => new Date(currentTime),
    resolve: (input) => resolveInsightPeriod(input, new Date(currentTime)),
    collect,
    analyze,
    findCached: async (_type, periodStart, periodEnd) => {
      const entry = cache.get(key(periodStart, periodEnd));
      if (!entry) return null;
      return {
        id: "period_insight_1",
        type: entry.type,
        periodStart: entry.periodStart,
        periodEnd: entry.periodEnd,
        feedbackCount: entry.feedbackCount,
        content: entry.content,
        model: entry.model,
        generatedAt: entry.generatedAt,
        updatedAt: entry.generatedAt,
      };
    },
    upsert: async (input) => {
      const entry: CacheEntry = {
        type: input.type,
        periodStart: input.periodStart,
        periodEnd: input.periodEnd,
        feedbackCount: input.feedbackCount,
        content: input.content,
        model: input.model,
        generatedAt: new Date(currentTime),
      };
      cache.set(key(input.periodStart, input.periodEnd), entry);
      return {
        id: "period_insight_1",
        ...entry,
        updatedAt: entry.generatedAt,
      };
    },
    modelName: () => "test/model",
    refreshCooldownMs: () => 60_000,
    ...overrides,
  };

  return {
    ctx,
    cache,
    analyze,
    collect,
    advance: (ms: number) => {
      currentTime += ms;
    },
  };
}

function periodInput(
  overrides: Partial<{ startDate: string; endDate: string }> = {},
) {
  return { period: "30_days" as const, ...overrides };
}

async function expectNoFeedback(result: PeriodInsightsResult) {
  expect(result.status).toBe("no-feedback");
}

// ---------------------------------------------------------------------------
// No feedback — no AI call, no persisted insight
// ---------------------------------------------------------------------------

describe("getPeriodInsights — no feedback", () => {
  it("returns no-feedback without calling the AI or persisting", async () => {
    const { ctx, cache, analyze, collect } = makeContext({
      collect: vi.fn(async () =>
        periodData({
          clinic: { ...periodData().clinic, feedbackCount: 0 },
        }),
      ),
    });

    const service = createPeriodInsightsService(ctx);
    const result = await service.getPeriodInsights({ period: periodInput() });

    await expectNoFeedback(result);
    expect(collect).toHaveBeenCalledOnce();
    expect(analyze).not.toHaveBeenCalled();
    expect(cache.size).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Normal dataset — generate, validate, persist
// ---------------------------------------------------------------------------

describe("getPeriodInsights — normal dataset", () => {
  it("generates, validates, and persists a period insight", async () => {
    const { ctx, cache, analyze } = makeContext();

    const service = createPeriodInsightsService(ctx);
    const result = await service.getPeriodInsights({ period: periodInput() });

    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    expect(result.cached).toBe(false);
    expect(result.feedbackCount).toBe(127);
    expect(result.insight.summary.length).toBeGreaterThan(0);
    expect(result.insight.keyFindings.length).toBeGreaterThan(0);
    expect(result.insight.recommendations.length).toBeGreaterThan(0);
    expect(result.insight.themes.length).toBeGreaterThan(0);
    expect(result.insight.metadata.period).toBe("30_days");
    expect(result.insight.metadata.feedbackCount).toBe(127);
    expect(analyze).toHaveBeenCalledOnce();
    expect(cache.size).toBe(1);
    expect(Array.from(cache.values())[0].type).toBe(AI_INSIGHT_TYPE_PERIOD);
  });

  it("passes only deterministic facts to the AI", async () => {
    const { ctx, analyze } = makeContext();
    const service = createPeriodInsightsService(ctx);

    await service.getPeriodInsights({ period: periodInput() });

    const input = analyze.mock.calls[0][0];
    expect(input.clinic.feedbackCount).toBe(127);
    expect(input.comparison.changes.satisfactionRate).toBe(-6);
    expect(input).not.toHaveProperty("phoneNumber");
    expect(input).not.toHaveProperty("patientId");
  });

  it("serves the cached result on the next read without calling the AI again", async () => {
    const { ctx, analyze } = makeContext();
    const service = createPeriodInsightsService(ctx);

    await service.getPeriodInsights({ period: periodInput() });
    expect(analyze).toHaveBeenCalledTimes(1);

    const second = await service.getPeriodInsights({ period: periodInput() });
    expect(second.status).toBe("ok");
    if (second.status !== "ok") return;
    expect(second.cached).toBe(true);
    expect(analyze).toHaveBeenCalledTimes(1);
  });

  it("uses a different cache key for a different period range", async () => {
    const { ctx, analyze } = makeContext();
    const service = createPeriodInsightsService(ctx);

    await service.getPeriodInsights({ period: periodInput() });
    await service.getPeriodInsights({ period: { period: "today" } });

    expect(analyze).toHaveBeenCalledTimes(2);
  });
});

// ---------------------------------------------------------------------------
// AI failure — the page must stay functional
// ---------------------------------------------------------------------------

describe("getPeriodInsights — AI failure", () => {
  it("propagates provider failures so the action can return a graceful AI_ERROR", async () => {
    const { ctx, cache } = makeContext({
      analyze: async () => {
        throw new AiProviderError("Provider is down");
      },
    });

    const service = createPeriodInsightsService(ctx);
    await expect(
      service.getPeriodInsights({ period: periodInput() }),
    ).rejects.toThrow(AiProviderError);
    expect(cache.size).toBe(0);
  });

  it("treats a corrupted cached insight as a cache miss and regenerates", async () => {
    const { ctx, cache, analyze } = makeContext();
    const service = createPeriodInsightsService(ctx);

    await service.getPeriodInsights({ period: periodInput() });
    expect(analyze).toHaveBeenCalledTimes(1);

    const entry = Array.from(cache.values())[0] as CacheEntry;
    entry.content = { ...entry.content, summary: "" };

    await service.getPeriodInsights({
      period: periodInput(),
      refresh: true,
    });
    expect(analyze).toHaveBeenCalledTimes(2);
  });
});

// ---------------------------------------------------------------------------
// Refresh / cooldown
// ---------------------------------------------------------------------------

describe("getPeriodInsights — refresh cooldown", () => {
  it("serves the cached analysis when a refresh is requested inside the cooldown", async () => {
    const { ctx, analyze, advance } = makeContext();
    const service = createPeriodInsightsService(ctx);

    await service.getPeriodInsights({ period: periodInput() });
    expect(analyze).toHaveBeenCalledTimes(1);

    advance(10_000);
    const refreshed = await service.getPeriodInsights({
      period: periodInput(),
      refresh: true,
    });
    expect(refreshed.status).toBe("ok");
    if (refreshed.status !== "ok") return;
    expect(refreshed.cached).toBe(true);
    expect(analyze).toHaveBeenCalledTimes(1);
  });

  it("regenerates when a refresh is requested after the cooldown elapses", async () => {
    const { ctx, analyze, advance } = makeContext();
    const service = createPeriodInsightsService(ctx);

    await service.getPeriodInsights({ period: periodInput() });
    expect(analyze).toHaveBeenCalledTimes(1);

    advance(120_000);
    const refreshed = await service.getPeriodInsights({
      period: periodInput(),
      refresh: true,
    });
    expect(refreshed.status).toBe("ok");
    if (refreshed.status !== "ok") return;
    expect(refreshed.cached).toBe(false);
    expect(analyze).toHaveBeenCalledTimes(2);
  });
});

// ---------------------------------------------------------------------------
// Schema validation
// ---------------------------------------------------------------------------

describe("periodAIInsightSchema", () => {
  it("accepts a fully valid structured response", () => {
    expect(periodAIInsightSchema.safeParse(VALID_PERIOD_INSIGHT).success).toBe(
      true,
    );
  });

  it("rejects output missing required fields", () => {
    expect(periodAIInsightSchema.safeParse({ summary: "x" }).success).toBe(
      false,
    );
  });
});

describe("ResolvedPeriod type helpers", () => {
  it("builds a resolved period for the default period", () => {
    const range = resolveInsightPeriod({ period: "today" }, NOW);
    expect(range).toBeDefined();
    expect(range.period).toBe("today");
    expect(range.previousStart < range.start).toBe(true);
  });
});
