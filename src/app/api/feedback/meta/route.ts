import { NextResponse } from "next/server";

import { requirePermissionResult } from "@/lib/auth/session";
import { PERMISSIONS } from "@/lib/permissions";
import { apiAuthError, apiErrorResponse } from "@/lib/api/errors";
import { getFeedbackMetaFromDb } from "@/lib/feedback/db";

/**
 * Returns the branch/service filter options and rating scale (API.md §11).
 * Requires `feedback.read`.
 */
export async function GET() {
  try {
    const auth = await requirePermissionResult(PERMISSIONS.FEEDBACK_READ);
    if (!auth.success) return apiAuthError(auth);

    return NextResponse.json(await getFeedbackMetaFromDb());
  } catch (error) {
    return apiErrorResponse(error);
  }
}
