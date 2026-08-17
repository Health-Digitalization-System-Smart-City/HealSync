import { describe, expect, it, vi } from "vitest";

import { createInsightTools, TOOL_NAMES } from "@/lib/ai/tools";
import {
  createToolCallRecorder,
  dedupeToolRecords,
} from "@/lib/ai/tools/recorder";
import {
  dateRangeSchema,
  dateTimeStringSchema,
  sampleLimitSchema,
} from "@/lib/ai/tools/schemas";
import type { AnalyticsPort } from "@/lib/ai/tools/types";
import type {
  BranchPerformanceItem,
  ClinicSummary,
  ServicePerformanceItem,
} from "@/lib/analytics/insights-types";
import { MAX_NEGATIVE_FEEDBACK_LIMIT } from "@/lib/analytics/feedback";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const SUMMARY: ClinicSummary = {
  feedbackCount: 42,
  averageRating: 4.3,
  satisfactionRate: 71,
  positiveCount: 30,
  neutralCount: 5,
  negativeCount: 7,
};

const BRANCHES: BranchPerformanceItem[] = [
  {
    branchId: "br-1",
    branchName: "Branch 1",
    feedbackCount: 20,
    averageRating: 4.5,
    satisfactionRate: 85,
    changeFromPreviousPeriod: 3,
  },
  {
    branchId: "br-2",
    branchName: "Branch 2",
    feedbackCount: 10,
    averageRating: 3.1,
    satisfactionRate: 40,
    changeFromPreviousPeriod: -8,
  },
];

const SERVICES: ServicePerformanceItem[] = [
  {
    serviceId: "sv-1",
    serviceName: "Laboratory",
    feedbackCount: 15,
    averageRating: 4.8,
    satisfactionRate: 90,
    changeFromPreviousPeriod: 2,
  },
];

function makeAnalytics(overrides: Partial<AnalyticsPort> = {}): AnalyticsPort {
  return {
    getClinicSummary: vi.fn(async () => SUMMARY),
    getBranchPerformance: vi.fn(async () => BRANCHES),
    getServicePerformance: vi.fn(async () => SERVICES),
    getFeedbackTrends: vi.fn(async () => []),
    getFeedbackThemes: vi.fn(async () => ({
      themes: [],
      analyzedFeedbackCount: 0,
      feedbackCountInPeriod: 0,
    })),
    getNegativeFeedback: vi.fn(async () => []),
    comparePeriods: vi.fn(async () => ({
      current: SUMMARY,
      previous: SUMMARY,
      changes: { feedbackCount: 0, averageRating: 0, satisfactionRate: 0 },
    })),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tool set shape
// ---------------------------------------------------------------------------

describe("createInsightTools", () => {
  it("exposes exactly the seven predefined tools", () => {
    const tools = createInsightTools(makeAnalytics());
    expect(Object.keys(tools).sort()).toEqual([...TOOL_NAMES].sort());
  });

  it("does not expose any database-access capability", () => {
    const tools = createInsightTools(makeAnalytics());
    for (const tool of Object.values(tools) as Array<{
      description?: string;
      inputSchema?: unknown;
      execute?: unknown;
    }>) {
      expect(tool).not.toHaveProperty("prisma");
      expect(tool).not.toHaveProperty("sql");
      expect(tool).not.toHaveProperty("db");
      expect(typeof tool.description).toBe("string");
    }
  });
});

// ---------------------------------------------------------------------------
// Input validation (PRD §26 — never trust LLM arguments)
// ---------------------------------------------------------------------------

describe("tool input schemas", () => {
  it("accepts valid ISO date strings", () => {
    expect(
      dateTimeStringSchema.safeParse("2026-08-01T00:00:00.000Z").success,
    ).toBe(true);
    expect(
      dateTimeStringSchema.safeParse("2026-08-01").success,
    ).toBe(true);
  });

  it("rejects non-date strings", () => {
    expect(dateTimeStringSchema.safeParse("not-a-date").success).toBe(false);
    expect(dateTimeStringSchema.safeParse("").success).toBe(false);
  });

  it("rejects date ranges with an invalid start or end", () => {
    expect(
      dateRangeSchema.safeParse({
        startDate: "garbage",
        endDate: "2026-08-15T00:00:00.000Z",
      }).success,
    ).toBe(false);
    expect(
      dateRangeSchema.safeParse({}).success,
    ).toBe(false);
  });

  it("caps the negative-feedback sample limit at 20", () => {
    expect(sampleLimitSchema.safeParse(5).success).toBe(true);
    expect(sampleLimitSchema.safeParse(0).success).toBe(false);
    expect(sampleLimitSchema.safeParse(100).success).toBe(false);
    expect(sampleLimitSchema.safeParse(1.5).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Tool execution: the tools call analytics, never Prisma
// ---------------------------------------------------------------------------

describe("tool execution", () => {
  it("getClinicSummary calls the analytics layer with parsed dates", async () => {
    const analytics = makeAnalytics();
    const tools = createInsightTools(analytics);

    const tool =
      tools.getClinicSummary as unknown as {
        execute: (args: {
          startDate: string;
          endDate: string;
        }) => Promise<ClinicSummary>;
      };
    const result = await tool.execute({
      startDate: "2026-08-01T00:00:00.000Z",
      endDate: "2026-08-15T23:59:59.999Z",
    });

    expect(result).toEqual(SUMMARY);
    expect(analytics.getClinicSummary).toHaveBeenCalledWith(
      expect.any(Date),
      expect.any(Date),
    );
  });

  it("getBranchPerformance passes the previous period for the change", async () => {
    const analytics = makeAnalytics();
    const tools = createInsightTools(analytics);

    const tool =
      tools.getBranchPerformance as unknown as {
        execute: (args: {
          startDate: string;
          endDate: string;
        }) => Promise<BranchPerformanceItem[]>;
      };
    await tool.execute({
      startDate: "2026-08-08T00:00:00.000Z",
      endDate: "2026-08-15T23:59:59.999Z",
    });

    const [start, end, previousStart, previousEnd] =
      vi.mocked(analytics.getBranchPerformance).mock.calls[0];
    expect(start).toBeInstanceOf(Date);
    expect(end).toBeInstanceOf(Date);
    // Previous period is the equal-length window immediately before.
    expect((previousStart as Date).getTime()).toBeLessThan(
      (start as Date).getTime(),
    );
    expect((previousEnd as Date).getTime()).toBeLessThan(
      (start as Date).getTime(),
    );
  });

  it("getNegativeFeedback never receives an unbounded limit", async () => {
    const analytics = makeAnalytics();
    const tools = createInsightTools(analytics);

    const tool =
      tools.getNegativeFeedback as unknown as {
        execute: (args: {
          startDate: string;
          endDate: string;
          limit?: number;
        }) => Promise<unknown[]>;
      };
    await tool.execute({
      startDate: "2026-08-01T00:00:00.000Z",
      endDate: "2026-08-15T23:59:59.999Z",
      limit: 500,
    });

    const input = vi.mocked(analytics.getNegativeFeedback).mock.calls[0][0];
    expect(input.limit).toBeLessThanOrEqual(MAX_NEGATIVE_FEEDBACK_LIMIT);
  });
});

// ---------------------------------------------------------------------------
// Privacy — no patient-identifying fields in tool results
// ---------------------------------------------------------------------------

describe("tool privacy", () => {
  it("the negative-feedback tool result contains no PII fields", async () => {
    const analytics = makeAnalytics({
      getNegativeFeedback: vi.fn(async () => [
        {
          rating: "POOR" as const,
          ratingLabel: "Poor",
          ratingScore: 1,
          text: "Waited too long at reception.",
          branchName: "Branch 1",
          serviceName: "Reception",
          createdAt: "2026-08-10T09:00:00.000Z",
        },
      ]),
    });
    const tools = createInsightTools(analytics);

    const tool = tools.getNegativeFeedback as unknown as {
      execute: (args: {
        startDate: string;
        endDate: string;
      }) => Promise<Array<Record<string, unknown>>>;
    };
    const result = await tool.execute({
      startDate: "2026-08-01T00:00:00.000Z",
      endDate: "2026-08-15T23:59:59.999Z",
    });

    expect(result).toHaveLength(1);
    const item = result[0];
    expect(item).not.toHaveProperty("phoneNumber");
    expect(item).not.toHaveProperty("phoneNumberHash");
    expect(item).not.toHaveProperty("patientId");
    expect(item).not.toHaveProperty("patientName");
    expect(Object.keys(item).sort()).toEqual(
      [
        "branchName",
        "createdAt",
        "rating",
        "ratingLabel",
        "ratingScore",
        "serviceName",
        "text",
      ].sort(),
    );
  });
});

// ---------------------------------------------------------------------------
// Tool-call recording (sources for the assistant)
// ---------------------------------------------------------------------------

describe("tool call recorder", () => {
  it("records each executed tool with a description", async () => {
    const { record, records } = createToolCallRecorder();
    const analytics = makeAnalytics();
    const tools = createInsightTools(analytics, record);

    await (
      tools.getClinicSummary as unknown as {
        execute: (a: { startDate: string; endDate: string }) => Promise<unknown>;
      }
    ).execute({
      startDate: "2026-08-01T00:00:00.000Z",
      endDate: "2026-08-15T23:59:59.999Z",
    });

    expect(records).toHaveLength(1);
    expect(records[0].tool).toBe("getClinicSummary");
    expect(records[0].description.length).toBeGreaterThan(0);
  });

  it("deduplicates repeated tool calls preserving first-seen order", () => {
    const { records } = createToolCallRecorder();
    const tool = "getBranchPerformance";
    records.push({ tool, description: "a" });
    records.push({ tool, description: "b" });
    records.push({ tool: "getClinicSummary", description: "c" });

    const deduped = dedupeToolRecords(records);
    expect(deduped).toHaveLength(2);
    expect(deduped[0].tool).toBe("getBranchPerformance");
    expect(deduped[1].tool).toBe("getClinicSummary");
  });
});
