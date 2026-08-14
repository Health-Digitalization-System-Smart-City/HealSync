import { HeartPulse } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";

import { can } from "@/lib/auth/permissions";
import { requireUser } from "@/lib/auth/session";

import { SignOutButton } from "@/features/auth/components/sign-out-button";

import { DashboardNavigation } from "./dashboard-navigation";

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
      <header className="bg-background/90 sticky top-0 z-10 border-b backdrop-blur-xl">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between gap-4">
            <Link
              href="/dashboard"
              className="flex shrink-0 items-center gap-2 font-semibold"
            >
              <HeartPulse className="text-primary h-6 w-6" aria-hidden />
              <span>HealSync</span>
            </Link>

            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 lg:flex">
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
          <div className="border-border/70 -mx-4 overflow-x-auto border-t px-4 sm:mx-0 sm:border-t-0 sm:px-0 md:absolute md:inset-0 md:mx-auto md:flex md:w-full md:max-w-6xl md:items-center md:justify-center md:overflow-visible">
            <DashboardNavigation canManageUsers={canManageUsers} />
          </div>
        </div>
      </header>

      <div className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </div>
      </div>

      <footer className="text-muted-foreground border-t py-6 text-center text-xs">
        HealSync · Patient feedback &amp; analytics platform
      </footer>
    </div>
  );
}
