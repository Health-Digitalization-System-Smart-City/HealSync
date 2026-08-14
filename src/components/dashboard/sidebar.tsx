"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Building2,
  CheckSquare,
  LayoutDashboard,
  MessageSquareText,
  Stethoscope,
  TrendingUp,
  UserCheck,
  Users,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  getNavSections,
  type NavIcon,
  type NavItem,
} from "@/components/dashboard/nav-config";
import { ROLES, type Role } from "@/lib/permissions";

/**
 * Resolves serializable nav icon keys to their Lucide components. Kept in the
 * client bundle so `nav-config` stays plain data and can cross the RSC
 * boundary (functions cannot be passed from Server to Client Components).
 */
const ICONS: Record<NavIcon, LucideIcon> = {
  dashboard: LayoutDashboard,
  tasks: CheckSquare,
  feedback: MessageSquareText,
  analytics: TrendingUp,
  branches: Building2,
  services: Stethoscope,
  users: Users,
  profile: UserCheck,
};

export function SidebarBrand() {
  return (
    <div className="flex w-full items-center justify-between">
      <Link href="/dashboard" className="group flex items-center gap-2.5 px-1">
        <span className="bg-primary text-primary-foreground flex size-8.5 items-center justify-center rounded-lg shadow-xs transition-transform group-hover:scale-105">
          <Activity className="size-4.5" aria-hidden />
        </span>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-foreground text-sm font-semibold tracking-tight">
              HealSync
            </span>
            <span className="bg-primary/10 py-0.2 text-primary rounded px-1 text-[10px] font-semibold">
              v1.0
            </span>
          </div>
          <span className="text-muted-foreground text-[11px]">
            Smart City Health
          </span>
        </div>
      </Link>
    </div>
  );
}

export function SidebarNav({
  items,
  branchCount,
}: {
  items: readonly NavItem[];
  branchCount: number;
}) {
  const pathname = usePathname();
  const sections = getNavSections(items);

  return (
    <nav
      className="flex flex-1 flex-col gap-5 py-1"
      aria-label="Dashboard navigation"
    >
      {sections.map(({ section, items: sectionItems }) => (
        <div key={section} className="flex flex-col gap-1">
          <div className="text-muted-foreground/70 px-2.5 pb-1 text-[11px] font-semibold tracking-wider uppercase">
            {section}
          </div>
          <div className="flex flex-col gap-0.5">
            {sectionItems.map((item) => {
              const Icon = ICONS[item.icon];
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname === item.href ||
                    pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "group relative flex items-center justify-between rounded-lg px-2.5 py-2 text-sm font-medium transition-all",
                    isActive
                      ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground font-semibold"
                      : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={cn(
                        "size-4 shrink-0 transition-colors",
                        isActive
                          ? "text-primary dark:text-primary-foreground"
                          : "text-muted-foreground group-hover:text-foreground",
                      )}
                      aria-hidden
                    />
                    <span className="truncate">{item.title}</span>
                  </div>
                  {item.badge ? (
                    <span
                      className={cn(
                        "py-0.2 rounded-full px-1.5 text-[10px] font-semibold",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground group-hover:bg-accent group-hover:text-accent-foreground",
                      )}
                    >
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        </div>
      ))}

      <div className="border-border/70 bg-muted/40 mt-auto rounded-lg border p-3">
        <div className="text-foreground flex items-center gap-2 text-xs font-medium">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500"></span>
          </span>
          <span>{branchCount} Clinics Connected</span>
        </div>
        <p className="text-muted-foreground mt-1 text-[11px]">
          Real-time patient feedback & SLA monitoring active.
        </p>
      </div>
    </nav>
  );
}

export function SidebarFooter({
  name,
  email,
  role,
}: {
  name: string;
  email: string;
  role: Role;
}) {
  return (
    <Link
      href="/dashboard/profile"
      className="group hover:bg-accent flex items-center gap-3 rounded-lg p-1.5 transition-colors"
    >
      <div className="bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors">
        {name
          .split(" ")
          .filter(Boolean)
          .slice(0, 2)
          .map((n) => n[0])
          .join("")
          .toUpperCase() || "U"}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between gap-1">
          <span className="text-foreground group-hover:text-foreground truncate text-xs font-semibold">
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
            className="px-1.5 py-0 text-[10px] font-bold tracking-wider uppercase"
          >
            {role}
          </Badge>
        </div>
        <span className="text-muted-foreground truncate text-[11px]">
          {email}
        </span>
      </div>
    </Link>
  );
}
