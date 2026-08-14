# API / Server Actions

**Document:** `API.md`
**Version:** 1.0
**Status:** Draft

## 1. API Strategy

The application uses **Next.js Server Actions** as the primary server communication layer.

We do **not** maintain a separate REST API for internal application communication.

The only REST-style endpoints are the authentication endpoints mounted by
**Better Auth** under `/api/auth/*` (§30) plus the analytics and feedback
route handlers under `/api/analytics/*` and `/api/feedback/*` (§11b). They are
provided and managed by the library and are not part of the Server Action contract.

```text
Client Component
      ↓
Server Action
      ↓
Validation
      ↓
Authentication
      ↓
Authorization
      ↓
Business Logic
      ↓
PostgreSQL
```

Server Actions are the standard interface between the UI and server-side application logic.

---

# 2. Server Action Rules

Every Server Action must:

1. Validate its input.
2. Authenticate when required.
3. Check authorization when required.
4. Execute business logic server-side.
5. Return a predictable result.
6. Never expose sensitive internal errors.
7. Never trust client-provided authorization information.

Example:

```ts
const result = await createBranch(input);
```

The client should not directly access Prisma or PostgreSQL.

---

# 3. Domain Organization

Server Actions should be organized by domain.

```text
features/
├── feedback/
│   └── actions.ts
├── branches/
│   └── actions.ts
├── services/
│   └── actions.ts
├── analytics/
│   └── actions.ts
├── users/
│   └── actions.ts
└── ai-insights/
    └── actions.ts
```

Do not create one large `actions.ts` containing the entire application.

---

# 4. Naming Convention

Use clear verb-based names.

### Create

```text
createBranch
createService
createUser
submitFeedback
```

### Update

```text
updateBranch
updateService
updateUser
updateFeedback
```

### Delete / deactivate

```text
deleteBranch
deleteService
deleteFeedback
deactivateBranch
deactivateUser
```

### Read

```text
getBranch
getBranches
getServices
getFeedback
getDashboardSummary
```

### AI

```text
generateFeedbackInsights
analyzeFeedbackSentiment
summarizeFeedback
```

Names should describe the operation, not the implementation.

---

# 5. Input Validation

All Server Action inputs must be validated on the server.

Use **Zod** schemas.

```text
Client Input
    ↓
Zod Validation
    ↓
Validated Data
    ↓
Business Logic
```

Example:

```ts
const feedbackSchema = z.object({
  phoneNumber: z.string(),
  branchId: z.string(),
  serviceId: z.string(),
  rating: z.string(),
  comment: z.string().optional(),
});
```

Never rely only on frontend validation.

---

# 6. Authentication

Actions that access administrative functionality must require an authenticated user.

Example:

```text
getDashboardSummary()
    ↓
requireAuthenticatedUser()
    ↓
continue
```

Patient feedback submission is public and does not require an administrative account.

Authentication uses **Better Auth** sessions (endpoints under `/api/auth/*`, see
§30); actions must resolve the session server-side rather than trusting client
claims.

---

# 7. Authorization

Authentication answers:

> Who are you?

Authorization answers:

> Are you allowed to perform this action?

Every protected action must check permissions.

Example:

```text
deleteFeedback()
      ↓
Authenticated?
      ↓
Has feedback.delete?
      ↓
Delete
```

Never trust:

* User IDs sent from the browser.
* Role values sent from the browser.
* Permission values sent from the browser.

These must come from the authenticated server-side session/database.

---

# 8. Permission Convention

Permissions follow:

```text
resource.action
```

Examples:

```text
feedback.read
feedback.update
feedback.delete

branch.read
branch.create
branch.update
branch.delete

service.read
service.create
service.update
service.delete

user.read
user.create
user.update
user.disable

analytics.read
analytics.ai
```

---

# 9. Standard Result Format

Server Actions should return predictable results.

### Success

```ts
{
  success: true,
  data: ...
}
```

### Failure

```ts
{
  success: false,
  error: {
    code: "VALIDATION_ERROR",
    message: "Invalid input"
  }
}
```

Do not return raw database or framework errors to the client.

---

# 10. Error Codes

Use consistent application-level error codes.

```text
VALIDATION_ERROR
UNAUTHENTICATED
FORBIDDEN
NOT_FOUND
CONFLICT
RATE_LIMITED
DATABASE_ERROR
AI_ERROR
INTERNAL_ERROR
```

Example:

```ts
{
  success: false,
  error: {
    code: "FORBIDDEN",
    message: "You do not have permission to perform this action."
  }
}
```

---

# 11. Feedback Actions

## `submitFeedback`

Public action.

### Input

```ts
{
  phoneNumber: string
  branchId: string
  serviceId: string
  rating: FeedbackRating
  comment?: string
}
```

### Rules

* Validate phone number.
* Validate branch.
* Validate service.
* Verify service is available for the selected branch.
* Validate rating.
* Sanitize/validate comment.
* Store submission.
* Prevent unintended duplicate submissions where applicable.
* Do not expose other feedback records.

---

## `getFeedback`

Protected action.

Supports:

```text
Branch
Service
Rating
Date range
Pagination
Search
```

Only users with `feedback.read` may use it.

Phone numbers are returned **masked by default**. Only Admin may request raw
phone numbers (`security.md` §8); the backend must not return the raw number
to other roles.

---

## `updateFeedback`

Protected action.

Requires:

```text
feedback.update
```

Changes must be auditable.

---

## `deleteFeedback`

Protected action.

Requires:

```text
feedback.delete
```

Deletion behavior must follow the data-retention rules defined in `database.md`.

---

# 11b. Feedback REST Endpoints (implemented)

> **Deviation note:** The feedback dashboard is served through REST route
> handlers under `/api/feedback/*` (mirroring the existing `/api/analytics/*`
> pattern) rather than Server Actions. The read path must enforce phone-number
> masking server-side before the response leaves the server, which is simpler
> and safer to centralize in a route-handler boundary. Domain logic lives in
> `src/lib/feedback/service.ts`; route handlers only parse/validate input,
> resolve the viewer, and delegate.
>
> This is currently the only client-server contract in the app besides
> `/api/auth/*` and `/api/analytics/*`. When feedback submission is built, the
> public `submitFeedback` action (§11) should still be a Server Action.

All feedback endpoints require an authenticated dashboard session with
`feedback.read`. Update requires `feedback.update`; delete requires
`feedback.delete` (Admin only, per the permission matrix in `security.md`).

### `GET /api/feedback`

List feedback with filters and pagination.

Query parameters (all optional):

```text
branchId?    branch to filter by
serviceId?   service to filter by
rating?      feedback rating to filter by (0..7)
range?       all | today | yesterday | last_7_days | this_month |
             last_30_days | this_year | custom     (default: all)
startDate?   required when range=custom  (YYYY-MM-DD)
endDate?     required when range=custom  (YYYY-MM-DD)
page?        page number (default: 1, clamped to totalPages)
pageSize?    page size (default: 10, 1..100)
```

Success response:

```json
{
  "items": [
    {
      "id": "fb_1",
      "branchId": "br_1",
      "branchName": "Downtown",
      "serviceId": "sv_1",
      "serviceName": "Consultation",
      "customerName": "Ada Lovelace",
      "phoneNumber": "•••• 4871",
      "rating": 7,
      "ratingLabel": "Very satisfied",
      "ratingScore": 100,
      "comment": "Great visit",
      "createdAt": "2026-08-14T09:00:00.000Z",
      "source": "kiosk"
    }
  ],
  "total": 5,
  "page": 1,
  "pageSize": 10,
  "totalPages": 1,
  "summary": { "total": 5, "positive": 3, "neutral": 1, "needsAttention": 1 },
  "viewer": {
    "role": "Admin",
    "canSeePhone": true,
    "canUpdate": true,
    "canDelete": true
  }
}
```

Phone masking rules:

* `phoneNumber` is returned masked as `•••• <last4>` for every role except
  Admin. The raw number is never sent to the browser for Manager/Analyst.
* The `viewer` object tells the client which capabilities the current session
  has so the UI can render the phone column, edit button, and delete button
  accordingly. The client must not rely on it for authorization — PATCH/DELETE
  are enforced server-side.

The `summary` mirrors the dashboard KPI categories (total / positive / neutral
/ needs-attention), matching the rating mapping in §11 and `security.md`.

### `GET /api/feedback/meta`

Returns filter options for the dashboard:

```json
{
  "branches": [{ "id": "br_1", "name": "Downtown" }],
  "services": [{ "id": "sv_1", "name": "Consultation" }],
  "ratings": [{ "value": 7, "label": "Very satisfied" }]
}
```

### `GET /api/feedback/:id`

Returns a single `FeedbackView` (same shape as a list item, phone masked per
the viewer). Returns `404 NOT_FOUND` when the record does not exist.

### `PATCH /api/feedback/:id`

Updates a feedback record. Requires `feedback.update`.

Body:

```ts
{
  rating?: FeedbackRating   // 0..7
  comment?: string          // sanitized, max length enforced
}
```

Returns the updated `FeedbackView`. At least one field is required; empty
requests return `VALIDATION_ERROR`. Changes must be auditable (§11).

### `DELETE /api/feedback/:id`

Deletes a feedback record. Requires `feedback.delete`. Returns `204 No
Content` on success and `404 NOT_FOUND` when the record does not exist.
Deletion behavior follows the data-retention rules defined in `database.md`.

### Error envelope

Non-2xx responses use the standard envelope:

```json
{
  "error": { "code": "FORBIDDEN", "message": "You do not have permission to perform this action." }
}
```

Codes: `VALIDATION_ERROR`, `UNAUTHENTICATED`, `FORBIDDEN`, `NOT_FOUND`,
`INTERNAL_ERROR`.

---

# 12. Branch Actions

## `getBranches`

Returns active/configured branches according to the caller's context.

---

## `createBranch`

Requires:

```text
branch.create
```

Input:

```ts
{
  name: string
  code?: string
}
```

---

## `updateBranch`

Requires:

```text
branch.update
```

---

## `deleteBranch`

Requires:

```text
branch.delete
```

Prefer deactivation when historical feedback references the branch.

---

# 13. Service Actions

## `getServices`

Returns services available to the application.

Can optionally filter by branch.

---

## `createService`

Requires:

```text
service.create
```

---

## `updateService`

Requires:

```text
service.update
```

---

## `deleteService`

Requires:

```text
service.delete
```

Historical feedback must remain valid when a service is deactivated.

---

# 14. User Actions

User-management actions are protected.

## `createUser`

Requires:

```text
user.create
```

Input:

```ts
{
  email: string
  password: string
  roleId: string
}
```

Admin-only dashboard user provisioning. Public self-registration is disabled
at the auth layer (`security.md` §9), so this action is the only path for
creating dashboard users.

Flow:

```text
Authenticate (Admin session)
    ↓
Check user.create permission
    ↓
Validate input (Zod)
    ↓
Create the auth user server-side via the auth library's admin API
(bypasses disableSignUp; the caller must already be an Admin)
    ↓
Assign roleId from the fixed role set
    ↓
Write an AuditLog record
    ↓
Return a safe result
```

* `roleId` must reference one of the fixed roles (Admin / Manager / Analyst).
* Never expose or log the raw password; return a predictable result (§9).
* Disabled users cannot access protected functionality (§14 `disableUser`).
* The admin API requires the auth library's admin plugin to be enabled with
  Admin as the admin role (`security.md` §9).

---

## `updateUser`

Requires:

```text
user.update
```

---

## `disableUser`

Requires:

```text
user.disable
```

A disabled user must not be able to access protected functionality.

---

# 15. Analytics Actions

Analytics actions are read-only from the application's business perspective.

## `getDashboardSummary`

Returns high-level metrics.

Example:

```ts
{
  totalFeedback: number
  satisfactionRate: number
  negativeRate: number
  neutralRate: number
  todayCount: number
}
```

`satisfactionRate`, `negativeRate`, and `neutralRate` (Neutral / Other) cover
the KPI categories of the dashboard overview (`PRD.md` §15); the three rates
are intended to sum to 100% of rated feedback once the rating-to-category
mapping is finalized.

---

## `getFeedbackTrends`

Input:

```ts
{
  branchId?: string
  serviceId?: string
  range?: "today" | "yesterday" | "specific_day" | "this_week" | "previous_week" | "this_month" | "previous_month" | "this_year" | "previous_year" | "custom"
  date?: Date         // required when range = "specific_day"
  startDate?: Date    // required when range = "custom" (or when range is omitted)
  endDate?: Date      // required when range = "custom" (or when range is omitted)
  interval: "day" | "week" | "month" | "year"
}
```

`range` selects a preset period from the filter set in §16. If `range` is
omitted, `startDate` and `endDate` must be provided explicitly.

---

## `getBranchAnalytics`

Returns metrics grouped by branch.

---

## `getServiceAnalytics`

Returns metrics grouped by service.

---

## `getSatisfactionDistribution`

Returns structured feedback distribution.

---

# 16. Date Filtering

Analytics must use a consistent date model.

Supported filters:

```text
today
yesterday
specific_day     # a specific calendar date
this_week
previous_week
this_month
previous_month
this_year
previous_year
custom
```

This is the full filter set from `PRD.md` G4 (Time-based analytics). For
`specific_day`, the caller supplies the specific date:

```ts
{
  date: Date
}
```

For custom ranges:

```ts
{
  startDate: Date
  endDate: Date
}
```

Date boundaries must be calculated server-side using the application's configured timezone.

---

# 17. Pagination

Large datasets must not be returned in a single response.

Feedback lists should use pagination.

Preferred approach:

```text
cursor-based pagination
```

when appropriate.

For simple administrative lists, page-based pagination may also be used.

The implementation should select the simplest approach that meets the actual query requirements.

---

# 18. Filtering

Filters must be explicit and validated.

Example:

```ts
{
  branchId?: string
  serviceId?: string
  rating?: FeedbackRating
  startDate?: Date
  endDate?: Date
}
```

Do not construct raw SQL from user-provided filter strings.

---

# 19. Analytics Performance

Analytics actions must calculate metrics on the server/database.

Avoid:

```text
Database
   ↓
10,000 feedback records
   ↓
Browser
   ↓
JavaScript calculates everything
```

Prefer:

```text
Database
   ↓
SQL aggregation
   ↓
Small analytics result
   ↓
Browser
```

---

# 20. AI Actions

AI actions are protected.

Example:

```text
generateFeedbackInsights()
```

The action should:

1. Authenticate user.
2. Check `analytics.ai`.
3. Validate requested scope.
4. Retrieve required feedback/analytics data.
5. Send only necessary data to the AI provider.
6. Validate the AI response.
7. Return structured insights.
8. Log AI processing errors safely.

---

# 21. AI Response Contract

AI output should use structured data rather than arbitrary text where possible.

Example:

```ts
{
  summary: string
  positiveThemes: string[]
  negativeThemes: string[]
  recommendations: string[]
}
```

The exact schema belongs to the AI implementation.

AI-generated information must be clearly distinguishable from deterministic analytics.

---

# 22. Database Access

Only server-side code may access Prisma/PostgreSQL.

Allowed:

```text
Server Action
   ↓
Service
   ↓
Prisma
```

Not allowed:

```text
Client Component
   ↓
Prisma
```

Do not expose database credentials to the browser.

---

# 23. Transactions

Use database transactions when multiple related writes must succeed or fail together.

Example:

```text
Create branch
+
Create branch-service relationships
+
Audit operation
```

should use a transaction when atomicity is required.

---

# 24. Idempotency

Actions that may be retried because of network conditions should consider idempotency.

This is especially important for:

* Feedback submission
* User creation
* Administrative mutations

The implementation should prevent accidental duplicate records where appropriate.

---

# 25. Rate Limiting

Public actions, especially `submitFeedback`, should be protected against abuse.

Potential controls:

```text
IP-based limits
Phone-number-based limits
Request throttling
Bot protection
```

Exact limits are defined in `security.md` §14 (default rate-limiting policy).

---

# 26. Logging

Server Actions should log useful operational information without exposing sensitive patient data.

Never unnecessarily log:

```text
Phone numbers
Full feedback text
Passwords
Session tokens
Secrets
```

---

# 27. Action Design Rules

AI agents and developers must follow these rules:

### Rule 1

Do not create a Server Action when existing functionality can be reused.

### Rule 2

Do not put database queries directly in UI components.

### Rule 3

Do not skip server-side validation.

### Rule 4

Do not skip authorization because a button is hidden.

### Rule 5

Do not return raw Prisma/database errors.

### Rule 6

Keep actions small and domain-specific.

### Rule 7

Use transactions for related atomic mutations.

### Rule 8

Update `API.md` when adding a significant new action or changing an existing contract.

---

# 28. API Contract Principle

The API layer should remain:

```text
Explicit
Typed
Validated
Authorized
Predictable
Testable
```

Server Actions are the transport mechanism.

**Business logic should remain in domain/service modules rather than being embedded entirely inside Server Actions.**

---

# 29. Source-of-Truth Rules

```text
PRD.md
    → Product requirements

Architecture.md
    → System structure

API.md
    → Server communication contracts

database.md
    → Data model

security.md
    → Security requirements

workflow.md
    → Development process
```

When documents conflict, the team should resolve the conflict explicitly rather than silently implementing contradictory behavior.

---

# 30. Authentication Endpoints (Better Auth)

Authentication is handled by **Better Auth**, configured in
`src/lib/auth/index.ts` (email + password with the Prisma adapter). The
library's Next.js adapter mounts its endpoints under `/api/auth/*` through the
catch-all route handler in `src/app/api/auth/[...all]/route.ts`.

These are the only REST-style routes in the application apart from the
analytics and feedback route handlers under `/api/analytics/*` and
`/api/feedback/*` (§11b); all other client-server communication uses Server
Actions (§1).

Common endpoints:

```text
POST /api/auth/sign-up/email      # disabled by default (disableSignUp);
                                  # provisioning happens via the createUser
                                  # Server Action (§14)
POST /api/auth/sign-in/email      # email + password sign-in
POST /api/auth/sign-out           # sign out
GET  /api/auth/get-session        # current session
```

Rules:

* The endpoints are provided and managed by the library — do not reimplement
  them as Server Actions and do not build custom session logic on top.
* Resolve sessions server-side through the library; never trust session or role
  claims sent from the client (`security.md` §9).
* The route handler is `force-dynamic`; these routes must never be statically
  prerendered.
* Configuration uses `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL`
  (`.env.example`); the secret must never be exposed through `NEXT_PUBLIC_*`.
* Public self-registration is disabled in the auth configuration
  (`emailAndPassword.disableSignUp = true`, `security.md` §9), so
  `sign-up/email` is not available to clients. Dashboard users are created
  only by Admin through the `createUser` Server Action (§14).
* Patient feedback submission does not use these endpoints; patients do not
  authenticate.
