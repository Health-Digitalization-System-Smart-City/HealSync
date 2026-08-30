"use client";

import * as React from "react";
import { ArrowDownUp, Stethoscope, TrendingDown, TrendingUp } from "lucide-react";
import type { ServiceComparisonItem } from "@/lib/analytics/types";
import { cn } from "@/lib/utils";

export interface ServicePerformanceVisualProps {
  services: ServiceComparisonItem[];
  onSelectService?: (serviceId: string) => void;
  selectedServiceId?: string;
  className?: string;
}

export function ServicePerformanceVisual({
  services,
  onSelectService,
  selectedServiceId,
  className,
}: ServicePerformanceVisualProps) {
  const [sortBy, setSortBy] = React.useState<"satisfaction" | "volume" | "attention">("satisfaction");

  const sortedServices = React.useMemo(() => {
    return [...services].sort((a, b) => {
      if (sortBy === "satisfaction") {
        return b.satisfactionRate - a.satisfactionRate || b.totalFeedback - a.totalFeedback;
      }
      if (sortBy === "volume") {
        return b.totalFeedback - a.totalFeedback || b.satisfactionRate - a.satisfactionRate;
      }
      return b.negativeCount - a.negativeCount || b.totalFeedback - a.totalFeedback;
    });
  }, [services, sortBy]);

  return (
    <div
      className={cn(
        "border-border/80 bg-card flex flex-col justify-between overflow-hidden rounded-2xl border p-5 shadow-xs transition-all",
        className,
      )}
    >
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Stethoscope className="size-4" aria-hidden />
            </span>
            <h3 className="text-foreground text-base font-bold tracking-tight">
              Clinical Service Satisfaction
            </h3>
          </div>
          <p className="text-muted-foreground mt-1 text-xs">
            Compare satisfaction and response quality across medical departments
          </p>
        </div>

        {/* Sort Controls */}
        <div className="bg-muted/60 border-border/60 flex items-center rounded-lg border p-0.5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setSortBy("satisfaction")}
            className={cn(
              "flex items-center gap-1 rounded-md px-2.5 py-1 transition",
              sortBy === "satisfaction"
                ? "bg-card text-foreground font-bold shadow-xs"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <TrendingUp className="size-3 text-emerald-500" />
            Satisfaction
          </button>
          <button
            type="button"
            onClick={() => setSortBy("volume")}
            className={cn(
              "flex items-center gap-1 rounded-md px-2.5 py-1 transition",
              sortBy === "volume"
                ? "bg-card text-foreground font-bold shadow-xs"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <ArrowDownUp className="size-3 text-blue-500" />
            Volume
          </button>
          <button
            type="button"
            onClick={() => setSortBy("attention")}
            className={cn(
              "flex items-center gap-1 rounded-md px-2.5 py-1 transition",
              sortBy === "attention"
                ? "bg-card text-foreground font-bold shadow-xs"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <TrendingDown className="size-3 text-amber-500" />
            Attention
          </button>
        </div>
      </div>

      {/* Services Grid */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {sortedServices.length === 0 ? (
          <p className="text-muted-foreground col-span-2 py-6 text-center text-xs">
            No clinical service data recorded in this timeframe.
          </p>
        ) : (
          sortedServices.map((service) => {
            const isSelected = selectedServiceId === service.serviceId;
            const hasFeedback = service.totalFeedback > 0;

            return (
              <div
                key={service.serviceId}
                onClick={() => onSelectService?.(service.serviceId)}
                className={cn(
                  "group flex cursor-pointer flex-col justify-between gap-3 rounded-xl border p-4 transition-all duration-200",
                  isSelected
                    ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary/30"
                    : "border-border/70 bg-card hover:border-primary/40 hover:bg-muted/30",
                )}
              >
                {/* Title & Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-foreground truncate text-sm font-bold">
                      {service.serviceName}
                    </p>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      {service.totalFeedback} submissions · Avg {service.avgScore.toFixed(1)}/7
                    </p>
                  </div>

                  <span
                    className={cn(
                      "shrink-0 rounded-lg border px-2 py-0.5 font-mono text-xs font-bold shadow-2xs",
                      service.satisfactionRate >= 75
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
                        : service.satisfactionRate >= 50
                          ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300"
                          : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
                    )}
                  >
                    {hasFeedback ? `${service.satisfactionRate}%` : "No data"}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                    <div
                      style={{ width: `${service.satisfactionRate}%` }}
                      className={cn(
                        "h-full rounded-full transition-all duration-300",
                        service.satisfactionRate >= 75
                          ? "bg-emerald-500"
                          : service.satisfactionRate >= 50
                            ? "bg-blue-600"
                            : "bg-amber-500",
                      )}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                      {service.positiveCount} positive
                    </span>
                    {service.negativeCount > 0 ? (
                      <span className="flex items-center gap-1 font-semibold text-amber-700 dark:text-amber-400">
                        <TrendingDown className="size-3" />
                        {service.negativeCount} needs attention
                      </span>
                    ) : (
                      <span className="text-muted-foreground">0 flagged</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Helper */}
      <div className="border-border/60 mt-4 flex items-center justify-between border-t pt-3 text-[11px] text-muted-foreground">
        <span>Click any service to filter entire dashboard</span>
        <span>{services.length} medical services tracked</span>
      </div>
    </div>
  );
}
