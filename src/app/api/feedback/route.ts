import { NextRequest, NextResponse } from "next/server";
import { getServerViewer } from "@/lib/auth/access";
import { apiErrorResponse } from "@/lib/api/errors";
import { listFeedback } from "@/lib/feedback/service";
import { feedbackStore } from "@/lib/feedback/store";
import { feedbackListQuerySchema } from "@/lib/validation/feedback";

export async function GET(request: NextRequest) {
  try {
    const viewer = await getServerViewer();
    const params = Object.fromEntries(request.nextUrl.searchParams);
    const query = feedbackListQuerySchema.parse(params);
    return NextResponse.json(listFeedback(feedbackStore, query, viewer));
  } catch (error) {
    return apiErrorResponse(error);
  }
}
