// Role and permission configuration.
//
// The dashboard uses three fixed roles — Admin, Manager, and Analyst — and
// does not support custom roles (see `docs/security.md` §2). Authorization is
// enforced server-side against the permission matrix below; the frontend only
// uses these values to shape the UI.

export type UserRole = "Admin" | "Manager" | "Analyst";

// Application permission keys (`docs/security.md` §3).
export const PERMISSIONS = {
  feedbackRead: "feedback.read",
  feedbackUpdate: "feedback.update",
  feedbackDelete: "feedback.delete",
  feedbackPhone: "feedback.phone",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// Route access per role (drives the sidebar/navigation UI).
export const roleRoutes: Record<UserRole, string[]> = {
  Admin: [
    "/dashboard",
    "/dashboard/feedback",
    "/dashboard/analytics",
    "/dashboard/branches",
    "/dashboard/services",
    "/dashboard/users",
  ],

  Manager: [
    "/dashboard",
    "/dashboard/feedback",
    "/dashboard/analytics",
    "/dashboard/branches",
    "/dashboard/services",
  ],

  Analyst: ["/dashboard", "/dashboard/feedback", "/dashboard/analytics"],
};

// Permission matrix per role (`docs/security.md` §3, §8).
//
// - Admin has full feedback access including the patient phone number.
// - Manager can read feedback but phone numbers stay hidden and no mutations
//   are allowed.
// - Analyst is read-only; phone numbers stay hidden.
export const rolePermissions: Record<UserRole, Permission[]> = {
  Admin: [
    PERMISSIONS.feedbackRead,
    PERMISSIONS.feedbackUpdate,
    PERMISSIONS.feedbackDelete,
    PERMISSIONS.feedbackPhone,
  ],
  Manager: [PERMISSIONS.feedbackRead],
  Analyst: [PERMISSIONS.feedbackRead],
};

export function hasPermission(
  role: UserRole,
  permission: Permission,
): boolean {
  return rolePermissions[role].includes(permission);
}

export function isUserRole(value: unknown): value is UserRole {
  return value === "Admin" || value === "Manager" || value === "Analyst";
}
