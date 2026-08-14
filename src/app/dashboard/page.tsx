import Link from "next/link";
import type { Metadata } from "next";
import {
  BarChart3,
  Building2,
  HeartPulse,
  MessageSquare,
  Sparkles,
  Stethoscope,
  TrendingUp,
} from "lucide-react";

import { MetricCard } from "@/components/metric-card";
import { PageIntro } from "@/components/page-intro";
import { requirePermissionResult } from "@/lib/auth/session";
import { PERMISSIONS } from "@/lib/permissions";
import { getRatingLabel } from "@/lib/feedback/ratings";
import {
  listRecentFeedbackFromDb,
  viewerFromUser,
} from "@/lib/feedback/db";
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

  return (
    <div className="space-y-8">
      <PageIntro
        title="Welcome back"
        description="Live overview of patient feedback and clinic performance across HealSync branches."
      />

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total Feedback"
          value={overview.totalFeedback.toLocaleString()}
          icon={MessageSquare}
          detail={`across ${overview.activeBranches} active branches`}
        />
        <MetricCard
          label="Today's Feedback"
          value={overview.todayFeedback.toLocaleString()}
          icon={HeartPulse}
          detail="patient submissions today"
        />
        <MetricCard
          label="Satisfaction Rate"
          value={`${overview.satisfactionRate}%`}
          icon={TrendingUp}
          detail={`${overview.positiveFeedback.toLocaleString()} positive reviews`}
        />
        <MetricCard
          label="Average Rating"
          value={overview.avgRatingScore.toFixed(1)}
          icon={Sparkles}
          detail={`out of 7 · ${overview.neutralFeedback} neutral · ${overview.negativeFeedback} needs attention`}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Feedback Feed */}
        <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
            <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
              <MessageSquare className="size-4 text-blue-600" />
              Recent Patient Feedback
            </h2>
            <Link
              href="/dashboard/feedback"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              View all →
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recent.length === 0 ? (
              <p className="p-6 text-sm text-slate-500">
                No patient feedback yet. Feedback submitted through the public
                form will appear here.
              </p>
            ) : (
              recent.map((item) => (
                <div
                  key={item.id}
                  className="p-4.5 transition hover:bg-slate-50/70"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-800">
                      {item.comment?.trim() || "No comment provided"}
                    </p>
                    <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                      {getRatingLabel(item.rating)} ({item.ratingScore}/7)
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {item.branchName} · {item.serviceName} ·{" "}
                    {formatRelativeTime(item.createdAt)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
            <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
              <Sparkles className="size-4 text-emerald-600" />
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
                  className="group flex flex-col justify-between rounded-xl border border-slate-200/80 bg-slate-50/40 p-4 transition hover:border-blue-300 hover:bg-white hover:shadow-sm"
                >
                  <div>
                    <span className="mb-2.5 flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white shadow-xs group-hover:border-blue-200">
                      <Icon className="size-4 text-blue-600" />
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 transition group-hover:text-blue-600">
                      {action.name}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">
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
