"use client";

import { useState } from "react";
import {
  Building2,
  ChevronDown,
  ChevronRight,
  Stethoscope,
  Tags,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import type {
  BranchPerformanceItem,
  ServicePerformanceItem,
  ThemeAggregateItem,
} from "@/lib/analytics/insights-types";
import { cn } from "@/lib/utils";

/** Collapsible analytics panel — branches, services, and themes. */
export function AnalyticsExplorablePanel({
  branches,
  services,
  themes,
  themesCoverage,
}: {
  branches: BranchPerformanceItem[];
  services: ServicePerformanceItem[];
  themes: ThemeAggregateItem[];
  themesCoverage: {
    analyzedFeedbackCount: number;
    feedbackCountInPeriod: number;
  };
}) {
  return (
    <div className="space-y-3">
      <CollapsibleSection
        icon={<Building2 className="size-4 text-blue-500" aria-hidden />}
        title="Branch Performance"
        subtitle={`${branches.length} branch${branches.length === 1 ? "" : "es"} · ranked by database`}
        defaultOpen={branches.length > 0}
      >
        <BranchTable branches={branches} />
      </CollapsibleSection>

      <CollapsibleSection
        icon={<Stethoscope className="size-4 text-emerald-500" aria-hidden />}
        title="Service Performance"
        subtitle={`${services.length} service${services.length === 1 ? "" : "s"} · ranked by database`}
        defaultOpen={services.length > 0}
      >
        <ServiceTable services={services} />
      </CollapsibleSection>

      <CollapsibleSection
        icon={<Tags className="size-4 text-violet-500" aria-hidden />}
        title="Feedback Themes"
        subtitle={`Aggregated from AI analyses · ${themesCoverage.analyzedFeedbackCount} of ${themesCoverage.feedbackCountInPeriod} submissions`}
        defaultOpen={themes.length > 0}
      >
        <ThemesViz themes={themes} coverage={themesCoverage} />
      </CollapsibleSection>
    </div>
  );
}

function CollapsibleSection({
  icon,
  title,
  subtitle,
  defaultOpen = false,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-700/50 dark:bg-slate-900">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 bg-gradient-to-r from-slate-50/80 to-white px-5 py-3.5 text-left transition hover:from-slate-50 dark:from-slate-800/50 dark:hover:from-slate-800/80"
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-xs dark:bg-slate-800">
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {title}
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {subtitle}
          </p>
        </div>
        {open ? (
          <ChevronDown className="size-4 shrink-0 text-slate-400" aria-hidden />
        ) : (
          <ChevronRight
            className="size-4 shrink-0 text-slate-400"
            aria-hidden
          />
        )}
      </button>
      {open && (
        <div className="border-t border-slate-100 px-5 py-4 dark:border-slate-700/50">
          {children}
        </div>
      )}
    </div>
  );
}

function BranchTable({ branches }: { branches: BranchPerformanceItem[] }) {
  if (branches.length === 0) {
    return (
      <p className="py-6 text-center text-xs text-slate-400 dark:text-slate-500">
        No branch feedback in this period.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-[11px] tracking-wider text-slate-400 uppercase dark:border-slate-700/50 dark:text-slate-500">
            <th className="pr-3 pb-2 font-semibold">Branch</th>
            <th className="pr-3 pb-2 font-semibold">Feedback</th>
            <th className="pr-3 pb-2 font-semibold">Avg Rating</th>
            <th className="pr-3 pb-2 font-semibold">Satisfaction</th>
            <th className="pb-2 font-semibold">vs Previous</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
          {branches.map((branch) => (
            <tr
              key={branch.branchId}
              className="transition hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
            >
              <td className="py-2.5 pr-3 font-semibold text-slate-800 dark:text-slate-200">
                {branch.branchName}
              </td>
              <td className="py-2.5 pr-3 text-slate-600 dark:text-slate-400">
                {branch.feedbackCount}
              </td>
              <td className="py-2.5 pr-3 text-slate-600 dark:text-slate-400">
                {branch.averageRating.toFixed(1)} / 7
              </td>
              <td className="py-2.5 pr-3">
                <SatisfactionBar rate={branch.satisfactionRate} />
              </td>
              <td className="py-2.5">
                <ChangeBadge change={branch.changeFromPreviousPeriod} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ServiceTable({ services }: { services: ServicePerformanceItem[] }) {
  if (services.length === 0) {
    return (
      <p className="py-6 text-center text-xs text-slate-400 dark:text-slate-500">
        No service feedback in this period.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-[11px] tracking-wider text-slate-400 uppercase dark:border-slate-700/50 dark:text-slate-500">
            <th className="pr-3 pb-2 font-semibold">Service</th>
            <th className="pr-3 pb-2 font-semibold">Feedback</th>
            <th className="pr-3 pb-2 font-semibold">Avg Rating</th>
            <th className="pr-3 pb-2 font-semibold">Satisfaction</th>
            <th className="pb-2 font-semibold">vs Previous</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
          {services.map((service) => (
            <tr
              key={service.serviceId}
              className="transition hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
            >
              <td className="py-2.5 pr-3 font-semibold text-slate-800 dark:text-slate-200">
                {service.serviceName}
              </td>
              <td className="py-2.5 pr-3 text-slate-600 dark:text-slate-400">
                {service.feedbackCount}
              </td>
              <td className="py-2.5 pr-3 text-slate-600 dark:text-slate-400">
                {service.averageRating.toFixed(1)} / 7
              </td>
              <td className="py-2.5 pr-3">
                <SatisfactionBar rate={service.satisfactionRate} />
              </td>
              <td className="py-2.5">
                <ChangeBadge change={service.changeFromPreviousPeriod} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SatisfactionBar({ rate }: { rate: number }) {
  const tone =
    rate >= 75 ? "bg-emerald-500" : rate >= 50 ? "bg-amber-400" : "bg-rose-500";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            tone,
          )}
          style={{ width: `${Math.min(100, Math.max(0, rate))}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
        {rate}%
      </span>
    </div>
  );
}

function ChangeBadge({ change }: { change: number | null }) {
  if (change === null) return null;
  const up = change > 0;
  const flat = change === 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
        up
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
          : flat
            ? "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
            : "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
      )}
    >
      {up ? (
        <TrendingUp className="size-3" aria-hidden />
      ) : flat ? null : (
        <TrendingDown className="size-3" aria-hidden />
      )}
      {up ? "+" : ""}
      {change} pts
    </span>
  );
}

function ThemesViz({
  themes,
  coverage,
}: {
  themes: ThemeAggregateItem[];
  coverage: { analyzedFeedbackCount: number; feedbackCountInPeriod: number };
}) {
  const max = themes.length > 0 ? themes[0].count : 1;
  const partial =
    coverage.analyzedFeedbackCount < coverage.feedbackCountInPeriod;

  if (themes.length === 0) {
    return (
      <p className="py-6 text-center text-xs text-slate-400 dark:text-slate-500">
        No aggregated themes available yet. Generate AI analyses to build theme
        data.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {partial && (
        <p className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
          Theme data covers {coverage.analyzedFeedbackCount} of{" "}
          {coverage.feedbackCountInPeriod} feedback submissions.
        </p>
      )}
      <ul className="space-y-2.5">
        {themes.map((theme) => (
          <li key={theme.name} className="flex items-center gap-3">
            <span className="w-40 shrink-0 truncate text-xs font-semibold text-slate-700 dark:text-slate-300">
              {theme.name}
            </span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-400 transition-all duration-700"
                style={{ width: `${Math.max(4, (theme.count / max) * 100)}%` }}
              />
            </div>
            <span className="w-16 shrink-0 text-right text-xs font-semibold text-slate-500 dark:text-slate-400">
              {theme.count} · {theme.percentage}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
