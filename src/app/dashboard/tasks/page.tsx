import type { Metadata } from "next";

import { PageHeader } from "@/components/dashboard/page-header";
import { TasksClient } from "@/components/dashboard/tasks-client";
import { requirePermission } from "@/lib/auth/session";
import { isRole, PERMISSIONS, ROLES } from "@/lib/permissions";

export const metadata: Metadata = {
  title: "Tasks & Workflows",
  description:
    "Operational task management, patient follow-ups, and clinic quality audits across Smart City branches.",
};

export default async function TasksPage() {
  const session = await requirePermission(PERMISSIONS.TASK_READ);
  const rawRole = session.user.role ?? ROLES.ANALYST;
  const role = isRole(rawRole) ? rawRole : ROLES.ANALYST;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 p-4 sm:p-6">
      <PageHeader
        title="Operational Tasks & Workflows"
        description="Track patient feedback follow-ups, triage speed audits, sanitization checks, and branch action items."
      />
      <TasksClient userRole={role} />
    </div>
  );
}
