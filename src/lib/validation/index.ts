// Validation schemas.
//
// This directory is the single location for Zod schemas. All schemas that
// validate external input (API request bodies, query parameters, form data)
// live here, organized by feature:
//
//   src/lib/validation/
//     feedback.ts    # patient feedback schemas (future)
//     auth.ts        # auth-related schemas (future)
//     ...
//
// Conventions:
// - Validate every piece of external input at the boundary.
// - Export schema + inferred type pairs, e.g.:
//     export const feedbackSchema = z.object({ ... });
//     export type FeedbackInput = z.infer<typeof feedbackSchema>;
// - No product schemas exist yet in Phase 1 — this module only establishes
//   the location and conventions.
export {};
