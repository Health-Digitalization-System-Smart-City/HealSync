import { beforeEach, describe, expect, it, vi } from "vitest";

import { getClinicSummary } from "@/lib/analytics/clinic";
import { getBranchPerformance } from "@/lib/analytics/branches";
import { getServicePerformance } from "@/lib/analytics/services";
import { getFeedbackTrends } from "@/lib/analytics/trends";
import { getFeedbackThemes } from "@/lib/analytics/themes";
import {
  getNegativeFeedbackSample,
  MAX_NEGATIVE_FEEDBACK_LIMIT,
} from "@/lib/analytics/feedback";
import { comparePeriods } from "@/lib/analytics/compare";

const dbMock = vi.hoisted(() => ({
  feedback: {
    groupBy: vi.fn(),
    count: vi.fn(),
    findMany: vi.fn(),
  },
  branch: { findMany: vi.fn() },
  service: { findMany: vi.fn() },
  aIInsight: { findMany: vi.fn() },
}));

vi.mock("@/lib/db", () => ({ db: dbMock }));

const START = new Date("2026-08-01T00:00:00");
const END = new Date("2026-08-15T23:59:59.999");

beforeEach(() => {
  // resetAllMocks also clears queued mockResolvedValueOnce implementations so
  // partially-consumed queues cannot leak between tests. Empty defaults keep
  // tests that only assert call shapes from crashing on undefined results.
  vi.resetAllMocks();
  dbMock.feedback.groupBy.mockResolvedValue([]);
  dbMock.feedback.count.mockResolvedValue(0);
  dbMock.feedback.findMany.mockResolvedValue([]);
  dbMock.branch.findMany.mockResolvedValue([]);
  dbMock.service.findMany.mockResolvedValue([]);
  dbMock.aIInsight.findMany.mockResolvedValue([]);
});

describe("getClinicSummary", () => {
  it("computes counts, satisfaction, and average from rating groups", async () => {
    dbMock.feedback.groupBy.mockResolvedValue([
      { rating: "VERY_SATISFIED", _count: { _all: 3 } }, // 7 pts
      { rating: "GOOD", _count: { _all: 2 } }, // 4 pts, neutral
      { rating: "POOR", _count: { _all: 1 } }, // 1 pt, negative
    ]);

    const summary = await getClinicSummary(START, END);

    expect(summary.feedbackCount).toBe(6);
    expect(summary.positiveCount).toBe(3);
    expect(summary.neutralCount).toBe(2);
    expect(summary.negativeCount).toBe(1);
    expect(summary.satisfactionRate).toBe(50);
    expect(summary.averageRating).toBe(5); // (3*7 + 2*4 + 1*1)/6 = 30/6
  });

  it("filters the groupBy by the date range and soft-deleted rows", async () => {
    await getClinicSummary(START, END);

    expect(dbMock.feedback.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { deletedAt: null, createdAt: { gte: START, lte: END } },
        _count: { _all: true },
      }),
    );
  });
});

describe("getBranchPerformance", () => {
  it("ranks branches and computes change vs the previous period", async () => {
    dbMock.feedback.groupBy
      .mockResolvedValueOnce([
        { branchId: "br-b", rating: "VERY_SATISFIED", _count: { _all: 2 } },
        { branchId: "br-a", rating: "POOR", _count: { _all: 1 } },
      ])
      .mockResolvedValueOnce([
        { branchId: "br-b", rating: "SATISFIED", _count: { _all: 1 } },
        { branchId: "br-a", rating: "VERY_SATISFIED", _count: { _all: 4 } },
      ]);
    dbMock.branch.findMany.mockResolvedValue([
      { id: "br-a", name: "Branch A" },
      { id: "br-b", name: "Branch B" },
    ]);

    const branches = await getBranchPerformance(
      START,
      END,
      new Date("2026-07-16"),
      new Date("2026-07-31"),
    );

    expect(branches).toHaveLength(2);
    // Sorted by feedback count desc.
    expect(branches[0].branchName).toBe("Branch B");
    expect(branches[0].feedbackCount).toBe(2);
    expect(branches[0].satisfactionRate).toBe(100);
    // Change vs previous period: 100 - 100 = 0.
    expect(branches[0].changeFromPreviousPeriod).toBe(0);

    expect(branches[1].branchName).toBe("Branch A");
    expect(branches[1].satisfactionRate).toBe(0);
    // Previous period: 4/4 positive = 100 → change = 0 - 100 = -100.
    expect(branches[1].changeFromPreviousPeriod).toBe(-100);
  });

  it("returns no previous-period change when the previous period is omitted", async () => {
    dbMock.feedback.groupBy
      .mockResolvedValueOnce([
        { branchId: "br-a", rating: "SATISFIED", _count: { _all: 2 } },
      ])
      .mockResolvedValueOnce([]);
    dbMock.branch.findMany.mockResolvedValue([
      { id: "br-a", name: "Branch A" },
    ]);

    const branches = await getBranchPerformance(START, END);

    expect(branches[0].changeFromPreviousPeriod).toBeNull();
  });

  it("omits branches with no feedback in the period", async () => {
    dbMock.feedback.groupBy.mockResolvedValueOnce([]);
    dbMock.branch.findMany.mockResolvedValue([
      { id: "br-a", name: "Branch A" },
    ]);

    const branches = await getBranchPerformance(START, END);

    expect(branches).toHaveLength(0);
  });
});

describe("getServicePerformance", () => {
  it("ranks services and computes change vs the previous period", async () => {
    dbMock.feedback.groupBy
      .mockResolvedValueOnce([
        { serviceId: "sv-lab", rating: "VERY_SATISFIED", _count: { _all: 3 } },
        { serviceId: "sv-out", rating: "POOR", _count: { _all: 2 } },
      ])
      .mockResolvedValueOnce([]);
    dbMock.service.findMany.mockResolvedValue([
      { id: "sv-lab", name: "Laboratory" },
      { id: "sv-out", name: "Outpatient" },
    ]);

    const services = await getServicePerformance(
      START,
      END,
      new Date("2026-07-16"),
      new Date("2026-07-31"),
    );

    expect(services).toHaveLength(2);
    expect(services[0].serviceName).toBe("Laboratory");
    expect(services[0].satisfactionRate).toBe(100);
    expect(services[0].changeFromPreviousPeriod).toBeNull();
    expect(services[1].serviceName).toBe("Outpatient");
    expect(services[1].satisfactionRate).toBe(0);
  });
});

describe("getFeedbackTrends", () => {
  it("buckets rows by day with deterministic metrics", async () => {
    dbMock.feedback.findMany.mockResolvedValue([
      { rating: "VERY_SATISFIED", createdAt: new Date("2026-08-01T09:00:00") },
      { rating: "POOR", createdAt: new Date("2026-08-01T10:00:00") },
      { rating: "SATISFIED", createdAt: new Date("2026-08-02T09:00:00") },
    ]);

    const trends = await getFeedbackTrends(START, END, "day");

    expect(trends).toHaveLength(2);
    expect(trends[0].period).toBe("2026-08-01");
    expect(trends[0].feedbackCount).toBe(2);
    expect(trends[0].satisfactionRate).toBe(50);
    expect(trends[0].averageRating).toBe(4);
    expect(trends[1].period).toBe("2026-08-02");
    expect(trends[1].feedbackCount).toBe(1);
    expect(trends[1].satisfactionRate).toBe(100);
  });

  it("selects only rating and createdAt (no PII)", async () => {
    await getFeedbackTrends(START, END, "week");

    expect(dbMock.feedback.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        select: { rating: true, createdAt: true },
      }),
    );
  });

  it("buckets by month", async () => {
    dbMock.feedback.findMany.mockResolvedValue([
      { rating: "SATISFIED", createdAt: new Date("2026-08-15T09:00:00") },
      { rating: "SATISFIED", createdAt: new Date("2026-07-01T09:00:00") },
    ]);

    const trends = await getFeedbackTrends(START, END, "month");

    expect(trends.map((t) => t.period)).toEqual(["2026-07", "2026-08"]);
  });
});

describe("getFeedbackThemes", () => {
  it("aggregates theme counts from stored daily insights with coverage", async () => {
    dbMock.aIInsight.findMany.mockResolvedValue([
      {
        feedbackCount: 10,
        content: {
          themes: [
            { name: "Waiting Time", count: 4 },
            { name: "Staff Friendliness", count: 6 },
          ],
        },
      },
      {
        feedbackCount: 5,
        content: {
          themes: [
            { name: "waiting time", count: 2 },
            { name: "Cleanliness", count: 3 },
          ],
        },
      },
    ]);
    dbMock.feedback.count.mockResolvedValue(15);

    const result = await getFeedbackThemes(START, END);

    // "Waiting Time" and "waiting time" normalize to one theme.
    expect(result.themes[0].name).toBe("Waiting Time");
    expect(result.themes[0].count).toBe(6);
    expect(result.analyzedFeedbackCount).toBe(15);
    expect(result.feedbackCountInPeriod).toBe(15);
  });

  it("returns empty themes with honest coverage when no daily insights exist", async () => {
    dbMock.aIInsight.findMany.mockResolvedValue([]);
    dbMock.feedback.count.mockResolvedValue(100);

    const result = await getFeedbackThemes(START, END);

    expect(result.themes).toHaveLength(0);
    expect(result.analyzedFeedbackCount).toBe(0);
    expect(result.feedbackCountInPeriod).toBe(100);
  });

  it("only counts fully-contained daily insights (no boundary double count)", async () => {
    await getFeedbackThemes(START, END);

    expect(dbMock.aIInsight.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          type: "daily",
          periodStart: { gte: START },
          periodEnd: { lte: END },
        },
      }),
    );
  });
});

describe("getNegativeFeedbackSample", () => {
  const NEGATIVE_ROW = {
    rating: "POOR",
    comment: "Waited too long at reception.",
    createdAt: new Date("2026-08-10T09:00:00.000Z"),
    branch: { name: "Branch 1" },
    service: { name: "Reception" },
  };

  it("returns de-identified negative feedback with comments only", async () => {
    dbMock.feedback.findMany.mockResolvedValue([NEGATIVE_ROW]);

    const items = await getNegativeFeedbackSample({ start: START, end: END });

    expect(items).toHaveLength(1);
    expect(items[0]).toEqual({
      rating: "POOR",
      ratingLabel: "Poor",
      ratingScore: 1,
      text: "Waited too long at reception.",
      branchName: "Branch 1",
      serviceName: "Reception",
      createdAt: "2026-08-10T09:00:00.000Z",
    });
    // No PII fields.
    expect(items[0]).not.toHaveProperty("phoneNumber");
    expect(items[0]).not.toHaveProperty("phoneNumberHash");
    expect(items[0]).not.toHaveProperty("patientId");
  });

  it("filters out positive/neutral ratings and empty comments", async () => {
    dbMock.feedback.findMany.mockResolvedValue([
      { ...NEGATIVE_ROW, rating: "SATISFIED" }, // not needs-attention
      { ...NEGATIVE_ROW, rating: "VERY_POOR", comment: "   " }, // empty comment
      { ...NEGATIVE_ROW, rating: "POOR", comment: "Long queue." },
    ]);

    const items = await getNegativeFeedbackSample({ start: START, end: END });

    expect(items).toHaveLength(1);
    expect(items[0].text).toBe("Long queue.");
  });

  it("caps the limit at MAX_NEGATIVE_FEEDBACK_LIMIT and never selects PII", async () => {
    await getNegativeFeedbackSample({
      start: START,
      end: END,
      limit: 500,
    });

    const call = dbMock.feedback.findMany.mock.calls[0][0];
    expect(call.take).toBe(MAX_NEGATIVE_FEEDBACK_LIMIT * 4);
    expect(call.select).not.toHaveProperty("phoneNumber");
    expect(call.select).not.toHaveProperty("phoneNumberHash");
  });
});

describe("comparePeriods", () => {
  it("computes both metric sets plus absolute changes", async () => {
    dbMock.feedback.groupBy
      .mockResolvedValueOnce([
        { rating: "VERY_SATISFIED", _count: { _all: 2 } },
        { rating: "POOR", _count: { _all: 1 } },
      ])
      .mockResolvedValueOnce([
        { rating: "SATISFIED", _count: { _all: 3 } },
        { rating: "NOT_SATISFIED", _count: { _all: 1 } },
      ]);

    const comparison = await comparePeriods({
      currentStart: START,
      currentEnd: END,
      previousStart: new Date("2026-07-16"),
      previousEnd: new Date("2026-07-31"),
    });

    expect(comparison.current.feedbackCount).toBe(3);
    expect(comparison.previous.feedbackCount).toBe(4);
    expect(comparison.changes.feedbackCount).toBe(-1);
    expect(comparison.current.satisfactionRate).toBe(67);
    expect(comparison.previous.satisfactionRate).toBe(75);
    expect(comparison.changes.satisfactionRate).toBe(-8);
  });
});
