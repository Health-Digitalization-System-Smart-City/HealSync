import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/permissions", () => ({
  requirePermission: vi.fn(),
}));

vi.mock("@/lib/ai-insights/period-service", () => ({
  periodInsightsService: { getPeriodInsights: vi.fn() },
  AI_INSIGHT_TYPE_PERIOD: "period_summary",
}));

vi.mock("@/lib/ai-insights/page-data", () => ({
  buildAiInsightsPageData: vi.fn(),
}));

vi.mock("@/lib/ai/assistant", () => ({
  askAiInsightsQuestion: vi.fn(),
}));

vi.mock("@/lib/ai/rate-limit", () => ({
  askAiRateLimiter: { allow: vi.fn(() => true) },
  getAskAiMaxLength: vi.fn(() => 500),
}));

vi.mock("@/lib/ai/tools", () => ({
  productionAnalyticsPort: {},
}));

import * as auth from "@/lib/auth/permissions";
import * as actions from "@/features/ai-insights/actions";

const requirePermission = vi.mocked(auth.requirePermission);

function okAuth() {
  requirePermission.mockResolvedValue({
    success: true,
    data: { user: { id: "user-1" } as never, permissions: [] },
  });
}

function denyAuth() {
  requirePermission.mockResolvedValue({
    success: false,
    error: { code: "FORBIDDEN", message: "denied" },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  okAuth();
});

describe("AI Insights server-action authorization", () => {
  it("denies getAiInsightsPageData without analytics.ai", async () => {
    denyAuth();
    const result = await actions.getAiInsightsPageData({ period: "today" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("FORBIDDEN");
  });

  it("denies generateAiInsight without analytics.ai", async () => {
    denyAuth();
    const result = await actions.generateAiInsight({ period: "today" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("FORBIDDEN");
  });

  it("denies askAiInsights without analytics.ai", async () => {
    denyAuth();
    const result = await actions.askAiInsights({
      question: "Which branch performed best?",
      periodLabel: "Today",
      startDate: "2026-08-15T00:00:00.000Z",
      endDate: "2026-08-15T23:59:59.999Z",
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("FORBIDDEN");
  });

  it("requires the analytics.ai permission server-side (never only UI hiding)", async () => {
    expect(requirePermission).toBeDefined();
    await actions.getAiInsightsPageData({ period: "today" });
    await actions.askAiInsights({
      question: "What improved this period?",
      periodLabel: "Today",
      startDate: "2026-08-15T00:00:00.000Z",
      endDate: "2026-08-15T23:59:59.999Z",
    });
    // The permission name used by every AI Insights action.
    const calls = requirePermission.mock.calls.map((c) => c[0]);
    expect(calls).toContain("analytics.ai");
    expect(calls.every((c) => c === "analytics.ai")).toBe(true);
  });

  it("rejects invalid period selections with VALIDATION_ERROR", async () => {
    const result = await actions.getAiInsightsPageData({ period: "this_year" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("VALIDATION_ERROR");
  });

  it("rejects an empty question with VALIDATION_ERROR", async () => {
    const result = await actions.askAiInsights({
      question: "   ",
      periodLabel: "Today",
      startDate: "2026-08-15T00:00:00.000Z",
      endDate: "2026-08-15T23:59:59.999Z",
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns RATE_LIMITED when the user exceeds the Ask AI budget", async () => {
    const { askAiRateLimiter } = await import("@/lib/ai/rate-limit");
    vi.mocked(askAiRateLimiter.allow).mockReturnValue(false);

    const result = await actions.askAiInsights({
      question: "Which branch needs attention?",
      periodLabel: "Today",
      startDate: "2026-08-15T00:00:00.000Z",
      endDate: "2026-08-15T23:59:59.999Z",
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("RATE_LIMITED");
  });
});
