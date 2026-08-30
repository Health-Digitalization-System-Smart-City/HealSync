"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { Info, TrendingDown, TrendingUp } from "lucide-react";
import { Tooltip } from "@base-ui/react/tooltip";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/ui/animated-number";

export type MetricAccent =
  "teal" | "blue" | "emerald" | "amber" | "violet" | "rose" | "sky";

const ACCENT_MAP: Record<
  MetricAccent,
  {
    icon: string;
    borderHover: string;
    topBar: string;
    glow: string;
    badge: string;
  }
> = {
  teal: {
    icon: "bg-teal-50 text-teal-600 border border-teal-200/60 dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/20",
    borderHover: "hover:border-teal-300/80 dark:hover:border-teal-500/40",
    topBar: "from-teal-500 via-emerald-400 to-teal-400",
    glow: "group-hover:shadow-teal-500/5",
    badge:
      "bg-teal-50 text-teal-700 border-teal-200/60 dark:bg-teal-500/10 dark:text-teal-300 dark:border-teal-500/20",
  },
  blue: {
    icon: "bg-blue-50 text-blue-600 border border-blue-200/60 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
    borderHover: "hover:border-blue-300/80 dark:hover:border-blue-500/40",
    topBar: "from-blue-600 via-sky-400 to-blue-500",
    glow: "group-hover:shadow-blue-500/5",
    badge:
      "bg-blue-50 text-blue-700 border-blue-200/60 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20",
  },
  emerald: {
    icon: "bg-emerald-50 text-emerald-600 border border-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
    borderHover: "hover:border-emerald-300/80 dark:hover:border-emerald-500/40",
    topBar: "from-emerald-500 via-teal-400 to-emerald-400",
    glow: "group-hover:shadow-emerald-500/5",
    badge:
      "bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20",
  },
  amber: {
    icon: "bg-amber-50 text-amber-600 border border-amber-200/60 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
    borderHover: "hover:border-amber-300/80 dark:hover:border-amber-500/40",
    topBar: "from-amber-500 via-orange-400 to-amber-400",
    glow: "group-hover:shadow-amber-500/5",
    badge:
      "bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20",
  },
  violet: {
    icon: "bg-violet-50 text-violet-600 border border-violet-200/60 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/20",
    borderHover: "hover:border-violet-300/80 dark:hover:border-violet-500/40",
    topBar: "from-violet-600 via-fuchsia-400 to-purple-500",
    glow: "group-hover:shadow-violet-500/5",
    badge:
      "bg-violet-50 text-violet-700 border-violet-200/60 dark:bg-violet-500/10 dark:text-violet-300 dark:border-violet-500/20",
  },
  rose: {
    icon: "bg-rose-50 text-rose-600 border border-rose-200/60 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20",
    borderHover: "hover:border-rose-300/80 dark:hover:border-rose-500/40",
    topBar: "from-rose-500 via-pink-400 to-rose-400",
    glow: "group-hover:shadow-rose-500/5",
    badge:
      "bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20",
  },
  sky: {
    icon: "bg-sky-50 text-sky-600 border border-sky-200/60 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20",
    borderHover: "hover:border-sky-300/80 dark:hover:border-sky-500/40",
    topBar: "from-sky-500 via-cyan-400 to-blue-400",
    glow: "group-hover:shadow-sky-500/5",
    badge:
      "bg-sky-50 text-sky-700 border-sky-200/60 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/20",
  },
};

export interface KPIMetricCardProps {
  label: string;
  value: React.ReactNode;
  /** Numeric value for animated counting (optional — falls back to static `value`) */
  numericValue?: number;
  /** Number of decimal places when using numericValue */
  decimals?: number;
  /** Prefix for animated value (e.g., "$") */
  prefix?: string;
  /** Suffix for animated value (e.g., "%") */
  suffix?: string;
  icon: LucideIcon;
  accent?: MetricAccent;
  detail?: React.ReactNode;
  trend?: {
    value: string | number;
    direction?: "up" | "down" | "neutral";
    label?: string;
    isPositive?: boolean;
  };
  tooltipText?: string;
  onClick?: () => void;
  className?: string;
}

export function KPIMetricCard({
  label,
  value,
  numericValue,
  decimals = 0,
  prefix = "",
  suffix = "",
  icon: Icon,
  accent = "teal",
  detail,
  trend,
  tooltipText,
  onClick,
  className,
}: KPIMetricCardProps) {
  const style = ACCENT_MAP[accent];
  const isClickable = Boolean(onClick);

  return (
    <div
      onClick={onClick}
      className={cn(
        "group border-border/80 bg-card relative flex flex-col justify-between overflow-hidden rounded-2xl border p-5 shadow-xs transition-all duration-250",
        style.borderHover,
        style.glow,
        isClickable && "cursor-pointer hover:-translate-y-0.5 hover:shadow-md",
        className,
      )}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
    >
      {/* Top gradient hairline accent */}
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r transition-opacity duration-300",
          style.topBar,
        )}
        aria-hidden
      />

      {/* Header with Title, Tooltip, and Icon */}
      <div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5">
            <span className="text-muted-foreground truncate text-xs font-semibold tracking-wider uppercase">
              {label}
            </span>
            {tooltipText && (
              <Tooltip.Root>
                <Tooltip.Trigger
                  render={
                    <button
                      type="button"
                      aria-label={`About ${label}`}
                      className="text-muted-foreground/60 hover:text-foreground focus-visible:ring-ring flex size-4 items-center justify-center rounded transition-colors focus-visible:ring-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Info className="size-3.5" aria-hidden />
                    </button>
                  }
                />
                <Tooltip.Portal>
                  <Tooltip.Positioner
                    side="top"
                    sideOffset={6}
                    className="z-50"
                  >
                    <Tooltip.Popup className="bg-foreground text-background max-w-xs rounded-lg px-2.5 py-1.5 text-xs font-normal shadow-lg transition duration-150">
                      {tooltipText}
                    </Tooltip.Popup>
                  </Tooltip.Positioner>
                </Tooltip.Portal>
              </Tooltip.Root>
            )}
          </div>

          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-xl shadow-xs transition-transform duration-300 group-hover:scale-105",
              style.icon,
            )}
          >
            <Icon className="size-4.5" aria-hidden />
          </span>
        </div>

        {/* Big Metric Value */}
        <div className="mt-3 flex items-baseline gap-2.5">
          <div className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
            {typeof numericValue === "number" ? (
              <AnimatedNumber
                value={numericValue}
                decimals={decimals}
                prefix={prefix}
                suffix={suffix}
                duration={1200}
                format
              />
            ) : (
              value
            )}
          </div>

          {trend && (
            <div
              className={cn(
                "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-bold",
                trend.isPositive === true
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300"
                  : trend.isPositive === false
                    ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300"
                    : "border-border bg-muted text-muted-foreground",
              )}
            >
              {trend.direction === "up" ? (
                <TrendingUp className="size-3" aria-hidden />
              ) : trend.direction === "down" ? (
                <TrendingDown className="size-3" aria-hidden />
              ) : null}
              <span>{trend.value}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer / Subtitle Detail */}
      {detail && (
        <div className="text-muted-foreground border-border/50 mt-3 flex items-center justify-between border-t pt-2.5 text-xs leading-relaxed">
          <div className="min-w-0 truncate">{detail}</div>
          {isClickable && (
            <span className="text-primary group-hover:text-primary/80 shrink-0 text-[11px] font-semibold opacity-0 transition-opacity group-hover:opacity-100">
              Filter →
            </span>
          )}
        </div>
      )}
    </div>
  );
}
