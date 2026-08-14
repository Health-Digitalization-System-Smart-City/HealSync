// Server-side session + authorization helpers for the dashboard.
//
// These helpers are used by server components, layouts, and Server Actions.
// They are never imported from client components.
import { cache } from "react";
import { headers } from "next/headers";
import { forbidden as nextForbidden, redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { hasPermission, ROLES, type Permission } from "@/lib/permissions";

/**
 * Resolves the current session on the server. Cached per-request so multiple
 * calls within the same render share one round-trip. Returns `null` when the
 * user is not authenticated.
 */
export const getSession = cache(async () => {
  return await auth.api.getSession({
    headers: await headers(),
  });
});

/**
 * Requires an authenticated session, otherwise redirects to the login page.
 * Returns the session for use in protected layouts/pages.
 */
export async function requireAuth() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

/**
 * Requires an authenticated session with the given permission, otherwise
 * redirects to /login (unauthenticated) or renders the forbidden page
 * (authenticated but not authorized).
 */
export async function requirePermission(permission: Permission) {
  const session = await requireAuth();

  if (!hasPermission(session.user.role ?? ROLES.ANALYST, permission)) {
    nextForbidden();
  }

  return session;
}

/** The authenticated dashboard user as stored in the database. */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  roleId: string | null;
  isActive: boolean;
  image: string | null;
  createdAt: Date;
  lastLoginAt: Date | null;
}

export type AuthErrorCode = "UNAUTHENTICATED" | "FORBIDDEN";

/** Standard result shape shared by the auth helpers (API.md §9). */
export type AuthResult<T> =
  | { success: true; data: T }
  | { success: false; error: { code: AuthErrorCode; message: string } };

export function unauthenticated(
  message = "You must be signed in to access this resource.",
): AuthResult<never> {
  return { success: false, error: { code: "UNAUTHENTICATED", message } };
}

export function forbidden(
  message = "You do not have permission to perform this action.",
): AuthResult<never> {
  return { success: false, error: { code: "FORBIDDEN", message } };
}

/**
 * Requires an authenticated, active dashboard user.
 *
 * Returns the database user (the authoritative record — never client claims)
 * or an UNAUTHENTICATED result.
 */
export async function requireUser(): Promise<AuthResult<AuthUser>> {
  const session = await getSession();
  if (!session?.user) return unauthenticated();

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      roleId: true,
      isActive: true,
      image: true,
      createdAt: true,
      lastLoginAt: true,
    },
  });

  if (!user) return unauthenticated();
  if (!user.isActive) {
    return unauthenticated(
      "Your account has been disabled. Please contact an administrator.",
    );
  }

  return { success: true, data: user };
}
