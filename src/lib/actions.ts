// Shared Server Action result type (API.md §9 — Standard Result Format).
//
// Server Actions return a predictable discriminated result and never surface
// raw database/framework errors to the client (API.md §9–§10, security.md §22).
export type ActionErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "DATABASE_ERROR"
  | "AI_ERROR"
  | "INTERNAL_ERROR";

export interface ActionError {
  code: ActionErrorCode;
  message: string;
  fieldErrors?: Record<string, string[]>;
}

export type ActionResponse<T> =
  { success: true; data: T } | { success: false; error: ActionError };

export function ok<T>(data: T): ActionResponse<T> {
  return { success: true, data };
}

export function fail<T = never>(
  code: ActionErrorCode,
  message: string,
  fieldErrors?: Record<string, string[]>,
): ActionResponse<T> {
  return {
    success: false,
    error: { code, message, ...(fieldErrors ? { fieldErrors } : {}) },
  };
}
