"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertOctagon, Check, Copy, Home, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

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
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center animate-in fade-in-50 duration-300">
      <div className="relative mb-4 flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive shadow-xs">
        <AlertOctagon className="size-8" aria-hidden />
        <span className="absolute -bottom-1 -right-1 flex size-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
          !
        </span>
      </div>

      <h1 className="text-xl font-bold tracking-tight sm:text-2xl text-foreground">
        Dashboard Encountered an Issue
      </h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground leading-relaxed">
        We ran into an unexpected problem while fetching or processing clinic telemetry.
        Your session remains secure.
      </p>

      {error.digest ? (
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/60 px-3 py-1 font-mono text-[11px] text-muted-foreground">
          <span>Error ID:</span>
          <span className="font-semibold text-foreground">{error.digest}</span>
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button onClick={() => reset()} className="gap-2 shadow-xs">
          <RefreshCw className="size-4" aria-hidden />
          <span>Reload & Retry</span>
        </Button>

        <Button variant="outline" render={<Link href="/dashboard" />} className="gap-2">
          <Home className="size-4" aria-hidden />
          <span>Return to Overview</span>
        </Button>

        <Button variant="ghost" onClick={handleCopyDetails} className="gap-1.5 text-xs text-muted-foreground">
          {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
          <span>{copied ? "Copied" : "Copy error details"}</span>
        </Button>
      </div>

      <div className="mt-8 rounded-lg border border-border/60 bg-muted/20 p-3 text-left max-w-md w-full">
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          System Safeguard Notice
        </span>
        <p className="mt-1 text-xs text-muted-foreground">
          All data operations are validated server-side. Patient feedback queue and synchronization jobs will resume automatically.
        </p>
      </div>
    </div>
  );
}
