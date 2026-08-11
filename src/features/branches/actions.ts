"use server";

import { db } from "@/lib/db";

export interface BranchData {
  id: string;
  name: string;
  code: string | null;
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
 * Public action: Returns active/configured branches for patient selection (API.md §12).
 */
export async function getBranches(): Promise<ActionResponse<BranchData[]>> {
  try {
    const branches = await db.branch.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        code: true,
        isActive: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return {
      success: true,
      data: branches,
    };
  } catch (error) {
    console.error("Failed to fetch branches:", error);
    return {
      success: false,
      error: {
        code: "DATABASE_ERROR",
        message: "Unable to retrieve branch list. Please try again later.",
      },
    };
  }
}
