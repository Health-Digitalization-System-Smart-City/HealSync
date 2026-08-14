import type { Metadata } from "next";

import { PageHeader } from "@/components/dashboard/page-header";
import { UsersClient } from "@/components/dashboard/users-client";
import { PERMISSIONS, isRole, ROLES } from "@/lib/permissions";
import { requirePermission } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Users & Staff Roles",
  description: "Manage HealSync system personnel, role allocations, and security permissions.",
};

export default async function UsersPage() {
  const session = await requirePermission(PERMISSIONS.USER_READ);
  const rawRole = session.user.role ?? ROLES.ADMIN;
  const role = isRole(rawRole) ? rawRole : ROLES.ADMIN;

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Staff & Role-Based Access Control (RBAC)"
        description="Admin-only directory of authorized personnel and global permission matrices across the Smart City health system."
      />
      <UsersClient userRole={role} />
    </div>
  );
}
