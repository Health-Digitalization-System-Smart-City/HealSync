<<<<<<< HEAD
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
=======
import { Lock, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { can, requirePermission } from "@/lib/auth/permissions";

import { getRoles, getUsers } from "@/features/users/actions";
import { CreateUserForm } from "@/features/users/components/create-user-form";
import { UsersTable } from "@/features/users/components/users-table";

/**
 * User management (security.md §4, PRD.md §22). Page-level permission check
 * is UX only — every mutation is re-authorized server-side by the actions.
 */
export default async function UsersPage() {
  const authResult = await requirePermission("user.read");
  if (!authResult.success) {
    // Unauthenticated is handled by the dashboard layout; this is FORBIDDEN.
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <div className="bg-muted flex h-14 w-14 items-center justify-center rounded-full">
          <Lock className="text-muted-foreground h-6 w-6" aria-hidden />
        </div>
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">Access denied</h1>
          <p className="text-muted-foreground max-w-sm text-sm">
            Your role does not have permission to manage dashboard users.
          </p>
        </div>
      </div>
    );
  }

  const user = authResult.data.user;
  const [usersResult, rolesResult] = await Promise.all([
    getUsers(),
    getRoles(),
  ]);

  const users = usersResult.success ? usersResult.data : [];
  const roles = rolesResult.success ? rolesResult.data : [];
  const canCreateUsers = await can(user.id, "user.create");

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <Badge variant="secondary" className="w-fit gap-2 px-3 py-1">
          <Users className="h-3.5 w-3.5 text-emerald-500" aria-hidden />
          Administration
        </Badge>
        <h1 className="text-3xl font-semibold tracking-tight">
          User management
        </h1>
        <p className="text-muted-foreground max-w-2xl leading-relaxed">
          Create dashboard accounts, assign the fixed roles (Admin, Manager,
          Analyst), and revoke access. Every action is audited.
        </p>
      </div>

      {!usersResult.success && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Could not load users</CardTitle>
            <CardDescription>{usersResult.error.message}</CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-[360px_1fr]">
        {canCreateUsers && <CreateUserForm roles={roles} />}

        <UsersTable users={users} roles={roles} currentUserId={user.id} />
      </div>
>>>>>>> d7f1791ce0ab492099e231d8e60834dae192064e
    </div>
  );
}
