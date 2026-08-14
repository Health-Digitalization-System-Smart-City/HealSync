// Feedback domain service.
//
// This is the permission-aware business layer between the API routes and the
// data store (`docs/API.md` §11, `docs/security.md` §8, §17).
//
// Key rules enforced here:
// - Only viewers with `feedback.phone` receive the raw phone number; everyone
//   else gets a masked value. The raw number never leaves this layer for
//   unauthorized viewers.
// - `feedback.update` and `feedback.delete` are required for mutations.
// - Soft deletion is used for feedback (retention policy, `docs/database.md`
//   §17).

import { PERMISSIONS, type Permission } from "@/lib/permissions";
import { forbidden, notFound } from "./errors";
import {
  RATING_OPTIONS,
  getRatingLabel,
  getRatingScore,
  isNeedsAttentionRating,
  isNeutralRating,
  isPositiveRating,
} from "./ratings";
import { resolveDateRange } from "./ranges";
import type { FeedbackStore } from "./store";
import type {
  FeedbackListResult,
  FeedbackMeta,
  FeedbackQuery,
  FeedbackRecord,
  FeedbackSummary,
  FeedbackView,
  UpdateFeedbackInput,
  Viewer,
  ViewerCapabilities,
} from "./types";

export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

export function viewerCapabilities(viewer: Viewer): ViewerCapabilities {
  const permissions = new Set(viewer.permissions);
  return {
    role: viewer.role,
    canSeePhone: permissions.has(PERMISSIONS.FEEDBACK_PHONE),
    canUpdate: permissions.has(PERMISSIONS.FEEDBACK_UPDATE),
    canDelete: permissions.has(PERMISSIONS.FEEDBACK_DELETE),
  };
}

function assertPermission(viewer: Viewer, permission: Permission): void {
  if (!viewer.permissions.includes(permission)) {
    throw forbidden();
  }
}

export function maskPhone(phoneNumber: string): string {
  const digits = phoneNumber.replace(/\D/g, "");
  if (digits.length === 0) return "••••";
  return `•••• ${digits.slice(-4)}`;
}

export function shapeFeedback(
  record: FeedbackRecord,
  viewer: Viewer,
): FeedbackView {
  const capabilities = viewerCapabilities(viewer);
  return {
    id: record.id,
    phoneNumber: capabilities.canSeePhone
      ? record.phoneNumber
      : maskPhone(record.phoneNumber),
    branchId: record.branchId,
    branchName: record.branchName,
    serviceId: record.serviceId,
    serviceName: record.serviceName,
    rating: record.rating,
    ratingLabel: getRatingLabel(record.rating),
    ratingScore: getRatingScore(record.rating),
    comment: record.comment,
    createdAt: record.createdAt,
  };
}

export function computeSummary(records: FeedbackRecord[]): FeedbackSummary {
  let positive = 0;
  let neutral = 0;
  let needsAttention = 0;

  for (const record of records) {
    if (isPositiveRating(record.rating)) positive += 1;
    else if (isNeutralRating(record.rating)) neutral += 1;
    else if (isNeedsAttentionRating(record.rating)) needsAttention += 1;
  }

  return {
    total: records.length,
    positive,
    neutral,
    needsAttention,
  };
}

export function listFeedback(
  store: FeedbackStore,
  query: FeedbackQuery,
  viewer: Viewer,
): FeedbackListResult {
  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, query.pageSize ?? DEFAULT_PAGE_SIZE),
  );

  const range = resolveDateRange(query.range, query.startDate, query.endDate);

  let records = store.records.filter((record) => record.deletedAt === null);

  if (query.search) {
    const term = query.search.trim().toLowerCase();
    const canSearchPhone = viewerCapabilities(viewer).canSeePhone;
    records = records.filter((record) => {
      if (record.id.toLowerCase().includes(term)) return true;
      if (record.branchName.toLowerCase().includes(term)) return true;
      if (record.serviceName.toLowerCase().includes(term)) return true;
      if (record.comment && record.comment.toLowerCase().includes(term))
        return true;
      if (canSearchPhone && record.phoneNumber.toLowerCase().includes(term))
        return true;
      return false;
    });
  }
  if (query.branchId) {
    records = records.filter((record) => record.branchId === query.branchId);
  }
  if (query.serviceId) {
    records = records.filter((record) => record.serviceId === query.serviceId);
  }
  if (query.rating) {
    records = records.filter((record) => record.rating === query.rating);
  }
  if (range) {
    const start = range.start.getTime();
    const end = range.end.getTime();
    records = records.filter((record) => {
      const time = new Date(record.createdAt).getTime();
      return time >= start && time <= end;
    });
  }

  records.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const total = records.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;

  const items = records
    .slice(start, start + pageSize)
    .map((record) => shapeFeedback(record, viewer));

  return {
    items,
    total,
    page: safePage,
    pageSize,
    totalPages,
    summary: computeSummary(records),
    viewer: viewerCapabilities(viewer),
  };
}

export function getFeedbackById(
  store: FeedbackStore,
  id: string,
  viewer: Viewer,
): FeedbackView {
  const record = store.records.find(
    (item) => item.id === id && item.deletedAt === null,
  );
  if (!record) throw notFound();
  return shapeFeedback(record, viewer);
}

export function updateFeedback(
  store: FeedbackStore,
  id: string,
  input: UpdateFeedbackInput,
  viewer: Viewer,
): FeedbackView {
  assertPermission(viewer, PERMISSIONS.FEEDBACK_UPDATE);

  const patch: { rating?: FeedbackRecord["rating"]; comment?: string | null } =
    {};
  if (input.rating !== undefined) patch.rating = input.rating;
  if (input.comment !== undefined) patch.comment = input.comment;

  const record = store.update(id, patch);
  if (!record) throw notFound();

  return shapeFeedback(record, viewer);
}

export function deleteFeedback(
  store: FeedbackStore,
  id: string,
  viewer: Viewer,
): { id: string } {
  assertPermission(viewer, PERMISSIONS.FEEDBACK_DELETE);

  const record = store.softDelete(id);
  if (!record) throw notFound();

  return { id: record.id };
}

export function getFeedbackMeta(store: FeedbackStore): FeedbackMeta {
  return {
    branches: store.branches,
    services: store.services,
    ratings: RATING_OPTIONS,
  };
}
