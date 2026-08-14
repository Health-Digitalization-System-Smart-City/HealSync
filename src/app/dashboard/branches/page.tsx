import type { Metadata } from "next";
import { AlertTriangle, Building2, MessageSquare, Smile } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { PageIntro } from "@/components/page-intro";
import { MetricCard } from "@/components/metric-card";
import {
  BranchesView,
  type ServiceOption,
} from "@/components/dashboard/branch-management";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/session";
import { hasPermission, PERMISSIONS, ROLES } from "@/lib/permissions";
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
  const session = await requirePermission(PERMISSIONS.BRANCH_READ);
  const role = session.user.role ?? ROLES.ANALYST;
  const canCreate = hasPermission(role, PERMISSIONS.BRANCH_CREATE);
  const canUpdate = hasPermission(role, PERMISSIONS.BRANCH_UPDATE);

  let branches: BranchOverview[] = [];
  let services: ServiceOption[] = [];
  let branchServiceIds: Record<string, string[]> = {};

  try {
    const [branchData, serviceData, links] = await Promise.all([
      listBranchesWithAnalytics(),
      db.service.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true, description: true, isActive: true },
      }),
      db.branchService.findMany({
        where: { isActive: true },
        select: { branchId: true, serviceId: true },
      }),
    ]);
    branches = branchData;
    services = serviceData;
    branchServiceIds = links.reduce<Record<string, string[]>>((acc, link) => {
      (acc[link.branchId] ??= []).push(link.serviceId);
      return acc;
    }, {});
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
        description="Every clinic location ranked by patient satisfaction, with live feedback statistics and attention flags. Administrators can add, edit, link services, and shut down branches."
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

      {/* Branch grid + Admin management */}
      <BranchesView
        branches={branches}
        services={services}
        branchServiceIds={branchServiceIds}
        canCreate={canCreate}
        canUpdate={canUpdate}
      />
    </div>
  );
}
