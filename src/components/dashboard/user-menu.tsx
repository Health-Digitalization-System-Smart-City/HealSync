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
import { ROLES, type Role } from "@/lib/permissions";

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
        className="border-border/80 bg-card text-foreground hover:bg-muted/70 focus-visible:ring-ring flex items-center gap-2.5 rounded-full border p-1 pr-3 text-xs font-semibold shadow-2xs transition-all select-none focus-visible:ring-2"
      >
        <div className="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-full text-xs leading-none font-bold">
          {initials(name)}
        </div>
        <div className="hidden flex-col text-left sm:flex">
          <span className="text-xs leading-none font-medium">{name}</span>
          <span className="text-muted-foreground text-[10px] capitalize">
            {role}
          </span>
        </div>
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner
          sideOffset={8}
          align="end"
          className="z-50 outline-hidden"
        >
          <Menu.Popup className="border-border bg-popover text-popover-foreground relative z-50 min-w-64 origin-[var(--transform-origin)] rounded-xl border p-1.5 shadow-xl outline-hidden transition-[scale,opacity] duration-150 ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0">
            {/* User Details */}
            <div className="bg-muted/40 flex flex-col gap-1 rounded-lg p-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-foreground truncate text-sm font-semibold">
                  {name}
                </span>
                <Badge
                  variant={
                    role === ROLES.ADMIN
                      ? "default"
                      : role === ROLES.MANAGER
                        ? "secondary"
                        : "outline"
                  }
                  className="text-[10px] font-bold tracking-wider uppercase"
                >
                  {role}
                </Badge>
              </div>
              <span className="text-muted-foreground truncate text-xs">
                {email}
              </span>
              <div className="text-muted-foreground mt-1 flex items-center gap-1.5 text-[11px]">
                <ShieldCheck className="size-3 text-emerald-600 dark:text-emerald-400" />
                <span>Your access is managed by your administrator</span>
              </div>
            </div>

            <Menu.Separator className="bg-border my-1.5 h-px" />

            {/* Profile link */}
            <Menu.Item
              className={menuItemClass}
              render={<Link href="/dashboard/profile" />}
            >
              <UserRound className="text-muted-foreground size-4" aria-hidden />
              <div className="flex flex-1 items-center justify-between">
                <span>Profile & Security</span>
                <ChevronRight className="text-muted-foreground/60 size-3.5" />
              </div>
            </Menu.Item>

            {/* Quick dashboard overview */}
            <Menu.Item
              className={menuItemClass}
              render={<Link href="/dashboard" />}
            >
              <Sparkles className="text-muted-foreground size-4" aria-hidden />
              <div className="flex flex-1 items-center justify-between">
                <span>Dashboard Overview</span>
              </div>
            </Menu.Item>

            <Menu.Separator className="bg-border my-1.5 h-px" />

            {/* Sign out */}
            <Menu.Item
              className={cn(
                menuItemClass,
                "text-destructive focus:bg-destructive/10 data-[highlighted]:bg-destructive/10 data-[highlighted]:text-destructive",
              )}
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
