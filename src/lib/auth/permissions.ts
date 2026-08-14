// RBAC permissions (API.md §7–§8, security.md §3, database.md §5).
//
// Permissions follow the `resource.action` convention and mirror the exact
// set seeded in prisma/seed.ts (18 permissions). The role → permission matrix
// lives in the seed and is not editable through the dashboard; this module is
// the type-safe constant source of truth used by Server Actions.
import { db } from "@/lib/db";

import {
  forbidden,
  requireUser,
  type AuthResult,
  type AuthUser,
} from "@/lib/auth/session";

/** All 18 permissions (API.md §8) — kept in sync with prisma/seed.ts. */
export const ALL_PERMISSIONS = [
  "analytics.read",
  "analytics.ai",
  "feedback.read",
  "feedback.update",
  "feedback.delete",
  "branch.read",
  "branch.create",
  "branch.update",
  "branch.delete",
  "service.read",
  "service.create",
  "service.update",
  "service.delete",
  "user.read",
  "user.create",
  "user.update",
  "user.disable",
] as const;

/** Union of every permission name, e.g. "feedback.read" | "user.disable". */
export type PermissionName = (typeof ALL_PERMISSIONS)[number];

/**
 * Pure permission check — unit-testable without a database.
 * The permission set is resolved server-side (never from the client).
 */
export function isPermissionGranted(
  granted: readonly string[],
  required: string,
): boolean {
  return granted.includes(required);
}

/**
 * Resolves the user's permission names from the database:
 * user.roleId → Role → RolePermission → Permission.name (database.md §5).
 * A user without an assigned role has no permissions.
 */
export async function getUserPermissionNames(
  userId: string,
): Promise<string[]> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      assignedRole: {
        select: {
          rolePermissions: {
            select: { permission: { select: { name: true } } },
          },
        },
      },
    },
  });

  if (!user?.assignedRole) return [];
  return user.assignedRole.rolePermissions.map((rp) => rp.permission.name);
}

/**
 * Authorizes the current caller for a specific permission (security.md §10).
 *
 * Returns the authenticated user plus their resolved permission set, or
 * UNAUTHENTICATED / FORBIDDEN results that Server Actions can return directly.
 */
export async function requirePermission(
  permission: PermissionName,
): Promise<AuthResult<{ user: AuthUser; permissions: string[] }>> {
  const authResult = await requireUser();
  if (!authResult.success) return authResult;

  const permissions = await getUserPermissionNames(authResult.data.id);
  if (!isPermissionGranted(permissions, permission)) return forbidden();

  return { success: true, data: { user: authResult.data, permissions } };
}

/**
 * Convenience check for UI-level decisions (hiding nav links, etc.).
 * This is never a security boundary — Server Actions still call
 * requirePermission() (PRD.md BR-008).
 */
export async function can(
  userId: string,
  permission: PermissionName,
): Promise<boolean> {
  const permissions = await getUserPermissionNames(userId);
  return isPermissionGranted(permissions, permission);
}
