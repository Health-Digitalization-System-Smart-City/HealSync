"use client";

import { useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  SidebarBrand,
  SidebarFooter,
  SidebarNav,
} from "@/components/dashboard/sidebar";
import { UserMenu } from "@/components/dashboard/user-menu";
import { DashboardBreadcrumbs } from "@/components/dashboard/breadcrumbs";
import type { NavItem } from "@/components/dashboard/nav-config";
import { ROLES, type Role } from "@/lib/permissions";

export type DashboardUser = {
  name: string;
  email: string;
  role: Role;
};

export function AppShell({
  children,
  navItems,
  user,
  branchCount,
}: {
  children: React.ReactNode;
  navItems: readonly NavItem[];
  user: DashboardUser;
  branchCount: number;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
      <div className="flex min-h-dvh w-full bg-muted/20">
        {/* Desktop sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-border/80 bg-sidebar lg:flex lg:flex-col">
          <div className="flex h-15 items-center border-b border-border/70 px-4">
            <SidebarBrand />
          </div>
          <div className="flex flex-1 flex-col overflow-y-auto p-3.5">
            <SidebarNav items={navItems} branchCount={branchCount} />
          </div>
          <div className="border-t border-border/70 p-3 bg-muted/20">
            <SidebarFooter {...user} />
          </div>
        </aside>

        {/* Main content column */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Header */}
          <header className="sticky top-0 z-30 flex h-15 shrink-0 items-center justify-between gap-3 border-b border-border/80 bg-background/90 px-4 sm:px-6 backdrop-blur-md">
            {/* Left: Mobile menu toggle + breadcrumbs */}
            <div className="flex items-center gap-3">
              <Dialog.Trigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden"
                    aria-label="Open navigation menu"
                  >
                    <Menu className="size-4.5" aria-hidden />
                  </Button>
                }
              />
              <DashboardBreadcrumbs />
            </div>

            {/* Right: Status pill, role indicator & user profile menu */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="hidden items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.8 text-xs font-medium text-emerald-700 dark:text-emerald-300 md:flex">
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500"></span>
                </span>
                <span>{branchCount} Branches Active</span>
              </div>

              <div className="hidden sm:block">
                <Badge
                  variant={user.role === ROLES.ADMIN ? "default" : user.role === ROLES.MANAGER ? "secondary" : "outline"}
                  className="font-mono text-[10px] uppercase font-bold tracking-wider"
                >
                  {user.role} role
                </Badge>
              </div>

              <UserMenu {...user} />
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile Drawer */}
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col bg-sidebar text-sidebar-foreground shadow-2xl outline-hidden transition-[transform,opacity] duration-200 ease-out data-ending-style:-translate-x-full data-starting-style:-translate-x-full">
          <div className="flex h-15 items-center justify-between border-b border-sidebar-border px-4">
            <SidebarBrand />
            <Dialog.Close
              aria-label="Close navigation"
              className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="size-4" aria-hidden />
            </Dialog.Close>
          </div>
          <div className="flex flex-1 flex-col overflow-y-auto p-3.5" onClick={() => setMobileOpen(false)}>
            <SidebarNav items={navItems} branchCount={branchCount} />
          </div>
          <div className="border-t border-sidebar-border p-3 bg-muted/20" onClick={() => setMobileOpen(false)}>
            <SidebarFooter {...user} />
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
