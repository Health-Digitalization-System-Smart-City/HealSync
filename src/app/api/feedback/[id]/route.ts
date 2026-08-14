import { NextRequest, NextResponse } from "next/server";
import { getServerViewer } from "@/lib/auth/access";
import { apiErrorResponse } from "@/lib/api/errors";
import {
  deleteFeedback,
  getFeedbackById,
  updateFeedback,
} from "@/lib/feedback/service";
import { feedbackStore } from "@/lib/feedback/store";
import { feedbackUpdateSchema } from "@/lib/validation/feedback";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const viewer = await getServerViewer();
    return NextResponse.json(getFeedbackById(feedbackStore, id, viewer));
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const viewer = await getServerViewer();
    const body = feedbackUpdateSchema.parse(await request.json());
    return NextResponse.json(updateFeedback(feedbackStore, id, body, viewer));
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const viewer = await getServerViewer();
    deleteFeedback(feedbackStore, id, viewer);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
