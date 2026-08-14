"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertOctagon, Check, Copy, Home, RefreshCw } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    console.error("[DashboardError]", error);
  }, [error]);

  function handleCopyDetails() {
    const details = `Error: ${error.message}\nDigest: ${error.digest ?? "N/A"}\nTimestamp: ${new Date().toISOString()}`;
    navigator.clipboard.writeText(details);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="animate-in fade-in-50 flex min-h-[60vh] flex-col items-center justify-center p-6 text-center duration-300">
      <div className="bg-destructive/10 text-destructive relative mb-4 flex size-16 items-center justify-center rounded-2xl shadow-xs">
        <AlertOctagon className="size-8" aria-hidden />
        <span className="bg-destructive text-destructive-foreground absolute -right-1 -bottom-1 flex size-4 items-center justify-center rounded-full text-[9px] font-bold">
          !
        </span>
      </div>

      <h1 className="text-foreground text-xl font-bold tracking-tight sm:text-2xl">
        Dashboard Encountered an Issue
      </h1>
      <p className="text-muted-foreground mt-2 max-w-md text-sm leading-relaxed">
        We ran into an unexpected problem while fetching or processing clinic
        telemetry. Your session remains secure.
      </p>

      {error.digest ? (
        <div className="border-border/80 bg-muted/60 text-muted-foreground mt-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[11px]">
          <span>Error ID:</span>
          <span className="text-foreground font-semibold">{error.digest}</span>
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button onClick={() => reset()} className="gap-2 shadow-xs">
          <RefreshCw className="size-4" aria-hidden />
          <span>Reload & Retry</span>
        </Button>

        <Link
          href="/dashboard"
          className={buttonVariants({ variant: "outline", className: "gap-2" })}
        >
          <Home className="size-4" aria-hidden />
          <span>Return to Overview</span>
        </Link>

        <Button
          variant="ghost"
          onClick={handleCopyDetails}
          className="text-muted-foreground gap-1.5 text-xs"
        >
          {copied ? (
            <Check className="size-3.5 text-emerald-500" />
          ) : (
            <Copy className="size-3.5" />
          )}
          <span>{copied ? "Copied" : "Copy error details"}</span>
        </Button>
      </div>

      <div className="border-border/60 bg-muted/20 mt-8 w-full max-w-md rounded-lg border p-3 text-left">
        <span className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
          System Safeguard Notice
        </span>
        <p className="text-muted-foreground mt-1 text-xs">
          All data operations are validated server-side. Patient feedback queue
          and synchronization jobs will resume automatically.
        </p>
      </div>
    </div>
  );
}
