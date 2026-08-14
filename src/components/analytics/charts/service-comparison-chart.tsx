"use client";

import { useState } from "react";
import {
  ArrowDownUp,
  Stethoscope,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import type { ServiceComparisonItem } from "@/lib/analytics/types";
import { cn } from "@/lib/utils";

export function ServiceComparisonChart({
  services,
  onSelectService,
  selectedServiceId,
}: {
  services: ServiceComparisonItem[];
  onSelectService?: (serviceId: string) => void;
  selectedServiceId?: string;
}) {
  const [sortBy, setSortBy] = useState<"satisfaction" | "volume">("satisfaction");

  const sortedServices = [...services].sort((a, b) => {
    if (sortBy === "satisfaction") {
      return b.satisfactionRate - a.satisfactionRate || b.totalFeedback - a.totalFeedback;
    }
    return b.totalFeedback - a.totalFeedback || b.satisfactionRate - a.satisfactionRate;
  });

  return (
    <div className="flex flex-col rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Stethoscope className="size-4 text-emerald-600" />
            Clinical Service Performance
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Compare patient satisfaction by department and medical service
          </p>
        </div>

        {/* Sorting */}
        <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setSortBy("satisfaction")}
            className={cn(
              "flex items-center gap-1 rounded-md px-2.5 py-1 transition",
              sortBy === "satisfaction"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-slate-500 hover:text-slate-900",
            )}
          >
            <TrendingUp className="size-3" />
            Satisfaction %
          </button>
          <button
            type="button"
            onClick={() => setSortBy("volume")}
            className={cn(
              "flex items-center gap-1 rounded-md px-2.5 py-1 transition",
              sortBy === "volume"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-slate-500 hover:text-slate-900",
            )}
          >
            <ArrowDownUp className="size-3" />
            Volume
          </button>
        </div>
      </div>

      {/* Services Grid */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {sortedServices.map((service) => {
          const isSelected = selectedServiceId === service.serviceId;

          return (
            <div
              key={service.serviceId}
              onClick={() => onSelectService && onSelectService(service.serviceId)}
              className={cn(
                "group rounded-xl border p-3.5 transition cursor-pointer flex flex-col justify-between gap-2.5",
                isSelected
                  ? "bg-blue-50/80 border-blue-300 shadow-xs"
                  : "bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-xs",
              )}
            >
              {/* Title & Badge */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-bold text-slate-800 text-sm truncate">
                    {service.serviceName}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {service.totalFeedback} submissions · Avg {service.avgScore}/7
                  </p>
                </div>

                <span
                  className={cn(
                    "font-mono font-bold text-xs rounded px-2 py-0.5 border shrink-0",
                    service.satisfactionRate >= 75
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : service.satisfactionRate >= 50
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : "bg-amber-50 text-amber-700 border-amber-200",
                  )}
                >
                  {service.totalFeedback > 0 ? `${service.satisfactionRate}%` : "No data"}
                </span>
              </div>

              {/* Progress Meter */}
              <div className="space-y-1">
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
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

                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="text-emerald-700 font-medium">
                    {service.positiveCount} positive
                  </span>
                  {service.negativeCount > 0 && (
                    <span className="text-amber-700 font-medium flex items-center gap-0.5">
                      <TrendingDown className="size-2.5" />
                      {service.negativeCount} needs attention
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
