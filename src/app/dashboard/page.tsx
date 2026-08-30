import { Suspense } from "react";
import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth/session";
import { getDashboardOverviewData } from "@/lib/analytics/db";
import { AiInsightsSection } from "@/components/ai-insights/ai-insights-section";
import { AiInsightsSkeleton } from "@/components/ai-insights/ai-insights-skeleton";
import { SimpleDashboard } from "@/components/dashboard/simple-dashboard";

export const metadata: Metadata = {
  title: "Dashboard | Smart Feedback",
  description: "Healthcare clinic feedback and patient satisfaction overview.",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await requireAuth();
  const firstName = session.user.name?.trim().split(/\s+/)[0] ?? "";

  let overviewData;
  try {
    overviewData = await getDashboardOverviewData();
  } catch (error) {
    console.error("[dashboard] Failed to load overview data:", error);
    overviewData = {
      totalFeedback: 0,
      todayFeedback: 0,
      satisfactionRate: 0,
      avgRatingScore: 0,
      positiveFeedback: 0,
      neutralFeedback: 0,
      negativeFeedback: 0,
      activeBranches: 0,
      activeServices: 0,
    };
  }

  return (
    <div className="space-y-8">
      {/* AI Insights Section — Streamed independently */}
      <Suspense fallback={<AiInsightsSkeleton />}>
        <AiInsightsSection />
      </Suspense>

      {/* Simple Beautiful Dashboard */}
      <SimpleDashboard firstName={firstName} overviewData={overviewData} />
    </div>
  );
}
