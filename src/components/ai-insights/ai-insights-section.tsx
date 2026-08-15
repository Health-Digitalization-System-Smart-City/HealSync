// Server-side AI Insights section for the dashboard home.
//
// Authorization is enforced here (renders nothing without `analytics.ai`)
// AND in the server action that powers refresh — hiding the UI is never the
// security boundary (security.md §10). The section streams in independently of
// the dashboard statistics: the page renders its skeleton immediately and the
// analysis fills in when ready, so the AI feature never blocks the KPIs.

import { requirePermissionResult } from "@/lib/auth/session";
import { PERMISSIONS } from "@/lib/permissions";
import { dailyInsightsService } from "@/lib/ai-insights/service";
import type { DailyInsightsResult } from "@/lib/ai-insights/types";
import { AiInsightsCard } from "./ai-insights-card";

export async function AiInsightsSection() {
  const auth = await requirePermissionResult(PERMISSIONS.ANALYTICS_AI);
  if (!auth.success) return null;

  let initial: DailyInsightsResult | null = null;
  try {
    initial = await dailyInsightsService.getDailyInsights();
  } catch (error) {
    // AI is an enhancement: a failure degrades to the graceful error card,
    // never a crash of the dashboard.
    console.error("[ai-insights] Failed to load initial insights:", error);
    initial = null;
  }

  return <AiInsightsCard initial={initial} />;
}
