"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  Stethoscope,
} from "lucide-react";
import type {
  BranchComparisonItem,
  ServiceComparisonItem,
} from "@/lib/analytics/types";
import { cn } from "@/lib/utils";

export interface AttentionItem {
  id: string;
  type: "branch" | "service" | "trend" | "volume";
  title: string;
  severity: "critical" | "warning" | "info";
  description: string;
  metric: string;
  actionHref?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export interface NeedsAttentionSectionProps {
  branches?: BranchComparisonItem[];
  services?: ServiceComparisonItem[];
  negativeCount?: number;
  totalCount?: number;
  satisfactionRate?: number;
  onFilterBranch?: (branchId: string) => void;
  onFilterService?: (serviceId: string) => void;
  className?: string;
}

const SEVERITY_STYLES = {
  critical: {
    badge:
      "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300",
    icon: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200/60 dark:border-rose-500/20",
    border: "border-rose-200/70 hover:border-rose-300 dark:border-rose-500/20",
    label: "Critical Attention",
  },
  warning: {
    badge:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
    icon: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200/60 dark:border-amber-500/20",
    border:
      "border-amber-200/70 hover:border-amber-300 dark:border-amber-500/20",
    label: "Requires Review",
  },
  info: {
    badge:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300",
    icon: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200/60 dark:border-blue-500/20",
    border: "border-blue-200/70 hover:border-blue-300 dark:border-blue-500/20",
    label: "Observation",
  },
};

export function NeedsAttentionSection({
  branches = [],
  services = [],
  negativeCount = 0,
  onFilterBranch,
  onFilterService,
  className,
}: NeedsAttentionSectionProps) {
  // Dynamically compute real attention items from actual application analytics data
  const attentionItems = React.useMemo(() => {
    const items: AttentionItem[] = [];

    // 1. Identify lowest scoring / highest negative branch
    const problematicBranches = branches
      .filter(
        (b) =>
          b.totalFeedback >= 3 &&
          (b.satisfactionRate < 65 || b.negativeCount >= 3),
      )
      .sort(
        (a, b) =>
          a.satisfactionRate - b.satisfactionRate ||
          b.negativeCount - a.negativeCount,
      );

    if (problematicBranches.length > 0) {
      const b = problematicBranches[0];
      items.push({
        id: `branch-${b.branchId}`,
        type: "branch",
        title: `${b.branchName} Branch`,
        severity: b.satisfactionRate < 50 ? "critical" : "warning",
        description: `Satisfaction is at ${b.satisfactionRate}% with ${b.negativeCount} negative feedback submissions flagged for review.`,
        metric: `${b.satisfactionRate}% Satisfaction · ${b.negativeCount} Issues`,
        actionLabel: "Filter to Branch",
        onAction: () => onFilterBranch?.(b.branchId),
      });
    }

    // 2. Identify clinical service with highest negative concentrations
    const problematicServices = services
      .filter(
        (s) =>
          s.totalFeedback >= 3 &&
          (s.satisfactionRate < 65 || s.negativeCount >= 3),
      )
      .sort(
        (a, b) =>
          a.satisfactionRate - b.satisfactionRate ||
          b.negativeCount - a.negativeCount,
      );

    if (problematicServices.length > 0) {
      const s = problematicServices[0];
      items.push({
        id: `service-${s.serviceId}`,
        type: "service",
        title: `${s.serviceName} Department`,
        severity: s.satisfactionRate < 50 ? "critical" : "warning",
        description: `${s.negativeCount} patient ratings require clinical workflow review (average score ${s.avgScore.toFixed(1)}/7).`,
        metric: `${s.satisfactionRate}% Satisfaction · Avg ${s.avgScore.toFixed(1)}/7`,
        actionLabel: "Filter to Service",
        onAction: () => onFilterService?.(s.serviceId),
      });
    }

    // 3. Overall clinic threshold flag
    if (negativeCount >= 5) {
      items.push({
        id: "overall-negative",
        type: "trend",
        title: "Negative Feedback Volume",
        severity: negativeCount >= 10 ? "critical" : "warning",
        description: `There are ${negativeCount} submissions categorized under "Needs Attention" across all active clinic departments.`,
        metric: `${negativeCount} Submissions Flagged`,
        actionHref: "/dashboard/feedback",
        actionLabel: "Open Feedback Management",
      });
    }

    return items;
  }, [branches, services, negativeCount, onFilterBranch, onFilterService]);

  return (
    <div
      className={cn(
        "border-border/80 bg-card flex flex-col justify-between overflow-hidden rounded-2xl border p-5 shadow-xs transition-all",
        className,
      )}
    >
      {/* Header */}
      <div className="border-border/60 flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <ShieldAlert className="size-4" aria-hidden />
          </span>
          <div>
            <h3 className="text-foreground text-base font-bold tracking-tight">
              Needs Attention & Action Items
            </h3>
            <p className="text-muted-foreground mt-0.5 text-xs">
              Automated operational flags derived from real patient sentiment
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/tasks"
          className="text-primary hover:text-primary/80 hidden items-center gap-1 text-xs font-semibold sm:inline-flex"
        >
          <span>View Task Board</span>
          <ArrowRight className="size-3" />
        </Link>
      </div>

      {/* Issues List */}
      <div className="mt-4 space-y-3">
        {attentionItems.length === 0 ? (
          <div className="border-border/60 bg-muted/20 flex flex-col items-center justify-center rounded-xl border border-dashed py-8 text-center">
            <CheckCircle2 className="size-8 text-emerald-500" />
            <p className="text-foreground mt-2 text-sm font-bold">
              All Clinical Metrics Within Healthy Thresholds
            </p>
            <p className="text-muted-foreground mt-1 max-w-sm text-xs">
              No branches or medical services currently fall below critical
              satisfaction rates.
            </p>
          </div>
        ) : (
          attentionItems.map((item) => {
            const style = SEVERITY_STYLES[item.severity];

            return (
              <div
                key={item.id}
                className={cn(
                  "group bg-card flex flex-col justify-between gap-3 rounded-xl border p-4 transition-all duration-200 sm:flex-row sm:items-center",
                  style.border,
                )}
              >
                {/* Left content */}
                <div className="flex min-w-0 items-start gap-3">
                  <span
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-xl border shadow-xs",
                      style.icon,
                    )}
                  >
                    {item.type === "branch" ? (
                      <Building2 className="size-4" />
                    ) : item.type === "service" ? (
                      <Stethoscope className="size-4" />
                    ) : (
                      <AlertTriangle className="size-4" />
                    )}
                  </span>

                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-foreground text-sm font-bold">
                        {item.title}
                      </h4>
                      <span
                        className={cn(
                          "rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase",
                          style.badge,
                        )}
                      >
                        {style.label}
                      </span>
                    </div>

                    <p className="text-muted-foreground text-xs leading-relaxed">
                      {item.description}
                    </p>

                    <p className="text-foreground/80 font-mono text-[11px] font-semibold">
                      {item.metric}
                    </p>
                  </div>
                </div>

                {/* Right Action */}
                <div className="flex shrink-0 items-center sm:self-center">
                  {item.actionHref ? (
                    <Link
                      href={item.actionHref}
                      className="border-border bg-card hover:bg-muted text-foreground inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold shadow-2xs transition"
                    >
                      <span>{item.actionLabel || "Inspect"}</span>
                      <ExternalLink className="text-muted-foreground size-3" />
                    </Link>
                  ) : item.onAction ? (
                    <button
                      type="button"
                      onClick={item.onAction}
                      className="border-border bg-card hover:bg-muted text-foreground inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold shadow-2xs transition"
                    >
                      <span>{item.actionLabel || "Drill Down"}</span>
                      <ArrowRight className="text-primary size-3" />
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="border-border/60 text-muted-foreground mt-4 flex items-center justify-between border-t pt-3 text-[11px]">
        <span>
          Deterministic prioritization based on low scores and negative volume
        </span>
        <Link
          href="/dashboard/tasks"
          className="hover:text-foreground underline"
        >
          Create operational task
        </Link>
      </div>
    </div>
  );
}
