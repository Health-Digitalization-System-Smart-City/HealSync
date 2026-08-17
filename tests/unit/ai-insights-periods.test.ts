import { describe, expect, it } from "vitest";

import {
  addRating,
  aggregateRatingGroups,
  emptyBuckets,
  percentageOf,
  satisfactionRate,
  summarizeClinic,
  averageScore,
} from "@/lib/analytics/insights-helpers";
import {
  INSIGHT_PERIODS,
  isInsightPeriod,
  parseDateOnly,
  previousPeriodOfEqualLength,
  resolveInsightPeriod,
} from "@/lib/analytics/periods";

const NOW = new Date("2026-08-15T10:30:00");

describe("resolveInsightPeriod", () => {
  it("resolves today to the local calendar day with yesterday as the previous period", () => {
    const range = resolveInsightPeriod({ period: "today" }, NOW);

    expect(range.period).toBe("today");
    expect(range.start.getHours()).toBe(0);
    expect(range.end.getHours()).toBe(23);
    expect(range.start.toDateString()).toBe("Sat Aug 15 2026");
    expect(range.end.toDateString()).toBe("Sat Aug 15 2026");
    expect(range.label).toBe("Today");
    expect(range.previousLabel).toBe("Yesterday");
    expect(range.previousStart.toDateString()).toBe("Fri Aug 14 2026");
    expect(range.previousEnd.toDateString()).toBe("Fri Aug 14 2026");
  });

  it("resolves 7 days to a week-long window ending today", () => {
    const range = resolveInsightPeriod({ period: "7_days" }, NOW);

    expect(range.period).toBe("7_days");
    // Aug 15 minus 6 days = Aug 9 (7 calendar days including today).
    expect(range.start.toDateString()).toBe("Sun Aug 09 2026");
    expect(range.end.toDateString()).toBe("Sat Aug 15 2026");
    expect(range.previousEnd.toDateString()).toBe("Sat Aug 08 2026");
  });

  it("resolves 30 days to a ~month-long window", () => {
    const range = resolveInsightPeriod({ period: "30_days" }, NOW);

    expect(range.start.toDateString()).toBe("Fri Jul 17 2026");
    expect(range.end.toDateString()).toBe("Sat Aug 15 2026");
    expect(range.label).toBe("Last 30 Days");
  });

  it("resolves 12 months to a year-long window ending today", () => {
    const range = resolveInsightPeriod({ period: "12_months" }, NOW);

    expect(range.start.toDateString()).toBe("Fri Aug 15 2025");
    expect(range.end.toDateString()).toBe("Sat Aug 15 2026");
    expect(range.label).toBe("Last 12 Months");
  });

  it("resolves a custom range from YYYY-MM-DD strings", () => {
    const range = resolveInsightPeriod(
      { period: "custom", startDate: "2026-08-01", endDate: "2026-08-15" },
      NOW,
    );

    expect(range.start.toDateString()).toBe("Sat Aug 01 2026");
    expect(range.end.toDateString()).toBe("Sat Aug 15 2026");
    expect(range.label).toContain("Aug 1");
    expect(range.label).toContain("2026");
  });

  it("rejects a custom range without both dates", () => {
    expect(() =>
      resolveInsightPeriod({ period: "custom", startDate: "2026-08-01" }, NOW),
    ).toThrow(/both a start and an end date/);
  });

  it("rejects a custom range whose start is after its end", () => {
    expect(() =>
      resolveInsightPeriod(
        { period: "custom", startDate: "2026-08-15", endDate: "2026-08-01" },
        NOW,
      ),
    ).toThrow(/must not be after/);
  });

  it("rejects malformed dates", () => {
    expect(() => parseDateOnly("08/01/2026")).toThrow(/YYYY-MM-DD/);
    expect(() => parseDateOnly("2026-13-01")).toThrow(/YYYY-MM-DD/);
  });
});

describe("previousPeriodOfEqualLength", () => {
  it("computes the equal-length window immediately before the current period", () => {
    const { previousStart, previousEnd } = previousPeriodOfEqualLength(
      new Date("2026-08-09T00:00:00"),
      new Date("2026-08-15T23:59:59.999"),
    );

    expect(previousEnd.toDateString()).toBe("Sat Aug 08 2026");
    expect(previousStart.toDateString()).toBe("Sun Aug 02 2026");
  });
});

describe("isInsightPeriod", () => {
  it("accepts only the five period values", () => {
    for (const value of INSIGHT_PERIODS) {
      expect(isInsightPeriod(value)).toBe(true);
    }
    expect(isInsightPeriod("this_year")).toBe(false);
    expect(isInsightPeriod(42)).toBe(false);
  });
});

describe("rating bucketing helpers", () => {
  it("buckets ratings into positive/neutral/negative with score", () => {
    const buckets = emptyBuckets();
    addRating(buckets, "VERY_SATISFIED", 4); // score 7, positive
    addRating(buckets, "GOOD", 2); // score 4, neutral
    addRating(buckets, "POOR", 1); // score 1, negative

    expect(buckets.total).toBe(7);
    expect(buckets.positive).toBe(4);
    expect(buckets.neutral).toBe(2);
    expect(buckets.negative).toBe(1);
    expect(buckets.score).toBe(4 * 7 + 2 * 4 + 1 * 1);
  });

  it("aggregates Prisma groupBy rows into buckets", () => {
    const buckets = aggregateRatingGroups([
      { rating: "SATISFIED", _count: { _all: 3 } },
      { rating: "NOT_SATISFIED", _count: { _all: 1 } },
    ]);

    expect(buckets.total).toBe(4);
    expect(buckets.positive).toBe(3);
    expect(buckets.negative).toBe(1);
  });

  it("computes satisfaction rate and average score", () => {
    const buckets = aggregateRatingGroups([
      { rating: "SATISFIED", _count: { _all: 3 } },
      { rating: "NEUTRAL", _count: { _all: 1 } },
      { rating: "VERY_POOR", _count: { _all: 1 } },
    ]);

    expect(satisfactionRate(buckets)).toBe(60); // 3/5
    expect(averageScore(buckets)).toBe(4.2); // (3*6 + 1*3 + 1*0) / 5 = 21/5 = 4.2
  });

  it("summarizes clinic metrics from buckets", () => {
    const summary = summarizeClinic(
      aggregateRatingGroups([
        { rating: "VERY_SATISFIED", _count: { _all: 2 } },
        { rating: "GOOD", _count: { _all: 1 } },
        { rating: "POOR", _count: { _all: 1 } },
      ]),
    );

    expect(summary.feedbackCount).toBe(4);
    expect(summary.positiveCount).toBe(2);
    expect(summary.neutralCount).toBe(1);
    expect(summary.negativeCount).toBe(1);
    expect(summary.satisfactionRate).toBe(50);
  });

  it("handles empty buckets without dividing by zero", () => {
    const empty = emptyBuckets();
    expect(satisfactionRate(empty)).toBe(0);
    expect(averageScore(empty)).toBe(0);
    expect(summarizeClinic(empty).feedbackCount).toBe(0);
  });

  it("computes percentages to one decimal", () => {
    expect(percentageOf(24, 127)).toBe(18.9);
    expect(percentageOf(0, 100)).toBe(0);
    expect(percentageOf(10, 0)).toBe(0);
  });
});
