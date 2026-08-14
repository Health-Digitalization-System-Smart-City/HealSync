"use client";

import { BarChart3, LayoutDashboard, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const navigationItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
] as const;

export function DashboardNavigation({
  canManageUsers,
}: {
  canManageUsers: boolean;
}) {
  const pathname = usePathname();
  const items = canManageUsers
    ? [
        ...navigationItems,
        { href: "/dashboard/users", label: "Users", icon: Users },
      ]
    : navigationItems;

  return (
    <nav aria-label="Dashboard navigation" className="flex items-center gap-1">
      {items.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold transition-colors",
              isActive
                ? "bg-primary text-primary-foreground shadow-primary/20 shadow-sm"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <Icon className="h-4 w-4" aria-hidden />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
