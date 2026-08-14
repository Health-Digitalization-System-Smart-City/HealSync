import * as React from "react";

import { cn } from "@/lib/utils";

interface PageIntroProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "title"
> {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}

/** A consistent, responsive heading block for dashboard pages. */
export function PageIntro({
  eyebrow,
  title,
  description,
  actions,
  className,
  ...props
}: PageIntroProps) {
  return (
    <div
      className={cn(
        "border-border/70 flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
      {...props}
    >
      <div className="min-w-0 space-y-2">
        {eyebrow}
        <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="text-muted-foreground max-w-2xl leading-relaxed">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}
