import type { Metadata } from "next";
import { AlertTriangle, Building2, MessageSquare, Smile } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { PageIntro } from "@/components/page-intro";
import { MetricCard } from "@/components/metric-card";
import { BranchCard } from "@/components/dashboard/branch-card";
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
  const activeBranches = branches.filter((b) => b.isActive);
  const activeCount = activeBranches.length;
  const totalFeedback = branches.reduce((sum, b) => sum + b.totalFeedback, 0);
  const avgSatisfaction =
    activeCount > 0
      ? Math.round(
          activeBranches.reduce((sum, b) => sum + b.satisfactionRate, 0) /
            activeCount,
        )
      : 0;
  const needsAttention = activeBranches.filter(
    (b) => b.satisfactionRate < 50,
  ).length;

  // Leaderboard order: active first, then best-performing first.
  const ranked = [...branches].sort(
    (a, b) =>
      Number(b.isActive) - Number(a.isActive) ||
      b.satisfactionRate - a.satisfactionRate,
  );

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow={
          <Badge variant="secondary" className="w-fit gap-2 px-3 py-1">
            <Building2 className="h-3.5 w-3.5 text-teal-600" aria-hidden />
            Management
          </Badge>
        }
        title="Clinic Branches"
        description="Every clinic location ranked by patient satisfaction, with live feedback statistics and attention flags."
      />

      {/* Insight metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total Branches"
          value={totalBranches}
          icon={Building2}
          accent="teal"
          detail={`${activeCount} active · ${Math.max(0, totalBranches - activeCount)} inactive`}
        />
        <MetricCard
          label="Avg Satisfaction"
          value={`${avgSatisfaction}%`}
          icon={Smile}
          accent="emerald"
          detail="across active branches"
        />
        <MetricCard
          label="Total Feedback"
          value={totalFeedback.toLocaleString()}
          icon={MessageSquare}
          accent="blue"
          detail="patient submissions all-time"
        />
        <MetricCard
          label="Needs Attention"
          value={needsAttention}
          icon={AlertTriangle}
          accent="amber"
          detail="active branches under 50% satisfaction"
        />
      </div>

      {branches.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
          <p className="text-sm text-slate-500">
            No branches are configured yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {ranked.map((branch, index) => (
            <BranchCard key={branch.id} branch={branch} rank={index + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
