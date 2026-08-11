"use server";

import { db } from "@/lib/db";
import { getServicesSchema } from "@/lib/validation";

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
 * Public action: Returns services available to the application (API.md §13).
 * Can optionally filter by branchId.
 */
export async function getServices(input?: {
  branchId?: string;
}): Promise<ActionResponse<ServiceData[]>> {
  try {
    const parseResult = getServicesSchema.safeParse(input ?? {});
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

    if (branchId) {
      // Find active services associated with the selected branch via BranchService join
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
    }

    // Default: Return all active services
    const services = await db.service.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        isActive: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return {
      success: true,
      data: services,
    };
  } catch (error) {
    console.error("Failed to fetch services:", error);
    return {
      success: false,
      error: {
        code: "DATABASE_ERROR",
        message: "Unable to retrieve service list. Please try again later.",
      },
    };
  }
}
