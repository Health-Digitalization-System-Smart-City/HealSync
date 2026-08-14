"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { fail, ok, type ActionResponse } from "@/lib/actions";
import { requirePermission } from "@/lib/auth/permissions";
import { getRequestIp, writeAudit } from "@/lib/audit";
import {
  createUserSchema,
  disableUserSchema,
  updateUserSchema,
  FIXED_ROLE_NAMES,
} from "@/lib/validation";

export interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  roleId: string | null;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
}

export interface RoleData {
  id: string;
  name: string;
  description: string | null;
}

function isFixedRole(name: string): boolean {
  return (FIXED_ROLE_NAMES as readonly string[]).includes(name);
}

// The admin plugin types `role` as its known-role union; the fixed roles
// (Admin / Manager / Analyst) are stored as plain strings on the user model.
type AdminPluginRole =
  | "user"
  | (typeof FIXED_ROLE_NAMES)[number]
  | ("user" | (typeof FIXED_ROLE_NAMES)[number])[];

function asPluginRole(name: string): AdminPluginRole {
  return name as AdminPluginRole;
}

async function getAuthHeaders() {
  return Object.fromEntries((await headers()).entries());
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

/**
 * Lists dashboard users (API.md §14). Requires user.read.
 */
export async function getUsers(): Promise<ActionResponse<UserData[]>> {
  const authResult = await requirePermission("user.read");
  if (!authResult.success) return authResult;

  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        roleId: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return ok(users);
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return fail(
      "DATABASE_ERROR",
      "Unable to retrieve users. Please try again later.",
    );
  }
}

/**
 * Lists the fixed roles for user-provisioning forms. Requires user.read.
 */
export async function getRoles(): Promise<ActionResponse<RoleData[]>> {
  const authResult = await requirePermission("user.read");
  if (!authResult.success) return authResult;

  try {
    const roles = await db.role.findMany({
      where: { name: { in: [...FIXED_ROLE_NAMES] } },
      select: { id: true, name: true, description: true },
      orderBy: { name: "asc" },
    });

    return ok(roles);
  } catch (error) {
    console.error("Failed to fetch roles:", error);
    return fail(
      "DATABASE_ERROR",
      "Unable to retrieve roles. Please try again later.",
    );
  }
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/**
 * Creates a dashboard user (API.md §14, security.md §9).
 * Requires user.create. This is the only path for provisioning dashboard
 * users — public self-registration is disabled at the auth layer.
 */
export async function createUser(
  input: unknown,
): Promise<ActionResponse<{ id: string }>> {
  const authResult = await requirePermission("user.create");
  if (!authResult.success) return authResult;
  const actor = authResult.data.user;

  const parsed = createUserSchema.safeParse(input);
  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "Please check the form and try again.", {
      ...parsed.error.flatten().fieldErrors,
    });
  }

  // Better Auth canonicalizes email addresses to lowercase. Do the same here
  // so the audit metadata and derived fallback name match the stored user.
  const email = parsed.data.email.toLowerCase();
  const { password, roleId } = parsed.data;
  const name = parsed.data.name?.trim() || email.split("@")[0] || "User";
  let createdUserId: string | null = null;

  try {
    // roleId must reference one of the fixed roles (API.md §14).
    const role = await db.role.findUnique({ where: { id: roleId } });
    if (!role || !isFixedRole(role.name)) {
      return fail("VALIDATION_ERROR", "Please select a valid role.");
    }

    // Create the auth user server-side via the auth library's admin API —
    // bypasses disableSignUp; the caller must already be an Admin
    // (security.md §9, API.md §30).
    const created = await auth.api.createUser({
      body: { email, password, name, role: asPluginRole(role.name) },
      headers: await getAuthHeaders(),
    });
    createdUserId = created.user.id;

    // Assign the roleId and write the audit record atomically.
    await db.$transaction([
      db.user.update({
        where: { id: created.user.id },
        data: { roleId },
      }),
      db.auditLog.create({
        data: {
          userId: actor.id,
          action: "create",
          entityType: "user",
          entityId: created.user.id,
          metadata: { email, role: role.name },
          ipAddress: await getRequestIp(),
        },
      }),
    ]);

    revalidatePath("/dashboard/users");
    return ok({ id: created.user.id });
  } catch (error) {
    // Better Auth creates the user and credential before the application role
    // and audit transaction below. Remove that fresh user if the follow-up
    // transaction fails so it cannot remain as an unassigned (or privileged)
    // account. This deletion only applies to a user created by this attempt.
    if (createdUserId) {
      try {
        await db.user.delete({ where: { id: createdUserId } });
      } catch (cleanupError) {
        console.error(
          "Failed to roll back partially created user:",
          cleanupError,
        );
      }
    }

    console.error("Failed to create user:", error);
    if (
      isUniqueConstraintError(error) ||
      isBetterAuthCode(error, "USER_ALREADY_EXISTS") ||
      isBetterAuthCode(error, "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL")
    ) {
      return fail("CONFLICT", "A user with this email already exists.");
    }
    return fail(
      "INTERNAL_ERROR",
      "Unable to create the user. Please try again.",
    );
  }
}

/**
 * Updates a dashboard user (name and/or role). Requires user.update.
 * A user cannot change their own role (prevents accidental self-lockout).
 */
export async function updateUser(
  input: unknown,
): Promise<ActionResponse<{ id: string }>> {
  const authResult = await requirePermission("user.update");
  if (!authResult.success) return authResult;
  const actor = authResult.data.user;

  const parsed = updateUserSchema.safeParse(input);
  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "Please check the input and try again.", {
      ...parsed.error.flatten().fieldErrors,
    });
  }

  const { userId, name, roleId } = parsed.data;

  if (userId === actor.id && roleId) {
    return fail("FORBIDDEN", "You cannot change your own role.");
  }

  try {
    const target = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, roleId: true },
    });
    if (!target) return fail("NOT_FOUND", "User not found.");

    const metadata: Record<string, unknown> = {};

    if (roleId && roleId !== target.roleId) {
      const role = await db.role.findUnique({ where: { id: roleId } });
      if (!role || !isFixedRole(role.name)) {
        return fail("VALIDATION_ERROR", "Please select a valid role.");
      }

      // Sync the auth-lib role (used by the admin plugin) and the roleId FK.
      await auth.api.setRole({
        body: { userId, role: asPluginRole(role.name) },
        headers: await getAuthHeaders(),
      });
      await db.user.update({ where: { id: userId }, data: { roleId } });
      metadata.role = role.name;
    }

    if (name) {
      await db.user.update({ where: { id: userId }, data: { name } });
      metadata.name = name;
    }

    // Nothing actually changed — skip the no-op audit record.
    if (Object.keys(metadata).length === 0) {
      return ok({ id: userId });
    }

    await writeAudit({
      actorId: actor.id,
      action: "update",
      entityType: "user",
      entityId: userId,
      metadata,
    });

    revalidatePath("/dashboard/users");
    return ok({ id: userId });
  } catch (error) {
    console.error("Failed to update user:", error);
    return fail(
      "INTERNAL_ERROR",
      "Unable to update the user. Please try again.",
    );
  }
}

/**
 * Disables a dashboard user (API.md §14, security.md §9, database.md §17).
 * Requires user.disable. A disabled user's sessions are revoked so they can
 * no longer access protected functionality.
 */
export async function disableUser(
  input: unknown,
): Promise<ActionResponse<{ id: string }>> {
  const authResult = await requirePermission("user.disable");
  if (!authResult.success) return authResult;
  const actor = authResult.data.user;

  const parsed = disableUserSchema.safeParse(input);
  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "Please check the input and try again.");
  }

  const { userId } = parsed.data;

  if (userId === actor.id) {
    return fail("FORBIDDEN", "You cannot disable your own account.");
  }

  try {
    const target = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, isActive: true, email: true },
    });
    if (!target) return fail("NOT_FOUND", "User not found.");
    if (!target.isActive) {
      return fail("CONFLICT", "This user is already disabled.");
    }

    await db.$transaction([
      db.user.update({ where: { id: userId }, data: { isActive: false } }),
      // Revoke existing sessions so access stops immediately (security.md §9).
      db.session.deleteMany({ where: { userId } }),
      db.auditLog.create({
        data: {
          userId: actor.id,
          action: "disable",
          entityType: "user",
          entityId: userId,
          metadata: { email: target.email },
          ipAddress: await getRequestIp(),
        },
      }),
    ]);

    revalidatePath("/dashboard/users");
    return ok({ id: userId });
  } catch (error) {
    console.error("Failed to disable user:", error);
    return fail(
      "INTERNAL_ERROR",
      "Unable to disable the user. Please try again.",
    );
  }
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}

function isBetterAuthCode(error: unknown, code: string): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === code
  );
}
