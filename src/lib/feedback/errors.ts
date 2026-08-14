// Application-level errors for the feedback domain.
//
// The API layer converts these into the standard error envelope used by the
// dashboard (`docs/API.md` §9, §10). Internal details are never leaked to the
// client.

export type FeedbackErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "INTERNAL_ERROR";

export class FeedbackError extends Error {
  readonly status: number;
  readonly code: FeedbackErrorCode;

  constructor(status: number, code: FeedbackErrorCode, message: string) {
    super(message);
    this.name = "FeedbackError";
    this.status = status;
    this.code = code;
  }
}

export function notFound(message = "Feedback not found."): FeedbackError {
  return new FeedbackError(404, "NOT_FOUND", message);
}

export function forbidden(
  message = "You do not have permission to perform this action.",
): FeedbackError {
  return new FeedbackError(403, "FORBIDDEN", message);
}

export function validationError(message: string): FeedbackError {
  return new FeedbackError(400, "VALIDATION_ERROR", message);
}
