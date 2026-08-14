// Dashboard navigation configuration.
//
// Each item declares the permission required to see it. The navigation is
// filtered by the user's role (from the server session) — this is a UX
// convenience only. Every route and Server Action re-checks authorization
// server-side.
import {
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

import {
  PERMISSIONS,
  getPermissions,
  type Permission,
} from "@/lib/permissions";

export type NavSection = "Core" | "Operations" | "Intelligence" | "Management" | "Account";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  section?: NavSection;
  badge?: string;
  /** Permission required to see this item. Omitted = visible to all roles. */
  permission?: Permission;
};

export const NAV_ITEMS: readonly NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    section: "Core",
  },
  {
    title: "Tasks",
    href: "/dashboard/tasks",
    icon: CheckSquare,
    section: "Operations",
    badge: "5",
    permission: PERMISSIONS.TASK_READ,
  },
  {
    title: "Feedback",
    href: "/dashboard/feedback",
    icon: MessageSquareText,
    section: "Operations",
    badge: "12",
    permission: PERMISSIONS.FEEDBACK_READ,
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: TrendingUp,
    section: "Intelligence",
    permission: PERMISSIONS.ANALYTICS_READ,
  },
  {
    title: "Branches",
    href: "/dashboard/branches",
    icon: Building2,
    section: "Management",
    permission: PERMISSIONS.BRANCH_READ,
  },
  {
    title: "Services",
    href: "/dashboard/services",
    icon: Stethoscope,
    section: "Management",
    permission: PERMISSIONS.SERVICE_READ,
  },
  {
    title: "Users",
    href: "/dashboard/users",
    icon: Users,
    section: "Management",
    permission: PERMISSIONS.USER_READ,
  },
  {
    title: "Profile & Security",
    href: "/dashboard/profile",
    icon: UserCheck,
    section: "Account",
  },
];

export function getNavItems(role: string): NavItem[] {
  const permitted = getPermissions(role);
  return NAV_ITEMS.filter(
    (item) => item.permission === undefined || permitted.includes(item.permission),
  );
}

export function getNavSections(items: readonly NavItem[]): { section: NavSection; items: NavItem[] }[] {
  const map = new Map<NavSection, NavItem[]>();
  for (const item of items) {
    const section = item.section ?? "Core";
    if (!map.has(section)) {
      map.set(section, []);
    }
    map.get(section)!.push(item);
  }
  return Array.from(map.entries()).map(([section, sectionItems]) => ({
    section,
    items: sectionItems,
  }));
}
