"use client";

import {
  Building2,
  CalendarDays,
  RotateCcw,
  SlidersHorizontal,
  Stethoscope,
  X,
} from "lucide-react";
import type { FeedbackRange } from "@/lib/feedback/types";
import type { BranchOption, ServiceOption } from "@/lib/feedback/types";
import { cn } from "@/lib/utils";

export type AnalyticsFilterValues = {
  range: FeedbackRange;
  customStart: string;
  customEnd: string;
  branchId: string;
  serviceId: string;
};

export const EMPTY_ANALYTICS_FILTERS: AnalyticsFilterValues = {
  range: "all",
  customStart: "",
  customEnd: "",
  branchId: "",
  serviceId: "",
};

export const ANALYTICS_RANGE_OPTIONS: Array<{
  value: FeedbackRange;
  label: string;
}> = [
  { value: "all", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "this_week", label: "This Week" },
  { value: "this_month", label: "This Month" },
  { value: "this_year", label: "This Year" },
  { value: "custom", label: "Custom Range" },
];

export function isAnalyticsFilterActive(values: AnalyticsFilterValues): boolean {
  return Boolean(
    values.range !== "all" ||
      values.branchId ||
      values.serviceId ||
      values.customStart ||
      values.customEnd,
  );
}

const selectClass =
  "h-9.5 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-xs transition focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60";

function FilterField({
  label,
  icon,
  children,
  className,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
        <span className="text-slate-400">{icon}</span>
        {label}
      </label>
      {children}
    </div>
  );
}

export function AnalyticsFilters({
  branches,
  services,
  values,
  onChange,
  onReset,
  disabled = false,
}: {
  branches: BranchOption[];
  services: ServiceOption[];
  values: AnalyticsFilterValues;
  onChange: (patch: Partial<AnalyticsFilterValues>) => void;
  onReset: () => void;
  disabled?: boolean;
}) {
  const hasActive = isAnalyticsFilterActive(values);
  const selectedBranch = branches.find((b) => b.id === values.branchId);
  const selectedService = services.find((s) => s.id === values.serviceId);
  const selectedRange = ANALYTICS_RANGE_OPTIONS.find((r) => r.value === values.range);

  return (
    <div className="rounded-xl border border-slate-200/90 bg-white p-4.5 shadow-sm">
      {/* Header */}
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <SlidersHorizontal className="size-4 text-slate-500" />
          <span>Analytics Timeframe & Scope</span>
          {hasActive && (
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
              Filtered View
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onReset}
          disabled={!hasActive || disabled}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 shadow-xs transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <RotateCcw className="size-3.5" />
          Reset to All Time
        </button>
      </div>

      {/* Main Filter Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* Time Period Range */}
        <FilterField label="Time Period" icon={<CalendarDays className="size-3.5" />}>
          <select
            value={values.range}
            onChange={(e) =>
              onChange({ range: e.target.value as FeedbackRange })
            }
            disabled={disabled}
            className={selectClass}
          >
            {ANALYTICS_RANGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FilterField>

        {/* Branch Filter */}
        <FilterField label="Branch Scope" icon={<Building2 className="size-3.5" />}>
          <select
            value={values.branchId}
            onChange={(e) => onChange({ branchId: e.target.value })}
            disabled={disabled}
            className={selectClass}
          >
            <option value="">All branches ({branches.length})</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
        </FilterField>

        {/* Service Filter */}
        <FilterField label="Clinical Service" icon={<Stethoscope className="size-3.5" />}>
          <select
            value={values.serviceId}
            onChange={(e) => onChange({ serviceId: e.target.value })}
            disabled={disabled}
            className={selectClass}
          >
            <option value="">All services ({services.length})</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>
        </FilterField>
      </div>

      {/* Custom Date Range Inputs */}
      {values.range === "custom" && (
        <div className="mt-3.5 rounded-lg border border-blue-100 bg-blue-50/50 p-3">
          <p className="mb-2 text-xs font-semibold text-blue-900">
            Specify Custom Analytics Date Range (Inclusive)
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:max-w-md">
            <FilterField label="From (Start Date)" icon={<CalendarDays className="size-3.5" />}>
              <input
                type="date"
                value={values.customStart}
                onChange={(e) => onChange({ customStart: e.target.value })}
                disabled={disabled}
                className={selectClass}
              />
            </FilterField>
            <FilterField label="To (End Date)" icon={<CalendarDays className="size-3.5" />}>
              <input
                type="date"
                value={values.customEnd}
                onChange={(e) => onChange({ customEnd: e.target.value })}
                disabled={disabled}
                className={selectClass}
              />
            </FilterField>
          </div>
        </div>
      )}

      {/* Active Filter Chips */}
      {hasActive && (
        <div className="mt-3.5 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
          <span className="text-xs font-medium text-slate-400">Active Scope:</span>

          {values.range !== "all" && (
            <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 border border-purple-200">
              Period: {selectedRange?.label || values.range}
              {values.range === "custom" && values.customStart && values.customEnd && (
                <span className="text-[11px] text-purple-600">
                  ({values.customStart} → {values.customEnd})
                </span>
              )}
              <button
                type="button"
                onClick={() =>
                  onChange({ range: "all", customStart: "", customEnd: "" })
                }
                className="text-purple-500 hover:text-purple-700"
              >
                <X className="size-3" />
              </button>
            </span>
          )}

          {selectedBranch && (
            <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 border border-blue-200">
              Branch: {selectedBranch.name}
              <button
                type="button"
                onClick={() => onChange({ branchId: "" })}
                className="text-blue-500 hover:text-blue-700"
              >
                <X className="size-3" />
              </button>
            </span>
          )}

          {selectedService && (
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 border border-emerald-200">
              Service: {selectedService.name}
              <button
                type="button"
                onClick={() => onChange({ serviceId: "" })}
                className="text-emerald-500 hover:text-emerald-700"
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
