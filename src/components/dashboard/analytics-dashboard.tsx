"use client";

import * as React from "react";
import { useMemo, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  Calendar,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Info,
  ArrowRight,
  Target,
  Activity,
  Stethoscope,
} from "lucide-react";
import { fetchAnalyticsDashboard } from "@/lib/api/analytics";
import { fetchFeedbackMeta } from "@/lib/api/feedback";
import type { AnalyticsQuery } from "@/lib/analytics/types";
import {
  DashboardGlobalFilters,
  EMPTY_DASHBOARD_FILTERS,
  isDashboardFilterActive,
  type DashboardFilterValues,
} from "@/components/dashboard/dashboard-global-filters";
import { KPIMetricCard } from "@/components/dashboard/kpi-metric-card";
import { SatisfactionTrendChart } from "@/components/dashboard/satisfaction-trend-chart";
import { BranchPerformanceVisual } from "@/components/dashboard/branch-performance-visual";
import { ServicePerformanceVisual } from "@/components/dashboard/service-performance-visual";
import { RatingDistributionVisual } from "@/components/dashboard/rating-distribution-visual";
import { NeedsAttentionSection } from "@/components/dashboard/needs-attention-section";
import { SatisfactionBar } from "@/components/dashboard/satisfaction-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { cn } from "@/lib/utils";
import {
  AnalyticsEmptyState,
  AnalyticsErrorState,
  AnalyticsSkeleton,
} from "@/components/analytics/analytics-states";

export default function AnalyticsDashboard() {
  const [filters, setFilters] = useState<DashboardFilterValues>(
    EMPTY_DASHBOARD_FILTERS,
  );

  const queryParams: AnalyticsQuery = useMemo(() => {
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

  const metaQuery = useQuery({
    queryKey: ["feedback-meta"],
    queryFn: fetchFeedbackMeta,
    staleTime: 5 * 60 * 1000,
  });

  const analyticsQuery = useQuery({
    queryKey: ["analytics-dashboard", queryParams],
    queryFn: () => fetchAnalyticsDashboard(queryParams),
    placeholderData: keepPreviousData,
  });

  function handleFilterChange(patch: Partial<DashboardFilterValues>) {
    setFilters((prev) => ({ ...prev, ...patch }));
  }

  function handleResetFilters() {
    setFilters(EMPTY_DASHBOARD_FILTERS);
  }

  const data = analyticsQuery.data;
  const hasActiveFilters = isDashboardFilterActive(filters);
  const isEmpty = data && data.totalCountInPeriod === 0;
  const summary = data?.summary;

  // Generate insights based on data
  const insights = useMemo(() => {
    if (!summary || !data) return null;

    const insights = [];

    // Satisfaction insight
    if (summary.satisfactionRate >= 80) {
      insights.push({
        type: "success",
        icon: TrendingUp,
        title: "Excellent Patient Satisfaction",
        description: `Your satisfaction rate of ${summary.satisfactionRate}% exceeds the 80% target threshold. Patients are consistently reporting positive experiences.`,
        action:
          "Maintain current practices and share success strategies with other branches.",
      });
    } else if (summary.satisfactionRate >= 60) {
      insights.push({
        type: "info",
        icon: Info,
        title: "Satisfaction Within Acceptable Range",
        description: `Current satisfaction rate of ${summary.satisfactionRate}% is within operational targets. There's room for improvement to reach excellence levels.`,
        action:
          "Focus on addressing neutral feedback areas to push satisfaction higher.",
      });
    } else {
      insights.push({
        type: "warning",
        icon: AlertTriangle,
        title: "Satisfaction Below Target Threshold",
        description: `Satisfaction rate of ${summary.satisfactionRate}% is below the 60% operational target. Immediate attention is required.`,
        action:
          "Prioritize reviewing negative feedback and implement improvement plans for low-performing areas.",
      });
    }

    // Negative feedback insight
    if (summary.negativeFeedback > 0) {
      const negativeRate = summary.negativeRate;
      insights.push({
        type: "warning",
        icon: AlertTriangle,
        title: `${summary.negativeFeedback} Reviews Require Attention`,
        description: `${negativeRate}% of total feedback indicates poor patient experiences. These should be reviewed and addressed systematically.`,
        action:
          "Use the Action Center below to identify specific branches and services requiring intervention.",
      });
    }

    // Volume insight
    if (summary.totalFeedback > 100) {
      insights.push({
        type: "success",
        icon: Activity,
        title: "Strong Feedback Volume",
        description: `With ${summary.totalFeedback.toLocaleString()} total responses, you have sufficient data for reliable analysis and trend identification.`,
        action:
          "Leverage this volume to identify patterns and make data-driven improvements.",
      });
    } else if (summary.totalFeedback > 0) {
      insights.push({
        type: "info",
        icon: Info,
        title: "Growing Feedback Dataset",
        description: `Current feedback volume of ${summary.totalFeedback} responses provides a foundation for analysis. Consider encouraging more patient feedback.`,
        action:
          "Implement feedback collection strategies to increase response rates for better insights.",
      });
    }

    return insights;
  }, [summary, data]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="from-primary/20 to-primary/10 text-primary dark:from-primary/30 dark:to-primary/20 flex size-8 items-center justify-center rounded-xl bg-gradient-to-br">
              <BarChart3 className="size-4" />
            </span>
            <div>
              <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
                Analytics
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Patient experience insights, satisfaction trends, and
                performance metrics
              </p>
            </div>
          </div>
        </div>

        {data && (
          <div className="border-border bg-card flex items-center gap-2 rounded-xl border px-4 py-2 text-sm shadow-sm">
            <Calendar className="text-primary size-4" />
            <span className="text-muted-foreground">Period:</span>
            <span className="font-semibold capitalize">
              {data.period.label}
            </span>
            <span className="text-muted-foreground/40">·</span>
            <span className="text-muted-foreground">
              <AnimatedNumber
                value={data.totalCountInPeriod}
                suffix=" responses"
                duration={1000}
              />
            </span>
          </div>
        )}
      </div>

      {/* Filters */}
      <DashboardGlobalFilters
        branches={metaQuery.data?.branches ?? []}
        services={metaQuery.data?.services ?? []}
        values={filters}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
        totalEvaluated={data?.totalCountInPeriod}
        disabled={metaQuery.isLoading || analyticsQuery.isFetching}
      />

      {/* Dashboard Body */}
      {analyticsQuery.isError ? (
        <AnalyticsErrorState
          message={
            analyticsQuery.error instanceof Error
              ? analyticsQuery.error.message
              : "Could not load analytics metrics."
          }
          onRetry={() => void analyticsQuery.refetch()}
        />
      ) : analyticsQuery.isLoading && !data ? (
        <AnalyticsSkeleton />
      ) : isEmpty ? (
        <AnalyticsEmptyState
          hasFilters={hasActiveFilters}
          onReset={handleResetFilters}
        />
      ) : (
        data &&
        summary && (
          <div className="space-y-8">
            {/* Key Insights */}
            {insights && insights.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Target className="text-primary size-5" />
                  <h2 className="text-lg font-bold">Key Insights</h2>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {insights.map((insight, index) => (
                    <Card
                      key={index}
                      className={cn(
                        "border-l-4 transition-all hover:shadow-md",
                        insight.type === "success"
                          ? "border-l-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20"
                          : insight.type === "warning"
                            ? "border-l-amber-500 bg-amber-50/30 dark:bg-amber-950/20"
                            : "border-l-blue-500 bg-blue-50/30 dark:bg-blue-950/20",
                      )}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div
                            className={cn(
                              "flex size-8 shrink-0 items-center justify-center rounded-lg",
                              insight.type === "success"
                                ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300"
                                : insight.type === "warning"
                                  ? "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300"
                                  : "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300",
                            )}
                          >
                            {React.createElement(insight.icon, {
                              className: "size-4",
                            })}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-semibold">
                              {insight.title}
                            </h4>
                            <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                              {insight.description}
                            </p>
                            <div className="text-primary mt-3 flex items-center gap-1 text-xs font-medium">
                              <ArrowRight className="size-3" />
                              <span>{insight.action}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* KPI Cards */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Activity className="text-primary size-5" />
                <h2 className="text-lg font-bold">Performance Overview</h2>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <KPIMetricCard
                  label="Total Feedback"
                  value={summary.totalFeedback.toLocaleString()}
                  numericValue={summary.totalFeedback}
                  icon={BarChart3}
                  accent="blue"
                  detail="Responses in selected period"
                  tooltipText="Total number of patient feedback submissions within the selected timeframe and filters."
                />
                <KPIMetricCard
                  label="Satisfaction Rate"
                  value={`${summary.satisfactionRate}%`}
                  numericValue={summary.satisfactionRate}
                  suffix="%"
                  icon={Sparkles}
                  accent="emerald"
                  detail={`${summary.positiveFeedback.toLocaleString()} positive responses`}
                  trend={{
                    value:
                      summary.satisfactionRate >= 75
                        ? "Above Target"
                        : summary.satisfactionRate >= 50
                          ? "On Track"
                          : "Below Target",
                    direction:
                      summary.satisfactionRate >= 75
                        ? "up"
                        : summary.satisfactionRate >= 50
                          ? "neutral"
                          : "down",
                    isPositive: summary.satisfactionRate >= 50,
                  }}
                  tooltipText="Percentage of responses indicating positive patient experience (ratings 5-7)."
                />
                <KPIMetricCard
                  label="Average Rating"
                  value={`${summary.avgRatingScore.toFixed(1)} / 7`}
                  numericValue={summary.avgRatingScore}
                  decimals={1}
                  suffix=" / 7"
                  icon={Sparkles}
                  accent="teal"
                  detail="On standardized clinical scale"
                  tooltipText="Average rating across all feedback on a 7-point clinical satisfaction scale."
                />
                <KPIMetricCard
                  label="Needs Attention"
                  value={summary.negativeFeedback.toLocaleString()}
                  numericValue={summary.negativeFeedback}
                  icon={AlertTriangle}
                  accent="amber"
                  detail={`${summary.negativeRate}% require action`}
                  trend={{
                    value: `${summary.negativeRate}% negative rate`,
                    direction:
                      summary.negativeFeedback > 0 ? "down" : "neutral",
                    isPositive: summary.negativeFeedback === 0,
                  }}
                  tooltipText="Number of responses indicating poor patient experience (ratings 0-2) requiring follow-up."
                />
              </div>
            </div>

            {/* Sentiment Distribution */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="size-5" />
                    Patient Sentiment
                  </CardTitle>
                  <Badge variant="outline">
                    <AnimatedNumber
                      value={summary.totalFeedback}
                      suffix=" responses"
                      duration={1000}
                    />
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <SatisfactionBar
                    positive={summary.positiveFeedback}
                    neutral={summary.neutralFeedback}
                    negative={summary.negativeFeedback}
                    showLegend={true}
                  />
                  <div className="grid grid-cols-3 gap-4 pt-2">
                    <div className="rounded-lg bg-emerald-50 p-3 text-center dark:bg-emerald-950/20">
                      <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        <AnimatedNumber
                          value={Math.round(
                            (summary.positiveFeedback / summary.totalFeedback) *
                              100,
                          )}
                          suffix="%"
                          duration={1200}
                        />
                      </p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        Positive (5-7 stars)
                      </p>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3 text-center dark:bg-gray-950/20">
                      <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                        <AnimatedNumber
                          value={Math.round(
                            (summary.neutralFeedback / summary.totalFeedback) *
                              100,
                          )}
                          suffix="%"
                          duration={1200}
                          delay={100}
                        />
                      </p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        Neutral (3-4 stars)
                      </p>
                    </div>
                    <div className="rounded-lg bg-red-50 p-3 text-center dark:bg-red-950/20">
                      <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                        <AnimatedNumber
                          value={Math.round(
                            (summary.negativeFeedback / summary.totalFeedback) *
                              100,
                          )}
                          suffix="%"
                          duration={1200}
                          delay={200}
                        />
                      </p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        Negative (0-2 stars)
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trend Analysis */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="text-primary size-5" />
                <h2 className="text-lg font-bold">Trend Analysis</h2>
              </div>
              <SatisfactionTrendChart
                data={data.trends}
                title="Satisfaction & Volume Over Time"
                subtitle="Track how satisfaction metrics and response volumes change over the selected period"
              />
            </div>

            {/* Comparative Performance Analysis */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="text-primary size-5" />
                <h2 className="text-lg font-bold">
                  Comparative Performance Analysis
                </h2>
              </div>
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
            </div>

            {/* Service Performance Breakdown */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Stethoscope className="text-primary size-5" />
                <h2 className="text-lg font-bold">
                  Service Performance Breakdown
                </h2>
              </div>
              <ServicePerformanceVisual
                services={data.serviceComparison}
                selectedServiceId={filters.serviceId}
                onSelectService={(serviceId) => {
                  handleFilterChange({
                    serviceId: filters.serviceId === serviceId ? "" : serviceId,
                  });
                }}
              />
            </div>

            {/* Action Center */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Target className="text-primary size-5" />
                <h2 className="text-lg font-bold">Action Center</h2>
              </div>
              <NeedsAttentionSection
                branches={data.branchComparison}
                services={data.serviceComparison}
                negativeCount={summary.negativeFeedback}
                totalCount={data.totalCountInPeriod}
                satisfactionRate={summary.satisfactionRate}
                onFilterBranch={(bId) => handleFilterChange({ branchId: bId })}
                onFilterService={(sId) =>
                  handleFilterChange({ serviceId: sId })
                }
              />
            </div>
          </div>
        )
      )}
    </div>
  );
}
