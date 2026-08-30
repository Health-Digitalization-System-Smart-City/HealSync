"use client";

import * as React from "react";
import {
  Building2,
  CalendarDays,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  Stethoscope,
  X,
} from "lucide-react";
import type {
  BranchOption,
  FeedbackRange,
  ServiceOption,
} from "@/lib/feedback/types";
import { cn } from "@/lib/utils";

export type DashboardFilterValues = {
  range: FeedbackRange;
  customStart: string;
  customEnd: string;
  branchId: string;
  serviceId: string;
};

export const EMPTY_DASHBOARD_FILTERS: DashboardFilterValues = {
  range: "all",
  customStart: "",
  customEnd: "",
  branchId: "",
  serviceId: "",
};

export const DASHBOARD_RANGE_PRESETS: Array<{
  value: FeedbackRange;
  label: string;
  shortLabel: string;
}> = [
  { value: "all", label: "All Time", shortLabel: "All" },
  { value: "today", label: "Today", shortLabel: "Today" },
  { value: "yesterday", label: "Yesterday", shortLabel: "Yesterday" },
  { value: "this_week", label: "This Week", shortLabel: "Week" },
  { value: "last_7_days", label: "Last 7 Days", shortLabel: "7D" },
  { value: "this_month", label: "This Month", shortLabel: "Month" },
  { value: "last_30_days", label: "Last 30 Days", shortLabel: "30D" },
  { value: "this_year", label: "This Year", shortLabel: "Year" },
  { value: "custom", label: "Custom Range", shortLabel: "Custom" },
];

export function isDashboardFilterActive(
  values: DashboardFilterValues,
): boolean {
  return Boolean(
    values.range !== "all" ||
    values.branchId ||
    values.serviceId ||
    values.customStart ||
    values.customEnd,
  );
}

export interface DashboardGlobalFiltersProps {
  branches: BranchOption[];
  services: ServiceOption[];
  values: DashboardFilterValues;
  onChange: (patch: Partial<DashboardFilterValues>) => void;
  onReset: () => void;
  disabled?: boolean;
  totalEvaluated?: number;
  className?: string;
}

export function DashboardGlobalFilters({
  branches,
  services,
  values,
  onChange,
  onReset,
  disabled = false,
  totalEvaluated,
  className,
}: DashboardGlobalFiltersProps) {
  const hasActive = isDashboardFilterActive(values);
  const selectedBranch = branches.find((b) => b.id === values.branchId);
  const selectedService = services.find((s) => s.id === values.serviceId);
  const selectedRange = DASHBOARD_RANGE_PRESETS.find(
    (r) => r.value === values.range,
  );

  return (
    <div
      className={cn(
        "border-border/80 bg-card rounded-2xl border p-4.5 shadow-xs transition-all",
        className,
      )}
    >
      {/* Top Bar: Title, Range quick-pills, and Reset */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Left Title & Status */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-primary/10 text-primary dark:bg-primary/20 flex size-7 items-center justify-center rounded-lg">
            <SlidersHorizontal className="size-3.5" aria-hidden />
          </div>
          <span className="text-foreground text-sm font-bold">
            Interactive Scope & Filters
          </span>

          {hasActive ? (
            <span className="border-primary/30 bg-primary/10 text-primary rounded-full border px-2 py-0.5 text-[11px] font-bold">
              Active Filters
            </span>
          ) : (
            <span className="text-muted-foreground text-xs">
              Viewing organization-wide data
            </span>
          )}

          {typeof totalEvaluated === "number" && (
            <span className="bg-muted text-muted-foreground hidden items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold sm:inline-flex">
              <Sparkles className="text-primary size-3" />
              {totalEvaluated.toLocaleString()} submissions evaluated
            </span>
          )}
        </div>

        {/* Right: Quick Range Presets & Reset button */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Quick preset segmented buttons for fast interaction */}
          <div className="bg-muted/60 border-border/60 flex items-center gap-0.5 rounded-lg border p-0.5 text-xs font-semibold">
            {(
              [
                "all",
                "today",
                "last_7_days",
                "this_month",
                "last_30_days",
              ] as const
            ).map((rangePreset) => {
              const preset = DASHBOARD_RANGE_PRESETS.find(
                (p) => p.value === rangePreset,
              );
              if (!preset) return null;
              const isActive = values.range === rangePreset;
              return (
                <button
                  key={rangePreset}
                  type="button"
                  disabled={disabled}
                  onClick={() => onChange({ range: rangePreset })}
                  className={cn(
                    "rounded-md px-2.5 py-1 transition-all",
                    isActive
                      ? "bg-card text-foreground font-bold shadow-xs"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {preset.shortLabel}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={onReset}
            disabled={!hasActive || disabled}
            className="border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium shadow-2xs transition disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RotateCcw className="size-3.5" aria-hidden />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Select Dropdowns Row */}
      <div className="mt-3.5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* Time Period Selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-muted-foreground flex items-center gap-1.5 text-xs font-semibold">
            <CalendarDays className="text-primary size-3.5" />
            <span>Time Period</span>
          </label>
          <select
            value={values.range}
            onChange={(e) =>
              onChange({ range: e.target.value as FeedbackRange })
            }
            disabled={disabled}
            className="border-border bg-card text-foreground focus:ring-ring h-9.5 w-full rounded-xl border px-3 text-xs font-medium transition outline-none focus:ring-2 disabled:opacity-60"
          >
            {DASHBOARD_RANGE_PRESETS.map((option) => (
              <option
                key={option.value}
                value={option.value}
                className="bg-popover text-foreground"
              >
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Branch Scope */}
        <div className="flex flex-col gap-1.5">
          <label className="text-muted-foreground flex items-center gap-1.5 text-xs font-semibold">
            <Building2 className="text-primary size-3.5" />
            <span>Clinic Branch</span>
          </label>
          <select
            value={values.branchId}
            onChange={(e) => onChange({ branchId: e.target.value })}
            disabled={disabled}
            className="border-border bg-card text-foreground focus:ring-ring h-9.5 w-full rounded-xl border px-3 text-xs font-medium transition outline-none focus:ring-2 disabled:opacity-60"
          >
            <option value="" className="bg-popover text-foreground">
              All Branches ({branches.length})
            </option>
            {branches.map((branch) => (
              <option
                key={branch.id}
                value={branch.id}
                className="bg-popover text-foreground"
              >
                {branch.name}
              </option>
            ))}
          </select>
        </div>

        {/* Clinical Service Scope */}
        <div className="flex flex-col gap-1.5">
          <label className="text-muted-foreground flex items-center gap-1.5 text-xs font-semibold">
            <Stethoscope className="text-primary size-3.5" />
            <span>Clinical Service</span>
          </label>
          <select
            value={values.serviceId}
            onChange={(e) => onChange({ serviceId: e.target.value })}
            disabled={disabled}
            className="border-border bg-card text-foreground focus:ring-ring h-9.5 w-full rounded-xl border px-3 text-xs font-medium transition outline-none focus:ring-2 disabled:opacity-60"
          >
            <option value="" className="bg-popover text-foreground">
              All Services ({services.length})
            </option>
            {services.map((service) => (
              <option
                key={service.id}
                value={service.id}
                className="bg-popover text-foreground"
              >
                {service.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Custom Date Pickers when 'custom' is selected */}
      {values.range === "custom" && (
        <div className="border-border/80 bg-muted/30 mt-3.5 rounded-xl border p-3">
          <p className="text-foreground mb-2 text-xs font-semibold">
            Specify Custom Feedback Dates (Inclusive)
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:max-w-md">
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-[11px] font-medium">
                Start Date
              </span>
              <input
                type="date"
                value={values.customStart}
                onChange={(e) => onChange({ customStart: e.target.value })}
                disabled={disabled}
                className="border-border bg-card text-foreground focus:ring-ring h-9 rounded-lg border px-3 text-xs outline-none focus:ring-2"
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-[11px] font-medium">
                End Date
              </span>
              <input
                type="date"
                value={values.customEnd}
                onChange={(e) => onChange({ customEnd: e.target.value })}
                disabled={disabled}
                className="border-border bg-card text-foreground focus:ring-ring h-9 rounded-lg border px-3 text-xs outline-none focus:ring-2"
              />
            </div>
          </div>
        </div>
      )}

      {/* Active Filter Chips */}
      {hasActive && (
        <div className="border-border/60 mt-3.5 flex flex-wrap items-center gap-2 border-t pt-3">
          <span className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
            Active Scope:
          </span>

          {values.range !== "all" && (
            <span className="bg-primary/10 border-primary/30 text-primary inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium">
              <span>{selectedRange?.label || values.range}</span>
              {values.range === "custom" &&
                values.customStart &&
                values.customEnd && (
                  <span className="text-muted-foreground text-[10px]">
                    ({values.customStart} → {values.customEnd})
                  </span>
                )}
              <button
                type="button"
                aria-label="Remove period filter"
                onClick={() =>
                  onChange({ range: "all", customStart: "", customEnd: "" })
                }
                className="hover:text-primary/70 focus-visible:ring-ring flex size-3.5 items-center justify-center rounded-full"
              >
                <X className="size-3" />
              </button>
            </span>
          )}

          {selectedBranch && (
            <span className="border-border bg-muted/60 text-foreground inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium">
              <Building2 className="text-muted-foreground size-3" />
              <span>{selectedBranch.name}</span>
              <button
                type="button"
                aria-label="Remove branch filter"
                onClick={() => onChange({ branchId: "" })}
                className="hover:text-muted-foreground text-muted-foreground/60 flex size-3.5 items-center justify-center rounded-full"
              >
                <X className="size-3" />
              </button>
            </span>
          )}

          {selectedService && (
            <span className="border-border bg-muted/60 text-foreground inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium">
              <Stethoscope className="text-muted-foreground size-3" />
              <span>{selectedService.name}</span>
              <button
                type="button"
                aria-label="Remove service filter"
                onClick={() => onChange({ serviceId: "" })}
                className="hover:text-muted-foreground text-muted-foreground/60 flex size-3.5 items-center justify-center rounded-full"
              >
                <X className="size-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
