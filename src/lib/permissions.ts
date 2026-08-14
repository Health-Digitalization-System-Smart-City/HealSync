// RBAC roles and permissions.
//
// Roles are fixed (Admin / Manager / Analyst) and cannot be created or edited
// through the dashboard. This module is the single source of truth for the
// role → permission matrix (see docs/SECURITY.md §2 and §3).
//
// IMPORTANT: This module is used server-side for authorization. The dashboard
// navigation is filtered client-side from the same matrix, but that is a UX
// convenience only — every protected route and Server Action must re-check
// the session + permission on the server.

export const ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  ANALYST: "analyst",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const PERMISSIONS = {
  ANALYTICS_READ: "analytics.read",
  FEEDBACK_READ: "feedback.read",
  FEEDBACK_UPDATE: "feedback.update",
  FEEDBACK_DELETE: "feedback.delete",
  BRANCH_READ: "branch.read",
  BRANCH_CREATE: "branch.create",
  BRANCH_UPDATE: "branch.update",
  BRANCH_DELETE: "branch.delete",
  SERVICE_READ: "service.read",
  SERVICE_CREATE: "service.create",
  SERVICE_UPDATE: "service.update",
  SERVICE_DELETE: "service.delete",
  USER_READ: "user.read",
  USER_CREATE: "user.create",
  USER_UPDATE: "user.update",
  USER_DISABLE: "user.disable",
  TASK_READ: "task.read",
  TASK_MANAGE: "task.manage",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  // Full system access.
  [ROLES.ADMIN]: [
    PERMISSIONS.ANALYTICS_READ,
    PERMISSIONS.FEEDBACK_READ,
    PERMISSIONS.FEEDBACK_UPDATE,
    PERMISSIONS.FEEDBACK_DELETE,
    PERMISSIONS.BRANCH_READ,
    PERMISSIONS.BRANCH_CREATE,
    PERMISSIONS.BRANCH_UPDATE,
    PERMISSIONS.BRANCH_DELETE,
    PERMISSIONS.SERVICE_READ,
    PERMISSIONS.SERVICE_CREATE,
    PERMISSIONS.SERVICE_UPDATE,
    PERMISSIONS.SERVICE_DELETE,
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.USER_DISABLE,
    PERMISSIONS.TASK_READ,
    PERMISSIONS.TASK_MANAGE,
  ],
  // Operational dashboard + analytics + feedback + branches + services + tasks.
  [ROLES.MANAGER]: [
    PERMISSIONS.ANALYTICS_READ,
    PERMISSIONS.FEEDBACK_READ,
    PERMISSIONS.FEEDBACK_UPDATE,
    PERMISSIONS.BRANCH_READ,
    PERMISSIONS.SERVICE_READ,
    PERMISSIONS.TASK_READ,
    PERMISSIONS.TASK_MANAGE,
  ],
  // Read-only: dashboard + analytics + aggregated feedback + tasks view.
  [ROLES.ANALYST]: [
    PERMISSIONS.ANALYTICS_READ,
    PERMISSIONS.FEEDBACK_READ,
    PERMISSIONS.TASK_READ,
  ],
};

export function isRole(value: string): value is Role {
  return Object.values(ROLES).includes(value as Role);
}

export function getPermissions(role: string): readonly Permission[] {
  if (!isRole(role)) return [];
  return ROLE_PERMISSIONS[role];
}

export function hasPermission(role: string, permission: Permission): boolean {
  return getPermissions(role).includes(permission);
}
