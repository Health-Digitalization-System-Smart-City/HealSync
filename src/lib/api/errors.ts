// Shared error handling for API route handlers.
//
// Internal details are never returned to the client (`docs/security.md` §22);
// they belong in server logs.

import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { FeedbackError } from "@/lib/feedback/errors";

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
