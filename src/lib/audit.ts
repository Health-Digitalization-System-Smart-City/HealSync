// Shared audit-logging helper (security.md §18, database.md §18–19).
//
// Every sensitive administrative mutation writes an AuditLog record with the
// acting user, action, entity, and minimal structured metadata. Patient phone
// numbers and other unnecessary sensitive data are never stored in metadata.
import { headers } from "next/headers";

import { db } from "@/lib/db";

/** Best-effort client IP from request headers. */
export async function getRequestIp(): Promise<string | null> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  return fwd ? fwd.split(",")[0].trim() : h.get("x-real-ip");
}

export async function writeAudit(input: {
  actorId: string;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  await db.auditLog.create({
    data: {
      userId: input.actorId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      metadata: input.metadata as never,
      ipAddress: await getRequestIp(),
    },
  });
}
