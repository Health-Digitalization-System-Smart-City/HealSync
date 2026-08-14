import { NextRequest, NextResponse } from "next/server";

import { requirePermissionResult } from "@/lib/auth/session";
import { PERMISSIONS } from "@/lib/permissions";
import { apiAuthError, apiErrorResponse } from "@/lib/api/errors";
import {
  deleteFeedbackFromDb,
  getFeedbackByIdFromDb,
  updateFeedbackFromDb,
  viewerFromUser,
} from "@/lib/feedback/db";
import { feedbackUpdateSchema } from "@/lib/validation/feedback";

type RouteContext = { params: Promise<{ id: string }> };

/** Fetches a single feedback record. Requires `feedback.read`. */
export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const auth = await requirePermissionResult(PERMISSIONS.FEEDBACK_READ);
    if (!auth.success) return apiAuthError(auth);

    const viewer = viewerFromUser(auth.data.user, auth.data.permissions);
    return NextResponse.json(await getFeedbackByIdFromDb(viewer, id));
  } catch (error) {
    return apiErrorResponse(error);
  }
}

/** Updates rating/comment. Requires `feedback.update`; audited. */
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const auth = await requirePermissionResult(PERMISSIONS.FEEDBACK_UPDATE);
    if (!auth.success) return apiAuthError(auth);

    const viewer = viewerFromUser(auth.data.user, auth.data.permissions);
    const body = feedbackUpdateSchema.parse(await request.json());

    return NextResponse.json(
      await updateFeedbackFromDb(viewer, id, body, auth.data.user.id),
    );
  } catch (error) {
    return apiErrorResponse(error);
  }
}

/** Soft-deletes feedback. Requires `feedback.delete`; audited. */
export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const auth = await requirePermissionResult(PERMISSIONS.FEEDBACK_DELETE);
    if (!auth.success) return apiAuthError(auth);

    const viewer = viewerFromUser(auth.data.user, auth.data.permissions);
    await deleteFeedbackFromDb(viewer, id, auth.data.user.id);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
