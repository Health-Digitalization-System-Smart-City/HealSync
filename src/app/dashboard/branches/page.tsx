import type { Metadata } from "next";

import { PageHeader } from "@/components/dashboard/page-header";
import { BranchesClient } from "@/components/dashboard/branches-client";
import { PERMISSIONS, isRole, ROLES } from "@/lib/permissions";
import { requirePermission } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Clinic Branches",
  description: "Manage and monitor 13 healthcare clinic branches, staff allocations, and operational capacity across the Smart City.",
};

export default async function BranchesPage() {
  const session = await requirePermission(PERMISSIONS.BRANCH_READ);
  const rawRole = session.user.role ?? ROLES.ANALYST;
  const role = isRole(rawRole) ? rawRole : ROLES.ANALYST;

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Smart City Clinic Branches (13 Total)"
        description="Unified network monitoring, district zones, facility directors, and live branch satisfaction indices."
      />
      <BranchesClient userRole={role} />
    </div>
  );
}
