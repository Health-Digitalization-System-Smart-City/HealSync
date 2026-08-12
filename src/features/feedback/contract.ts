/**
 * Patient-feedback flow contract — the agreed integration boundary between the
 * flow integration layer and the UX/responsive layer.
 *
 * Both sides MUST keep working from these signatures:
 *
 *   getBranches():          Promise<ActionResponse<BranchData[]>>
 *   getServiceByBranch({ branchId }):
 *                           Promise<ActionResponse<ServiceData[]>>
 *   submitFeedback(input):  Promise<ActionResponse<SubmitFeedbackResult>>
 *
 * Note: server actions must be imported DIRECTLY from their feature modules by
 * consumers; do not re-export them through this module (Next.js requires a
 * direct import path to serialize a server action).
 */

export type { BranchData } from "@/features/branches/actions";
export type { ServiceData } from "@/features/services/actions";
export type {
  SubmitFeedbackResult,
  ActionResponse,
} from "@/features/feedback/actions";
export type {
  FeedbackRating,
  SubmitFeedbackInput,
} from "@/lib/validation";
