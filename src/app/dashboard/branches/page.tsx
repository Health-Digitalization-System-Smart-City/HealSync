import type { Metadata } from "next";
import { Building2, MessageSquare, Star, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { PageIntro } from "@/components/page-intro";
import { MetricCard } from "@/components/metric-card";
import { requirePermission } from "@/lib/auth/session";
import { PERMISSIONS } from "@/lib/permissions";
import {
  listBranchesWithAnalytics,
  type BranchOverview,
} from "@/lib/analytics/db";

export const metadata: Metadata = {
  title: "Branches",
  description: "All clinic branches with their live feedback statistics.",
};

export const dynamic = "force-dynamic";

export default async function BranchesPage() {
  await requirePermission(PERMISSIONS.BRANCH_READ);

  let branches: BranchOverview[] = [];
  try {
    branches = await listBranchesWithAnalytics();
  } catch (error) {
    console.error("Failed to load branches:", error);
  }

  const totalBranches = branches.length;
  const activeBranches = branches.filter((b) => b.isActive).length;
  const totalFeedback = branches.reduce((sum, b) => sum + b.totalFeedback, 0);

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow={
          <Badge variant="secondary" className="w-fit gap-2 px-3 py-1">
            <Building2 className="h-3.5 w-3.5 text-emerald-500" aria-hidden />
            Management
          </Badge>
        }
        title="Clinic Branches"
        description="Every clinic location with its live patient-feedback statistics."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          label="Total Branches"
          value={totalBranches}
          icon={Building2}
        />
        <MetricCard
          label="Active Branches"
          value={activeBranches}
          icon={Users}
          detail={`${Math.max(0, totalBranches - activeBranches)} inactive`}
        />
        <MetricCard
          label="Total Feedback"
          value={totalFeedback.toLocaleString()}
          icon={MessageSquare}
        />
      </div>

      {branches.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-slate-500">
            No branches are configured yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {branches.map((branch) => (
            <div
              key={branch.id}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-xl font-semibold">{branch.name}</h2>
                  {branch.code ? (
                    <p className="mt-1 font-mono text-xs text-slate-400">
                      {branch.code}
                    </p>
                  ) : null}
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-sm ${
                    branch.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {branch.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Feedback</p>
                  <p className="mt-1 text-lg font-bold">
                    {branch.totalFeedback.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="flex items-center gap-1 text-xs text-slate-500">
                    <Star className="size-3 text-amber-500" aria-hidden />
                    Satisfaction
                  </p>
                  <p className="mt-1 text-lg font-bold">
                    {branch.satisfactionRate}%
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Avg rating</p>
                  <p className="mt-1 text-lg font-bold">
                    {branch.avgScore.toFixed(1)}
                    <span className="text-xs font-medium text-slate-400">
                      {" "}
                      / 7
                    </span>
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Services</p>
                  <p className="mt-1 text-lg font-bold">
                    {branch.servicesCount}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
