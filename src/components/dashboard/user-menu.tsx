"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  LogOut,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { Menu } from "@base-ui/react/menu";

import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth/client";
import { Badge } from "@/components/ui/badge";
import { getPermissions, ROLES, type Role } from "@/lib/permissions";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function UserMenu({
  name,
  email,
  role,
}: {
  name: string;
  email: string;
  role: Role;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const permissions = getPermissions(role);

  async function handleSignOut() {
    setPending(true);
    try {
      await authClient.signOut();
    } catch {
      // ignore client signout errors and redirect
    }
    router.push("/login");
    router.refresh();
  }

  const menuItemClass =
    "flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-foreground select-none outline-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:opacity-50 transition-colors";

  return (
    <Menu.Root>
      <Menu.Trigger
        aria-label="Open user menu"
        className="flex items-center gap-2.5 rounded-full border border-border/80 bg-card p-1 pr-3 text-xs font-semibold text-foreground shadow-2xs transition-all hover:bg-muted/70 focus-visible:ring-2 focus-visible:ring-ring select-none"
      >
        <div className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
          {initials(name)}
        </div>
        <div className="hidden flex-col text-left sm:flex">
          <span className="text-xs font-medium leading-none">{name}</span>
          <span className="text-[10px] text-muted-foreground capitalize">{role}</span>
        </div>
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner sideOffset={8} align="end" className="outline-hidden z-50">
          <Menu.Popup className="relative z-50 min-w-64 origin-[var(--transform-origin)] rounded-xl border border-border bg-popover p-1.5 text-popover-foreground shadow-xl outline-hidden transition-[scale,opacity] duration-150 ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0">
            {/* User Details */}
            <div className="flex flex-col gap-1 rounded-lg bg-muted/40 p-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-semibold text-foreground">{name}</span>
                <Badge
                  variant={role === ROLES.ADMIN ? "default" : role === ROLES.MANAGER ? "secondary" : "outline"}
                  className="text-[10px] uppercase font-bold tracking-wider"
                >
                  {role}
                </Badge>
              </div>
              <span className="truncate text-xs text-muted-foreground">{email}</span>
              <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <ShieldCheck className="size-3 text-emerald-600 dark:text-emerald-400" />
                <span>{permissions.length} server permissions active</span>
              </div>
            </div>

            <Menu.Separator className="my-1.5 h-px bg-border" />

            {/* Profile link */}
            <Menu.Item
              className={menuItemClass}
              render={<Link href="/dashboard/profile" />}
            >
              <UserRound className="size-4 text-muted-foreground" aria-hidden />
              <div className="flex flex-1 items-center justify-between">
                <span>Profile & Security</span>
                <ChevronRight className="size-3.5 text-muted-foreground/60" />
              </div>
            </Menu.Item>

            {/* Quick dashboard overview */}
            <Menu.Item
              className={menuItemClass}
              render={<Link href="/dashboard" />}
            >
              <Sparkles className="size-4 text-muted-foreground" aria-hidden />
              <div className="flex flex-1 items-center justify-between">
                <span>Dashboard Overview</span>
              </div>
            </Menu.Item>

            <Menu.Separator className="my-1.5 h-px bg-border" />

            {/* Sign out */}
            <Menu.Item
              className={cn(menuItemClass, "text-destructive focus:bg-destructive/10 data-[highlighted]:bg-destructive/10 data-[highlighted]:text-destructive")}
              onSelect={handleSignOut}
              disabled={pending}
            >
              <LogOut className="size-4" aria-hidden />
              <span>{pending ? "Signing out…" : "Sign out"}</span>
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
