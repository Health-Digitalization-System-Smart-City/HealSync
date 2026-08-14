<<<<<<< HEAD
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
=======
import { HeartPulse, LayoutDashboard, Users } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";

import { can } from "@/lib/auth/permissions";
import { requireUser } from "@/lib/auth/session";

import { SignOutButton } from "@/features/auth/components/sign-out-button";

/**
 * Dashboard route guard (PRD.md BR-007, API.md §6, security.md §9).
 * Enforced server-side on every dashboard route:
 * - Unauthenticated users are redirected to /login.
 * - Disabled accounts are blocked even with a pre-existing session.
 */
export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const authResult = await requireUser();
  if (!authResult.success) redirect("/login");

  const user = authResult.data;
  const canManageUsers = await can(user.id, "user.read");

  return (
    <div className="bg-background flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b backdrop-blur-sm">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 font-semibold"
            >
              <HeartPulse className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">HealSync</span>
            </Link>
            <nav className="flex items-center gap-1">
              <Link
                href="/dashboard"
                className="text-muted-foreground hover:text-foreground hover:bg-accent/60 flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              {canManageUsers && (
                <Link
                  href="/dashboard/users"
                  className="text-muted-foreground hover:text-foreground hover:bg-accent/60 flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
                >
                  <Users className="h-4 w-4" />
                  Users
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 sm:flex">
              <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="leading-tight">
                <p className="max-w-[160px] truncate text-sm font-medium">
                  {user.name}
                </p>
                <Badge
                  variant="secondary"
                  className="mt-0.5 px-1.5 py-0 text-[10px]"
                >
                  {user.role}
                </Badge>
              </div>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      <div className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
          {children}
        </div>
      </div>

      <footer className="text-muted-foreground border-t py-6 text-center text-xs">
        HealSync · Patient feedback &amp; analytics platform
      </footer>
    </div>
>>>>>>> d7f1791ce0ab492099e231d8e60834dae192064e
  );
}
