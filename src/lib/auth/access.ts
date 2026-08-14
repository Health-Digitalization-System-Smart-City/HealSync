import { cookies, headers } from "next/headers";
import { auth } from "@/lib/auth";
import { currentUser } from "@/config/user";
import { isUserRole, rolePermissions, type UserRole } from "@/config/roles";
import type { Viewer } from "@/lib/feedback/types";

export function createViewer(role: UserRole): Viewer {
  return { role, permissions: rolePermissions[role] };
}

export async function getServerViewer(): Promise<Viewer> {
  let role: UserRole = currentUser.role;

  try {
    const cookieStore = await cookies();
    const cookieRole = cookieStore.get("healsync_role")?.value;
    if (isUserRole(cookieRole)) {
      return createViewer(cookieRole);
    }

    const headerList = await headers();
    const headerRole = headerList.get("x-healsync-role");
    if (isUserRole(headerRole)) {
      return createViewer(headerRole);
    }

    const session = await auth.api.getSession({ headers: headerList });
    const sessionRole = (session?.user as { role?: unknown } | undefined)?.role;
    if (isUserRole(sessionRole)) {
      role = sessionRole;
    }
  } catch {
    // Session resolution can be unavailable early on (e.g. missing auth
    // tables). The configured dev role is the safe fallback.
  }

  return createViewer(role);
}
