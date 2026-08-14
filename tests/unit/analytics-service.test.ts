import { describe, expect, it } from "vitest";
import { computeAnalyticsDashboard } from "@/lib/analytics/service";
import { createFeedbackStore } from "@/lib/feedback/store";

describe("computeAnalyticsDashboard", () => {
  it("calculates summary metrics accurately for all time", () => {
    const store = createFeedbackStore();
    const data = computeAnalyticsDashboard(store, { range: "all" });

    expect(data.totalCountInPeriod).toBe(store.records.length);
    expect(data.summary.totalFeedback).toBe(store.records.length);
    expect(data.summary.satisfactionRate).toBeGreaterThanOrEqual(0);
    expect(data.summary.satisfactionRate).toBeLessThanOrEqual(100);
    expect(
      data.summary.positiveFeedback +
        data.summary.neutralFeedback +
        data.summary.negativeFeedback,
    ).toBe(store.records.length);
    expect(data.summary.avgRatingScore).toBeGreaterThanOrEqual(0);
    expect(data.summary.avgRatingScore).toBeLessThanOrEqual(7);
  });

  it("filters analytics by today", () => {
    const store = createFeedbackStore();
    const data = computeAnalyticsDashboard(store, { range: "today" });

    const now = new Date();
    const expected = store.records.filter((r) => {
      const d = new Date(r.createdAt);
      return d.toDateString() === now.toDateString();
    }).length;

    expect(data.totalCountInPeriod).toBe(expected);
    expect(data.summary.totalFeedback).toBe(expected);
  });

  it("filters analytics by yesterday", () => {
    const store = createFeedbackStore();
    const data = computeAnalyticsDashboard(store, { range: "yesterday" });

    const now = new Date();
    const y = new Date(now);
    y.setDate(y.getDate() - 1);

    const expected = store.records.filter((r) => {
      const d = new Date(r.createdAt);
      return d.toDateString() === y.toDateString();
    }).length;

    expect(data.totalCountInPeriod).toBe(expected);
    expect(data.summary.totalFeedback).toBe(expected);
  });

  it("filters analytics by this_week", () => {
    const store = createFeedbackStore();
    const data = computeAnalyticsDashboard(store, { range: "this_week" });

    expect(data.totalCountInPeriod).toBeGreaterThanOrEqual(0);
    expect(data.totalCountInPeriod).toBeLessThanOrEqual(store.records.length);
  });

  it("filters analytics by this_month and this_year", () => {
    const store = createFeedbackStore();
    const thisMonth = computeAnalyticsDashboard(store, { range: "this_month" });
    const thisYear = computeAnalyticsDashboard(store, { range: "this_year" });

    expect(thisMonth.totalCountInPeriod).toBeLessThanOrEqual(
      thisYear.totalCountInPeriod,
    );
  });

  it("filters analytics by custom date range", () => {
    const store = createFeedbackStore();
    const data = computeAnalyticsDashboard(store, {
      range: "custom",
      startDate: "2000-01-01",
      endDate: "2100-01-01",
    });

    expect(data.totalCountInPeriod).toBe(store.records.length);
  });

  it("filters analytics by branchId", () => {
    const store = createFeedbackStore();
    const branchId = "br-main";
    const data = computeAnalyticsDashboard(store, { branchId });

    const expected = store.records.filter(
      (r) => r.branchId === branchId,
    ).length;
    expect(data.totalCountInPeriod).toBe(expected);
    expect(data.summary.totalFeedback).toBe(expected);
  });

  it("filters analytics by serviceId", () => {
    const store = createFeedbackStore();
    const serviceId = "sv-general";
    const data = computeAnalyticsDashboard(store, { serviceId });

    const expected = store.records.filter(
      (r) => r.serviceId === serviceId,
    ).length;
    expect(data.totalCountInPeriod).toBe(expected);
    expect(data.summary.totalFeedback).toBe(expected);
  });

  it("produces structured satisfaction distribution for all 8 ratings", () => {
    const store = createFeedbackStore();
    const data = computeAnalyticsDashboard(store, { range: "all" });

    expect(data.distribution).toHaveLength(8);
    const sumCount = data.distribution.reduce(
      (acc, item) => acc + item.count,
      0,
    );
    expect(sumCount).toBe(store.records.length);
  });

  it("computes branch comparison for all store branches", () => {
    const store = createFeedbackStore();
    const data = computeAnalyticsDashboard(store, { range: "all" });

    expect(data.branchComparison).toHaveLength(store.branches.length);
    const sumTotal = data.branchComparison.reduce(
      (acc, b) => acc + b.totalFeedback,
      0,
    );
    expect(sumTotal).toBe(store.records.length);
  });

  it("computes service comparison for all store services", () => {
    const store = createFeedbackStore();
    const data = computeAnalyticsDashboard(store, { range: "all" });

    expect(data.serviceComparison).toHaveLength(store.services.length);
    const sumTotal = data.serviceComparison.reduce(
      (acc, s) => acc + s.totalFeedback,
      0,
    );
    expect(sumTotal).toBe(store.records.length);
  });

  it("handles empty period gracefully with 0 totals and empty trends", () => {
    const store = createFeedbackStore();
    const data = computeAnalyticsDashboard(store, {
      range: "custom",
      startDate: "1990-01-01",
      endDate: "1990-01-02",
    });

    expect(data.totalCountInPeriod).toBe(0);
    expect(data.summary.totalFeedback).toBe(0);
    expect(data.summary.satisfactionRate).toBe(0);
    expect(data.summary.negativeFeedback).toBe(0);
    expect(data.summary.avgRatingScore).toBe(0);
    expect(data.trends).toHaveLength(0);
  });
});
