import { NextRequest, NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api/errors";
import { computeAnalyticsDashboard } from "@/lib/analytics/service";
import { feedbackStore } from "@/lib/feedback/store";
import { analyticsQuerySchema } from "@/lib/validation/analytics";

export async function GET(request: NextRequest) {
  try {
    const params = Object.fromEntries(request.nextUrl.searchParams);
    const query = analyticsQuerySchema.parse(params);
    const data = computeAnalyticsDashboard(feedbackStore, query);
    return NextResponse.json(data);
  } catch (error) {
    return apiErrorResponse(error);
  }
}
