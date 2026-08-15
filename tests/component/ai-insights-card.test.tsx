// @vitest-environment jsdom
//
// AI Insights card states: success, no-feedback, and the graceful error.
// The server action is mocked — these tests verify the UI renders each state
// correctly, not the action's behavior.

import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { AiInsightsCard } from "@/components/ai-insights/ai-insights-card";
import type { DailyAIInsightResult } from "@/lib/ai/schema";
import type { DailyInsightsResult } from "@/lib/ai-insights/types";

vi.mock("@/features/analytics/actions", () => ({
  generateFeedbackInsights: vi.fn(),
}));

const SUCCESS: DailyInsightsResult = {
  status: "ok",
  feedbackCount: 3,
  cached: false,
  insight: {
    summary:
      "Today's feedback was generally positive. Waiting time was the most common complaint.",
    overallSentiment: "positive",
    keyFindings: [
      {
        type: "negative",
        title: "Waiting time",
        explanation: "Long waiting times were the most common complaint.",
        evidenceCount: 18,
      },
    ],
    recommendations: [
      {
        priority: "high",
        title: "Review waiting times",
        explanation: "Waiting-time complaints were common today.",
      },
    ],
    themes: [{ name: "Waiting Time", sentiment: "negative", count: 18 }],
    metadata: {
      feedbackCount: 3,
      generatedAt: "2026-08-15T10:00:00.000Z",
      period: "today",
    },
  } satisfies DailyAIInsightResult,
};

describe("AiInsightsCard", () => {
  it("renders the success state: summary, findings, themes, recommendations, and metadata", () => {
    render(<AiInsightsCard initial={SUCCESS} />);

    expect(screen.getByText("AI Insights")).toBeTruthy();
    expect(screen.getByText(/generally positive/i)).toBeTruthy();
    expect(screen.getByText("Waiting time")).toBeTruthy();
    expect(screen.getByText(/Mentioned in 18 submissions/i)).toBeTruthy();
    expect(screen.getByText("Review waiting times")).toBeTruthy();
    expect(screen.getByText("Waiting Time")).toBeTruthy();
    expect(
      screen.getByText(/Based on 3 feedback submissions today/i),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: /Refresh Analysis/i }),
    ).toBeTruthy();
  });

  it("renders the no-feedback state without AI content", () => {
    render(
      <AiInsightsCard initial={{ status: "no-feedback", feedbackCount: 0 }} />,
    );

    expect(
      screen.getByText(/No patient feedback has been submitted today yet/i),
    ).toBeTruthy();
    expect(
      screen.queryByText(/Based on .* feedback submissions today/i),
    ).toBeNull();
  });

  it("renders the graceful error state when the server-side fetch failed", () => {
    render(<AiInsightsCard initial={null} />);

    expect(
      screen.getByText(/Today's AI analysis is temporarily unavailable/i),
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: /Try again/i })).toBeTruthy();
  });

  it("shows the cached indicator when served from cache", () => {
    render(
      <AiInsightsCard initial={{ ...SUCCESS, cached: true, status: "ok" }} />,
    );
    expect(screen.getByText("cached")).toBeTruthy();
  });
});
