import { Lock, Sparkles } from "lucide-react";
import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { PageIntro } from "@/components/page-intro";
import { requirePermission } from "@/lib/auth/permissions";
import { AiInsightsWorkspace } from "@/components/ai-insights/ai-insights-workspace";

export const metadata: Metadata = {
  title: "AI Insights · HealSync",
  description:
    "AI-powered understanding of patient feedback and clinic performance across time periods.",
};

/**
 * AI Insights page (Phase 2). Server-side authorization: only Admin, Manager,
 * and Analyst (`analytics.ai`) may access it. The workspace handles period
 * selection, deterministic analytics, the cached AI summary, and Ask AI.
 */
export default async function AiInsightsPage() {
  const authResult = await requirePermission("analytics.ai");
  if (!authResult.success) {
    // Unauthenticated is handled by the dashboard layout; this is FORBIDDEN.
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
    <div className="space-y-8">
      <PageIntro
        eyebrow={
          <Badge variant="secondary" className="w-fit gap-2 px-3 py-1">
            <Sparkles className="h-3.5 w-3.5 text-violet-500" aria-hidden />
            Intelligence
          </Badge>
        }
        title="AI Insights"
        description="Understand what your patients are saying and where attention may be needed — powered by AI analysis of real feedback."
      />
      <AiInsightsWorkspace />
    </div>
  );
}
