"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Shared async UI states for the feedback flow: loading, error and empty.
 * Each announces itself to assistive technology (status / alert) so the
 * flow never silently hangs.
 */

export function LoadingState({
  label,
  hint,
  className,
}: {
  label: string;
  hint?: string;
  className?: string;
}) {
  return (
    <div
      role="status"
      className={cn(
        "flex flex-col items-center justify-center space-y-3 py-12 text-center",
        className,
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
        <div
          className="text-primary h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      </div>
      <div className="space-y-0.5">
        <p className="text-sm font-medium">{label}</p>
        {hint ? (
          <p className="text-muted-foreground max-w-xs text-xs">{hint}</p>
        ) : null}
      </div>
    </div>
  );
}

export function ErrorState({
  title,
  message,
  onRetry,
  retryLabel = "Try again",
  className,
}: {
  title: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center space-y-3 py-10 text-center",
        className,
      )}
    >
      <div className="bg-destructive/10 text-destructive flex h-12 w-12 items-center justify-center rounded-full">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6"
          aria-hidden="true"
        >
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
        </svg>
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-muted-foreground max-w-xs text-xs">{message}</p>
      </div>
      {onRetry ? (
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          {retryLabel}
        </Button>
      ) : null}
    </div>
  );
}

export function EmptyState({
  title,
  message,
  actionLabel,
  onAction,
  className,
}: {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center space-y-3 py-10 text-center",
        className,
      )}
    >
      <div className="bg-muted text-muted-foreground flex h-12 w-12 items-center justify-center rounded-full">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6"
          aria-hidden="true"
        >
          <path d="M22 12h-6l-2 3h-4l-2-3H2" />
          <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
          <path d="M6 16h.01" />
          <path d="M10 16h.01" />
        </svg>
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-muted-foreground max-w-xs text-xs">{message}</p>
      </div>
      {actionLabel && onAction ? (
        <Button type="button" variant="outline" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
