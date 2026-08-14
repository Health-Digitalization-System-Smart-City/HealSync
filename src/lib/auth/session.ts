// Server-side session + authorization helpers for the dashboard.
//
// These helpers are used by server components, layouts, and Server Actions.
// They are never imported from client components.
import { cache } from "react";
import { headers } from "next/headers";
import { forbidden, redirect } from "next/navigation";

import { auth } from "@/lib/auth";
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
    forbidden();
  }

  return session;
}
