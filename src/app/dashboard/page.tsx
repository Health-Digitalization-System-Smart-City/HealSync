import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import {
  BarChart3,
  Building2,
  CalendarCheck,
  HeartPulse,
  MessageSquare,
  Sparkles,
  Stethoscope,
  TrendingUp,
} from "lucide-react";

import { MetricCard } from "@/components/metric-card";
import { PageIntro } from "@/components/page-intro";
import { SatisfactionBar } from "@/components/dashboard/satisfaction-bar";
import { AiInsightsSection } from "@/components/ai-insights/ai-insights-section";
import { AiInsightsSkeleton } from "@/components/ai-insights/ai-insights-skeleton";
import { requireAuth, requirePermissionResult } from "@/lib/auth/session";
import { PERMISSIONS } from "@/lib/permissions";
import { getRatingLabel } from "@/lib/feedback/ratings";
import { listRecentFeedbackFromDb, viewerFromUser } from "@/lib/feedback/db";
import {
  getDashboardOverviewData,
  type DashboardOverview,
} from "@/lib/analytics/db";
import type { FeedbackView } from "@/lib/feedback/types";

export const metadata: Metadata = {
  title: "Dashboard | HealSync",
  description: "Administrative dashboard for HealSync healthcare clinics.",
};

export const dynamic = "force-dynamic";

const EMPTY_OVERVIEW: DashboardOverview = {
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

/** Short human-readable "x ago" label for the recent feedback feed. */
function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const minutes = Math.max(0, Math.round((Date.now() - then) / 60000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

/** A plain-language takeaway so the numbers mean something at a glance. */
function sentimentInsight(overview: DashboardOverview): {
  headline: string;
  detail: string;
  tone: "good" | "mixed" | "attention";
} {
  const { satisfactionRate, negativeFeedback, positiveFeedback } = overview;
  if (satisfactionRate >= 75) {
    return {
      headline: "Patients are happy with their care",
      detail: `${satisfactionRate}% of feedback is positive (${positiveFeedback} submissions). Keep doing what works — this level of satisfaction is a strong signal.`,
      tone: "good",
    };
  }
  if (satisfactionRate >= 50) {
    return {
      headline: "Satisfaction is solid, with room to grow",
      detail: `${satisfactionRate}% of feedback is positive, but ${negativeFeedback} submissions need attention. Review the flagged branches and services for quick wins.`,
      tone: "mixed",
    };
  }
  return {
    headline: "Patient satisfaction needs attention",
    detail: `Only ${satisfactionRate}% of feedback is positive and ${negativeFeedback} submissions are flagged. Prioritize the lowest-scoring branches and services this week.`,
    tone: "attention",
  };
}

const quickActions = [
  {
    name: "Feedback Management",
    description: "Review, filter, and respond to patient reviews",
    href: "/dashboard/feedback",
    icon: MessageSquare,
  },
  {
    name: "Analytics & Insights",
    description: "Visualize satisfaction trends and branch metrics",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    name: "Clinical Branches",
    description: "Monitor all clinic locations and their feedback",
    href: "/dashboard/branches",
    icon: Building2,
  },
  {
    name: "Healthcare Services",
    description: "Review departments and their satisfaction scores",
    href: "/dashboard/services",
    icon: Stethoscope,
  },
];

export default async function DashboardPage() {
  let overview = EMPTY_OVERVIEW;
  let recent: FeedbackView[] = [];

  // Greeting personalization — getSession is cached per request, so this is
  // free even though the layout already authenticated the user.
  const session = await requireAuth();
  const firstName = session.user.name?.trim().split(/\s+/)[0] ?? "";

  try {
    const auth = await requirePermissionResult(PERMISSIONS.FEEDBACK_READ);
    overview = await getDashboardOverviewData();
    if (auth.success) {
      const viewer = viewerFromUser(auth.data.user, auth.data.permissions);
      recent = await listRecentFeedbackFromDb(viewer, 5);
    }
  } catch (error) {
    // DB unavailable — render an honest empty state instead of crashing.
    console.error("Failed to load dashboard overview:", error);
  }

  const insight = sentimentInsight(overview);
  const insightTone =
    insight.tone === "good"
      ? "border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50/60 dark:border-emerald-500/25 dark:from-emerald-500/10 dark:to-teal-500/5"
      : insight.tone === "mixed"
        ? "border-blue-200 bg-gradient-to-br from-blue-50 to-sky-50/60 dark:border-blue-500/25 dark:from-blue-500/10 dark:to-sky-500/5"
        : "border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50/60 dark:border-amber-500/25 dark:from-amber-500/10 dark:to-orange-500/5";
  const insightIcon =
    insight.tone === "good"
      ? "bg-emerald-500 text-white"
      : insight.tone === "mixed"
        ? "bg-blue-500 text-white"
        : "bg-amber-500 text-white";

  return (
    <div className="space-y-8">
      <PageIntro
        title={firstName ? `Welcome back, ${firstName}` : "Welcome back"}
        description="Live overview of patient feedback and clinic performance across HealSync branches."
      />

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total Feedback"
          value={overview.totalFeedback.toLocaleString()}
          icon={MessageSquare}
          accent="blue"
          detail={`across ${overview.activeBranches} active branches`}
        />
        <MetricCard
          label="Today's Feedback"
          value={overview.todayFeedback.toLocaleString()}
          icon={CalendarCheck}
          accent="violet"
          detail="patient submissions today"
        />
        <MetricCard
          label="Satisfaction Rate"
          value={`${overview.satisfactionRate}%`}
          icon={TrendingUp}
          accent="emerald"
          detail={`${overview.positiveFeedback.toLocaleString()} positive reviews`}
        />
        <MetricCard
          label="Average Rating"
          value={overview.avgRatingScore.toFixed(1)}
          icon={Sparkles}
          accent="amber"
          detail={`out of 7 · ${overview.neutralFeedback} neutral · ${overview.negativeFeedback} needs attention`}
        />
      </div>

      {/* AI Insights — loads independently so it never blocks the stats */}
      <Suspense fallback={<AiInsightsSkeleton />}>
        <AiInsightsSection />
      </Suspense>

      {/* Sentiment insight panel */}
      {overview.totalFeedback > 0 && (
        <div
          className={`rounded-2xl border p-6 shadow-sm transition-colors ${insightTone}`}
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <span
                className={`flex size-11 shrink-0 items-center justify-center rounded-xl shadow-sm ${insightIcon}`}
                aria-hidden
              >
                <HeartPulse className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
                  Patient sentiment at a glance
                </p>
                <h2 className="text-foreground mt-1 text-lg font-bold">
                  {insight.headline}
                </h2>
                <p className="text-muted-foreground mt-1 max-w-2xl text-sm leading-relaxed">
                  {insight.detail}
                </p>
              </div>
            </div>

            <div className="w-full max-w-md shrink-0">
              <div className="bg-card/80 border-border/60 rounded-xl border p-4 shadow-xs backdrop-blur-sm">
                <div className="text-muted-foreground mb-2.5 flex items-center justify-between text-xs font-semibold">
                  <span>Sentiment split</span>
                  <span className="text-foreground font-bold">
                    {overview.totalFeedback.toLocaleString()} total
                  </span>
                </div>
                <SatisfactionBar
                  positive={overview.positiveFeedback}
                  neutral={overview.neutralFeedback}
                  negative={overview.negativeFeedback}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Feedback Feed */}
        <div className="border-border/80 bg-card flex flex-col overflow-hidden rounded-xl border shadow-sm">
          <div className="bg-muted/40 border-border/70 flex items-center justify-between border-b px-6 py-4">
            <h2 className="text-foreground flex items-center gap-2 text-base font-bold">
              <MessageSquare className="text-primary size-4" />
              Recent Patient Feedback
            </h2>
            <Link
              href="/dashboard/feedback"
              className="text-primary hover:text-primary/80 text-xs font-semibold"
            >
              View all →
            </Link>
          </div>

          <div className="divide-border/60 divide-y">
            {recent.length === 0 ? (
              <p className="text-muted-foreground p-6 text-sm">
                No patient feedback yet. Feedback submitted through the public
                form will appear here.
              </p>
            ) : (
              recent.map((item) => (
                <div
                  key={item.id}
                  className="hover:bg-muted/40 p-4.5 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-foreground text-sm font-semibold">
                      {item.comment?.trim() || "No comment provided"}
                    </p>
                    <span className="bg-muted text-muted-foreground shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium">
                      {getRatingLabel(item.rating)} ({item.ratingScore}/7)
                    </span>
                  </div>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {item.branchName} · {item.serviceName} ·{" "}
                    {formatRelativeTime(item.createdAt)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="border-border/80 bg-card flex flex-col overflow-hidden rounded-xl border shadow-sm">
          <div className="bg-muted/40 border-border/70 flex items-center justify-between border-b px-6 py-4">
            <h2 className="text-foreground flex items-center gap-2 text-base font-bold">
              <Sparkles className="text-primary size-4" />
              Quick Navigation
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="group border-border/70 bg-muted/30 hover:border-primary/40 hover:bg-card flex flex-col justify-between rounded-xl border p-4 transition hover:shadow-md"
                >
                  <div>
                    <span className="border-border bg-card group-hover:border-primary/30 mb-2.5 flex size-9 items-center justify-center rounded-lg border shadow-xs transition-colors">
                      <Icon className="text-primary size-4" />
                    </span>
                    <h3 className="text-foreground group-hover:text-primary text-sm font-bold transition">
                      {action.name}
                    </h3>
                    <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                      {action.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
