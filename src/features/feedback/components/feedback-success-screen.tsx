"use client";

import * as React from "react";

import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { CardDescription, CardFooter, CardHeader } from "@/components/ui/card";

export function FeedbackSuccessScreen({
  headingRef,
  submissionId,
  branchName,
  serviceName,
  onReset,
}: {
  headingRef?: React.Ref<HTMLHeadingElement>;
  submissionId: string | null;
  branchName: string;
  serviceName: string;
  onReset: () => void;
}) {
  return (
    <div
      role="status"
      className="from-card mx-auto w-full max-w-lg rounded-xl border border-emerald-500/20 bg-gradient-to-b to-emerald-500/5 shadow-xl"
    >
      <CardHeader className="pt-8 pb-4 text-center">
        <div className="animate-in zoom-in-50 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 duration-300 dark:text-emerald-400">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-10 w-10"
            aria-hidden="true"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <path d="m9 11 3 3L22 4" />
          </svg>
        </div>
        <Badge
          variant="outline"
          className="mx-auto mb-2 gap-1 border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-emerald-600 dark:text-emerald-400"
        >
          Feedback Submitted
        </Badge>
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="text-2xl font-bold tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          Thank You for Your Feedback!
        </h2>
        <CardDescription className="mx-auto mt-2 max-w-md text-base">
          Your response helps us continuously improve the quality of care across
          our clinic branches.
        </CardDescription>
      </CardHeader>

      <div className="bg-background/80 mx-6 space-y-2 rounded-lg border p-4 text-sm">
        <div className="text-muted-foreground flex items-center justify-between gap-4 border-b pb-2">
          <span>Reference ID</span>
          <span className="text-foreground font-mono text-xs font-medium break-all">
            {submissionId ? submissionId.slice(0, 12) : "N/A"}
          </span>
        </div>
        <div className="text-muted-foreground flex items-center justify-between gap-4">
          <span>Branch</span>
          <span className="text-foreground text-right font-medium">
            {branchName}
          </span>
        </div>
        <div className="text-muted-foreground flex items-center justify-between gap-4">
          <span>Service</span>
          <span className="text-foreground text-right font-medium">
            {serviceName}
          </span>
        </div>
      </div>

      <CardFooter className="flex flex-col gap-3 px-6 pt-6 pb-8 sm:flex-row">
        <Button
          onClick={onReset}
          className="h-11 w-full gap-2 text-base font-medium shadow-md"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Submit Another Response
        </Button>
        <Link
          href="/"
          className={
            buttonVariants({ variant: "outline" }) +
            " h-11 w-full gap-2 text-base font-medium"
          }
        >
          Return to Home
        </Link>
      </CardFooter>
    </div>
  );
}
