"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  CalendarDays,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Star,
  Stethoscope,
  X,
} from "lucide-react";
import { RANGE_OPTIONS } from "@/lib/feedback/ranges";
import type {
  BranchOption,
  FeedbackRange,
  RatingOption,
  ServiceOption,
} from "@/lib/feedback/types";
import { cn } from "@/lib/utils";

export type FeedbackFilterValues = {
  search: string;
  branchId: string;
  serviceId: string;
  rating: string;
  range: FeedbackRange;
  customStart: string;
  customEnd: string;
};

export const EMPTY_FILTERS: FeedbackFilterValues = {
  search: "",
  branchId: "",
  serviceId: "",
  rating: "",
  range: "all",
  customStart: "",
  customEnd: "",
};

export function isFilterActive(values: FeedbackFilterValues): boolean {
  return Boolean(
    values.search ||
      values.branchId ||
      values.serviceId ||
      values.rating ||
      values.range !== "all" ||
      values.customStart ||
      values.customEnd,
  );
}

export function activeFilterCount(values: FeedbackFilterValues): number {
  return (
    (values.search ? 1 : 0) +
    (values.branchId ? 1 : 0) +
    (values.serviceId ? 1 : 0) +
    (values.rating ? 1 : 0) +
    (values.range !== "all" ? 1 : 0)
  );
}

const inputOrSelectClass =
  "h-9.5 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-xs transition placeholder:text-slate-400 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60";

function Field({
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

export function FeedbackFilters({
  branches,
  services,
  ratings,
  values,
  onChange,
  onReset,
  disabled = false,
}: {
  branches: BranchOption[];
  services: ServiceOption[];
  ratings: RatingOption[];
  values: FeedbackFilterValues;
  onChange: (patch: Partial<FeedbackFilterValues>) => void;
  onReset: () => void;
  disabled?: boolean;
}) {
  const [prevSearchProp, setPrevSearchProp] = useState(values.search);
  const [searchInput, setSearchInput] = useState(values.search);

  if (values.search !== prevSearchProp) {
    setPrevSearchProp(values.search);
    setSearchInput(values.search);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== values.search) {
        onChange({ search: searchInput });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, values.search, onChange]);

  const activeCount = activeFilterCount(values);
  const hasActive = isFilterActive(values);

  const selectedBranch = branches.find((b) => b.id === values.branchId);
  const selectedService = services.find((s) => s.id === values.serviceId);
  const selectedRating = ratings.find((r) => r.value === values.rating);
  const selectedRange = RANGE_OPTIONS.find((r) => r.value === values.range);

  return (
    <div className="rounded-xl border border-slate-200/90 bg-white p-4.5 shadow-sm">
      {/* Header with Title & Reset */}
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <SlidersHorizontal className="size-4 text-slate-500" />
          <span>Filters & Search</span>
          {activeCount > 0 && (
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
              {activeCount} active
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
          Reset filters
        </button>
      </div>

      {/* Main Filter Controls Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {/* Search */}
        <Field label="Keyword Search" icon={<Search className="size-3.5" />}>
          <div className="relative">
            <input
              type="text"
              placeholder="Search comments, ID..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              disabled={disabled}
              className={cn(inputOrSelectClass, "pr-8")}
            />
            {searchInput && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  setSearchInput("");
                  onChange({ search: "" });
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </Field>

        {/* Branch */}
        <Field label="Branch" icon={<Building2 className="size-3.5" />}>
          <select
            value={values.branchId}
            onChange={(event) => onChange({ branchId: event.target.value })}
            disabled={disabled}
            className={inputOrSelectClass}
          >
            <option value="">All branches ({branches.length})</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
        </Field>

        {/* Service */}
        <Field label="Service" icon={<Stethoscope className="size-3.5" />}>
          <select
            value={values.serviceId}
            onChange={(event) => onChange({ serviceId: event.target.value })}
            disabled={disabled}
            className={inputOrSelectClass}
          >
            <option value="">All services ({services.length})</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>
        </Field>

        {/* Rating */}
        <Field label="Rating Level" icon={<Star className="size-3.5" />}>
          <select
            value={values.rating}
            onChange={(event) => onChange({ rating: event.target.value })}
            disabled={disabled}
            className={inputOrSelectClass}
          >
            <option value="">All ratings</option>
            {ratings.map((rating) => (
              <option key={rating.value} value={rating.value}>
                {rating.label} ({rating.score}/7)
              </option>
            ))}
          </select>
        </Field>

        {/* Date Range */}
        <Field label="Time Period" icon={<CalendarDays className="size-3.5" />}>
          <select
            value={values.range}
            onChange={(event) =>
              onChange({ range: event.target.value as FeedbackRange })
            }
            disabled={disabled}
            className={inputOrSelectClass}
          >
            {RANGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {/* Custom Date Pickers Sub-row */}
      {values.range === "custom" && (
        <div className="mt-3.5 rounded-lg border border-blue-100 bg-blue-50/50 p-3">
          <p className="mb-2 text-xs font-semibold text-blue-900">
            Specify Custom Date Range (Inclusive)
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:max-w-md">
            <Field label="Start Date (From)" icon={<CalendarDays className="size-3.5" />}>
              <input
                type="date"
                value={values.customStart}
                onChange={(event) => onChange({ customStart: event.target.value })}
                disabled={disabled}
                className={inputOrSelectClass}
              />
            </Field>
            <Field label="End Date (To)" icon={<CalendarDays className="size-3.5" />}>
              <input
                type="date"
                value={values.customEnd}
                onChange={(event) => onChange({ customEnd: event.target.value })}
                disabled={disabled}
                className={inputOrSelectClass}
              />
            </Field>
          </div>
        </div>
      )}

      {/* Active Filter Chips / Pills */}
      {hasActive && (
        <div className="mt-3.5 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
          <span className="text-xs font-medium text-slate-400">Active:</span>

          {values.search && (
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
              Keyword: &ldquo;{values.search}&rdquo;
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  onChange({ search: "" });
                }}
                className="text-slate-400 hover:text-slate-600"
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

          {selectedRating && (
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 border border-amber-200">
              Rating: {selectedRating.label}
              <button
                type="button"
                onClick={() => onChange({ rating: "" })}
                className="text-amber-500 hover:text-amber-700"
              >
                <X className="size-3" />
              </button>
            </span>
          )}

          {values.range !== "all" && (
            <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 border border-purple-200">
              Range: {selectedRange?.label || values.range}
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
        </div>
      )}
    </div>
  );
}
