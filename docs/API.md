# HealSync — API Design

**Status: Draft — Phase 2 (design; only Better Auth endpoints exist)**

This document specifies the **future API contract**. Nothing here is
implemented yet except the Better Auth endpoints under `/api/auth/*` (Phase 1
foundation). Endpoint shapes below are **proposals** and are marked as such;
they will be locked during the API-finalization phase.

Related: [PRD.md](PRD.md) (requirements) · [WORKFLOWS.md](WORKFLOWS.md)
(workflows the API serves) · [DATABASE.md](DATABASE.md) (data model) ·
[ARCHITECTURE.md](ARCHITECTURE.md) (route-handler conventions) ·
[SECURITY.md](SECURITY.md) (protection of these endpoints).

---

## 1. Current State (Phase 1)

The only mounted routes are Better Auth endpoints:

```text
/api/auth/*        GET/POST  mounted by src/app/api/auth/[...all]/route.ts
```

All product endpoints below are **planned** and do not exist yet.

---

## 2. Endpoint Groups (planned)

```text
/api/auth/*        # Authentication (Better Auth — exists)
/api/feedback      # Patient feedback submission (public)
/api/admin/feedback    # Feedback listing & filtering (admin)
/api/admin/analytics   # Analytics queries (admin)
/api/admin/clinics     # Clinic management (admin)
/api/admin/branches    # Branch management (admin)
/api/admin/services    # Service management (admin)
/api/admin/staff       # Staff management (admin, if in scope)
```

All `/api/admin/*` endpoints require an authenticated administrator session.

---

## 3. API Design Principles

Every endpoint must:

1. **Validate input** at the boundary with Zod (`src/lib/validation`).
2. **Authenticate** where required (Better Auth session).
3. **Authorize** where required (admin-only; server-side, never trusting the
   client).
4. **Delegate business logic to a service** (`src/services`); route handlers
   stay thin.
5. **Return predictable responses** — consistent success and error shapes.
6. **Paginate** list endpoints (see §6) and cap result sizes.
7. **Never leak internals** — no Prisma errors, connection strings, or stack
   traces in responses (see [SECURITY.md](SECURITY.md)).

---

## 4. Response & Error Contract (proposed)

### 4.1 Success envelope

Simple success responses return the resource directly:

```json
{ "data": { ... }, "meta": { "page": 1, "pageSize": 25, "total": 137 } }
```

- `meta` present on paginated list responses.
- Write operations return the created/updated resource plus a stable id.

### 4.2 Error envelope

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "One or more fields are invalid.",
    "details": [{ "field": "phone", "message": "Invalid phone format" }]
  }
}
```

| Error code         | HTTP | Meaning                                            |
| ------------------ | ---- | -------------------------------------------------- |
| `VALIDATION_ERROR` | 400  | Request body/query failed Zod validation           |
| `UNAUTHENTICATED`  | 401  | Missing or invalid session                         |
| `FORBIDDEN`        | 403  | Authenticated but not authorized                   |
| `NOT_FOUND`        | 404  | Resource does not exist                            |
| `CONFLICT`         | 409  | State conflict (e.g., duplicate unique value)      |
| `BUSINESS_RULE`    | 422  | Semantically invalid (e.g., service not at branch) |
| `RATE_LIMITED`     | 429  | Too many requests                                  |
| `INTERNAL_ERROR`   | 500  | Unexpected server error (generic message only)     |

---

## 5. Patient API (public)

### 5.1 `POST /api/feedback`

Public, unauthenticated. Creates a feedback record.

**Proposed request body:**

```json
{
  "branchId": "brn_01H...",
  "serviceId": "srv_01H...",
  "phone": "+201012345678",
  "rating": 5,
  "comment": "Great doctor, short wait.",
  "categoryId": "cat_reception"
}
```

| Field        | Required | Validation (proposed)                                                                    |
| ------------ | -------- | ---------------------------------------------------------------------------------------- |
| `branchId`   | yes      | Must exist and be active                                                                 |
| `serviceId`  | yes      | Must belong to the selected branch's catalog (contingent on DATABASE.md open decision A) |
| `phone`      | proposed | Normalized E.164; see PRD/DATABASE Open Decisions                                        |
| `rating`     | yes      | Integer 1–5                                                                              |
| `comment`    | no       | Optional, ≤ 1,000 chars, plain text (no HTML)                                            |
| `categoryId` | no       | Must exist and be active if provided (MVP acceptance is an open decision)                |

**Success (201):**

```json
{ "data": { "id": "fb_01H...", "createdAt": "2026-08-08T10:00:00Z" } }
```

**Validation errors (400):** per-field `details` (see §4.2).

**Rate limiting (proposed):** the endpoint is public, so it must be protected
(see §8 and [SECURITY.md](SECURITY.md) §Public feedback endpoint). Proposed:
per-IP sliding window (e.g. 10 submissions / 10 minutes) at the application
layer, platform-level limits at the edge; CAPTCHA is a post-MVP option —
patients are never forced to authenticate.

**Design notes:**

- `serviceId` must be validated against the branch (server-side) — this
  prevents mismatched selections and enforces the workflow (FR-PAT-3).
- No patient identity; the record stands alone. Duplicate-submission control
  is post-MVP (hash-based, see [DATABASE.md](DATABASE.md) §5).

---

## 6. Admin API (proposed)

All endpoints below require an authenticated administrator session
(`Authorization`/session cookie). They are **design proposals**, not
implementations.

### 6.1 `GET /api/admin/feedback`

List feedback with filtering, sorting, pagination.

| Query param               | Notes                                                 |
| ------------------------- | ----------------------------------------------------- |
| `branchId`                | Filter by branch                                      |
| `serviceId`               | Filter by service                                     |
| `categoryId`              | Filter by category                                    |
| `rating`                  | Filter by exact rating                                |
| `minRating` / `maxRating` | Range filter                                          |
| `from` / `to`             | Date range (ISO 8601)                                 |
| `q`                       | Free-text search on comment (post-MVP: also category) |
| `sort`                    | `createdAt` / `rating` (default: createdAt desc)      |
| `cursor` / `limit`        | Cursor pagination (§6.3)                              |
| `includeMaskedPhone`      | `true` only for authorized access; default masked     |

**Response:** paginated list of feedback DTOs. Phone numbers are **masked by
default** (PRD FR-ADM-10); raw numbers returned only when explicitly
requested by an authorized admin, and such access is **logged as an audit
/ access event** (see [SECURITY.md](SECURITY.md) §5.2 and
[DATABASE.md](DATABASE.md) §3.7).

### 6.2 `GET /api/admin/feedback/:id`

Single feedback record (masked phone by default).

### 6.3 Pagination

List endpoints must not return unlimited records.

| Strategy              | How                                                           | Chosen for                                                         |
| --------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------ |
| **Cursor pagination** | Opaque `cursor` + `limit`; stable under inserts; O(1) lookups | High-volume, append-only, date-ordered lists: **feedback**         |
| **Offset pagination** | `page` + `pageSize` + `total`                                 | Small, stable management lists: clinics, branches, services, staff |

**Rationale:** feedback is the high-volume, append-only collection; cursor
pagination avoids the offset-skip cost and page-drift problems as new
feedback arrives during browsing. Management lists are small and rarely
change shape, so simple offset + total is fine there.

### 6.4 `GET /api/admin/analytics`

Aggregated metrics.

| Query param                             | Notes                            |
| --------------------------------------- | -------------------------------- |
| `from` / `to`                           | Required date range (PRD §10.5)  |
| `branchId` / `serviceId` / `categoryId` | Optional filters                 |
| `groupBy`                               | `day` / `week` / `month` (trend) |

**Response (proposed):**

```json
{
  "data": {
    "range": { "from": "...", "to": "..." },
    "summary": { "totalFeedback": 137, "averageRating": 4.2,
                 "satisfactionPercent": 81.0, "dissatisfactionPercent": 9.0,
                 "ratingDistribution": { "1": 5, "2": 7, "3": 14, "4": 51, "5": 60 } },
    "byBranch": [ { "branchId": "...", "totalFeedback": 60, "averageRating": 4.4, "satisfactionPercent": 88.0 } ],
    "byService": [ ... ],
    "trend": [ { "bucket": "2026-08-01", "totalFeedback": 12, "averageRating": 4.1 } ]
  }
}
```

Metric definitions (satisfaction %, thresholds) are shared with the analytics
module and documented in [PRD.md](PRD.md) §11. This endpoint returns
**aggregates only** — never raw feedback.

### 6.5 Management endpoints

```text
GET    /api/admin/clinics            # list (offset pagination)
POST   /api/admin/clinics            # create
PATCH  /api/admin/clinics/:id        # update (incl. archive)
GET    /api/admin/branches           # list (filter by clinicId)
POST   /api/admin/branches           # create
PATCH  /api/admin/branches/:id       # update (incl. archive)
GET    /api/admin/services           # list (filter by branchId)
POST   /api/admin/services           # create
PATCH  /api/admin/services/:id       # update (incl. archive)
GET    /api/admin/staff              # list (if staff in scope)
POST   /api/admin/staff
PATCH  /api/admin/staff/:id
```

- **Archive** (soft delete) is the default destructive action; hard DELETE is
  only allowed when no dependent data exists (see
  [DATABASE.md](DATABASE.md) §7 and [WORKFLOWS.md](WORKFLOWS.md) §8).
- All mutations are audited (PRD NFR-9).

---

## 7. Authentication Endpoints

Handled entirely by Better Auth (already mounted):

```text
POST /api/auth/sign-in/email     # email + password sign-in
POST /api/auth/sign-up/email     # (admin provisioning; usage TBD)
GET  /api/auth/get-session       # current session
POST /api/auth/sign-out          # sign out
```

Admin session validation for `/api/admin/*` is done server-side in the route
handler / guard layer using the Better Auth session API (see
[ARCHITECTURE.md](ARCHITECTURE.md) §7).

---

## 8. Rate Limiting & Abuse Protection (public endpoint)

The public `POST /api/feedback` is an open submission channel and must be
protected without forcing patient accounts (PRD §15):

| Control              | Proposed approach                                                     | MVP?     |
| -------------------- | --------------------------------------------------------------------- | -------- |
| Per-IP rate limiting | Sliding window at application layer (e.g., 10/10min) + edge limits    | Yes      |
| Input validation     | Zod: types, lengths, formats, allowed values (branch/service catalog) | Yes      |
| Payload limits       | Body size cap (e.g., 16 KB); comment length cap                       | Yes      |
| Duplicate control    | Optional phone-hash dedupe window (post-MVP refinement)               | Post-MVP |
| CAPTCHA              | Only if abuse persists; friction trade-off documented                 | Post-MVP |
| Abuse detection      | Spike alerts / blocking heuristics                                    | Post-MVP |

Never require patient authentication to mitigate abuse.

---

## 9. Versioning

No URL versioning (`/api/v1/...`) in the MVP — the API surface is small and
internal. If a breaking-change need emerges, versioning will be introduced
deliberately (open decision).

---

## 10. Open Decisions

- Exact request/response schemas for each admin endpoint (locked during
  API-finalization).
- Whether `categoryId` is accepted from the public form in MVP (proposed:
  optional; see [PRD.md](PRD.md) §16).
- Whether a `Feedback.status` field is adopted — if so,
  `GET /api/admin/feedback` gains a `status` filter and the DTO exposes it
  (see [DATABASE.md](DATABASE.md) open decision D).
- Whether `staffId` appears in `POST /api/feedback` (depends on staff-in-MVP
  decision; [DATABASE.md](DATABASE.md) §11).
- Raw phone visibility policy: which roles may request `includeMaskedPhone`.
- URL versioning approach if ever needed.
- Whether analytics supports `groupBy` by category in MVP.
