"use client";

import * as React from "react";
import {
  BarChart3,
  ChevronRight,
  LayoutGrid,
  List,
  Minus,
  Star,
  Stethoscope,
  ThumbsDown,
  ThumbsUp,
  TrendingDown,
} from "lucide-react";
import type { ServiceComparisonItem } from "@/lib/analytics/types";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/ui/animated-number";

export interface ServicePerformanceVisualProps {
  services: ServiceComparisonItem[];
  onSelectService?: (serviceId: string) => void;
  selectedServiceId?: string;
  className?: string;
}

type SortKey = "satisfaction" | "volume" | "negative";
type ViewMode = "table" | "grid";

function getTierColor(rate: number, total: number) {
  if (total === 0)
    return { bg: "bg-muted", text: "text-muted-foreground", label: "No Data" };
  if (rate >= 75)
    return {
      bg: "bg-emerald-50 dark:bg-emerald-500/10",
      text: "text-emerald-700 dark:text-emerald-300",
      border: "border-emerald-200 dark:border-emerald-500/30",
      label: "Excellent",
      barColor: "from-emerald-500 to-emerald-400",
    };
  if (rate >= 50)
    return {
      bg: "bg-blue-50 dark:bg-blue-500/10",
      text: "text-blue-700 dark:text-blue-300",
      border: "border-blue-200 dark:border-blue-500/30",
      label: "Good",
      barColor: "from-blue-500 to-blue-400",
    };
  return {
    bg: "bg-amber-50 dark:bg-amber-500/10",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-500/30",
    label: "Needs Focus",
    barColor: "from-amber-500 to-orange-400",
  };
}

export function ServicePerformanceVisual({
  services,
  onSelectService,
  selectedServiceId,
  className,
}: ServicePerformanceVisualProps) {
  const [sortBy, setSortBy] = React.useState<SortKey>("satisfaction");
  const [viewMode, setViewMode] = React.useState<ViewMode>("table");
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  const sortedServices = React.useMemo(() => {
    return [...services].sort((a, b) => {
      if (sortBy === "satisfaction") {
        return (
          b.satisfactionRate - a.satisfactionRate ||
          b.totalFeedback - a.totalFeedback
        );
      }
      if (sortBy === "volume") {
        return (
          b.totalFeedback - a.totalFeedback ||
          b.satisfactionRate - a.satisfactionRate
        );
      }
      return (
        b.negativeCount - a.negativeCount ||
        b.satisfactionRate - a.satisfactionRate
      );
    });
  }, [services, sortBy]);

  const maxVolume = React.useMemo(
    () => Math.max(...services.map((s) => s.totalFeedback), 1),
    [services],
  );

  const avgSatisfaction = React.useMemo(
    () =>
      services.length > 0
        ? Math.round(
            services.reduce((sum, s) => sum + s.satisfactionRate, 0) /
              services.length,
          )
        : 0,
    [services],
  );

  const toggleExpand = (serviceId: string) => {
    setExpandedId((prev) => (prev === serviceId ? null : serviceId));
  };

  return (
    <div
      className={cn(
        "border-border/80 bg-card flex flex-col overflow-hidden rounded-2xl border shadow-xs transition-all",
        className,
      )}
    >
      {/* Header */}
      <div className="border-border/60 border-b p-5 pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/15 to-teal-500/10 text-emerald-600 dark:text-emerald-400">
              <Stethoscope className="size-4.5" aria-hidden />
            </span>
            <div>
              <h3 className="text-foreground text-sm font-bold tracking-tight sm:text-base">
                Service Performance
              </h3>
              <p className="text-muted-foreground mt-0.5 text-xs">
                Satisfaction by clinical department · {services.length} services
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Sort Controls */}
            <div className="bg-muted/60 border-border/60 flex items-center rounded-xl border p-0.5 text-[11px] font-semibold">
              {(
                [
                  {
                    key: "satisfaction" as SortKey,
                    label: "Rating",
                    icon: Star,
                  },
                  {
                    key: "volume" as SortKey,
                    label: "Volume",
                    icon: BarChart3,
                  },
                  {
                    key: "negative" as SortKey,
                    label: "Issues",
                    icon: TrendingDown,
                  },
                ] as const
              ).map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSortBy(key)}
                  className={cn(
                    "flex items-center gap-1 rounded-lg px-2.5 py-1.5 transition-all",
                    sortBy === key
                      ? "bg-card text-foreground font-bold shadow-xs"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="size-3" />
                  {label}
                </button>
              ))}
            </div>

            {/* View Toggle */}
            <div className="bg-muted/60 border-border/60 flex items-center rounded-xl border p-0.5">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={cn(
                  "flex size-7 items-center justify-center rounded-lg transition-all",
                  viewMode === "table"
                    ? "bg-card text-foreground font-bold shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
                title="Table view"
              >
                <List className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={cn(
                  "flex size-7 items-center justify-center rounded-lg transition-all",
                  viewMode === "grid"
                    ? "bg-card text-foreground font-bold shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
                title="Grid view"
              >
                <LayoutGrid className="size-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-500" />
            <span className="text-muted-foreground">
              <span className="text-foreground font-semibold">
                {services.filter((s) => s.satisfactionRate >= 75).length}
              </span>{" "}
              Excellent
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-blue-500" />
            <span className="text-muted-foreground">
              <span className="text-foreground font-semibold">
                {
                  services.filter(
                    (s) => s.satisfactionRate >= 50 && s.satisfactionRate < 75,
                  ).length
                }
              </span>{" "}
              Good
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-amber-500" />
            <span className="text-muted-foreground">
              <span className="text-foreground font-semibold">
                {
                  services.filter(
                    (s) => s.satisfactionRate < 50 && s.totalFeedback > 0,
                  ).length
                }
              </span>{" "}
              Needs Focus
            </span>
          </div>
          <div className="bg-border/60 mx-1 h-3 w-px" />
          <span className="text-muted-foreground">
            Avg:{" "}
            <span className="text-foreground font-bold">
              <AnimatedNumber
                value={avgSatisfaction}
                suffix="%"
                duration={800}
              />
            </span>
          </span>
        </div>
      </div>

      {/* ===== TABLE VIEW ===== */}
      {viewMode === "table" && (
        <div className="p-4">
          {sortedServices.length === 0 ? (
            <div className="border-border/60 bg-muted/20 flex flex-col items-center justify-center rounded-xl border border-dashed py-10 text-center">
              <Stethoscope className="text-muted-foreground size-8" />
              <p className="text-muted-foreground mt-2 text-xs">
                No service data available for this period
              </p>
            </div>
          ) : (
            <div className="border-border/60 overflow-hidden rounded-xl border">
              {/* Table Header */}
              <div className="bg-muted/50 border-border/60 text-muted-foreground flex items-center gap-2 border-b px-3 py-2 text-[11px] font-semibold tracking-wider uppercase">
                <span className="w-7 text-center">#</span>
                <span className="flex-1">Service</span>
                <span className="hidden w-24 sm:block">Volume</span>
                <span className="hidden w-20 text-center md:block">Score</span>
                <span className="w-16 text-right">Rate</span>
              </div>

              {/* Table Rows */}
              {sortedServices.map((service, index) => {
                const isSelected = selectedServiceId === service.serviceId;
                const isExpanded = expandedId === service.serviceId;
                const tier = getTierColor(
                  service.satisfactionRate,
                  service.totalFeedback,
                );
                const volumeBarWidth =
                  maxVolume > 0 ? (service.totalFeedback / maxVolume) * 100 : 0;

                const positivePct =
                  service.totalFeedback > 0
                    ? (service.positiveCount / service.totalFeedback) * 100
                    : 0;
                const neutralPct =
                  service.totalFeedback > 0
                    ? (service.neutralCount / service.totalFeedback) * 100
                    : 0;
                const negativePct =
                  service.totalFeedback > 0
                    ? (service.negativeCount / service.totalFeedback) * 100
                    : 0;

                return (
                  <div key={service.serviceId}>
                    <div
                      onClick={() => {
                        onSelectService?.(service.serviceId);
                        toggleExpand(service.serviceId);
                      }}
                      className={cn(
                        "group border-border/40 flex cursor-pointer items-center gap-2 border-b px-3 py-2.5 transition-all duration-150 last:border-b-0",
                        isSelected ? "bg-primary/[0.04]" : "hover:bg-muted/30",
                      )}
                    >
                      {/* Rank */}
                      <span className="bg-muted text-muted-foreground flex size-6 shrink-0 items-center justify-center rounded-md font-mono text-[10px] font-bold">
                        {index + 1}
                      </span>

                      {/* Service Name + Tier */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-foreground truncate text-sm font-semibold">
                            {service.serviceName}
                          </span>
                          {service.totalFeedback > 0 && (
                            <span
                              className={cn(
                                "hidden items-center rounded border px-1 py-0 text-[9px] font-bold sm:inline-flex",
                                tier.border,
                                tier.bg,
                                tier.text,
                              )}
                            >
                              {tier.label}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Volume — compact bar */}
                      <div className="hidden w-24 items-center gap-1.5 sm:flex">
                        <div className="bg-muted h-1.5 flex-1 overflow-hidden rounded-full">
                          <div
                            className="from-primary to-primary/70 h-full rounded-full bg-gradient-to-r transition-all duration-500"
                            style={{ width: `${volumeBarWidth}%` }}
                          />
                        </div>
                        <span className="text-muted-foreground w-5 text-right font-mono text-[11px]">
                          {service.totalFeedback}
                        </span>
                      </div>

                      {/* Avg Score */}
                      <div className="hidden w-20 text-center md:block">
                        <span className="text-foreground font-mono text-xs font-semibold">
                          <AnimatedNumber
                            value={service.avgScore}
                            decimals={1}
                            duration={600}
                          />
                          <span className="text-muted-foreground">/7</span>
                        </span>
                      </div>

                      {/* Satisfaction Badge + Expand */}
                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            "rounded-lg border px-2 py-0.5 font-mono text-xs font-bold shadow-2xs",
                            tier.border,
                            tier.bg,
                            tier.text,
                          )}
                        >
                          {service.totalFeedback > 0 ? (
                            <AnimatedNumber
                              value={service.satisfactionRate}
                              suffix="%"
                              duration={600}
                            />
                          ) : (
                            "—"
                          )}
                        </span>
                        {isExpanded ? (
                          <ChevronRight className="text-muted-foreground size-3.5 rotate-90 transition-transform" />
                        ) : (
                          <ChevronRight className="text-muted-foreground size-3.5 transition-transform" />
                        )}
                      </div>
                    </div>

                    {/* Expanded Detail */}
                    {isExpanded && (
                      <div className="bg-muted/20 border-border/40 border-b px-3 py-3">
                        {/* Sentiment bar */}
                        <div className="bg-muted flex h-1.5 overflow-hidden rounded-full">
                          <div
                            style={{ width: `${positivePct}%` }}
                            className="bg-emerald-500 transition-all duration-500"
                          />
                          <div
                            style={{ width: `${neutralPct}%` }}
                            className="bg-slate-300 transition-all duration-500 dark:bg-slate-500"
                          />
                          <div
                            style={{ width: `${negativePct}%` }}
                            className="bg-amber-500 transition-all duration-500"
                          />
                        </div>

                        <div className="mt-2.5 grid grid-cols-3 gap-2">
                          <div className="bg-card border-border/50 rounded-lg border p-2 text-center">
                            <div className="mx-auto flex size-6 items-center justify-center rounded-md bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                              <ThumbsUp className="size-3" />
                            </div>
                            <p className="text-foreground mt-1 text-sm font-bold">
                              <AnimatedNumber
                                value={service.positiveCount}
                                duration={800}
                              />
                            </p>
                            <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                              <AnimatedNumber
                                value={Math.round(positivePct)}
                                suffix="%"
                                duration={600}
                              />
                            </p>
                          </div>
                          <div className="bg-card border-border/50 rounded-lg border p-2 text-center">
                            <div className="mx-auto flex size-6 items-center justify-center rounded-md bg-slate-100 text-slate-500 dark:bg-slate-500/10 dark:text-slate-400">
                              <Minus className="size-3" />
                            </div>
                            <p className="text-foreground mt-1 text-sm font-bold">
                              <AnimatedNumber
                                value={service.neutralCount}
                                duration={800}
                                delay={50}
                              />
                            </p>
                            <p className="text-muted-foreground text-[10px] font-semibold">
                              <AnimatedNumber
                                value={Math.round(neutralPct)}
                                suffix="%"
                                duration={600}
                                delay={50}
                              />
                            </p>
                          </div>
                          <div className="bg-card border-border/50 rounded-lg border p-2 text-center">
                            <div className="mx-auto flex size-6 items-center justify-center rounded-md bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                              <ThumbsDown className="size-3" />
                            </div>
                            <p className="text-foreground mt-1 text-sm font-bold">
                              <AnimatedNumber
                                value={service.negativeCount}
                                duration={800}
                                delay={100}
                              />
                            </p>
                            <p className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                              <AnimatedNumber
                                value={Math.round(negativePct)}
                                suffix="%"
                                duration={600}
                                delay={100}
                              />
                            </p>
                          </div>
                        </div>

                        <div className="bg-card border-border/50 mt-2 rounded-lg border p-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <Star className="size-3 fill-amber-400 text-amber-400" />
                              <span className="text-foreground text-[11px] font-semibold">
                                Average Score
                              </span>
                            </div>
                            <span className="text-foreground font-mono text-xs font-bold">
                              <AnimatedNumber
                                value={service.avgScore}
                                decimals={1}
                                duration={800}
                              />
                              {" / 7"}
                            </span>
                          </div>
                          <div className="bg-muted mt-1.5 h-1.5 overflow-hidden rounded-full">
                            <div
                              className={cn(
                                "h-full rounded-full bg-gradient-to-r transition-all duration-500",
                                tier.barColor,
                              )}
                              style={{
                                width: `${(service.avgScore / 7) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ===== GRID VIEW ===== */}
      {viewMode === "grid" && (
        <div className="space-y-2 p-4">
          {sortedServices.length === 0 ? (
            <div className="border-border/60 bg-muted/20 flex flex-col items-center justify-center rounded-xl border border-dashed py-10 text-center">
              <Stethoscope className="text-muted-foreground size-8" />
              <p className="text-muted-foreground mt-2 text-xs">
                No service data available for this period
              </p>
            </div>
          ) : (
            sortedServices.map((service, index) => {
              const isSelected = selectedServiceId === service.serviceId;
              const isExpanded = expandedId === service.serviceId;
              const tier = getTierColor(
                service.satisfactionRate,
                service.totalFeedback,
              );
              const volumeBarWidth =
                maxVolume > 0 ? (service.totalFeedback / maxVolume) * 100 : 0;

              const positivePct =
                service.totalFeedback > 0
                  ? (service.positiveCount / service.totalFeedback) * 100
                  : 0;
              const neutralPct =
                service.totalFeedback > 0
                  ? (service.neutralCount / service.totalFeedback) * 100
                  : 0;
              const negativePct =
                service.totalFeedback > 0
                  ? (service.negativeCount / service.totalFeedback) * 100
                  : 0;

              return (
                <div key={service.serviceId}>
                  <div
                    onClick={() => {
                      onSelectService?.(service.serviceId);
                      toggleExpand(service.serviceId);
                    }}
                    className={cn(
                      "group cursor-pointer rounded-xl border p-4 transition-all duration-200",
                      isSelected
                        ? "border-primary/50 bg-primary/[0.03] ring-primary/20 shadow-sm ring-1"
                        : "border-border/60 hover:border-primary/30 hover:bg-muted/20",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="bg-muted text-muted-foreground flex size-7 shrink-0 items-center justify-center rounded-lg font-mono text-[11px] font-bold">
                        {index + 1}
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-foreground truncate text-sm font-bold">
                            {service.serviceName}
                          </span>
                          {service.totalFeedback > 0 && (
                            <span
                              className={cn(
                                "hidden items-center rounded-md border px-1.5 py-0.5 text-[10px] font-bold sm:inline-flex",
                                tier.border,
                                tier.bg,
                                tier.text,
                              )}
                            >
                              {tier.label}
                            </span>
                          )}
                        </div>

                        <div className="mt-1.5 flex items-center gap-2.5">
                          <div className="bg-muted h-1.5 flex-1 overflow-hidden rounded-full">
                            <div
                              className="from-primary to-primary/70 h-full rounded-full bg-gradient-to-r transition-all duration-500"
                              style={{ width: `${volumeBarWidth}%` }}
                            />
                          </div>
                          <span className="text-muted-foreground w-16 text-right text-[11px] font-medium">
                            <AnimatedNumber
                              value={service.totalFeedback}
                              suffix=" reviews"
                              duration={800}
                            />
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "rounded-xl border px-3 py-1 font-mono text-sm font-bold shadow-xs",
                            tier.border,
                            tier.bg,
                            tier.text,
                          )}
                        >
                          {service.totalFeedback > 0 ? (
                            <AnimatedNumber
                              value={service.satisfactionRate}
                              suffix="%"
                              duration={800}
                            />
                          ) : (
                            "—"
                          )}
                        </span>
                        {isExpanded ? (
                          <ChevronRight className="text-muted-foreground size-4 rotate-90 transition-transform" />
                        ) : (
                          <ChevronRight className="text-muted-foreground size-4 transition-transform" />
                        )}
                      </div>
                    </div>

                    <div className="bg-muted mt-3 flex h-2 overflow-hidden rounded-full">
                      <div
                        style={{ width: `${positivePct}%` }}
                        className="bg-emerald-500 transition-all duration-500"
                      />
                      <div
                        style={{ width: `${neutralPct}%` }}
                        className="bg-slate-300 transition-all duration-500 dark:bg-slate-500"
                      />
                      <div
                        style={{ width: `${negativePct}%` }}
                        className="bg-amber-500 transition-all duration-500"
                      />
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-border/60 bg-muted/20 mx-2 mb-1 rounded-b-xl border border-t-0 px-4 py-3.5">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-card border-border/50 rounded-xl border p-3 text-center">
                          <div className="mx-auto flex size-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                            <ThumbsUp className="size-4" />
                          </div>
                          <p className="text-foreground mt-2 text-lg font-bold">
                            <AnimatedNumber
                              value={service.positiveCount}
                              duration={1000}
                            />
                          </p>
                          <p className="text-muted-foreground text-[11px]">
                            Positive
                          </p>
                          <p className="mt-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                            <AnimatedNumber
                              value={Math.round(positivePct)}
                              suffix="%"
                              duration={800}
                            />
                          </p>
                        </div>

                        <div className="bg-card border-border/50 rounded-xl border p-3 text-center">
                          <div className="mx-auto flex size-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-500/10 dark:text-slate-400">
                            <Minus className="size-4" />
                          </div>
                          <p className="text-foreground mt-2 text-lg font-bold">
                            <AnimatedNumber
                              value={service.neutralCount}
                              duration={1000}
                              delay={50}
                            />
                          </p>
                          <p className="text-muted-foreground text-[11px]">
                            Neutral
                          </p>
                          <p className="text-muted-foreground mt-0.5 text-[11px] font-semibold">
                            <AnimatedNumber
                              value={Math.round(neutralPct)}
                              suffix="%"
                              duration={800}
                              delay={50}
                            />
                          </p>
                        </div>

                        <div className="bg-card border-border/50 rounded-xl border p-3 text-center">
                          <div className="mx-auto flex size-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                            <ThumbsDown className="size-4" />
                          </div>
                          <p className="text-foreground mt-2 text-lg font-bold">
                            <AnimatedNumber
                              value={service.negativeCount}
                              duration={1000}
                              delay={100}
                            />
                          </p>
                          <p className="text-muted-foreground text-[11px]">
                            Attention
                          </p>
                          <p className="mt-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                            <AnimatedNumber
                              value={Math.round(negativePct)}
                              suffix="%"
                              duration={800}
                              delay={100}
                            />
                          </p>
                        </div>
                      </div>

                      <div className="bg-card border-border/50 mt-3 rounded-xl border p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Star className="size-3.5 fill-amber-400 text-amber-400" />
                            <span className="text-foreground text-xs font-semibold">
                              Average Score
                            </span>
                          </div>
                          <span className="text-foreground font-mono text-sm font-bold">
                            <AnimatedNumber
                              value={service.avgScore}
                              decimals={1}
                              duration={1000}
                            />
                            {" / 7"}
                          </span>
                        </div>
                        <div className="bg-muted mt-2 h-2 overflow-hidden rounded-full">
                          <div
                            className={cn(
                              "h-full rounded-full bg-gradient-to-r transition-all duration-500",
                              tier.barColor,
                            )}
                            style={{
                              width: `${(service.avgScore / 7) * 100}%`,
                            }}
                          />
                        </div>
                        <div className="text-muted-foreground mt-1.5 flex justify-between text-[10px]">
                          <span>0</span>
                          <span>1</span>
                          <span>2</span>
                          <span>3</span>
                          <span>4</span>
                          <span>5</span>
                          <span>6</span>
                          <span>7</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Footer */}
      <div className="border-border/60 text-muted-foreground flex items-center justify-between border-t px-5 py-3 text-[11px]">
        <span>Click any service to expand details</span>
        <span>{services.length} services tracked</span>
      </div>
    </div>
  );
}
