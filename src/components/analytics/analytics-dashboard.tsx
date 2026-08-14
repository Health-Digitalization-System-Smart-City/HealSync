"use client";

import { useMemo, useState } from "react";
import {
  keepPreviousData,
  useQuery,
} from "@tanstack/react-query";
import {
  BarChart2,
  Calendar,
} from "lucide-react";
import { fetchAnalyticsDashboard } from "@/lib/api/analytics";
import { fetchFeedbackMeta } from "@/lib/api/feedback";
import type { AnalyticsQuery } from "@/lib/analytics/types";
import {
  AnalyticsFilters,
  EMPTY_ANALYTICS_FILTERS,
  isAnalyticsFilterActive,
  type AnalyticsFilterValues,
} from "./analytics-filters";
import { AnalyticsSummary } from "./analytics-summary";
import {
  AnalyticsEmptyState,
  AnalyticsErrorState,
  AnalyticsSkeleton,
} from "./analytics-states";
import { FeedbackTrendChart } from "./charts/feedback-trend-chart";
import { SatisfactionDistributionChart } from "./charts/satisfaction-distribution-chart";
import { BranchComparisonChart } from "./charts/branch-comparison-chart";
import { ServiceComparisonChart } from "./charts/service-comparison-chart";

export default function AnalyticsDashboard() {
  const [filters, setFilters] = useState<AnalyticsFilterValues>(
    EMPTY_ANALYTICS_FILTERS,
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

  function handleFilterChange(patch: Partial<AnalyticsFilterValues>) {
    setFilters((prev) => ({ ...prev, ...patch }));
  }

  function handleResetFilters() {
    setFilters(EMPTY_ANALYTICS_FILTERS);
  }

  const data = analyticsQuery.data;
  const hasActiveFilters = isAnalyticsFilterActive(filters);
  const isEmpty = data && data.totalCountInPeriod === 0;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
              <BarChart2 className="size-4" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Analytics & Insights
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Real-time healthcare performance metrics, satisfaction trends, and clinical comparisons.
          </p>
        </div>

        {data && (
          <div className="flex items-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-3 py-1.5 shadow-xs sm:self-auto text-xs font-semibold text-slate-700">
            <Calendar className="size-3.5 text-blue-600" />
            <span>
              Period: <strong className="text-slate-900 capitalize">{data.period.label}</strong>
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-500">
              {data.totalCountInPeriod} records evaluated
            </span>
          </div>
        )}
      </div>

      {/* KPI Summary Cards */}
      <AnalyticsSummary
        summary={data?.summary}
        loading={analyticsQuery.isLoading && !data}
      />

      {/* Analytics Scope & Timeframe Filters */}
      <AnalyticsFilters
        branches={metaQuery.data?.branches ?? []}
        services={metaQuery.data?.services ?? []}
        values={filters}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
        disabled={metaQuery.isLoading}
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
        data && (
          <div className="space-y-6">
            {/* Row 1: Trend Over Time & Satisfaction Distribution */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <FeedbackTrendChart
                data={data.trends}
                title="Feedback Volume Over Time"
                subtitle="Daily patient submissions and positive rate trends"
              />

              <SatisfactionDistributionChart
                distribution={data.distribution}
                totalCount={data.totalCountInPeriod}
              />
            </div>

            {/* Row 2: Branch Comparison & Clinical Service Comparison */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <BranchComparisonChart
                branches={data.branchComparison}
                onSelectBranch={(branchId) => {
                  handleFilterChange({
                    branchId: filters.branchId === branchId ? "" : branchId,
                  });
                }}
                selectedBranchId={filters.branchId}
              />

              <ServiceComparisonChart
                services={data.serviceComparison}
                onSelectService={(serviceId) => {
                  handleFilterChange({
                    serviceId: filters.serviceId === serviceId ? "" : serviceId,
                  });
                }}
                selectedServiceId={filters.serviceId}
              />
            </div>
          </div>
        )
      )}
    </div>
  );
}
