"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Building2,
  CheckSquare,
  LayoutDashboard,
  MessageSquareText,
  Sparkles,
  Stethoscope,
  TrendingUp,
  UserCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Tooltip } from "@base-ui/react/tooltip";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  getNavSections,
  type NavIcon,
  type NavItem,
} from "@/components/dashboard/nav-config";
import { ROLES, type Role } from "@/lib/permissions";
import { useFeedbackI18n } from "@/features/feedback/components/feedback-i18n";

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
  ai: Sparkles,
  branches: Building2,
  services: Stethoscope,
  users: Users,
  profile: UserCheck,
};

const NAV_LABEL_KEYS: Record<
  string,
  Parameters<ReturnType<typeof useFeedbackI18n>["t"]>[0]
> = {
  "/dashboard": "navDashboard",
  "/dashboard/tasks": "navTasks",
  "/dashboard/feedback": "navFeedback",
  "/dashboard/analytics": "navAnalytics",
  "/dashboard/ai-insights": "navAi",
  "/dashboard/branches": "navBranches",
  "/dashboard/services": "navServices",
  "/dashboard/users": "navUsers",
  "/dashboard/profile": "navProfile",
};

const SECTION_LABEL_KEYS: Record<
  string,
  Parameters<ReturnType<typeof useFeedbackI18n>["t"]>[0]
> = {
  Core: "sectionCore",
  Operations: "sectionOperations",
  Intelligence: "sectionIntelligence",
  Management: "sectionManagement",
  Account: "sectionAccount",
};

/**
 * Tooltip used by the collapsed (icon-only) sidebar rail so every hidden
 * label stays discoverable on hover. Rendered through a portal so it never
 * gets clipped by the sidebar's own scroll area.
 */
function RailTooltip({
  label,
  children,
}: {
  label: string;
  children: React.ReactElement;
}) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger render={children} />
      <Tooltip.Portal>
        <Tooltip.Positioner side="right" sideOffset={10} className="z-50">
          <Tooltip.Popup className="bg-foreground text-background origin-left rounded-lg px-2.5 py-1.5 text-xs font-medium whitespace-nowrap shadow-lg transition-[scale,opacity] duration-150 ease-out data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
            {label}
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

export function SidebarBrand({ collapsed = false }: { collapsed?: boolean }) {
  const { t } = useFeedbackI18n();
  if (collapsed) {
    return (
      <Link
        href="/dashboard"
        aria-label={t("dashboardHome")}
        title={t("dashboardHome")}
        className="group flex items-center"
      >
        <span className="bg-primary text-primary-foreground flex size-8.5 items-center justify-center rounded-lg shadow-xs transition-transform group-hover:scale-105">
          <Activity className="size-4.5" aria-hidden />
        </span>
      </Link>
    );
  }

  return (
    <div className="flex w-full items-center justify-between">
      <Link href="/dashboard" className="group flex items-center gap-2.5 px-1">
        <span className="bg-primary text-primary-foreground flex size-8.5 items-center justify-center rounded-lg shadow-xs transition-transform group-hover:scale-105">
          <Activity className="size-4.5" aria-hidden />
        </span>
        <div className="flex flex-col">
          <span className="text-foreground text-sm font-semibold tracking-tight">
            Smart Feedback
          </span>
          <span className="text-muted-foreground text-[11px]">
            Healthcare Platform
          </span>
        </div>
      </Link>
    </div>
  );
}

function NavItemLink({
  item,
  isActive,
  collapsed,
}: {
  item: NavItem;
  isActive: boolean;
  collapsed: boolean;
}) {
  const { t } = useFeedbackI18n();
  const Icon = ICONS[item.icon];
  const title = t(NAV_LABEL_KEYS[item.href] ?? "navDashboard");

  const link = (
    <Link
      href={item.href}
      aria-current={isActive ? "page" : undefined}
      aria-label={collapsed ? title : undefined}
      title={collapsed ? title : undefined}
      className={cn(
        "group relative flex items-center rounded-lg px-2.5 py-2 text-sm font-medium transition-all",
        collapsed ? "justify-center px-0 py-2.5" : "justify-between",
        isActive
          ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground font-semibold"
          : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
      )}
    >
      <span
        className={cn("flex items-center gap-2.5", collapsed && "relative")}
      >
        <Icon
          className={cn(
            "size-4 shrink-0 transition-colors",
            isActive
              ? "text-primary dark:text-primary-foreground"
              : "text-muted-foreground group-hover:text-foreground",
          )}
          aria-hidden
        />
        {!collapsed && <span className="truncate">{title}</span>}

        {item.badge && collapsed ? (
          <span
            className={cn(
              "absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold",
              isActive
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground group-hover:bg-accent group-hover:text-accent-foreground",
            )}
            aria-hidden
          >
            {item.badge}
          </span>
        ) : null}
      </span>

      {item.badge && !collapsed ? (
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

  if (!collapsed) return link;

  return <RailTooltip label={title}>{link}</RailTooltip>;
}

export function SidebarNav({
  items,
  branchCount,
  collapsed = false,
}: {
  items: readonly NavItem[];
  branchCount: number;
  collapsed?: boolean;
}) {
  const { t } = useFeedbackI18n();
  const pathname = usePathname();
  const sections = getNavSections(items);

  return (
    <nav
      className="flex flex-1 flex-col gap-5 py-1"
      aria-label={t("dashboardNavigation")}
    >
      {sections.map(({ section, items: sectionItems }) => (
        <div key={section} className="flex flex-col gap-1">
          {!collapsed && (
            <div className="text-muted-foreground/70 px-2.5 pb-1 text-[11px] font-semibold tracking-wider uppercase">
              {t(SECTION_LABEL_KEYS[section] ?? "sectionCore")}
            </div>
          )}
          <div className="flex flex-col gap-0.5">
            {sectionItems.map((item) => {
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname === item.href ||
                    pathname.startsWith(item.href + "/");

              return (
                <NavItemLink
                  key={item.href}
                  item={item}
                  isActive={isActive}
                  collapsed={collapsed}
                />
              );
            })}
          </div>
        </div>
      ))}

      {collapsed ? (
        <div className="mt-auto">
          <RailTooltip label={t("clinicsConnected", { count: branchCount })}>
            <div
              className="border-border/70 bg-muted/40 flex flex-col items-center gap-1.5 rounded-lg border p-2"
              aria-label={t("clinicsConnected", { count: branchCount })}
            >
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500"></span>
              </span>
              <span className="text-foreground text-[10px] font-semibold">
                {branchCount}
              </span>
            </div>
          </RailTooltip>
        </div>
      ) : (
        <div className="border-border/70 bg-muted/40 mt-auto rounded-lg border p-3">
          <div className="text-foreground flex items-center gap-2 text-xs font-medium">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500"></span>
            </span>
            <span>{t("clinicsConnected", { count: branchCount })}</span>
          </div>
          <p className="text-muted-foreground mt-1 text-[11px]">
            {t("monitoringActive")}
          </p>
        </div>
      )}
    </nav>
  );
}

export function SidebarFooter({
  name,
  email,
  role,
  collapsed = false,
}: {
  name: string;
  email: string;
  role: Role;
  collapsed?: boolean;
}) {
  const avatar = (
    <div className="bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground flex size-9 shrink-0 items-center justify-center rounded-full text-xs leading-none font-bold transition-colors">
      {name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase() || "U"}
    </div>
  );

  if (collapsed) {
    return (
      <RailTooltip label={`${name} · ${role}`}>
        <Link
          href="/dashboard/profile"
          aria-label={`${name}, ${role} — view profile`}
          title={`${name} · ${role}`}
          className="group flex justify-center rounded-lg p-1 transition-colors"
        >
          {avatar}
        </Link>
      </RailTooltip>
    );
  }

  return (
    <Link
      href="/dashboard/profile"
      className="group hover:bg-accent flex items-center gap-3 rounded-lg p-1.5 transition-colors"
    >
      {avatar}
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
