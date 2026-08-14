// Dashboard navigation configuration.
//
// This module is intentionally serializable — every field is plain data, with
// no functions or React components — so the `navItems` array can safely cross
// the Server → Client component boundary. Icons are referenced by string key
// (`NavIcon`) and resolved to Lucide components in the client `sidebar.tsx`.
//
// Each item declares the permission required to see it. The navigation is
// filtered by the user's role (from the server session) — this is a UX
// convenience only. Every route and Server Action re-checks authorization
// server-side.
import {
  PERMISSIONS,
  getPermissions,
  type Permission,
} from "@/lib/permissions";

export type NavSection =
  "Core" | "Operations" | "Intelligence" | "Management" | "Account";

/** Serializable icon key — resolved to a Lucide component in the client sidebar. */
export type NavIcon =
  | "dashboard"
  | "tasks"
  | "feedback"
  | "analytics"
  | "branches"
  | "services"
  | "users"
  | "profile";

/** Live counts the server attaches to nav badges (0 = badge hidden). */
export type NavBadgeCounts = {
  tasks?: number;
  feedback?: number;
};

export type NavItem = {
  title: string;
  href: string;
  icon: NavIcon;
  section?: NavSection;
  /** Static badge text. Leave unset and set `badgeCount` for a live count. */
  badge?: string;
  /** When set, the server fills `badge` with the live count of this resource. */
  badgeCount?: "tasks" | "feedback";
  /** Permission required to see this item. Omitted = visible to all roles. */
  permission?: Permission;
};

export const NAV_ITEMS: readonly NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: "dashboard",
    section: "Core",
  },
  {
    title: "Tasks",
    href: "/dashboard/tasks",
    icon: "tasks",
    section: "Operations",
    badgeCount: "tasks",
    permission: PERMISSIONS.TASK_READ,
  },
  {
    title: "Feedback",
    href: "/dashboard/feedback",
    icon: "feedback",
    section: "Operations",
    badgeCount: "feedback",
    permission: PERMISSIONS.FEEDBACK_READ,
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: "analytics",
    section: "Intelligence",
    permission: PERMISSIONS.ANALYTICS_READ,
  },
  {
    title: "Branches",
    href: "/dashboard/branches",
    icon: "branches",
    section: "Management",
    permission: PERMISSIONS.BRANCH_READ,
  },
  {
    title: "Services",
    href: "/dashboard/services",
    icon: "services",
    section: "Management",
    permission: PERMISSIONS.SERVICE_READ,
  },
  {
    title: "Users",
    href: "/dashboard/users",
    icon: "users",
    section: "Management",
    permission: PERMISSIONS.USER_READ,
  },
  {
    title: "Profile & Security",
    href: "/dashboard/profile",
    icon: "profile",
    section: "Account",
  },
];

/**
 * Returns the nav items visible to `role`, optionally with live counts filled
 * into the matching `badgeCount` items. Purely data — safe for server render.
 */
export function getNavItems(
  role: string,
  counts: NavBadgeCounts = {},
): NavItem[] {
  const permitted = getPermissions(role);
  return NAV_ITEMS.filter(
    (item) =>
      item.permission === undefined || permitted.includes(item.permission),
  ).map((item) => {
    if (!item.badgeCount) return item;
    const count = counts[item.badgeCount] ?? 0;
    return count > 0 ? { ...item, badge: String(count) } : item;
  });
}

export function getNavSections(
  items: readonly NavItem[],
): { section: NavSection; items: NavItem[] }[] {
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
