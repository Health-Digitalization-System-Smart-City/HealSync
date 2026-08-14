import { NextRequest, NextResponse } from "next/server";

import { requirePermissionResult } from "@/lib/auth/session";
import { PERMISSIONS } from "@/lib/permissions";
import { apiAuthError, apiErrorResponse } from "@/lib/api/errors";
import { computeAnalyticsDashboardFromDb } from "@/lib/analytics/db";
import { analyticsQuerySchema } from "@/lib/validation/analytics";

/**
 * Computes the analytics dashboard from real feedback data (API.md §15).
 * Requires `analytics.read`; aggregation happens server-side (API.md §19).
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requirePermissionResult(PERMISSIONS.ANALYTICS_READ);
    if (!auth.success) return apiAuthError(auth);

    const params = Object.fromEntries(request.nextUrl.searchParams);
    const query = analyticsQuerySchema.parse(params);

    return NextResponse.json(await computeAnalyticsDashboardFromDb(query));
  } catch (error) {
    return apiErrorResponse(error);
  }
}
