import type { Metadata } from "next";

import { PageHeader } from "@/components/dashboard/page-header";
import { AnalyticsClient } from "@/components/dashboard/analytics-client";
import { PERMISSIONS, isRole, ROLES } from "@/lib/permissions";
import { requirePermission } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Analytics & Intelligence",
  description: "Advanced healthcare telemetry, patient satisfaction index, and 13-branch performance trends.",
};

export default async function AnalyticsPage() {
  const session = await requirePermission(PERMISSIONS.ANALYTICS_READ);
  const rawRole = session.user.role ?? ROLES.ANALYST;
  const role = isRole(rawRole) ? rawRole : ROLES.ANALYST;

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Healthcare Analytics & Intelligence"
        description="Comprehensive satisfaction trends, Net Promoter Scores, and cross-branch performance comparisons."
      />
      <AnalyticsClient userRole={role} />
    </div>
  );
}
