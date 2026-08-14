import { NextRequest, NextResponse } from "next/server";

import { requirePermissionResult } from "@/lib/auth/session";
import { PERMISSIONS } from "@/lib/permissions";
import { apiAuthError, apiErrorResponse } from "@/lib/api/errors";
import { listFeedbackFromDb, viewerFromUser } from "@/lib/feedback/db";
import { feedbackListQuerySchema } from "@/lib/validation/feedback";

/**
 * Lists feedback records for the dashboard (API.md §11). Requires
 * `feedback.read`; phone numbers are masked for viewers without
 * `feedback.phone` (security.md §8).
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requirePermissionResult(PERMISSIONS.FEEDBACK_READ);
    if (!auth.success) return apiAuthError(auth);

    const viewer = viewerFromUser(auth.data.user, auth.data.permissions);
    const params = Object.fromEntries(request.nextUrl.searchParams);
    const query = feedbackListQuerySchema.parse(params);

    return NextResponse.json(await listFeedbackFromDb(viewer, query));
  } catch (error) {
    return apiErrorResponse(error);
  }
}
