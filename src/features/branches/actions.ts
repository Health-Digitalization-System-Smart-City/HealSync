"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { fail, ok, type ActionResponse } from "@/lib/actions";
import { requirePermissionResult } from "@/lib/auth/session";
import { PERMISSIONS } from "@/lib/permissions";
import { writeAudit } from "@/lib/audit";
import {
  createBranchSchema,
  setBranchActiveSchema,
  setBranchServicesSchema,
  updateBranchSchema,
} from "@/lib/validation/branches";

export interface BranchData {
  id: string;
  name: string;
  code: string | null;
  isActive: boolean;
}

const BRANCH_SELECT = {
  id: true,
  name: true,
  code: true,
  isActive: true,
} as const;

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}

// ---------------------------------------------------------------------------
// Public reads (patient feedback flow — API.md §12)
// ---------------------------------------------------------------------------

/**
 * Public action: Returns active/configured branches for patient selection (API.md §12).
 */
export async function getBranches(): Promise<ActionResponse<BranchData[]>> {
  try {
    const branches = await db.branch.findMany({
      where: {
        isActive: true,
      },
      select: BRANCH_SELECT,
      orderBy: {
        name: "asc",
      },
    });

    return ok(branches);
  } catch (error) {
    console.error("Failed to fetch branches:", error);
    return fail(
      "DATABASE_ERROR",
      "Unable to retrieve branch list. Please try again later.",
    );
  }
}

// ---------------------------------------------------------------------------
// Admin mutations (branch.create / branch.update + audit — ROADMAP 5.1)
// ---------------------------------------------------------------------------

/**
 * Creates a new clinic branch. Requires `branch.create`; writes an audit record.
 * The branch becomes visible to patients immediately (the feedback form lists
 * all active branches) once services are linked to it.
 */
export async function createBranch(
  input: unknown,
): Promise<ActionResponse<BranchData>> {
  const auth = await requirePermissionResult(PERMISSIONS.BRANCH_CREATE);
  if (!auth.success) return auth;

  const parsed = createBranchSchema.safeParse(input);
  if (!parsed.success) {
    return fail(
      "VALIDATION_ERROR",
      "Please check the branch details and try again.",
      { ...parsed.error.flatten().fieldErrors },
    );
  }

  const { name, code } = parsed.data;

  try {
    const branch = await db.branch.create({
      data: { name, code: code || null },
      select: BRANCH_SELECT,
    });

    await writeAudit({
      actorId: auth.data.user.id,
      action: "create",
      entityType: "branch",
      entityId: branch.id,
      metadata: { name, code: code || null },
    });

    revalidatePath("/dashboard/branches");
    return ok(branch);
  } catch (error) {
    console.error("Failed to create branch:", error);
    if (isUniqueConstraintError(error)) {
      return fail("CONFLICT", "A branch with this code already exists.");
    }
    return fail(
      "DATABASE_ERROR",
      "Unable to create the branch. Please try again.",
    );
  }
}

/**
 * Renames a branch (name and/or code). Requires `branch.update`; audited.
 */
export async function updateBranch(
  input: unknown,
): Promise<ActionResponse<BranchData>> {
  const auth = await requirePermissionResult(PERMISSIONS.BRANCH_UPDATE);
  if (!auth.success) return auth;

  const parsed = updateBranchSchema.safeParse(input);
  if (!parsed.success) {
    return fail(
      "VALIDATION_ERROR",
      "Please check the branch details and try again.",
      { ...parsed.error.flatten().fieldErrors },
    );
  }

  const { id, name, code } = parsed.data;

  try {
    const existing = await db.branch.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) return fail("NOT_FOUND", "Branch not found.");

    const branch = await db.branch.update({
      where: { id },
      data: { name, code: code || null },
      select: BRANCH_SELECT,
    });

    await writeAudit({
      actorId: auth.data.user.id,
      action: "update",
      entityType: "branch",
      entityId: id,
      metadata: { name, code: code || null },
    });

    revalidatePath("/dashboard/branches");
    return ok(branch);
  } catch (error) {
    console.error("Failed to update branch:", error);
    if (isUniqueConstraintError(error)) {
      return fail("CONFLICT", "A branch with this code already exists.");
    }
    return fail(
      "DATABASE_ERROR",
      "Unable to update the branch. Please try again.",
    );
  }
}

/**
 * Shuts down (or reactivates) a branch. Requires `branch.update`; audited.
 *
 * Deactivation is the safe real-world "branch closed" operation: patients no
 * longer see the branch in the feedback form, while historical feedback and
 * analytics are preserved. Services linked to the branch are kept so a later
 * reactivation restores them.
 */
export async function setBranchActive(
  input: unknown,
): Promise<ActionResponse<BranchData>> {
  const auth = await requirePermissionResult(PERMISSIONS.BRANCH_UPDATE);
  if (!auth.success) return auth;

  const parsed = setBranchActiveSchema.safeParse(input);
  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "Please check the input and try again.");
  }

  const { id, isActive } = parsed.data;

  try {
    const existing = await db.branch.findUnique({
      where: { id },
      select: { id: true, name: true, isActive: true },
    });
    if (!existing) return fail("NOT_FOUND", "Branch not found.");
    if (existing.isActive === isActive) {
      return fail(
        "CONFLICT",
        isActive
          ? "This branch is already active."
          : "This branch is already shut down.",
      );
    }

    const branch = await db.branch.update({
      where: { id },
      data: { isActive },
      select: BRANCH_SELECT,
    });

    await writeAudit({
      actorId: auth.data.user.id,
      action: isActive ? "activate" : "deactivate",
      entityType: "branch",
      entityId: id,
      metadata: { name: existing.name },
    });

    revalidatePath("/dashboard/branches");
    return ok(branch);
  } catch (error) {
    console.error("Failed to update branch status:", error);
    return fail(
      "DATABASE_ERROR",
      "Unable to update the branch status. Please try again.",
    );
  }
}

/**
 * Replaces the set of services a branch currently offers. Requires
 * `branch.update`; audited. Runs in a single transaction so the branch can
 * never be left with a half-applied offering list.
 */
export async function setBranchServices(
  input: unknown,
): Promise<ActionResponse<{ branchId: string; serviceIds: string[] }>> {
  const auth = await requirePermissionResult(PERMISSIONS.BRANCH_UPDATE);
  if (!auth.success) return auth;

  const parsed = setBranchServicesSchema.safeParse(input);
  if (!parsed.success) {
    return fail(
      "VALIDATION_ERROR",
      "Please check the selected services and try again.",
      { ...parsed.error.flatten().fieldErrors },
    );
  }

  const { branchId, serviceIds } = parsed.data;
  const uniqueIds = Array.from(new Set(serviceIds));

  try {
    const [branchExists, serviceCount] = await Promise.all([
      db.branch.findUnique({
        where: { id: branchId },
        select: { id: true },
      }),
      uniqueIds.length > 0
        ? db.service.count({ where: { id: { in: uniqueIds } } })
        : Promise.resolve(0),
    ]);
    if (!branchExists) return fail("NOT_FOUND", "Branch not found.");
    if (uniqueIds.length > 0 && serviceCount !== uniqueIds.length) {
      return fail(
        "VALIDATION_ERROR",
        "One or more selected services are invalid.",
      );
    }

    await db.$transaction([
      // Deactivate every current link, then activate the selected ones.
      db.branchService.updateMany({
        where: { branchId },
        data: { isActive: false },
      }),
      ...uniqueIds.map((serviceId) =>
        db.branchService.upsert({
          where: { branchId_serviceId: { branchId, serviceId } },
          create: { branchId, serviceId, isActive: true },
          update: { isActive: true },
        }),
      ),
    ]);

    await writeAudit({
      actorId: auth.data.user.id,
      action: "update",
      entityType: "branch",
      entityId: branchId,
      metadata: { serviceIds: uniqueIds },
    });

    revalidatePath("/dashboard/branches");
    return ok({ branchId, serviceIds: uniqueIds });
  } catch (error) {
    console.error("Failed to update branch services:", error);
    return fail(
      "DATABASE_ERROR",
      "Unable to update the branch services. Please try again.",
    );
  }
}
