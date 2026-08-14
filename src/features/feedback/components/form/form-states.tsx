"use client";

import * as React from "react";

import { Inbox, LoaderCircle, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Shared async UI states for the feedback flow: loading, error and empty.
 * Each announces itself to assistive technology (status / alert) so the
 * flow never silently hangs. The states share a common visual language:
 * a centered icon tile, a title, an optional supporting message, and an
 * optional action button.
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
      aria-label={label}
      className={cn(
        "animate-in fade-in flex flex-col items-center justify-center gap-4 px-6 py-12 text-center duration-300",
        className,
      )}
    >
      <div className="relative flex h-14 w-14 items-center justify-center">
        <span
          aria-hidden="true"
          className="absolute inset-0 animate-ping rounded-full bg-emerald-500/15 motion-reduce:animate-none"
        />
        <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/20">
          <LoaderCircle
            className="h-6 w-6 animate-spin text-emerald-600 motion-reduce:animate-none dark:text-emerald-400"
            aria-hidden="true"
          />
        </span>
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">{label}</p>
        {hint ? (
          <p className="text-muted-foreground mx-auto max-w-xs text-xs leading-relaxed">
            {hint}
          </p>
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
      aria-label={`${title}${message ? `: ${message}` : ""}`}
      className={cn(
        "animate-in fade-in border-destructive/20 bg-destructive/5 flex flex-col items-center gap-4 rounded-xl border px-6 py-12 text-center duration-300",
        className,
      )}
    >
      <span className="bg-destructive/10 ring-destructive/20 flex h-12 w-12 items-center justify-center rounded-full ring-1">
        <TriangleAlert
          className="text-destructive h-6 w-6"
          aria-hidden="true"
        />
      </span>
      <div className="space-y-1">
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-muted-foreground mx-auto max-w-xs text-xs leading-relaxed">
          {message}
        </p>
      </div>
      {onRetry ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
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
        "animate-in fade-in border-border bg-muted/40 flex flex-col items-center gap-4 rounded-xl border border-dashed px-6 py-12 text-center duration-300",
        className,
      )}
    >
      <span className="bg-background ring-border text-muted-foreground flex h-12 w-12 items-center justify-center rounded-full shadow-sm ring-1">
        <Inbox className="h-6 w-6" aria-hidden="true" />
      </span>
      <div className="space-y-1">
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-muted-foreground mx-auto max-w-xs text-xs leading-relaxed">
          {message}
        </p>
      </div>
      {actionLabel && onAction ? (
        <Button type="button" variant="outline" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
