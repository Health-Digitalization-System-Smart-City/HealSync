import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { PageHeader } from "@/components/dashboard/page-header";
import { ProfileClient } from "@/components/dashboard/profile-client";
import { requireUser } from "@/lib/auth/session";
import { isRole, ROLES } from "@/lib/permissions";

export const metadata: Metadata = {
  title: "Profile & Security",
  description:
    "Your account, the permissions granted to you, and how to keep it secure.",
};

export default async function ProfilePage() {
  const authResult = await requireUser();
  if (!authResult.success) {
    redirect("/login");
  }
  const user = authResult.data;

  const rawRole = user.role ?? ROLES.ANALYST;
  const role = isRole(rawRole) ? rawRole : ROLES.ANALYST;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 p-4 sm:p-6">
      <PageHeader
        title="Profile & Security"
        description="Your account, what you're allowed to do, and how to keep it secure. Your password is the only detail you can change yourself."
      />
      <ProfileClient
        user={{
          id: user.id,
          name: user.name ?? "Clinic Specialist",
          email: user.email ?? "",
          role,
        }}
        createdAt={user.createdAt.toISOString()}
        lastLoginAt={user.lastLoginAt?.toISOString() ?? null}
        isActive={user.isActive}
      />
    </div>
  );
}
