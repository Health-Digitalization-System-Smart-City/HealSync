"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  AlertTriangle,
  CalendarCheck,
  HeartPulse,
  MessageSquare,
  TrendingUp,
} from "lucide-react";

import { PageIntro } from "@/components/page-intro";
import { KPIMetricCard } from "@/components/dashboard/kpi-metric-card";
import { SatisfactionBar } from "@/components/dashboard/satisfaction-bar";
import {
  DashboardGlobalFilters,
  EMPTY_DASHBOARD_FILTERS,
  type DashboardFilterValues,
} from "@/components/dashboard/dashboard-global-filters";
import { SatisfactionTrendChart } from "@/components/dashboard/satisfaction-trend-chart";
import { BranchPerformanceVisual } from "@/components/dashboard/branch-performance-visual";
import { ServicePerformanceVisual } from "@/components/dashboard/service-performance-visual";
import { RatingDistributionVisual } from "@/components/dashboard/rating-distribution-visual";
import { NeedsAttentionSection } from "@/components/dashboard/needs-attention-section";
import { RecentFeedbackFeed } from "@/components/dashboard/recent-feedback-feed";
import { FeedbackDetails } from "@/components/feedback/feedback-details";
import { fetchAnalyticsDashboard } from "@/lib/api/analytics";
import {
  deleteFeedback as deleteFeedbackRequest,
  fetchFeedbackMeta,
  updateFeedback as updateFeedbackRequest,
} from "@/lib/api/feedback";
import type {
  AnalyticsDashboardData,
  AnalyticsQuery,
} from "@/lib/analytics/types";
import type {
  BranchOption,
  FeedbackView,
  ServiceOption,
  UpdateFeedbackInput,
  ViewerCapabilities,
} from "@/lib/feedback/types";
import { cn } from "@/lib/utils";

export interface DashboardPageClientProps {
  firstName: string;
  initialAnalytics: AnalyticsDashboardData;
  initialRecent: FeedbackView[];
  initialBranches: BranchOption[];
  initialServices: ServiceOption[];
  viewerCapabilities: ViewerCapabilities;
}

export function DashboardPageClient({
  firstName,
  initialAnalytics,
  initialRecent,
  initialBranches,
  initialServices,
  viewerCapabilities,
}: DashboardPageClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // 1. Global Interactive Filters State
  const [filters, setFilters] = React.useState<DashboardFilterValues>(
    EMPTY_DASHBOARD_FILTERS,
  );

  // 2. Selected Feedback Inspection Drawer State
  const [selectedFeedback, setSelectedFeedback] =
    React.useState<FeedbackView | null>(null);

  // Query parameters formatted for analytics endpoint
  const queryParams: AnalyticsQuery = React.useMemo(() => {
    const params: AnalyticsQuery = {
      range: filters.range,
    };
    if (filters.range === "custom") {
      if (filters.customStart) params.startDate = filters.customStart;
      if (filters.customEnd) params.endDate = filters.customEnd;
    }
    if (filters.branchId) params.branchId = filters.branchId;
    if (filters.serviceId) params.serviceId = filters.serviceId;
    return params;
  }, [filters]);

  // React Query for live reactive updates on filter change
  const metaQuery = useQuery({
    queryKey: ["feedback-meta"],
    queryFn: fetchFeedbackMeta,
    initialData: {
      branches: initialBranches,
      services: initialServices,
      ratings: [],
    },
    staleTime: 5 * 60 * 1000,
  });

  const analyticsQuery = useQuery({
    queryKey: ["dashboard-analytics", queryParams],
    queryFn: () => fetchAnalyticsDashboard(queryParams),
    initialData:
      filters.range === "all" && !filters.branchId && !filters.serviceId
        ? initialAnalytics
        : undefined,
    placeholderData: keepPreviousData,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateFeedbackInput }) =>
      updateFeedbackRequest(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["dashboard-analytics"] });
      router.refresh();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteFeedbackRequest(id),
    onSuccess: () => {
      setSelectedFeedback(null);
      void queryClient.invalidateQueries({ queryKey: ["dashboard-analytics"] });
      router.refresh();
    },
  });

  const data = analyticsQuery.data ?? initialAnalytics;
  const summary = data.summary;

  function handleFilterChange(patch: Partial<DashboardFilterValues>) {
    setFilters((prev) => ({ ...prev, ...patch }));
  }

  function handleResetFilters() {
    setFilters(EMPTY_DASHBOARD_FILTERS);
  }

  // Sentiment tone calculation for patient pulse banner
  const sentimentInsight = React.useMemo(() => {
    const sat = summary.satisfactionRate;
    const pos = summary.positiveFeedback;
    const neg = summary.negativeFeedback;

    if (sat >= 75) {
      return {
        headline: "High Patient Satisfaction",
        detail: `${sat}% of evaluated patients reported positive experiences (${pos.toLocaleString()} submissions). Care delivery metrics are well within clinical target thresholds.`,
        tone: "good" as const,
      };
    }
    if (sat >= 50) {
      return {
        headline: "Moderate Satisfaction — Actionable Gaps Identified",
        detail: `${sat}% satisfaction rating with ${neg.toLocaleString()} submissions requiring attention. Check the flagged departments below for targeted improvements.`,
        tone: "mixed" as const,
      };
    }
    return {
      headline: "Clinical Satisfaction Below Target Threshold",
      detail: `Satisfaction currently stands at ${sat}%. ${neg.toLocaleString()} patient submissions require administrative investigation. Prioritize low-scoring branches.`,
      tone: "attention" as const,
    };
  }, [summary]);

  const insightToneClass =
    sentimentInsight.tone === "good"
      ? "border-emerald-200/70 bg-gradient-to-br from-emerald-50/80 to-teal-50/40 dark:border-emerald-500/20 dark:from-emerald-500/10 dark:to-teal-500/5"
      : sentimentInsight.tone === "mixed"
        ? "border-blue-200/70 bg-gradient-to-br from-blue-50/80 to-sky-50/40 dark:border-blue-500/20 dark:from-blue-500/10 dark:to-sky-500/5"
        : "border-amber-200/70 bg-gradient-to-br from-amber-50/80 to-orange-50/40 dark:border-amber-500/20 dark:from-amber-500/10 dark:to-orange-500/5";

  const insightIconClass =
    sentimentInsight.tone === "good"
      ? "bg-emerald-500 text-white shadow-emerald-500/20"
      : sentimentInsight.tone === "mixed"
        ? "bg-blue-600 text-white shadow-blue-500/20"
        : "bg-amber-500 text-white shadow-amber-500/20";

  return (
    <div className="space-y-6">
      {/* 1. Header Area with Greeting & Intro */}
      <PageIntro
        title={firstName ? `Welcome back, ${firstName}` : "Welcome back"}
        description="Healthcare analytics, patient satisfaction trends, and clinical performance across Smart Feedback branches."
      />

      {/* 2. Global Interactive Filters */}
      <DashboardGlobalFilters
        branches={metaQuery.data?.branches ?? initialBranches}
        services={metaQuery.data?.services ?? initialServices}
        values={filters}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
        totalEvaluated={data.totalCountInPeriod}
        disabled={analyticsQuery.isFetching}
      />

      {/* 3. KPI Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPIMetricCard
          label="Total Feedback"
          value={summary.totalFeedback.toLocaleString()}
          icon={MessageSquare}
          accent="blue"
          detail="Total patient submissions in scope"
          tooltipText="Total count of verified patient experience submissions recorded in the selected period and branch scope."
          onClick={() => router.push("/dashboard/feedback")}
        />

        <KPIMetricCard
          label="Today's Submissions"
          value={summary.todayFeedback.toLocaleString()}
          icon={CalendarCheck}
          accent="violet"
          detail="Real-time daily intake"
          trend={{
            value: "Live Feed",
            direction: "neutral",
            isPositive: true,
          }}
          tooltipText="New patient feedback submissions logged across the clinic today."
        />

        <KPIMetricCard
          label="Satisfaction Rate"
          value={`${summary.satisfactionRate}%`}
          icon={TrendingUp}
          accent="emerald"
          detail={`${summary.positiveFeedback.toLocaleString()} positive (5–7 stars)`}
          trend={{
            value: summary.satisfactionRate >= 75 ? "Target Met" : "Moderate",
            direction: summary.satisfactionRate >= 75 ? "up" : "down",
            isPositive: summary.satisfactionRate >= 75,
          }}
          tooltipText="Percentage of feedback responses classified as positive satisfaction (standardized 5–7 rating scores)."
        />

        <KPIMetricCard
          label="Needs Attention"
          value={summary.negativeFeedback.toLocaleString()}
          icon={AlertTriangle}
          accent="amber"
          detail={`${summary.negativeRate}% rate · ${summary.neutralFeedback} neutral`}
          trend={{
            value: `${summary.negativeRate}% Rate`,
            direction: summary.negativeFeedback > 0 ? "down" : "neutral",
            isPositive: summary.negativeFeedback === 0,
          }}
          tooltipText="Submissions scoring 0–2 stars requiring clinical review or operational remediation."
          onClick={() => {
            // Scroll down smoothly to Needs Attention section
            const el = document.getElementById("needs-attention-section");
            el?.scrollIntoView({ behavior: "smooth" });
          }}
        />
      </div>

      {/* 4. Patient Sentiment Pulse Banner */}
      {data.totalCountInPeriod > 0 && (
        <div
          className={cn(
            "rounded-2xl border p-5 shadow-xs transition-colors",
            insightToneClass,
          )}
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3.5">
              <span
                className={cn(
                  "flex size-11 shrink-0 items-center justify-center rounded-xl shadow-sm",
                  insightIconClass,
                )}
                aria-hidden
              >
                <HeartPulse className="size-5.5" />
              </span>
              <div className="min-w-0 space-y-1">
                <p className="text-muted-foreground text-[11px] font-bold tracking-wider uppercase">
                  Patient Experience Pulse
                </p>
                <h3 className="text-foreground text-base font-bold sm:text-lg">
                  {sentimentInsight.headline}
                </h3>
                <p className="text-muted-foreground max-w-2xl text-xs leading-relaxed sm:text-sm">
                  {sentimentInsight.detail}
                </p>
              </div>
            </div>

            <div className="w-full max-w-md shrink-0">
              <div className="border-border/70 bg-card/90 rounded-xl border p-4 shadow-2xs backdrop-blur-xs">
                <div className="text-muted-foreground mb-2 flex items-center justify-between text-xs font-semibold">
                  <span>Sentiment Balance</span>
                  <span className="text-foreground font-bold">
                    {summary.totalFeedback.toLocaleString()} responses
                  </span>
                </div>
                <SatisfactionBar
                  positive={summary.positiveFeedback}
                  neutral={summary.neutralFeedback}
                  negative={summary.negativeFeedback}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Main Satisfaction & Volume Trend Chart */}
      <SatisfactionTrendChart
        data={data.trends}
        title="Patient Satisfaction & Intake Longitudinal Trend"
        subtitle="Daily/weekly tracking of patient satisfaction indices and response volumes"
      />

      {/* 6. Two-Column Analytics: Branch Benchmarking & Rating Distribution */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <BranchPerformanceVisual
          branches={data.branchComparison}
          selectedBranchId={filters.branchId}
          onSelectBranch={(branchId) => {
            handleFilterChange({
              branchId: filters.branchId === branchId ? "" : branchId,
            });
          }}
        />

        <RatingDistributionVisual
          distribution={data.distribution}
          totalCount={data.totalCountInPeriod}
        />
      </div>

      {/* 7. Clinical Service Performance Visual */}
      <ServicePerformanceVisual
        services={data.serviceComparison}
        selectedServiceId={filters.serviceId}
        onSelectService={(serviceId) => {
          handleFilterChange({
            serviceId: filters.serviceId === serviceId ? "" : serviceId,
          });
        }}
      />

      {/* 8. Operational Action Center: Needs Attention */}
      <div id="needs-attention-section">
        <NeedsAttentionSection
          branches={data.branchComparison}
          services={data.serviceComparison}
          negativeCount={summary.negativeFeedback}
          totalCount={data.totalCountInPeriod}
          satisfactionRate={summary.satisfactionRate}
          onFilterBranch={(bId) => handleFilterChange({ branchId: bId })}
          onFilterService={(sId) => handleFilterChange({ serviceId: sId })}
        />
      </div>

      {/* 9. Live Recent Feedback Stream */}
      <RecentFeedbackFeed
        items={initialRecent}
        onSelectFeedback={(item) => setSelectedFeedback(item)}
      />

      {/* 10. Slide-over Feedback Inspection Drawer */}
      {selectedFeedback && (
        <FeedbackDetails
          key={selectedFeedback.id}
          feedback={selectedFeedback}
          capabilities={viewerCapabilities}
          onClose={() => setSelectedFeedback(null)}
          onSave={async (input) => {
            const updated = await updateMutation.mutateAsync({
              id: selectedFeedback.id,
              input,
            });
            setSelectedFeedback(updated);
            return updated;
          }}
          onDelete={async (id) => {
            await deleteMutation.mutateAsync(id);
          }}
        />
      )}
    </div>
  );
}
