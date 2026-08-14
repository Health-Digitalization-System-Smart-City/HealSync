import * as React from "react";
import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
  detail?: React.ReactNode;
}

/** A compact metric with a consistent information hierarchy. */
export function MetricCard({
  label,
  value,
  icon: Icon,
  detail,
  className,
  ...props
}: MetricCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)} {...props}>
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <p className="text-muted-foreground text-sm font-medium">{label}</p>
          {Icon ? (
            <span className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-xl">
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
