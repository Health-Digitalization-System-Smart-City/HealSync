import type { Metadata } from "next";

import { AppShell } from "@/components/dashboard/app-shell";
import { getNavItems } from "@/components/dashboard/nav-config";
import { isRole, ROLES } from "@/lib/permissions";
import { requireAuth } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: {
    default: "Dashboard",
    template: "%s · HealSync",
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
  const navItems = getNavItems(role);

  return (
    <AppShell
      user={{
        name: user.name ?? "Dashboard user",
        email: user.email ?? "",
        role,
      }}
      navItems={navItems}
    >
      {children}
    </AppShell>
  );
}
