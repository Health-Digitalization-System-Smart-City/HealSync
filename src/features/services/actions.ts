"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { fail, ok, type ActionResponse } from "@/lib/actions";
import { requirePermissionResult } from "@/lib/auth/session";
import { PERMISSIONS } from "@/lib/permissions";
import { writeAudit } from "@/lib/audit";
import { getServiceByBranchSchema } from "@/lib/validation";
import {
  createServiceSchema,
  setServiceActiveSchema,
  updateServiceSchema,
} from "@/lib/validation/services";

export interface ServiceData {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
}

const SERVICE_SELECT = {
  id: true,
  name: true,
  description: true,
  isActive: true,
} as const;

// ---------------------------------------------------------------------------
// Public reads (patient feedback flow — API.md §13)
// ---------------------------------------------------------------------------

/**
 * Public action: Returns active services offered at the given branch
 * (API.md §13, DATABASE.md §15). Part of the agreed patient-flow contract
 * (submitFeedback / getBranches / getServiceByBranch).
 *
 * Only services linked to the branch via an active BranchService row and
 * themselves active are returned, so the client can never present an invalid
 * branch → service combination.
 */
export async function getServiceByBranch(input: {
  branchId: string;
}): Promise<ActionResponse<ServiceData[]>> {
  try {
    const parseResult = getServiceByBranchSchema.safeParse(input);
    if (!parseResult.success) {
      return fail(
        "VALIDATION_ERROR",
        "Invalid input parameters",
        parseResult.error.flatten().fieldErrors,
      );
    }

    const { branchId } = parseResult.data;

    const branchServices = await db.branchService.findMany({
      where: {
        branchId,
        isActive: true,
        service: {
          isActive: true,
        },
      },
      include: {
        service: true,
      },
      orderBy: {
        service: {
          name: "asc",
        },
      },
    });

    const services: ServiceData[] = branchServices.map((bs) => ({
      id: bs.service.id,
      name: bs.service.name,
      description: bs.service.description,
      isActive: bs.service.isActive,
    }));

    return ok(services);
  } catch (error) {
    console.error("Failed to fetch branch services:", error);
    return fail(
      "DATABASE_ERROR",
      "Unable to retrieve service list. Please try again later.",
    );
  }
}

// ---------------------------------------------------------------------------
// Admin mutations (service.create / service.update + audit — ROADMAP 5.2)
// ---------------------------------------------------------------------------

/**
 * Creates a new service. Requires `service.create`; writes an audit record.
 * A service only becomes selectable by patients after it is linked to at
 * least one active branch (see `setBranchServices`).
 */
export async function createService(
  input: unknown,
): Promise<ActionResponse<ServiceData>> {
  const auth = await requirePermissionResult(PERMISSIONS.SERVICE_CREATE);
  if (!auth.success) return auth;

  const parsed = createServiceSchema.safeParse(input);
  if (!parsed.success) {
    return fail(
      "VALIDATION_ERROR",
      "Please check the service details and try again.",
      { ...parsed.error.flatten().fieldErrors },
    );
  }

  const { name, description } = parsed.data;

  try {
    const service = await db.service.create({
      data: { name, description: description || null },
      select: SERVICE_SELECT,
    });

    await writeAudit({
      actorId: auth.data.user.id,
      action: "create",
      entityType: "service",
      entityId: service.id,
      metadata: { name },
    });

    revalidatePath("/dashboard/services");
    revalidatePath("/dashboard/branches");
    return ok(service);
  } catch (error) {
    console.error("Failed to create service:", error);
    return fail(
      "DATABASE_ERROR",
      "Unable to create the service. Please try again.",
    );
  }
}

/**
 * Updates a service's name and/or description. Requires `service.update`;
 * audited.
 */
export async function updateService(
  input: unknown,
): Promise<ActionResponse<ServiceData>> {
  const auth = await requirePermissionResult(PERMISSIONS.SERVICE_UPDATE);
  if (!auth.success) return auth;

  const parsed = updateServiceSchema.safeParse(input);
  if (!parsed.success) {
    return fail(
      "VALIDATION_ERROR",
      "Please check the service details and try again.",
      { ...parsed.error.flatten().fieldErrors },
    );
  }

  const { id, name, description } = parsed.data;

  try {
    const existing = await db.service.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) return fail("NOT_FOUND", "Service not found.");

    const service = await db.service.update({
      where: { id },
      data: { name, description: description || null },
      select: SERVICE_SELECT,
    });

    await writeAudit({
      actorId: auth.data.user.id,
      action: "update",
      entityType: "service",
      entityId: id,
      metadata: { name },
    });

    revalidatePath("/dashboard/services");
    revalidatePath("/dashboard/branches");
    return ok(service);
  } catch (error) {
    console.error("Failed to update service:", error);
    return fail(
      "DATABASE_ERROR",
      "Unable to update the service. Please try again.",
    );
  }
}

/**
 * Stops (or restarts) offering a service. Requires `service.update`; audited.
 *
 * Deactivation is the safe real-world "service no longer provided"
 * operation: patients stop seeing it in the feedback form, while historical
 * feedback is preserved. Branch links are kept so a reactivation restores
 * availability immediately.
 */
export async function setServiceActive(
  input: unknown,
): Promise<ActionResponse<ServiceData>> {
  const auth = await requirePermissionResult(PERMISSIONS.SERVICE_UPDATE);
  if (!auth.success) return auth;

  const parsed = setServiceActiveSchema.safeParse(input);
  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "Please check the input and try again.");
  }

  const { id, isActive } = parsed.data;

  try {
    const existing = await db.service.findUnique({
      where: { id },
      select: { id: true, name: true, isActive: true },
    });
    if (!existing) return fail("NOT_FOUND", "Service not found.");
    if (existing.isActive === isActive) {
      return fail(
        "CONFLICT",
        isActive
          ? "This service is already active."
          : "This service is already stopped.",
      );
    }

    const service = await db.service.update({
      where: { id },
      data: { isActive },
      select: SERVICE_SELECT,
    });

    await writeAudit({
      actorId: auth.data.user.id,
      action: isActive ? "activate" : "deactivate",
      entityType: "service",
      entityId: id,
      metadata: { name: existing.name },
    });

    revalidatePath("/dashboard/services");
    revalidatePath("/dashboard/branches");
    return ok(service);
  } catch (error) {
    console.error("Failed to update service status:", error);
    return fail(
      "DATABASE_ERROR",
      "Unable to update the service status. Please try again.",
    );
  }
}
