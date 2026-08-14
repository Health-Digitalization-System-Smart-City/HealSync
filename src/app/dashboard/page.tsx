import type { Metadata } from "next";

import { PageHeader } from "@/components/dashboard/page-header";
import { OverviewClient } from "@/components/dashboard/overview-client";
import { requireAuth } from "@/lib/auth/session";
import { isRole, ROLES } from "@/lib/permissions";

export const metadata: Metadata = {
  title: "Overview",
  description: "Live snapshot of healthcare clinic operations, patient feedback, and branch status across the Smart City.",
};

export default async function DashboardOverviewPage() {
  const session = await requireAuth();
  const rawRole = session.user.role ?? ROLES.ANALYST;
  const role = isRole(rawRole) ? rawRole : ROLES.ANALYST;

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Operations Overview"
        description="Unified telemetry, patient satisfaction metrics, and urgent workflows across 13 Smart City branches."
      />
      <OverviewClient
        userName={session.user.name ?? "Clinic Specialist"}
        userRole={role}
      />
    </div>
  );
}
