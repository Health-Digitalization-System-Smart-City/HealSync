import * as React from "react";
import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type MetricAccent =
  "teal" | "blue" | "emerald" | "amber" | "violet" | "rose" | "sky";

const ACCENT_STYLES: Record<MetricAccent, { icon: string; gradient: string }> =
  {
    teal: {
      icon: "bg-primary/10 text-primary",
      gradient: "from-teal-500 to-emerald-400",
    },
    blue: {
      icon: "bg-blue-50 text-blue-600 border border-blue-100",
      gradient: "from-blue-500 to-sky-400",
    },
    emerald: {
      icon: "bg-emerald-50 text-emerald-600 border border-emerald-100",
      gradient: "from-emerald-500 to-teal-400",
    },
    amber: {
      icon: "bg-amber-50 text-amber-600 border border-amber-100",
      gradient: "from-amber-500 to-orange-400",
    },
    violet: {
      icon: "bg-violet-50 text-violet-600 border border-violet-100",
      gradient: "from-violet-500 to-fuchsia-400",
    },
    rose: {
      icon: "bg-rose-50 text-rose-600 border border-rose-100",
      gradient: "from-rose-500 to-pink-400",
    },
    sky: {
      icon: "bg-sky-50 text-sky-600 border border-sky-100",
      gradient: "from-sky-500 to-cyan-400",
    },
  };

interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
  detail?: React.ReactNode;
  /** Per-card accent color that tints the icon chip and top gradient bar. */
  accent?: MetricAccent;
}

/** A compact, accent-tinted metric card with a clear information hierarchy. */
export function MetricCard({
  label,
  value,
  icon: Icon,
  detail,
  accent = "teal",
  className,
  ...props
}: MetricCardProps) {
  const style = ACCENT_STYLES[accent];

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-300 hover:shadow-md hover:shadow-slate-900/5",
        className,
      )}
      {...props}
    >
      {/* Accent gradient bar */}
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r",
          style.gradient,
        )}
        aria-hidden
      />
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <p className="text-muted-foreground text-sm font-medium">{label}</p>
          {Icon ? (
            <span
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-xl shadow-xs transition-transform duration-300 group-hover:scale-105",
                style.icon,
              )}
            >
              <Icon className="size-4" aria-hidden />
            </span>
          ) : null}
        </div>
        <p className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
          {value}
        </p>
        {detail ? (
          <p className="text-muted-foreground mt-2 text-xs leading-5">
            {detail}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
