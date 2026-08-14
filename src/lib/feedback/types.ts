// Feedback domain types.
//
// These types are shared by the server-side domain layer (`service.ts`) and
// the API client (`src/lib/api/feedback.ts`). They describe the permission-
// aware shape of feedback data returned to the browser.

import type { Permission, UserRole } from "@/config/roles";

export type FeedbackRating =
  | "VERY_SATISFIED"
  | "SATISFIED"
  | "MOSTLY_SATISFIED"
  | "GOOD"
  | "NEUTRAL"
  | "NOT_SATISFIED"
  | "POOR"
  | "VERY_POOR";

export type FeedbackRange =
  | "all"
  | "today"
  | "yesterday"
  | "this_week"
  | "last_7_days"
  | "this_month"
  | "last_30_days"
  | "this_year"
  | "custom";

// The viewer context is resolved server-side and drives both the data that is
// returned and (via the `viewer` block) the UI capabilities rendered.
export type Viewer = {
  role: UserRole;
  permissions: Permission[];
};

// A feedback record as stored by the domain layer. The raw phone number is
// sensitive and must never leave the server for viewers without
// `feedback.phone` (see `service.ts`).
export type FeedbackRecord = {
  id: string;
  phoneNumber: string;
  branchId: string;
  branchName: string;
  serviceId: string;
  serviceName: string;
  rating: FeedbackRating;
  comment: string | null;
  createdAt: string;
  deletedAt: string | null;
};

// The permission-scoped shape returned to the browser. `phoneNumber` is only
// present when the viewer has `feedback.phone`; otherwise it is masked.
export type FeedbackView = {
  id: string;
  phoneNumber?: string;
  branchId: string;
  branchName: string;
  serviceId: string;
  serviceName: string;
  rating: FeedbackRating;
  ratingLabel: string;
  ratingScore: number;
  comment: string | null;
  createdAt: string;
};

export type FeedbackSummary = {
  total: number;
  positive: number;
  neutral: number;
  needsAttention: number;
};

export type FeedbackListResult = {
  items: FeedbackView[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  summary: FeedbackSummary;
  viewer: ViewerCapabilities;
};

export type ViewerCapabilities = {
  role: UserRole;
  canSeePhone: boolean;
  canUpdate: boolean;
  canDelete: boolean;
};

export type FeedbackQuery = {
  search?: string;
  branchId?: string;
  serviceId?: string;
  rating?: FeedbackRating;
  range?: FeedbackRange;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
};

export type UpdateFeedbackInput = {
  rating?: FeedbackRating;
  comment?: string | null;
};

export type BranchOption = { id: string; name: string };

export type ServiceOption = { id: string; name: string };

export type RatingOption = {
  value: FeedbackRating;
  label: string;
  score: number;
};

export type FeedbackMeta = {
  branches: BranchOption[];
  services: ServiceOption[];
  ratings: RatingOption[];
};
