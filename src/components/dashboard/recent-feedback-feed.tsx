"use client";

import * as React from "react";
import Link from "next/link";
import {
  Building2,
  Calendar,
  ChevronRight,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Star,
  Stethoscope,
} from "lucide-react";
import { getRatingLabel } from "@/lib/feedback/ratings";
import type { FeedbackView } from "@/lib/feedback/types";
import { cn } from "@/lib/utils";

export interface RecentFeedbackFeedProps {
  items: FeedbackView[];
  onSelectFeedback?: (feedback: FeedbackView) => void;
  className?: string;
}

function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const minutes = Math.max(0, Math.round((Date.now() - then) / 60000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export function RecentFeedbackFeed({
  items,
  onSelectFeedback,
  className,
}: RecentFeedbackFeedProps) {
  return (
    <div
      className={cn(
        "border-border/80 bg-card flex flex-col justify-between overflow-hidden rounded-2xl border shadow-xs transition-all",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-primary/20">
            <MessageSquare className="size-4" aria-hidden />
          </span>
          <div>
            <h3 className="text-foreground text-base font-bold tracking-tight">
              Recent Patient Submissions
            </h3>
            <p className="text-muted-foreground text-xs">
              Live feedback feed across connected clinical points
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/feedback"
          className="text-primary hover:text-primary/80 inline-flex items-center gap-1 text-xs font-semibold"
        >
          <span>View all records</span>
          <ChevronRight className="size-3.5" />
        </Link>
      </div>

      {/* List */}
      <div className="divide-border/60 divide-y overflow-hidden">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <MessageSquare className="text-muted-foreground size-8 stroke-1" />
            <p className="text-foreground mt-2 text-sm font-semibold">
              No Feedback Submissions Yet
            </p>
            <p className="text-muted-foreground mt-1 max-w-sm text-xs">
              Submissions from the public patient experience form will stream here in real-time.
            </p>
          </div>
        ) : (
          items.map((item) => {
            const isPositive = item.ratingScore >= 5;
            const isAttention = item.ratingScore <= 2;

            return (
              <div
                key={item.id}
                onClick={() => onSelectFeedback?.(item)}
                className="group hover:bg-muted/40 flex cursor-pointer flex-col gap-2 p-4.5 transition-colors"
              >
                {/* Top: Comment or placeholder + Rating pill */}
                <div className="flex items-start justify-between gap-3">
                  <p
                    className={cn(
                      "text-sm font-medium leading-relaxed line-clamp-2",
                      item.comment
                        ? "text-foreground font-semibold"
                        : "text-muted-foreground italic",
                    )}
                  >
                    {item.comment ? `“${item.comment}”` : "No written comment provided"}
                  </p>

                  <span
                    className={cn(
                      "shrink-0 inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 font-mono text-[11px] font-bold shadow-2xs",
                      isPositive
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
                        : isAttention
                          ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
                          : "border-border bg-muted text-muted-foreground",
                    )}
                  >
                    <Star className="size-2.5 fill-current" />
                    <span>{item.ratingScore}/7</span>
                  </span>
                </div>

                {/* Metadata details */}
                <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                  <span className="flex items-center gap-1 font-medium text-foreground">
                    <Building2 className="text-muted-foreground size-3" />
                    {item.branchName}
                  </span>
                  <span className="text-border">·</span>
                  <span className="flex items-center gap-1">
                    <Stethoscope className="text-muted-foreground size-3" />
                    {item.serviceName}
                  </span>
                  <span className="text-border">·</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="text-muted-foreground size-3" />
                    {formatRelativeTime(item.createdAt)}
                  </span>
                  <span className="text-border">·</span>
                  <span className="text-primary group-hover:underline text-[11px] font-semibold">
                    Inspect details →
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="border-border/60 bg-muted/20 flex items-center justify-between border-t px-5 py-3 text-[11px] text-muted-foreground">
        <span>Click any submission to view full clinical details or take notes</span>
        <Link href="/dashboard/feedback" className="text-primary hover:underline">
          Filter & export
        </Link>
      </div>
    </div>
  );
}
