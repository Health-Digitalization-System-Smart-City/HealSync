import { describe, expect, it, vi } from "vitest";

import {
  dailyAIInsightSchema,
  isDailyAIInsight,
  type DailyAIInsight,
  type DailyAIInsightResult,
} from "@/lib/ai/schema";
import {
  AiNotConfiguredError,
  AiProviderError,
  AiValidationError,
} from "@/lib/ai/errors";
import {
  analyzeDailyFeedback,
  type GenerateStructuredFn,
} from "@/lib/ai/service";
import { DEFAULT_MODEL, getModelConfig, isAIConfigured } from "@/lib/ai/model";
import {
  buildDailyAnalysisPrompt,
  DAILY_ANALYSIS_SYSTEM_PROMPT,
  SMALL_DATASET_THRESHOLD,
} from "@/lib/ai/prompts/daily-feedback-analysis";
import {
  createDailyInsightsService,
  getRefreshCooldownMs,
  type DailyInsightsContext,
} from "@/lib/ai-insights/service";
import type {
  AIFeedbackItem,
  CollectedDailyFeedback,
  DailyInsightsResult,
} from "@/lib/ai-insights/types";
import { PERMISSIONS, hasPermission, getPermissions } from "@/lib/permissions";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const NOW = new Date("2026-08-15T10:00:00");

const VALID_INSIGHT: DailyAIInsight = {
  summary:
    "Today's feedback was generally positive, with an average rating of 4.1/5. Staff friendliness was praised frequently, while waiting time was the most common complaint.",
  overallSentiment: "positive",
  keyFindings: [
    {
      type: "positive",
      title: "Staff friendliness",
      explanation: "Patients frequently praised staff behavior.",
      evidenceCount: 24,
    },
    {
      type: "negative",
      title: "Waiting time",
      explanation: "Long waiting times were today's most common complaint.",
      evidenceCount: 18,
    },
  ],
  recommendations: [
    {
      priority: "high",
      title: "Review outpatient waiting times",
      explanation:
        "Waiting-time complaints were the most common negative theme today.",
    },
  ],
  themes: [
    { name: "Waiting Time", sentiment: "negative", count: 18, percentage: 14 },
    { name: "Staff Friendliness", sentiment: "positive", count: 24 },
  ],
};

function feedbackItem(overrides: Partial<AIFeedbackItem> = {}): AIFeedbackItem {
  return {
    id: "fb_1",
    rating: "SATISFIED",
    ratingLabel: "Satisfied",
    ratingScore: 6,
    comment: "The staff were very friendly.",
    branch: "Branch 01",
    service: "Reception",
    createdAt: "2026-08-15T09:00:00.000Z",
    ...overrides,
  };
}

function collected(
  overrides: Partial<CollectedDailyFeedback> = {},
): CollectedDailyFeedback {
  return {
    periodLabel: "Saturday, August 15, 2026",
    stats: {
      feedbackCount: 3,
      positiveCount: 2,
      neutralCount: 0,
      negativeCount: 1,
      satisfactionRate: 67,
      avgRatingScore: 4.7,
      ratingDistribution: [
        { rating: "SATISFIED", label: "Satisfied", count: 2 },
        { rating: "NOT_SATISFIED", label: "Not Satisfied", count: 1 },
      ],
      branchStats: [
        {
          name: "Branch 01",
          count: 3,
          positiveCount: 2,
          negativeCount: 1,
          avgScore: 4.7,
        },
      ],
      serviceStats: [
        {
          name: "Reception",
          count: 3,
          positiveCount: 2,
          negativeCount: 1,
          avgScore: 4.7,
        },
      ],
    },
    feedback: [feedbackItem()],
    ...overrides,
  };
}

type CacheEntry = {
  type: string;
  periodStart: Date;
  periodEnd: Date;
  feedbackCount: number;
  content: DailyAIInsightResult;
  model: string | null;
  generatedAt: Date;
};

function makeContext(overrides: Partial<DailyInsightsContext> = {}) {
  let currentTime = NOW.getTime();
  const cache = new Map<string, CacheEntry>();
  const analyze = overrides.analyze
    ? vi.fn(overrides.analyze)
    : vi.fn(async () => VALID_INSIGHT);
  const collect = overrides.collect
    ? vi.fn(overrides.collect)
    : vi.fn(async () => collected());
  const key = (type: string, start: Date, end: Date) =>
    `${type}:${start.getTime()}:${end.getTime()}`;

  const ctx: DailyInsightsContext = {
    now: () => new Date(currentTime),
    collect,
    analyze,
    findCached: async (type, periodStart, periodEnd) => {
      const entry = cache.get(key(type, periodStart, periodEnd));
      if (!entry) return null;
      return {
        id: "insight_1",
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
      cache.set(key(input.type, input.periodStart, input.periodEnd), entry);
      return {
        id: "insight_1",
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

async function expectNoFeedbackResult(result: DailyInsightsResult) {
  expect(result.status).toBe("no-feedback");
}

// ---------------------------------------------------------------------------
// No feedback — no AI call, no generated insight
// ---------------------------------------------------------------------------

describe("getDailyInsights — no feedback", () => {
  it("returns no-feedback without calling the AI or persisting anything", async () => {
    const { ctx, cache, analyze, collect } = makeContext({
      collect: vi.fn(async () =>
        collected({ stats: { ...collected().stats, feedbackCount: 0 } }),
      ),
    });

    const service = createDailyInsightsService(ctx);
    const result = await service.getDailyInsights();

    await expectNoFeedbackResult(result);
    if (result.status === "no-feedback") {
      expect(result.feedbackCount).toBe(0);
    }
    expect(collect).toHaveBeenCalledOnce();
    expect(analyze).not.toHaveBeenCalled();
    expect(cache.size).toBe(0);
  });

  it("does not generate an insight when only a refresh is requested and there is no feedback", async () => {
    const { ctx, analyze } = makeContext({
      collect: vi.fn(async () =>
        collected({ stats: { ...collected().stats, feedbackCount: 0 } }),
      ),
    });

    const service = createDailyInsightsService(ctx);
    const result = await service.getDailyInsights({ refresh: true });

    await expectNoFeedbackResult(result);
    expect(analyze).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Normal dataset — summary / findings / recommendations / themes
// ---------------------------------------------------------------------------

describe("getDailyInsights — normal dataset", () => {
  it("generates, validates, and persists an insight", async () => {
    const { ctx, cache, analyze } = makeContext();

    const service = createDailyInsightsService(ctx);
    const result = await service.getDailyInsights();

    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    expect(result.cached).toBe(false);
    expect(result.feedbackCount).toBe(3);
    expect(result.insight.summary.length).toBeGreaterThan(0);
    expect(result.insight.keyFindings.length).toBeGreaterThan(0);
    expect(result.insight.recommendations.length).toBeGreaterThan(0);
    expect(result.insight.themes.length).toBeGreaterThan(0);
    expect(result.insight.metadata.period).toBe("today");
    expect(result.insight.metadata.feedbackCount).toBe(3);
    expect(analyze).toHaveBeenCalledOnce();
    expect(cache.size).toBe(1);
  });

  it("serves the cached result on the next read without calling the AI again", async () => {
    const { ctx, analyze } = makeContext();
    const service = createDailyInsightsService(ctx);

    const first = await service.getDailyInsights();
    expect(first.status).toBe("ok");
    expect(analyze).toHaveBeenCalledTimes(1);

    const second = await service.getDailyInsights();
    expect(second.status).toBe("ok");
    if (second.status !== "ok") return;
    expect(second.cached).toBe(true);
    expect(second.insight.summary).toBe(
      (first.status === "ok" && first.insight.summary) || "",
    );
    expect(analyze).toHaveBeenCalledTimes(1);
  });

  it("small datasets are flagged in the prompt so the AI acknowledges limited data", async () => {
    const systemPrompt = DAILY_ANALYSIS_SYSTEM_PROMPT;
    expect(systemPrompt).toContain(`below ${SMALL_DATASET_THRESHOLD}`);
    expect(systemPrompt).toMatch(/limited/i);
    expect(systemPrompt).toMatch(/reliable trend/i);

    const input = collected();
    expect(input.stats.feedbackCount).toBeLessThan(SMALL_DATASET_THRESHOLD);
    const prompt = buildDailyAnalysisPrompt(input);
    expect(prompt).toContain("Total feedback today: 3");
  });

  it("passes the collected data to the AI and persists the validated result", async () => {
    const { ctx, analyze } = makeContext();
    const service = createDailyInsightsService(ctx);

    await service.getDailyInsights();

    const input = analyze.mock.calls[0][0];
    expect(input.stats.feedbackCount).toBe(3);
    expect(input.feedback[0]).toMatchObject({
      branch: "Branch 01",
      service: "Reception",
    });
  });
});

// ---------------------------------------------------------------------------
// AI failure — dashboard must stay functional
// ---------------------------------------------------------------------------

describe("getDailyInsights — AI failure", () => {
  it("propagates provider failures so the action can return a graceful AI_ERROR", async () => {
    const { ctx, cache } = makeContext({
      analyze: async () => {
        throw new AiProviderError("Provider is down");
      },
    });

    const service = createDailyInsightsService(ctx);
    await expect(service.getDailyInsights()).rejects.toThrow(AiProviderError);
    expect(cache.size).toBe(0);
  });

  it("surfaces misconfiguration (missing AI_API_KEY) as an AiError", () => {
    expect(() =>
      getModelConfig({ ...process.env, AI_PROVIDER: "unsupported" }),
    ).toThrow(AiNotConfiguredError);
    expect(isAIConfigured({ ...process.env, AI_API_KEY: "" })).toBe(false);
    expect(isAIConfigured({ ...process.env, AI_API_KEY: "secret" })).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Invalid AI response — schema validation fails safely
// ---------------------------------------------------------------------------

describe("analyzeDailyFeedback — invalid responses", () => {
  it("rejects output missing required fields", async () => {
    const generate: GenerateStructuredFn = async () => ({
      object: { summary: "missing everything else" },
    });

    await expect(analyzeDailyFeedback(collected(), generate)).rejects.toThrow(
      AiValidationError,
    );
  });

  it("rejects malformed arrays and wrong enum values", async () => {
    const generate: GenerateStructuredFn = async () => ({
      object: {
        ...VALID_INSIGHT,
        overallSentiment: "terrific",
        keyFindings: "not an array",
      },
    });

    await expect(analyzeDailyFeedback(collected(), generate)).rejects.toThrow(
      AiValidationError,
    );
  });

  it("wraps transport errors in AiProviderError", async () => {
    const generate: GenerateStructuredFn = async () => {
      throw new Error("network failure");
    };

    await expect(analyzeDailyFeedback(collected(), generate)).rejects.toThrow(
      AiProviderError,
    );
  });

  it("accepts a fully valid structured response", async () => {
    const generate: GenerateStructuredFn = async () => ({
      object: VALID_INSIGHT,
    });

    const insight = await analyzeDailyFeedback(collected(), generate);
    expect(isDailyAIInsight(insight)).toBe(true);
    expect(dailyAIInsightSchema.safeParse(insight).success).toBe(true);
  });

  it("treats a corrupted cached insight as a cache miss and regenerates", async () => {
    const { ctx, cache, analyze } = makeContext();
    const service = createDailyInsightsService(ctx);

    // First call persists a valid insight.
    await service.getDailyInsights();
    expect(analyze).toHaveBeenCalledTimes(1);

    // Corrupt the persisted content (simulating bad stored data) — the next
    // read must not serve it.
    const entry = cache.values().next().value as CacheEntry;
    entry.content = { ...entry.content, summary: "" };

    await service.getDailyInsights({ refresh: true });

    // The corrupted entry was not served — analysis ran again for the refresh.
    expect(analyze).toHaveBeenCalledTimes(2);
  });
});

// ---------------------------------------------------------------------------
// Refresh / cooldown — protect against excessive AI calls
// ---------------------------------------------------------------------------

describe("getDailyInsights — refresh cooldown", () => {
  it("keeps serving the cached analysis when a refresh is requested inside the cooldown window", async () => {
    const { ctx, analyze, advance } = makeContext();
    const service = createDailyInsightsService(ctx);

    await service.getDailyInsights();
    expect(analyze).toHaveBeenCalledTimes(1);

    advance(10_000); // still inside the 60s cooldown
    const refreshed = await service.getDailyInsights({ refresh: true });
    expect(refreshed.status).toBe("ok");
    if (refreshed.status !== "ok") return;
    expect(refreshed.cached).toBe(true);
    expect(analyze).toHaveBeenCalledTimes(1);
  });

  it("regenerates when a refresh is requested after the cooldown elapses", async () => {
    const { ctx, analyze, advance } = makeContext();
    const service = createDailyInsightsService(ctx);

    await service.getDailyInsights();
    expect(analyze).toHaveBeenCalledTimes(1);

    advance(120_000); // past the 60s cooldown
    const refreshed = await service.getDailyInsights({ refresh: true });
    expect(refreshed.status).toBe("ok");
    if (refreshed.status !== "ok") return;
    expect(refreshed.cached).toBe(false);
    expect(analyze).toHaveBeenCalledTimes(2);
  });

  it("reads the cooldown from the environment with a sane default", () => {
    expect(getRefreshCooldownMs({})).toBe(60_000);
    expect(getRefreshCooldownMs({ AI_REFRESH_COOLDOWN_MS: "5000" })).toBe(
      5_000,
    );
    expect(getRefreshCooldownMs({ AI_REFRESH_COOLDOWN_MS: "0" })).toBe(60_000);
  });
});

// ---------------------------------------------------------------------------
// Authorization — Admin / Manager / Analyst allowed; others denied
// ---------------------------------------------------------------------------

describe("analytics.ai authorization", () => {
  it("grants analytics.ai to Admin, Manager, and Analyst", () => {
    for (const role of ["Admin", "Manager", "Analyst"] as const) {
      expect(hasPermission(role, PERMISSIONS.ANALYTICS_AI)).toBe(true);
      expect(getPermissions(role)).toContain(PERMISSIONS.ANALYTICS_AI);
    }
  });

  it("denies analytics.ai to unknown/unauthenticated roles", () => {
    expect(hasPermission("guest", PERMISSIONS.ANALYTICS_AI)).toBe(false);
    expect(hasPermission("", PERMISSIONS.ANALYTICS_AI)).toBe(false);
    expect(getPermissions("superadmin")).not.toContain(
      PERMISSIONS.ANALYTICS_AI,
    );
  });

  it("keeps the analytics.ai permission in the seeded permission set", async () => {
    const { ALL_PERMISSIONS } = await import("@/lib/auth/permissions");
    expect(ALL_PERMISSIONS).toContain("analytics.ai");
  });
});

// ---------------------------------------------------------------------------
// Privacy — no patient-identifying data reaches the AI
// ---------------------------------------------------------------------------

describe("privacy — de-identified AI payload", () => {
  it("AIFeedbackItem exposes only the allowed non-PII fields", () => {
    const item = feedbackItem();
    expect(Object.keys(item).sort()).toEqual(
      [
        "branch",
        "comment",
        "createdAt",
        "id",
        "rating",
        "ratingLabel",
        "ratingScore",
        "service",
      ].sort(),
    );
  });

  it("the serialized prompt sent to the model contains no PII fields or patient identity", async () => {
    let capturedPrompt = "";
    const generate: GenerateStructuredFn = async ({ prompt }) => {
      capturedPrompt = prompt;
      return { object: VALID_INSIGHT };
    };

    await analyzeDailyFeedback(collected(), generate);

    expect(capturedPrompt).not.toMatch(/phone/i);
    expect(capturedPrompt).not.toMatch(/patient name/i);
    expect(capturedPrompt).not.toMatch(/\+251/);
    expect(capturedPrompt).not.toContain("phoneNumber");
    expect(capturedPrompt).not.toContain("patientId");
  });

  it("only branch/service names (not IDs) are included in the AI payload", async () => {
    const input = collected();
    const prompt = buildDailyAnalysisPrompt(input);
    expect(prompt).toContain("Branch: Branch 01");
    expect(prompt).toContain("Service: Reception");
  });
});

// ---------------------------------------------------------------------------
// Model configuration
// ---------------------------------------------------------------------------

describe("model configuration", () => {
  it("defaults to the free-tier Google Gemini model", () => {
    const config = getModelConfig({ AI_PROVIDER: "", AI_MODEL: "" });
    expect(config.provider).toBe("google");
    expect(config.modelId).toBe(DEFAULT_MODEL);
    expect(DEFAULT_MODEL).toBe("gemini-2.5-flash");
  });

  it("honors AI_MODEL overrides", () => {
    const config = getModelConfig({ AI_MODEL: "gemini-2.0-flash" });
    expect(config.modelId).toBe("gemini-2.0-flash");
  });

  it("rejects unsupported providers", () => {
    expect(() => getModelConfig({ AI_PROVIDER: "anthropic" })).toThrow(
      AiNotConfiguredError,
    );
  });
});
