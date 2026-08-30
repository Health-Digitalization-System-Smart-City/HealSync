import type { Metadata } from "next";

import Providers from "@/components/Providers";
import { AppShell } from "@/components/dashboard/app-shell";
import {
  getNavItems,
  type NavBadgeCounts,
} from "@/components/dashboard/nav-config";
import { getNavCounts } from "@/lib/analytics/db";
import { isRole, ROLES } from "@/lib/permissions";
import { requireAuth } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: {
    default: "Dashboard",
    template: "%s · Smart Feedback",
  },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();
  const user = session.user;

  const rawRole = user.role ?? ROLES.ANALYST;
  const role = isRole(rawRole) ? rawRole : ROLES.ANALYST;

  // Shell counts degrade gracefully: a DB hiccup renders the nav without
  // badges rather than crashing the whole dashboard.
  let badgeCounts: NavBadgeCounts = {};
  let branchCount = 0;
  try {
    const counts = await getNavCounts();
    badgeCounts = { tasks: counts.tasks, feedback: counts.feedback };
    branchCount = counts.branches;
  } catch (error) {
    console.error("Failed to load dashboard nav counts:", error);
  }

  const navItems = getNavItems(role, badgeCounts);

  return (
    <Providers>
      <AppShell
        user={{
          name: user.name ?? "Dashboard user",
          email: user.email ?? "",
          role,
        }}
        navItems={navItems}
        branchCount={branchCount}
      >
        {children}
      </AppShell>
    </Providers>
  );
}
