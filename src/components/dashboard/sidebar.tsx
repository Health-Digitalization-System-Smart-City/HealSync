"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Radio } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { getNavSections, type NavItem } from "@/components/dashboard/nav-config";
import type { Role } from "@/lib/permissions";

export function SidebarBrand() {
  return (
    <div className="flex w-full items-center justify-between">
      <Link href="/dashboard" className="flex items-center gap-2.5 px-1 group">
        <span className="flex size-8.5 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs transition-transform group-hover:scale-105">
          <Activity className="size-4.5" aria-hidden />
        </span>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold tracking-tight text-sm text-foreground">HealSync</span>
            <span className="rounded bg-primary/10 px-1 py-0.2 text-[10px] font-semibold text-primary">v1.0</span>
          </div>
          <span className="text-[11px] text-muted-foreground">Smart City Health</span>
        </div>
      </Link>
    </div>
  );
}

export function SidebarNav({ items }: { items: readonly NavItem[] }) {
  const pathname = usePathname();
  const sections = getNavSections(items);

  return (
    <nav className="flex flex-1 flex-col gap-5 py-1" aria-label="Dashboard navigation">
      {sections.map(({ section, items: sectionItems }) => (
        <div key={section} className="flex flex-col gap-1">
          <div className="px-2.5 pb-1 text-[11px] font-semibold tracking-wider text-muted-foreground/70 uppercase">
            {section}
          </div>
          <div className="flex flex-col gap-0.5">
            {sectionItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "group relative flex items-center justify-between rounded-lg px-2.5 py-2 text-sm font-medium transition-all",
                    isActive
                      ? "bg-primary/10 text-primary font-semibold dark:bg-primary/20 dark:text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={cn(
                        "size-4 shrink-0 transition-colors",
                        isActive ? "text-primary dark:text-primary-foreground" : "text-muted-foreground group-hover:text-foreground",
                      )}
                      aria-hidden
                    />
                    <span className="truncate">{item.title}</span>
                  </div>
                  {item.badge ? (
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.2 text-[10px] font-semibold",
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

      <div className="mt-auto rounded-lg border border-border/70 bg-muted/40 p-3">
        <div className="flex items-center gap-2 text-xs font-medium text-foreground">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500"></span>
          </span>
          <span>13 Clinics Connected</span>
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">
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
      className="group flex items-center gap-3 rounded-lg p-1.5 transition-colors hover:bg-accent"
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
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
          <span className="truncate text-xs font-semibold text-foreground group-hover:text-foreground">
            {name}
          </span>
          <Badge
            variant={role === "admin" ? "default" : role === "manager" ? "secondary" : "outline"}
            className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0"
          >
            {role}
          </Badge>
        </div>
        <span className="truncate text-[11px] text-muted-foreground">{email}</span>
      </div>
    </Link>
  );
}
