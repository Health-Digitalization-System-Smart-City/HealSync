import Link from "next/link";
import {
  BarChart3,
  Building2,
  CalendarCheck,
  HeartPulse,
  MessageSquare,
  Sparkles,
  Stethoscope,
  TrendingUp,
  Users,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | HealSync",
  description: "Administrative dashboard for HealSync healthcare clinics.",
};

const stats = [
  {
    title: "Total Patients",
    value: "1,248",
    delta: "+12% this month",
    deltaClass: "text-emerald-600 bg-emerald-50 border-emerald-200",
    icon: <Users className="size-4 text-blue-600" />,
  },
  {
    title: "Today's Appointments",
    value: "48",
    delta: "8 in progress",
    deltaClass: "text-blue-600 bg-blue-50 border-blue-200",
    icon: <CalendarCheck className="size-4 text-purple-600" />,
  },
  {
    title: "Patient Feedback",
    value: "47",
    delta: "3 new today",
    deltaClass: "text-amber-600 bg-amber-50 border-amber-200",
    icon: <MessageSquare className="size-4 text-amber-600" />,
  },
  {
    title: "Satisfaction Rate",
    value: "92%",
    delta: "Target exceeded",
    deltaClass: "text-emerald-600 bg-emerald-50 border-emerald-200",
    icon: <TrendingUp className="size-4 text-emerald-600" />,
  },
];

const recentFeedback = [
  {
    title: "Excellent consultation and prompt laboratory testing",
    branch: "Main Branch",
    when: "Today, 9:00 AM",
    rating: "Very Satisfied (7/7)",
  },
  {
    title: "Caring pediatrician and friendly pediatric nurses",
    branch: "CMC Branch",
    when: "Yesterday, 1:00 PM",
    rating: "Very Satisfied (7/7)",
  },
  {
    title: "Long queue at pharmacy counter during rush hour",
    branch: "East Branch",
    when: "2 days ago",
    rating: "Not Satisfied (2/7)",
  },
];

const quickActions = [
  {
    name: "Feedback Management",
    description: "Review, filter, and respond to patient reviews",
    href: "/dashboard/feedback",
    icon: <MessageSquare className="size-5 text-blue-600" />,
  },
  {
    name: "Analytics & Insights",
    description: "Visualize satisfaction trends and branch metrics",
    href: "/dashboard/analytics",
    icon: <BarChart3 className="size-5 text-emerald-600" />,
  },
  {
    name: "Clinical Branches",
    description: "Manage 13 healthcare clinic locations",
    href: "/dashboard/branches",
    icon: <Building2 className="size-5 text-purple-600" />,
  },
  {
    name: "Healthcare Services",
    description: "Configure medical departments and service offerings",
    href: "/dashboard/services",
    icon: <Stethoscope className="size-5 text-amber-600" />,
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
            <HeartPulse className="size-4" />
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Healthcare Overview
          </h1>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Welcome back to HealSync clinic administration and analytics center.
        </p>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm transition hover:shadow"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {stat.title}
              </p>
              <span className="flex size-8 items-center justify-center rounded-lg bg-slate-50 border border-slate-100">
                {stat.icon}
              </span>
            </div>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
              {stat.value}
            </h2>
            <p
              className={`mt-2 inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold border ${stat.deltaClass}`}
            >
              {stat.delta}
            </p>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Feedback Feed */}
        <div className="flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
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
            {recentFeedback.map((item) => (
              <div
                key={item.title}
                className="p-4.5 transition hover:bg-slate-50/70"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-800">
                    {item.title}
                  </p>
                  <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                    {item.rating}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {item.branch} · {item.when}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-4 bg-slate-50/50">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="size-4 text-emerald-600" />
              Quick Navigation
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="group flex flex-col justify-between rounded-xl border border-slate-200/80 bg-slate-50/40 p-4 transition hover:bg-white hover:border-blue-300 hover:shadow-sm"
              >
                <div>
                  <span className="mb-2.5 flex size-9 items-center justify-center rounded-lg bg-white shadow-xs border border-slate-200 group-hover:border-blue-200">
                    {action.icon}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition">
                    {action.name}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                    {action.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
