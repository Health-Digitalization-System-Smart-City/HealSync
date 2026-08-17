// @vitest-environment jsdom
//
// AI Insights page states: initial loading, deterministic analytics + AI
// summary rendering, the Ask AI panel, and error handling. Server actions are
// mocked — these tests verify the UI renders each state correctly.

import { describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { AiInsightsWorkspace } from "@/components/ai-insights/ai-insights-workspace";
import { AskAiPanel } from "@/components/ai-insights/ask-ai-panel";
import type { AiInsightsPageData } from "@/lib/ai-insights/page-data";
import * as actions from "@/features/ai-insights/actions";

vi.mock("@/features/ai-insights/actions", () => ({
  getAiInsightsPageData: vi.fn(),
  generateAiInsight: vi.fn(),
  askAiInsights: vi.fn(),
}));

const getAiInsightsPageData = vi.mocked(actions.getAiInsightsPageData);
const askAiInsights = vi.mocked(actions.askAiInsights);

function renderWorkspace() {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  });
  return render(
    <QueryClientProvider client={client}>
      <AiInsightsWorkspace />
    </QueryClientProvider>,
  );
}

function makePageData(
  overrides: Partial<AiInsightsPageData> = {},
): AiInsightsPageData {
  return {
    period: {
      value: "today",
      label: "Today",
      startDate: "2026-08-15T00:00:00.000Z",
      endDate: "2026-08-15T23:59:59.999Z",
      previousLabel: "Yesterday",
    },
    feedbackCount: 42,
    analytics: {
      summary: {
        feedbackCount: 42,
        averageRating: 4.3,
        satisfactionRate: 71,
        positiveCount: 30,
        neutralCount: 5,
        negativeCount: 7,
      },
      branches: [
        {
          branchId: "br-1",
          branchName: "Branch 1",
          feedbackCount: 20,
          averageRating: 4.5,
          satisfactionRate: 85,
          changeFromPreviousPeriod: 3,
        },
      ],
      services: [
        {
          serviceId: "sv-1",
          serviceName: "Laboratory",
          feedbackCount: 15,
          averageRating: 4.8,
          satisfactionRate: 90,
          changeFromPreviousPeriod: null,
        },
      ],
      themes: [{ name: "Waiting Time", count: 6, percentage: 14.3 }],
      themesCoverage: {
        analyzedFeedbackCount: 10,
        feedbackCountInPeriod: 42,
      },
      comparison: {
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
        changes: {
          feedbackCount: 2,
          averageRating: -0.2,
          satisfactionRate: -7,
        },
      },
    },
    insight: null,
    insightCached: false,
    ...overrides,
  };
}

describe("AiInsightsWorkspace", () => {
  it("renders the period selector and deterministic analytics", async () => {
    vi.mocked(getAiInsightsPageData).mockResolvedValue({
      success: true,
      data: makePageData(),
    });

    renderWorkspace();

    expect(
      await screen.findByRole("group", { name: /Analysis period/i }),
    ).toBeTruthy();
    expect(await screen.findByText("Branch 1")).toBeTruthy();
    expect(await screen.findByText("Laboratory")).toBeTruthy();
    expect(await screen.findByText("Waiting Time")).toBeTruthy();
    // Deterministic metrics render.
    expect(await screen.findByText("Satisfaction Rate")).toBeTruthy();
    // AI summary offers generation.
    expect(
      await screen.findByRole("button", { name: /Generate AI Summary/i }),
    ).toBeTruthy();
  });

  it("shows a loading skeleton before the first data arrives", () => {
    vi.mocked(getAiInsightsPageData).mockImplementation(
      () => new Promise(() => {}),
    );

    renderWorkspace();

    expect(screen.getByText("Analyzing clinic feedback…")).toBeTruthy();
  });

  it("shows guided insights and submits the spotlight question to the AI", async () => {
    vi.mocked(getAiInsightsPageData).mockResolvedValue({
      success: true,
      data: makePageData(),
    });
    vi.mocked(askAiInsights).mockResolvedValue({
      success: true,
      data: {
        answer: "Satisfaction dropped after the service change.",
        keyPoints: [],
        recommendations: [],
        sources: [],
      },
    });

    renderWorkspace();

    expect(
      await screen.findByText(/Satisfaction fell 7 pts vs Yesterday/i),
    ).toBeTruthy();
    const action = screen.getByRole("button", { name: /Ask why/i });
    fireEvent.click(action);

    await waitFor(() => {
      expect(askAiInsights).toHaveBeenCalledWith(
        expect.objectContaining({
          question:
            "Why did satisfaction decrease compared with the previous period?",
        }),
      );
    });
    expect(
      await screen.findByText("Satisfaction dropped after the service change."),
    ).toBeTruthy();
  });

  it("shows a retryable error when the analytics load fails", async () => {
    vi.mocked(getAiInsightsPageData).mockResolvedValue({
      success: false,
      error: {
        code: "DATABASE_ERROR",
        message: "Failed to load analytics for this period.",
      },
    });

    renderWorkspace();

    expect(await screen.findByText(/Could not load analytics/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: /Retry/i })).toBeTruthy();
  });
});

describe("AskAiPanel", () => {
  it("renders the question input and disables submit when empty", () => {
    render(<AskAiPanel period={{ value: "today" }} periodLabel="Today" />);

    expect(screen.getByLabelText("Ask AI a question")).toBeTruthy();
    const askButton = screen.getByRole("button", { name: /Ask$/i });
    expect((askButton as HTMLButtonElement).disabled).toBe(true);
    // Suggested questions are rendered.
    expect(
      screen.getByRole("button", {
        name: /Which branch needs the most attention/i,
      }),
    ).toBeTruthy();
  });

  it("renders a compact rail that stays visible when collapsed", () => {
    const onToggle = vi.fn();
    render(
      <AskAiPanel
        period={{ value: "today" }}
        periodLabel="Today"
        open={false}
        onToggle={onToggle}
      />,
    );

    const rail = screen.getByRole("button", {
      name: /Open the Ask AI assistant/i,
    });
    expect(rail).toBeTruthy();
    expect(screen.queryByLabelText("Ask AI a question")).toBeNull();
    fireEvent.click(rail);
    expect(onToggle).toHaveBeenCalled();
  });

  it("enables submit after typing a question", async () => {
    askAiInsights.mockResolvedValue({
      success: true,
      data: {
        answer: "Branch 2 needs the most attention.",
        keyPoints: [],
        recommendations: [],
        sources: [
          { tool: "getBranchPerformance", description: "Per-branch data" },
        ],
      },
    });

    render(
      <AskAiPanel period={{ value: "30_days" }} periodLabel="Last 30 Days" />,
    );

    const input = screen.getByLabelText("Ask AI a question");
    fireEvent.change(input, {
      target: { value: "Which branch needs attention?" },
    });
    const askButton = screen.getByRole("button", {
      name: /Ask$/i,
    }) as HTMLButtonElement;
    expect(askButton.disabled).toBe(false);

    fireEvent.click(askButton);

    await waitFor(() => {
      expect(askAiInsights).toHaveBeenCalledWith(
        expect.objectContaining({ question: "Which branch needs attention?" }),
      );
    });
    // The structured answer is rendered.
    expect(
      await screen.findByText("Branch 2 needs the most attention."),
    ).toBeTruthy();
    expect(screen.getByText("getBranchPerformance")).toBeTruthy();
  });
});
