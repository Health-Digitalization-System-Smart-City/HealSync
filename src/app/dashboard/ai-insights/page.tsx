import { Lock, Sparkles } from "lucide-react";
import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { requirePermission } from "@/lib/auth/permissions";
import { AiInsightsWorkspace } from "@/components/ai-insights/ai-insights-workspace";

export const metadata: Metadata = {
  title: "AI Insights · Smart Feedback",
  description:
    "AI-powered understanding of patient feedback and clinic performance across time periods.",
};

/**
 * AI Insights page — redesigned with AI chat as the hero.
 * Server-side authorization: only Admin, Manager, and Analyst (`analytics.ai`) may access.
 */
export default async function AiInsightsPage() {
  const authResult = await requirePermission("analytics.ai");
  if (!authResult.success) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <div className="bg-muted flex h-14 w-14 items-center justify-center rounded-full">
          <Lock className="text-muted-foreground h-6 w-6" aria-hidden />
        </div>
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">Access denied</h1>
          <p className="text-muted-foreground max-w-sm text-sm">
            Your role does not have permission to view AI Insights. This feature
            is available to Admin, Manager, and Analyst roles.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Compact header */}
      <div className="flex items-center gap-3">
        <Badge
          variant="secondary"
          className="gap-2 border-indigo-200 bg-indigo-50 px-3 py-1 text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/15 dark:text-indigo-300"
        >
          <Sparkles className="h-3.5 w-3.5 text-indigo-500" aria-hidden />
          Intelligence
        </Badge>
        <span className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          AI Active
        </span>
      </div>

      <AiInsightsWorkspace />
    </div>
  );
}
