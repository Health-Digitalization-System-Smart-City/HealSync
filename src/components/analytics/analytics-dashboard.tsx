"use client";

import * as React from "react";
import { useMemo, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { 
  BarChart3, 
  Calendar, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Info,
  ArrowRight,
  Lightbulb,
  Target,
  Activity,
  Building2,
  Stethoscope,
  ChevronRight
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
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  AnalyticsEmptyState,
  AnalyticsErrorState,
  AnalyticsSkeleton,
} from "./analytics-states";

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
      if (filters.customEnd) params.endDate = params.customEnd;
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
        action: "Maintain current practices and share success strategies with other branches."
      });
    } else if (summary.satisfactionRate >= 60) {
      insights.push({
        type: "info",
        icon: Info,
        title: "Satisfaction Within Acceptable Range",
        description: `Current satisfaction rate of ${summary.satisfactionRate}% is within operational targets. There's room for improvement to reach excellence levels.`,
        action: "Focus on addressing neutral feedback areas to push satisfaction higher."
      });
    } else {
      insights.push({
        type: "warning",
        icon: AlertTriangle,
        title: "Satisfaction Below Target Threshold",
        description: `Satisfaction rate of ${summary.satisfactionRate}% is below the 60% operational target. Immediate attention is required.`,
        action: "Prioritize reviewing negative feedback and implement improvement plans for low-performing areas."
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
        action: "Use the Needs Attention section below to identify specific branches and services requiring intervention."
      });
    }

    // Volume insight
    if (summary.totalFeedback > 100) {
      insights.push({
        type: "success",
        icon: Activity,
        title: "Strong Feedback Volume",
        description: `With ${summary.totalFeedback.toLocaleString()} total responses, you have sufficient data for reliable analysis and trend identification.`,
        action: "Leverage this volume to identify patterns and make data-driven improvements."
      });
    } else if (summary.totalFeedback > 0) {
      insights.push({
        type: "info",
        icon: Info,
        title: "Growing Feedback Dataset",
        description: `Current feedback volume of ${summary.totalFeedback} responses provides a foundation for analysis. Consider encouraging more patient feedback.`,
        action: "Implement feedback collection strategies to increase response rates for better insights."
      });
    }

    return insights;
  }, [summary, data]);

  return (
    <div className="space-y-6">
      {/* Guided Header with Context */}
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 text-primary dark:from-primary/30 dark:to-primary/20">
                <BarChart3 className="size-4" />
              </span>
              <div>
                <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
                  Healthcare Analytics Dashboard
                </h1>
                <p className="text-muted-foreground mt-1 text-sm">
                  Real-time insights into patient experience, satisfaction trends, and clinical performance
                </p>
              </div>
            </div>
          </div>

          {data && (
            <div className="border-border bg-card flex items-center gap-2 rounded-xl border px-4 py-2 text-sm shadow-sm">
              <Calendar className="text-primary size-4" />
              <span className="text-muted-foreground">Period:</span>
              <span className="font-semibold capitalize">{data.period.label}</span>
              <span className="text-muted-foreground/40">·</span>
              <span className="text-muted-foreground">{data.totalCountInPeriod.toLocaleString()} responses</span>
            </div>
          )}
        </div>

        {/* Guided Navigation */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 flex size-8 shrink-0 items-center justify-center rounded-lg">
              <Lightbulb className="size-4" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm text-blue-900 dark:text-blue-100">Quick Guide to This Dashboard</h3>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                Start with the Key Insights below, then explore detailed metrics. Use filters to focus on specific branches, services, or time periods. Each section provides actionable recommendations.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Scope & Timeframe Filters */}
      <DashboardGlobalFilters
        branches={metaQuery.data?.branches ?? []}
        services={metaQuery.data?.services ?? []}
        values={filters}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
        totalEvaluated={data?.totalCountInPeriod}
        disabled={metaQuery.isLoading || analyticsQuery.isFetching}
      />

      {/* Dashboard Visualization Body */}
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
            {/* Key Insights Section - AI-Generated Style Insights */}
            {insights && insights.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Target className="text-primary size-5" />
                  <h2 className="text-lg font-bold">Key Insights & Recommendations</h2>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {insights.map((insight, index) => (
                    <Card 
                      key={index}
                      className={cn(
                        "border-l-4 transition-all hover:shadow-md",
                        insight.type === "success" ? "border-l-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20" :
                        insight.type === "warning" ? "border-l-amber-500 bg-amber-50/30 dark:bg-amber-950/20" :
                        "border-l-blue-500 bg-blue-50/30 dark:bg-blue-950/20"
                      )}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "flex size-8 shrink-0 items-center justify-center rounded-lg",
                            insight.type === "success" ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300" :
                            insight.type === "warning" ? "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300" :
                            "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
                          )}>
                            {React.createElement(insight.icon, { className: "size-4" })}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm">{insight.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{insight.description}</p>
                            <div className="mt-3 flex items-center gap-1 text-xs font-medium text-primary">
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

            {/* Performance Overview Cards */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Activity className="text-primary size-5" />
                <h2 className="text-lg font-bold">Performance Overview</h2>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <KPIMetricCard
                  label="Total Feedback"
                  value={summary.totalFeedback.toLocaleString()}
                  icon={BarChart3}
                  accent="blue"
                  detail="Responses in selected period"
                  tooltipText="Total number of patient feedback submissions within the selected timeframe and filters."
                />
                <KPIMetricCard
                  label="Satisfaction Rate"
                  value={`${summary.satisfactionRate}%`}
                  icon={Sparkles}
                  accent="emerald"
                  detail={`${summary.positiveFeedback.toLocaleString()} positive responses`}
                  trend={{
                    value: summary.satisfactionRate >= 75 ? "Above Target" : summary.satisfactionRate >= 50 ? "On Track" : "Below Target",
                    direction: summary.satisfactionRate >= 75 ? "up" : summary.satisfactionRate >= 50 ? "neutral" : "down",
                    isPositive: summary.satisfactionRate >= 50,
                  }}
                  tooltipText="Percentage of responses indicating positive patient experience (ratings 5-7)."
                />
                <KPIMetricCard
                  label="Average Rating"
                  value={`${summary.avgRatingScore.toFixed(1)} / 7`}
                  icon={Sparkles}
                  accent="teal"
                  detail="On standardized clinical scale"
                  tooltipText="Average rating across all feedback on a 7-point clinical satisfaction scale."
                />
                <KPIMetricCard
                  label="Needs Attention"
                  value={summary.negativeFeedback.toLocaleString()}
                  icon={AlertTriangle}
                  accent="amber"
                  detail={`${summary.negativeRate}% require action`}
                  trend={{
                    value: `${summary.negativeRate}% negative rate`,
                    direction: summary.negativeFeedback > 0 ? "down" : "neutral",
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
                    Patient Sentiment Distribution
                  </CardTitle>
                  <Badge variant="outline">{summary.totalFeedback.toLocaleString()} Total Responses</Badge>
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
                    <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg">
                      <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        {Math.round((summary.positiveFeedback / summary.totalFeedback) * 100)}%
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Positive (5-7 stars)</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-950/20 rounded-lg">
                      <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                        {Math.round((summary.neutralFeedback / summary.totalFeedback) * 100)}%
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Neutral (3-4 stars)</p>
                    </div>
                    <div className="text-center p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                      <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {Math.round((summary.negativeFeedback / summary.totalFeedback) * 100)}%
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Negative (0-2 stars)</p>
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
                title="Patient Satisfaction & Feedback Volume Over Time"
                subtitle="Track how satisfaction metrics and response volumes change over the selected period"
              />
            </div>

            {/* Comparative Analysis */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="text-primary size-5" />
                <h2 className="text-lg font-bold">Comparative Performance Analysis</h2>
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

            {/* Service Performance */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Stethoscope className="text-primary size-5" />
                <h2 className="text-lg font-bold">Service Performance Breakdown</h2>
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
                onFilterService={(sId) => handleFilterChange({ serviceId: sId })}
              />
            </div>

            {/* Navigation Guidance */}
            <Card className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/20 dark:to-cyan-950/20 border-teal-200 dark:border-teal-800">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-teal-100 text-teal-600 dark:bg-teal-900 dark:text-teal-300 flex size-10 shrink-0 items-center justify-center rounded-xl">
                    <Lightbulb className="size-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-base text-teal-900 dark:text-teal-100">Explore Deeper Insights</h3>
                    <p className="text-sm text-teal-700 dark:text-teal-300 mt-2 mb-4">
                      For detailed analysis of specific branches or services, click on any item in the comparative sections above. You can also visit the dedicated pages for comprehensive management:
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2"
                        onClick={() => window.location.href = '/dashboard/branches'}
                      >
                        <Building2 className="size-4" />
                        Manage Branches
                        <ChevronRight className="size-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2"
                        onClick={() => window.location.href = '/dashboard/services'}
                      >
                        <Stethoscope className="size-4" />
                        Manage Services
                        <ChevronRight className="size-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2"
                        onClick={() => window.location.href = '/dashboard/feedback'}
                      >
                        <BarChart3 className="size-4" />
                        View All Feedback
                        <ChevronRight className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      )}
    </div>
  );
}
