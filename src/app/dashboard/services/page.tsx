import type { Metadata } from "next";

import { PageHeader } from "@/components/dashboard/page-header";
import { ServicesClient } from "@/components/dashboard/services-client";
import { PERMISSIONS, isRole, ROLES } from "@/lib/permissions";
import { requirePermission } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Medical Services",
  description: "Manage clinic services, specialties, diagnostic categories, and patient wait time metrics.",
};

export default async function ServicesPage() {
  const session = await requirePermission(PERMISSIONS.SERVICE_READ);
  const rawRole = session.user.role ?? ROLES.ANALYST;
  const role = isRole(rawRole) ? rawRole : ROLES.ANALYST;

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Medical Services & Specialties"
        description="Configure clinical departments, lead doctors, satisfaction ratings, and triage wait time standards."
      />
      <ServicesClient userRole={role} />
    </div>
  );
}
