import type { Metadata } from "next";

import { PageHeader } from "@/components/dashboard/page-header";
import { FeedbackClient } from "@/components/dashboard/feedback-client";
import { PERMISSIONS, isRole, ROLES } from "@/lib/permissions";
import { requirePermission } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Patient Feedback",
  description: "Review, triage, and analyze patient satisfaction and comments across all Smart City clinic branches.",
};

export default async function FeedbackPage() {
  const session = await requirePermission(PERMISSIONS.FEEDBACK_READ);
  const rawRole = session.user.role ?? ROLES.ANALYST;
  const role = isRole(rawRole) ? rawRole : ROLES.ANALYST;

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Patient Feedback Stream"
        description="Monitor real-time structured ratings and free-text reviews across all 13 clinic branches."
      />
      <FeedbackClient userRole={role} />
    </div>
  );
}
