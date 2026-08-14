import type { Metadata } from "next";

import { PageHeader } from "@/components/dashboard/page-header";
import { ProfileClient } from "@/components/dashboard/profile-client";
import { requireAuth } from "@/lib/auth/session";
import { isRole, ROLES } from "@/lib/permissions";

export const metadata: Metadata = {
  title: "Profile & Security",
  description:
    "User credentials, granted server-side permissions, and session security status.",
};

export default async function ProfilePage() {
  const session = await requireAuth();
  const rawRole = session.user.role ?? ROLES.ANALYST;
  const role = isRole(rawRole) ? rawRole : ROLES.ANALYST;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 p-4 sm:p-6">
      <PageHeader
        title="Profile & Security Scope"
        description="Inspect your active identity, role-based authorization matrix, and cryptographic session telemetry."
      />
      <ProfileClient
        user={{
          id: session.user.id,
          name: session.user.name ?? "Clinic Specialist",
          email: session.user.email ?? "",
          role,
        }}
      />
    </div>
  );
}
