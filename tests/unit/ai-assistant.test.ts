import { describe, expect, it, vi } from "vitest";

import {
  askAiInsightsQuestion,
  type AssistantGenerateFn,
  type AssistantQuestionInput,
} from "@/lib/ai/assistant";
import {
  AiProviderError,
  AiValidationError,
} from "@/lib/ai/errors";
import {
  AI_ASSISTANT_SYSTEM_PROMPT,
  buildAssistantUserPrompt,
} from "@/lib/ai/prompts/ai-assistant";
import { createInsightTools, type AnalyticsPort } from "@/lib/ai/tools";
import type { AiAssistantResult } from "@/lib/ai/schema";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const QUESTION_INPUT: AssistantQuestionInput = {
  question: "Which branch needs the most attention?",
  periodLabel: "Last 30 Days",
  startDate: "2026-07-17T00:00:00.000Z",
  endDate: "2026-08-15T23:59:59.999Z",
};

const VALID_ANSWER = {
  answer:
    "Branch 2 needs the most attention, with a satisfaction rate of 40%, the lowest in the period.",
  keyPoints: [
    {
      title: "Branch 2",
      explanation: "Satisfaction rate of 40%, down 8 points vs the previous period.",
      type: "negative" as const,
    },
  ],
  recommendations: [
    {
      priority: "high" as const,
      title: "Review Branch 2 operations",
      explanation: "Branch 2 has the lowest satisfaction rate in the period.",
    },
  ],
};

function makeAnalytics(overrides: Partial<AnalyticsPort> = {}): AnalyticsPort {
  return {
    getClinicSummary: vi.fn(async () => ({
      feedbackCount: 42,
      averageRating: 4.3,
      satisfactionRate: 71,
      positiveCount: 30,
      neutralCount: 5,
      negativeCount: 7,
    })),
    getBranchPerformance: vi.fn(async () => []),
    getServicePerformance: vi.fn(async () => []),
    getFeedbackTrends: vi.fn(async () => []),
    getFeedbackThemes: vi.fn(async () => ({
      themes: [],
      analyzedFeedbackCount: 0,
      feedbackCountInPeriod: 0,
    })),
    getNegativeFeedback: vi.fn(async () => []),
    comparePeriods: vi.fn(async () => ({
      current: {
        feedbackCount: 42,
        averageRating: 4.3,
        satisfactionRate: 71,
      },
      previous: {
        feedbackCount: 40,
        averageRating: 4.5,
        satisfactionRate: 78,
      },
      changes: { feedbackCount: 2, averageRating: -0.2, satisfactionRate: -7 },
    })),
    ...overrides,
  };
}

function makeGenerate(result: unknown, capture?: (input: {
  system: string;
  prompt: string;
  tools: ReturnType<typeof createInsightTools>;
}) => void): AssistantGenerateFn {
  return async (input) => {
    capture?.(input);
    return { object: result };
  };
}

// ---------------------------------------------------------------------------
// Prompt construction
// ---------------------------------------------------------------------------

describe("assistant prompt", () => {
  it("builds a user prompt with the question and the selected period", () => {
    const prompt = buildAssistantUserPrompt(QUESTION_INPUT);
    expect(prompt).toContain("Which branch needs the most attention?");
    expect(prompt).toContain("Last 30 Days");
    expect(prompt).toContain("2026-07-17");
  });

  it("system prompt enforces the hallucination rules", () => {
    const system = AI_ASSISTANT_SYSTEM_PROMPT;
    expect(system).toMatch(/never invent statistics/i);
    expect(system).toMatch(/never access the database directly/i);
    expect(system).toMatch(/do not make medical diagnoses/i);
    expect(system).toMatch(/do not make unsupported accusations/i);
    expect(system).toMatch(/tools/i);
  });
});

// ---------------------------------------------------------------------------
// Assistant flow
// ---------------------------------------------------------------------------

describe("askAiInsightsQuestion", () => {
  it("returns a validated structured answer with server-side sources", async () => {
    let capturedTools: ReturnType<typeof createInsightTools> | null = null;
    const generate = makeGenerate(VALID_ANSWER, ({ tools }) => {
      capturedTools = tools;
    });
    const analytics = makeAnalytics();

    const result = await askAiInsightsQuestion(QUESTION_INPUT, {
      analytics,
      generate,
    });

    expect(result.answer).toContain("Branch 2");
    expect(result.keyPoints).toHaveLength(1);
    expect(result.recommendations).toHaveLength(1);
    expect(Array.isArray(result.sources)).toBe(true);
    // The tools were passed to the LLM.
    expect(capturedTools).not.toBeNull();
  });

  it("records the tools actually executed as sources", async () => {
    const analytics = makeAnalytics({
      getBranchPerformance: vi.fn(async () => [
        {
          branchId: "br-2",
          branchName: "Branch 2",
          feedbackCount: 10,
          averageRating: 3.1,
          satisfactionRate: 40,
          changeFromPreviousPeriod: -8,
        },
      ]),
    });

    // Simulate a generateText that executes the branch tool (the SDK does this
    // internally during multi-step tool calling; here we invoke the tool to
    // prove the recording works end-to-end).
    const generate: AssistantGenerateFn = async ({ tools }) => {
      await (
        tools.getBranchPerformance as unknown as {
          execute: (a: {
            startDate: string;
            endDate: string;
          }) => Promise<unknown>;
        }
      ).execute({
        startDate: "2026-07-17T00:00:00.000Z",
        endDate: "2026-08-15T23:59:59.999Z",
      });
      return { object: VALID_ANSWER };
    };

    const result = await askAiInsightsQuestion(QUESTION_INPUT, {
      analytics,
      generate,
    });

    expect(result.sources).toHaveLength(1);
    expect(result.sources[0].tool).toBe("getBranchPerformance");
  });

  it("rejects output missing required fields", async () => {
    const generate = makeGenerate({});

    await expect(
      askAiInsightsQuestion(QUESTION_INPUT, { analytics: makeAnalytics(), generate }),
    ).rejects.toThrow(AiValidationError);
  });

  it("rejects output with wrong field types", async () => {
    const generate = makeGenerate({
      ...VALID_ANSWER,
      keyPoints: "not an array",
    });

    await expect(
      askAiInsightsQuestion(QUESTION_INPUT, { analytics: makeAnalytics(), generate }),
    ).rejects.toThrow(AiValidationError);
  });

  it("wraps transport failures in AiProviderError", async () => {
    const generate: AssistantGenerateFn = async () => {
      throw new Error("network failure");
    };

    await expect(
      askAiInsightsQuestion(QUESTION_INPUT, { analytics: makeAnalytics(), generate }),
    ).rejects.toThrow(AiProviderError);
  });

  it("passes through typed AiError subclasses unchanged", async () => {
    const generate: AssistantGenerateFn = async () => {
      throw new AiValidationError("bad output");
    };

    await expect(
      askAiInsightsQuestion(QUESTION_INPUT, { analytics: makeAnalytics(), generate }),
    ).rejects.toThrow(AiValidationError);
  });
});

// ---------------------------------------------------------------------------
// Multi-tool reasoning support
// ---------------------------------------------------------------------------

describe("assistant multi-tool support", () => {
  it("supplies all seven tools for multi-step reasoning", () => {
    const tools = createInsightTools(makeAnalytics());
    expect(Object.keys(tools)).toHaveLength(7);
  });

  it("analyzes the fixture result as a full AiAssistantResult", () => {
    const result: AiAssistantResult = {
      ...VALID_ANSWER,
      sources: [{ tool: "getBranchPerformance", description: "Per-branch data" }],
    };
    expect(result.sources[0].tool).toBe("getBranchPerformance");
  });
});
