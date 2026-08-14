// Shared error handling for API route handlers.
//
// Internal details are never returned to the client (`docs/security.md` §22);
// they belong in server logs.

import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { FeedbackError } from "@/lib/feedback/errors";
import type { AuthResult } from "@/lib/auth/session";

/**
 * Maps an `AuthResult` failure (from requirePermissionResult / requireUser)
 * to a 401 Unauthenticated / 403 Forbidden JSON response.
 */
export function apiAuthError(
  result: Extract<AuthResult<unknown>, { success: false }>,
): NextResponse {
  const status = result.error.code === "UNAUTHENTICATED" ? 401 : 403;
  return NextResponse.json({ error: result.error }, { status });
}

export function apiErrorResponse(error: unknown): NextResponse {
  if (error instanceof FeedbackError) {
    return NextResponse.json(
      { error: { code: error.code, message: error.message } },
      { status: error.status },
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid request. Check the submitted values and try again.",
        },
      },
      { status: 400 },
    );
  }

  console.error("[api] unhandled error", error);
  return NextResponse.json(
    {
      error: {
        code: "INTERNAL_ERROR",
        message: "Something went wrong. Please try again.",
      },
    },
    { status: 500 },
  );
}
