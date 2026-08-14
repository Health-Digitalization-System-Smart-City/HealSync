// Prisma-backed feedback repository — the production data access layer for the
// dashboard feedback management UI.
//
// `service.ts` implements the pure domain rules (phone masking, capability
// gating, rating buckets) on top of the in-memory store used by unit tests.
// This module implements the same contract against PostgreSQL: filters and
// pagination are translated to Prisma where-clauses so the work happens on the
// server (API.md §19), while the shared shaping/capability helpers are reused
// from `service.ts` (single definition, no duplication).
//
// Every function is permission-aware: the caller resolves a `Viewer` from the
// authenticated session (see `viewerFromUser`) and raw phone numbers only
// leave this layer for viewers with `feedback.phone`.

import { db } from "@/lib/db";
import { writeAudit } from "@/lib/audit";
import {
  PERMISSIONS,
  ROLES,
  isRole,
  type Permission,
  type Role,
} from "@/lib/permissions";
import { forbidden, notFound } from "./errors";
import { resolveDateRange } from "./ranges";
import {
  isNeutralRating,
  isPositiveRating,
  RATING_OPTIONS,
} from "./ratings";
import {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  shapeFeedback,
  viewerCapabilities,
} from "./service";
import type { Prisma } from "@/generated/prisma/client";
import type {
  FeedbackListResult,
  FeedbackMeta,
  FeedbackQuery,
  FeedbackRating,
  FeedbackRecord,
  FeedbackSummary,
  FeedbackView,
  UpdateFeedbackInput,
  Viewer,
} from "./types";

// ---------------------------------------------------------------------------
// Row mapping (Prisma row → domain FeedbackRecord)
// ---------------------------------------------------------------------------

const FEEDBACK_SELECT = {
  id: true,
  phoneNumber: true,
  branchId: true,
  serviceId: true,
  rating: true,
  comment: true,
  createdAt: true,
  deletedAt: true,
  branch: { select: { name: true } },
  service: { select: { name: true } },
} as const;

type FeedbackRow = {
  id: string;
  phoneNumber: string;
  branchId: string;
  serviceId: string;
  rating: FeedbackRating;
  comment: string | null;
  createdAt: Date;
  deletedAt: Date | null;
  branch: { name: string } | null;
  service: { name: string } | null;
};

function toRecord(row: FeedbackRow): FeedbackRecord {
  return {
    id: row.id,
    phoneNumber: row.phoneNumber,
    branchId: row.branchId,
    branchName: row.branch?.name ?? "Unknown branch",
    serviceId: row.serviceId,
    serviceName: row.service?.name ?? "Unknown service",
    rating: row.rating,
    comment: row.comment,
    createdAt: row.createdAt.toISOString(),
    deletedAt: row.deletedAt?.toISOString() ?? null,
  };
}

/** Builds a `Viewer` from an authenticated user (role validated, Analyst fallback). */
export function viewerFromUser(
  user: { role: string },
  permissions: readonly Permission[],
): Viewer {
  const role: Role = isRole(user.role) ? user.role : ROLES.ANALYST;
  return { role, permissions: [...permissions] };
}

function assertPermission(viewer: Viewer, permission: Permission): void {
  if (!viewer.permissions.includes(permission)) {
    throw forbidden();
  }
}

// ---------------------------------------------------------------------------
// Query building
// ---------------------------------------------------------------------------

function searchClause(
  term: string,
  viewer: Viewer,
): Prisma.FeedbackWhereInput[] {
  const like = { contains: term, mode: "insensitive" as const };
  const clauses: Prisma.FeedbackWhereInput[] = [
    { comment: like },
    { branch: { is: { name: like } } },
    { service: { is: { name: like } } },
  ];
  // Only viewers allowed to see phone numbers can search by them (security.md
  // §8, §13) — matching the in-memory service behavior.
  if (viewerCapabilities(viewer).canSeePhone) {
    clauses.push({ phoneNumber: like });
  }
  return clauses;
}

function feedbackWhere(
  query: FeedbackQuery,
  viewer: Viewer,
): Prisma.FeedbackWhereInput {
  const range = resolveDateRange(query.range, query.startDate, query.endDate);
  const where: Prisma.FeedbackWhereInput = { deletedAt: null };

  if (query.search) {
    where.OR = searchClause(query.search.trim().toLowerCase(), viewer);
  }
  if (query.branchId) where.branchId = query.branchId;
  if (query.serviceId) where.serviceId = query.serviceId;
  if (query.rating) where.rating = query.rating;
  if (range) where.createdAt = { gte: range.start, lte: range.end };

  return where;
}

/** Aggregates the positive / neutral / needs-attention buckets in one query. */
async function countSummary(
  where: Prisma.FeedbackWhereInput,
): Promise<FeedbackSummary> {
  const grouped = await db.feedback.groupBy({
    by: ["rating"],
    where,
    _count: { _all: true },
  });

  let total = 0;
  let positive = 0;
  let neutral = 0;
  let needsAttention = 0;

  for (const group of grouped) {
    const count = group._count._all;
    total += count;
    if (isPositiveRating(group.rating)) positive += count;
    else if (isNeutralRating(group.rating)) neutral += count;
    else needsAttention += count;
  }

  return { total, positive, neutral, needsAttention };
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

/** Lists feedback with server-side filters, pagination, and phone masking. */
export async function listFeedbackFromDb(
  viewer: Viewer,
  query: FeedbackQuery,
): Promise<FeedbackListResult> {
  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, query.pageSize ?? DEFAULT_PAGE_SIZE),
  );
  const where = feedbackWhere(query, viewer);

  const [summary, rows] = await Promise.all([
    countSummary(where),
    db.feedback.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: FEEDBACK_SELECT,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(summary.total / pageSize));
  const safePage = Math.min(page, totalPages);
  const items = rows.map((row) => shapeFeedback(toRecord(row), viewer));

  return {
    items,
    total: summary.total,
    page: safePage,
    pageSize,
    totalPages,
    summary,
    viewer: viewerCapabilities(viewer),
  };
}

/** Fetches a single feedback record (masked per viewer capabilities). */
export async function getFeedbackByIdFromDb(
  viewer: Viewer,
  id: string,
): Promise<FeedbackView> {
  const row = await db.feedback.findUnique({
    where: { id },
    select: FEEDBACK_SELECT,
  });
  if (!row || row.deletedAt) throw notFound();
  return shapeFeedback(toRecord(row), viewer);
}

/** The most recent feedback entries (dashboard overview feed). */
export async function listRecentFeedbackFromDb(
  viewer: Viewer,
  limit = 5,
): Promise<FeedbackView[]> {
  const rows = await db.feedback.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: FEEDBACK_SELECT,
  });
  return rows.map((row) => shapeFeedback(toRecord(row), viewer));
}

/** Branch/service options + rating scale for filter dropdowns. */
export async function getFeedbackMetaFromDb(): Promise<FeedbackMeta> {
  const [branches, services] = await Promise.all([
    db.branch.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    db.service.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return { branches, services, ratings: RATING_OPTIONS };
}

// ---------------------------------------------------------------------------
// Mutations (permission-gated + audited)
// ---------------------------------------------------------------------------

/** Updates rating/comment. Requires `feedback.update`; writes an audit record. */
export async function updateFeedbackFromDb(
  viewer: Viewer,
  id: string,
  input: UpdateFeedbackInput,
  actorId: string,
): Promise<FeedbackView> {
  assertPermission(viewer, PERMISSIONS.FEEDBACK_UPDATE);

  const existing = await db.feedback.findUnique({
    where: { id },
    select: { id: true, deletedAt: true },
  });
  if (!existing || existing.deletedAt) throw notFound();

  const data: { rating?: FeedbackRating; comment?: string | null } = {};
  if (input.rating !== undefined) data.rating = input.rating;
  if (input.comment !== undefined) data.comment = input.comment;

  const row = await db.feedback.update({
    where: { id },
    data,
    select: FEEDBACK_SELECT,
  });

  // Audit metadata never contains the raw comment or phone number.
  await writeAudit({
    actorId,
    action: "update",
    entityType: "feedback",
    entityId: id,
    metadata: {
      ...(input.rating !== undefined ? { rating: input.rating } : {}),
      ...(input.comment !== undefined ? { commentUpdated: true } : {}),
    },
  });

  return shapeFeedback(toRecord(row), viewer);
}

/** Soft-deletes feedback. Requires `feedback.delete`; writes an audit record. */
export async function deleteFeedbackFromDb(
  viewer: Viewer,
  id: string,
  actorId: string,
): Promise<{ id: string }> {
  assertPermission(viewer, PERMISSIONS.FEEDBACK_DELETE);

  const existing = await db.feedback.findUnique({
    where: { id },
    select: { id: true, deletedAt: true },
  });
  if (!existing || existing.deletedAt) throw notFound();

  await db.feedback.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  await writeAudit({
    actorId,
    action: "delete",
    entityType: "feedback",
    entityId: id,
    metadata: { softDelete: true },
  });

  return { id };
}
