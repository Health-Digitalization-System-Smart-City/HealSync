import { describe, expect, it } from "vitest";

import {
  ROLES,
  PERMISSIONS,
  isRole,
  getPermissions,
  hasPermission,
} from "@/lib/permissions";
import { getNavItems, NAV_ITEMS } from "@/components/dashboard/nav-config";

describe("RBAC Permissions & Navigation UX", () => {
  describe("isRole()", () => {
    it("recognizes valid system roles", () => {
      expect(isRole(ROLES.ADMIN)).toBe(true);
      expect(isRole(ROLES.MANAGER)).toBe(true);
      expect(isRole(ROLES.ANALYST)).toBe(true);
    });

    it("rejects unknown or invalid roles", () => {
      expect(isRole("superadmin")).toBe(false);
      expect(isRole("guest")).toBe(false);
      expect(isRole("")).toBe(false);
    });
  });

  describe("getPermissions() & hasPermission()", () => {
    it("gives Admin role full system permissions including user management and branch creation", () => {
      expect(hasPermission(ROLES.ADMIN, PERMISSIONS.ANALYTICS_READ)).toBe(true);
      expect(hasPermission(ROLES.ADMIN, PERMISSIONS.FEEDBACK_READ)).toBe(true);
      expect(hasPermission(ROLES.ADMIN, PERMISSIONS.FEEDBACK_DELETE)).toBe(true);
      expect(hasPermission(ROLES.ADMIN, PERMISSIONS.BRANCH_CREATE)).toBe(true);
      expect(hasPermission(ROLES.ADMIN, PERMISSIONS.SERVICE_CREATE)).toBe(true);
      expect(hasPermission(ROLES.ADMIN, PERMISSIONS.USER_READ)).toBe(true);
      expect(hasPermission(ROLES.ADMIN, PERMISSIONS.USER_CREATE)).toBe(true);
      expect(hasPermission(ROLES.ADMIN, PERMISSIONS.TASK_READ)).toBe(true);
      expect(hasPermission(ROLES.ADMIN, PERMISSIONS.TASK_MANAGE)).toBe(true);
    });

    it("gives Manager operational permissions (branches, services, tasks, feedback) but denies user management", () => {
      expect(hasPermission(ROLES.MANAGER, PERMISSIONS.ANALYTICS_READ)).toBe(true);
      expect(hasPermission(ROLES.MANAGER, PERMISSIONS.FEEDBACK_READ)).toBe(true);
      expect(hasPermission(ROLES.MANAGER, PERMISSIONS.FEEDBACK_UPDATE)).toBe(true);
      expect(hasPermission(ROLES.MANAGER, PERMISSIONS.BRANCH_READ)).toBe(true);
      expect(hasPermission(ROLES.MANAGER, PERMISSIONS.SERVICE_READ)).toBe(true);
      expect(hasPermission(ROLES.MANAGER, PERMISSIONS.TASK_READ)).toBe(true);
      expect(hasPermission(ROLES.MANAGER, PERMISSIONS.TASK_MANAGE)).toBe(true);

      // Denied user management and permanent deletion
      expect(hasPermission(ROLES.MANAGER, PERMISSIONS.USER_READ)).toBe(false);
      expect(hasPermission(ROLES.MANAGER, PERMISSIONS.USER_CREATE)).toBe(false);
      expect(hasPermission(ROLES.MANAGER, PERMISSIONS.FEEDBACK_DELETE)).toBe(false);
    });

    it("gives Analyst read-only access to analytics, feedback, and tasks", () => {
      expect(hasPermission(ROLES.ANALYST, PERMISSIONS.ANALYTICS_READ)).toBe(true);
      expect(hasPermission(ROLES.ANALYST, PERMISSIONS.FEEDBACK_READ)).toBe(true);
      expect(hasPermission(ROLES.ANALYST, PERMISSIONS.TASK_READ)).toBe(true);

      // Denied write & management permissions
      expect(hasPermission(ROLES.ANALYST, PERMISSIONS.FEEDBACK_UPDATE)).toBe(false);
      expect(hasPermission(ROLES.ANALYST, PERMISSIONS.FEEDBACK_DELETE)).toBe(false);
      expect(hasPermission(ROLES.ANALYST, PERMISSIONS.BRANCH_READ)).toBe(false);
      expect(hasPermission(ROLES.ANALYST, PERMISSIONS.SERVICE_READ)).toBe(false);
      expect(hasPermission(ROLES.ANALYST, PERMISSIONS.USER_READ)).toBe(false);
      expect(hasPermission(ROLES.ANALYST, PERMISSIONS.TASK_MANAGE)).toBe(false);
    });
  });

  describe("getNavItems(role) - Client Navigation Filtering", () => {
    it("returns all navigation items for Admin", () => {
      const nav = getNavItems(ROLES.ADMIN);
      const titles = nav.map((item) => item.title);

      expect(titles).toContain("Dashboard");
      expect(titles).toContain("Tasks");
      expect(titles).toContain("Feedback");
      expect(titles).toContain("Analytics");
      expect(titles).toContain("Branches");
      expect(titles).toContain("Services");
      expect(titles).toContain("Users");
      expect(titles).toContain("Profile & Security");
    });

    it("returns operational navigation items for Manager (excluding Users)", () => {
      const nav = getNavItems(ROLES.MANAGER);
      const titles = nav.map((item) => item.title);

      expect(titles).toContain("Dashboard");
      expect(titles).toContain("Tasks");
      expect(titles).toContain("Feedback");
      expect(titles).toContain("Analytics");
      expect(titles).toContain("Branches");
      expect(titles).toContain("Services");
      expect(titles).toContain("Profile & Security");

      // Users is hidden for Manager
      expect(titles).not.toContain("Users");
    });

    it("returns read-only navigation items for Analyst (excluding Branches, Services, and Users)", () => {
      const nav = getNavItems(ROLES.ANALYST);
      const titles = nav.map((item) => item.title);

      expect(titles).toContain("Dashboard");
      expect(titles).toContain("Tasks");
      expect(titles).toContain("Feedback");
      expect(titles).toContain("Analytics");
      expect(titles).toContain("Profile & Security");

      // Management routes are hidden for Analyst
      expect(titles).not.toContain("Branches");
      expect(titles).not.toContain("Services");
      expect(titles).not.toContain("Users");
    });
  });
});
