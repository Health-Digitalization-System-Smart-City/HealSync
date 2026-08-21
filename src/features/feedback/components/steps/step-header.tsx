"use client";

import * as React from "react";

import { CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFeedbackI18n } from "@/features/feedback/components/feedback-i18n";

/**
 * Shared step header: a focusable `<h2>` (focus target when steps change) plus
 * an optional back button. Mobile-first: the title wraps and the back button
 * shrinks to an icon-only-ish compact control on small screens.
 */
export function StepHeader({
  headingRef,
  icon: Icon,
  title,
  description,
  onBack,
}: {
  headingRef?: React.Ref<HTMLHeadingElement>;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  title: string;
  description: React.ReactNode;
  onBack?: () => void;
}) {
  const { t } = useFeedbackI18n();
  return (
    <div className="space-y-1.5">
      <div className="flex items-start justify-between gap-3">
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="focus-visible:ring-ring flex min-w-0 items-center gap-2 rounded-md text-xl font-semibold tracking-tight outline-none focus-visible:ring-2"
        >
          <Icon className="text-primary h-5 w-5 shrink-0" aria-hidden={true} />
          <span className="truncate">{title}</span>
        </h2>
        {onBack ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-muted-foreground shrink-0 gap-1 px-2"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            <span className="hidden sm:inline">{t("back")}</span>
          </Button>
        ) : null}
      </div>
      <CardDescription>{description}</CardDescription>
    </div>
  );
}
