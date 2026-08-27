"use client";

import { useEffect, useSyncExternalStore, useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { Menu, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";

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
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth/client";
import { LanguageSelector } from "@/features/feedback/components/language-selector";
import { useFeedbackI18n } from "@/features/feedback/components/feedback-i18n";

export type DashboardUser = {
  name: string;
  email: string;
  role: Role;
};

/** Where the desktop collapse preference is persisted across visits. */
const SIDEBAR_STORAGE_KEY = "healsync:sidebar-collapsed";

/** Custom event used to re-render the same tab after a local toggle. */
const SIDEBAR_STORAGE_EVENT = "healsync:sidebar-collapsed-change";

function readCollapsed(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === "1";
}

function subscribeToCollapsed(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(SIDEBAR_STORAGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(SIDEBAR_STORAGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function persistCollapsed(value: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SIDEBAR_STORAGE_KEY, value ? "1" : "0");
  window.dispatchEvent(new Event(SIDEBAR_STORAGE_EVENT));
}

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
  const { t } = useFeedbackI18n();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Persisted collapse preference. useSyncExternalStore keeps the server and
  // first client render in sync (no hydration mismatch) and re-renders when
  // the value changes — either from this tab or, via the `storage` event,
  // from another tab.
  const collapsed = useSyncExternalStore(
    subscribeToCollapsed,
    readCollapsed,
    () => false,
  );
  const toggleCollapsed = () => persistCollapsed(!collapsed);

  // Active session gatekeeper: if website/tab was closed, require fresh login
  useEffect(() => {
    if (typeof window === "undefined") return;

    const hasActiveSession = sessionStorage.getItem("healsync:session-active");
    if (!hasActiveSession) {
      authClient.signOut().finally(() => {
        window.location.href = "/login";
      });
      return;
    }

    // 30-minute client inactivity timeout
    const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000;
    let timer: ReturnType<typeof setTimeout>;

    function handleActivity() {
      clearTimeout(timer);
      timer = setTimeout(() => {
        console.warn("[auth] Idle inactivity timeout reached. Logging out.");
        sessionStorage.removeItem("healsync:session-active");
        authClient.signOut().finally(() => {
          window.location.href = "/login";
        });
      }, INACTIVITY_TIMEOUT_MS);
    }

    handleActivity();

    const events = ["pointerdown", "keydown", "scroll", "touchstart"];
    events.forEach((evt) => window.addEventListener(evt, handleActivity, { passive: true }));

    return () => {
      clearTimeout(timer);
      events.forEach((evt) => window.removeEventListener(evt, handleActivity));
    };
  }, []);

  // Ctrl/Cmd+B toggles the sidebar for keyboard-first users.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "b") {
        event.preventDefault();
        persistCollapsed(!collapsed);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [collapsed]);

  return (
    <Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
      <div className="bg-muted/20 flex min-h-dvh w-full">
        {/* Desktop sidebar — sticks to the viewport so it scrolls
            independently of the page; its own nav area scrolls on overflow. */}
        <aside
          className={cn(
            "bg-sidebar border-border/80 sticky top-0 hidden h-dvh shrink-0 flex-col border-r transition-[width] duration-200 ease-in-out lg:flex",
            collapsed ? "w-[4.5rem]" : "w-64",
          )}
        >
          <div
            className={cn(
              "border-border/70 flex h-15 shrink-0 items-center border-b",
              collapsed ? "justify-center px-2" : "px-4",
            )}
          >
            <SidebarBrand collapsed={collapsed} />
          </div>
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-3.5">
            <SidebarNav
              items={navItems}
              branchCount={branchCount}
              collapsed={collapsed}
            />
          </div>
          <div className="border-border/70 bg-muted/20 shrink-0 border-t p-3">
            <SidebarFooter {...user} collapsed={collapsed} />
          </div>
        </aside>

        {/* Main content column */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Header */}
          <header className="border-border/80 bg-background/90 sticky top-0 z-30 flex h-15 shrink-0 items-center justify-between gap-3 border-b px-4 backdrop-blur-md sm:px-6">
            {/* Left: mobile menu + sidebar collapse + breadcrumbs */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Dialog.Trigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden"
                    aria-label={t("openNavigation")}
                  >
                    <Menu className="size-4.5" aria-hidden />
                  </Button>
                }
              />
              <Button
                variant="ghost"
                size="icon"
                className="hidden lg:inline-flex"
                onClick={toggleCollapsed}
                aria-label={
                  collapsed ? t("expandSidebar") : t("collapseSidebar")
                }
                title={
                  collapsed
                    ? `${t("expandSidebar")} (Ctrl+B)`
                    : `${t("collapseSidebar")} (Ctrl+B)`
                }
              >
                {collapsed ? (
                  <PanelLeftOpen className="size-4.5" aria-hidden />
                ) : (
                  <PanelLeftClose className="size-4.5" aria-hidden />
                )}
              </Button>
              <DashboardBreadcrumbs />
            </div>

            {/* Right: Status pill, role indicator & user profile menu */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="hidden sm:block">
                <LanguageSelector />
              </div>
              <div className="py-0.8 hidden items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 text-xs font-medium text-emerald-700 md:flex dark:text-emerald-300">
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500"></span>
                </span>
                <span>{t("branchesActive", { count: branchCount })}</span>
              </div>

              <div className="hidden sm:block">
                <Badge
                  variant={
                    user.role === ROLES.ADMIN
                      ? "default"
                      : user.role === ROLES.MANAGER
                        ? "secondary"
                        : "outline"
                  }
                  className="font-mono text-[10px] font-bold tracking-wider uppercase"
                >
                  {t("role", { role: user.role })}
                </Badge>
              </div>

              <UserMenu {...user} />
            </div>
          </header>

          {/* Page Content — centered, padded page shell so every dashboard
              page (and its loading state) gets consistent edge gaps. */}
          <main className="mx-auto w-full max-w-7xl flex-1 overflow-x-hidden px-4 py-4 sm:px-6 sm:py-6">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile Drawer */}
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup className="bg-sidebar text-sidebar-foreground fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col shadow-2xl outline-hidden transition-[transform,opacity] duration-200 ease-out data-ending-style:-translate-x-full data-starting-style:-translate-x-full">
          <div className="border-sidebar-border flex h-15 items-center justify-between border-b px-4">
            <SidebarBrand />
            <Dialog.Close
              aria-label={t("closeNavigation")}
              className="text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring flex size-8 items-center justify-center rounded-lg transition-colors focus-visible:ring-2"
            >
              <X className="size-4" aria-hidden />
            </Dialog.Close>
          </div>
          <div
            className="flex flex-1 flex-col overflow-y-auto p-3.5"
            onClick={() => setMobileOpen(false)}
          >
            <SidebarNav items={navItems} branchCount={branchCount} />
          </div>
          <div
            className="border-sidebar-border bg-muted/20 border-t p-3"
            onClick={() => setMobileOpen(false)}
          >
            <SidebarFooter {...user} />
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
