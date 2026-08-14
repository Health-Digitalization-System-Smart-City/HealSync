"use server";

import { db } from "@/lib/db";
import { getServiceByBranchSchema } from "@/lib/validation";

export interface ServiceData {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
}

export type ActionResponse<T> =
  | { success: true; data: T }
  | {
      success: false;
      error: {
        code: string;
        message: string;
        fieldErrors?: Record<string, string[]>;
      };
    };

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
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid input parameters",
          fieldErrors: parseResult.error.flatten().fieldErrors,
        },
      };
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

    return {
      success: true,
      data: services,
    };
  } catch (error) {
    console.error("Failed to fetch branch services:", error);
    return {
      success: false,
      error: {
        code: "DATABASE_ERROR",
        message: "Unable to retrieve service list. Please try again later.",
      },
    };
  }
}
