# Implementation Roadmap

**Document:** `ROADMAP.md`
**Version:** 1.0
**Status:** Draft
**Audience:** Developers, QA, AI coding agents

---

## 1. Purpose

This document is the **working feature checklist** derived from the
specifications. It exists so the team can track what still needs to be built,
in what order, and by which workstream — and so individual teammates can pick
up assignable units of work.

It is **not a specification**. The authoritative requirements live in:

```text
PRD.md          →  What to build and why
Architecture.md →  How the system is structured
API.md          →  Server Action contracts
database.md     →  Data model and integrity rules
security.md     →  Security requirements
workflow.md     →  Development process
```

When a task says "per API §11", read that section before implementing.

---

## 2. Status Legend

```text
[ ]  Not started
[/]  In progress
[x]  Done
```

Dependency tags:

```text
[dep: <n>]  Requires the listed workstream(s) to be (at least partially) done
[public]    Public flow — patients do not authenticate
[admin]     Admin-only functionality
```

Type tags:

```text
Server   Business logic, Server Actions, auth, data access
UI       Screens, components, client-side state
DevOps   Environment, infrastructure, CI, deployment
Tests    Automated test coverage
```

---

## 3. Current State (baseline)

```text
[x]  DB schema (prisma/schema.prisma) — all 11 models + FeedbackRating enum
[x]  Initial Prisma migration (prisma/migrations/20260811122340_init)
[x]  Database migrated + seeded (roles, permissions, admin, branches, services, feedback)
[x]  Better Auth foundation — mounted at /api/auth/*, email+password enabled
[x]  Better Auth target config — disableSignUp + admin plugin + session hooks configured
[x]  Landing page + button/badge UI components
[/]  Server Actions, validation schemas, permission checks — auth/user done; analytics, AI pending
[x]  Unit + e2e tests — smoke, feedback, auth/RBAC
```

---

## 4. Workstream 0 — Environment & Database Bring-up

**Type:** DevOps · **Blocks:** everything that touches the database

| # | Task | Type | Depends |
| - | ---- | ---- | ------- |
| 0.1 | `[x]` Create `.env` from `.env.example` (`DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`) | DevOps | — |
| 0.2 | `[x]` Start local PostgreSQL and create the `healsync` database | DevOps | 0.1 |
| 0.3 | `[x]` Run `prisma migrate dev --name init` to create + apply the initial migration | DevOps | 0.2 |
| 0.4 | `[x]` Run `prisma db seed` (roles, 17 permissions, matrix, admin, 13 branches, 3 services, sample feedback) | DevOps | 0.3 |

Notes: `prisma migrate deploy` for production (database.md §27). Seed is
idempotent; production requires `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`
(prisma/seed.ts). CI already sets `DATABASE_URL` + `BETTER_AUTH_SECRET` for
its quality job (workflow.md §14).

---

## 5. Workstream 1 — Auth & Access Control

**Type:** Server + UI · **Depends on:** 0 · **Blocks:** 2, 4, 5, 6

| # | Task | Type | Depends |
| - | ---- | ---- | ------- |
| 1.1 | `[x]` Enable auth-lib target config in `src/lib/auth/index.ts`: `emailAndPassword.disableSignUp = true` + **admin plugin** with `adminRoles: ["Admin"]` (security.md §9, API.md §30) | Server | 0 |
| 1.2 | `[x]` `requireUser()` helper — resolve Better Auth session server-side; reject with `UNAUTHENTICATED` (API.md §6, §10) | Server | 1.1 |
| 1.3 | `[x]` `requirePermission("resource.action")` helper — user → role → permissions from DB; never trust client claims (API.md §7, security.md §10) | Server | 1.1 |
| 1.4 | `[x]` Login page UI (`(auth)/login`) — email/password form → `/api/auth/sign-in/email`, error states, redirect to dashboard | UI | 1.2 |
| 1.5 | `[x]` Dashboard route guard — server-side layout check: unauthenticated → login; disabled users blocked (`isActive`) | Server+UI | 1.2, 1.4 |
| 1.6 | `[x]` Sign-out control in the dashboard shell | UI | 1.4 |
| 1.7 | `[x]` Enable password reset + session-expiry handling via Better Auth (Resend for email delivery, console preview in dev) — responsibility per Architecture.md §5 | Server | 1.1 |

Acceptance: no public self-registration path; disabled users cannot reach the
dashboard; Manager/Analyst roles can sign in but only see permitted areas.

---

## 6. Workstream 2 — User Management (Admin)

**Type:** Server + UI · **Depends on:** 1

| # | Task | Type | Depends |
| - | ---- | ---- | ------- |
| 2.1 | `[x]` `getUsers` action — requires `user.read`; never expose passwords. (API.md §14 does not yet contract user read actions — add them there as part of this task, contract-first per API.md §27 Rule 8) | Server | 1.3 |
| 2.2 | `[x]` `createUser` action — full flow per API.md §14: Admin session → `user.create` → Zod → auth-lib admin API (bypasses `disableSignUp`) → fixed role → AuditLog → safe result | Server | 1.3 |
| 2.3 | `[x]` `updateUser` / `disableUser` actions — `user.update` / `user.disable`; disable sets `isActive = false`, revokes sessions + audit (API.md §14) | Server | 1.3 |
| 2.4 | `[x]` Shared `writeAudit()` helper for all sensitive mutations (database.md §18–19) | Server | 0 |
| 2.5 | `[x]` Users management page (admin) — list, create form (email/password/role), disable, change role; permission-gated server-side | UI | 2.1–2.3 |

---

## 7. Workstream 3 — Patient Feedback Flow

**Type:** Server + UI · **Public flow — parallel with W1**

| # | Task | Type | Depends |
| - | ---- | ---- | ------- |
| 3.1 | `[x]` Zod schemas — `src/lib/validation/feedback.ts` + phone normalization to E.164 (`0912 345 678` → `+251912345678`), rating enum, comment ≤ 1,000 chars (security.md §14, database.md §11) | Server | 0 |
| 3.2 | `[/]` `submitFeedback` action — validate phone/branch/service/rating → **verify BranchService relationship** → store with `phoneNumberHash` → rate limiting (10/10 min per IP, 16 KB payload cap) **pending (task 8.3)** (API.md §11, security.md §14) | Server | 3.1 |
| 3.3 | `[x]` Public `getBranches` / `getServices` — only active branches; services filtered by selected branch (API.md §12–13, PRD §9) | Server | 0 |
| 3.4 | `[x]` Mobile-first feedback form — multi-step: phone → branch → service → rating → optional comment → submit (PRD G1, FR-P001–P006) | UI | 3.1–3.3 |
| 3.5 | `[x]` Confirmation screen + duplicate-submit guard (disable button while pending) (PRD §13, FR-P007) | UI | 3.4 |

Acceptance (workflow.md §13): patient can complete the flow end-to-end on a
mobile viewport; invalid branch/service pair rejected by the backend.

---

## 8. Workstream 4 — Admin Feedback Management

**Type:** Server + UI · **Depends on:** 1 + 3

| # | Task | Type | Depends |
| - | ---- | ---- | ------- |
| 4.1 | `[ ]` `getFeedback` action — filters (branch/service/rating/date), search, pagination; **phone numbers masked by default — only Admin may receive raw numbers; backend must not even fetch raw for other roles**; searching **by phone number requires Admin** (API.md §11, security.md §8, §13) | Server | 1.3, 3.2 |
| 4.2 | `[ ]` `updateFeedback` / `deleteFeedback` actions — `feedback.update` / `feedback.delete`; delete = soft-delete (`deletedAt`) + audit per retention policy (API.md §11, database.md §17) | Server | 1.3 |
| 4.3 | `[ ]` Feedback list page — filter bar, table (`@tanstack/react-table` is installed), pagination, masked phone display | UI | 4.1 |
| 4.4 | `[ ]` Feedback detail view — branch/service/rating/comment/timestamp; raw phone only for Admin (PRD §19) | UI | 4.1 |

---

## 9. Workstream 5 — Branch & Service Management

**Type:** Server + UI · **Depends on:** 1

| # | Task | Type | Depends |
| - | ---- | ---- | ------- |
| 5.1 | `[ ]` Branch actions — `getBranches`, `createBranch`, `updateBranch`, `deleteBranch` (deactivate preferred), permissions `branch.*`, audit each mutation (API.md §12) | Server | 1.3 |
| 5.2 | `[ ]` Service actions — `getServices`, `createService`, `updateService`, `deleteService`, permissions `service.*` (API.md §13) | Server | 1.3 |
| 5.3 | `[ ]` Branch↔Service linking — manage `BranchService` rows per branch (activate/deactivate); use a transaction + audit (API.md §23, database.md §8) | Server | 5.1, 5.2 |
| 5.4 | `[ ]` Branches management UI — list/create/edit/deactivate | UI | 5.1 |
| 5.5 | `[ ]` Services management UI — list/create/edit/deactivate + per-branch availability editor | UI | 5.2, 5.3 |

---

## 10. Workstream 6 — Analytics

**Type:** Server + UI · **Depends on:** 3 (data exists) + 1

| # | Task | Type | Depends |
| - | ---- | ---- | ------- |
| 6.1 | `[ ]` `getDashboardSummary` — `totalFeedback`, `satisfactionRate`, `negativeRate`, `neutralRate`, `todayCount`; SQL aggregation, requires `analytics.read` (API.md §15, PRD §15) | Server | 1.3, 3.2 |
| 6.2 | `[ ]` `getFeedbackTrends` — interval day/week/month/year + the 10 date presets (`today` … `previous_year`, `custom`, `specific_day`); server-side timezone boundaries (API.md §15–16, PRD G4) | Server | 1.3, 3.2 |
| 6.3 | `[ ]` `getBranchAnalytics` / `getServiceAnalytics` — grouped counts + satisfaction %, comparisons (API.md §15, PRD §18.3–18.4) | Server | 1.3, 3.2 |
| 6.4 | `[ ]` `getSatisfactionDistribution` — rating distribution + satisfied/neutral/not-satisfied bucket mapping (API.md §15, PRD §18.2) | Server | 1.3, 3.2 |
| 6.5 | `[ ]` Dashboard layout + KPI cards — sidebar shell, overview cards, "Feedback Today" | UI | 6.1 |
| 6.6 | `[ ]` Filter bar — branch / service / date-preset dropdowns that combine (PRD §16) | UI | 6.1–6.4 |
| 6.7 | `[ ]` Charts — Recharts (installed): trend line, distribution bars, branch/service ranking bars | UI | 6.2–6.4 |

Rule: analytics must use database aggregation — never send all feedback to the
browser to compute statistics (API.md §19, Architecture.md §9).

---

## 11. Workstream 7 — AI Insights

**Type:** Server + UI · **Depends on:** 6

| # | Task | Type | Depends |
| - | ---- | ---- | ------- |
| 7.1 | `[ ]` AI provider abstraction — swappable provider interface + `AI_API_KEY` env (Architecture.md §10, PRD §33 decision 12) | Server | — |
| 7.2 | `[ ]` `generateFeedbackInsights` — auth → `analytics.ai` → validate scope → fetch feedback **excluding phone numbers** → send minimal data → validate AI response → structured result (API.md §20–21, security.md §20) | Server | 1.3, 6.1 |
| 7.3 | `[ ]` AI insights UI — clearly labeled "AI Insight" panel (themes, recommendations), never presented as fact, with path back to source feedback (PRD §20.3) | UI | 7.2 |

---

## 12. Workstream 8 — Cross-cutting & Quality

**Type:** Mixed · **Can run in parallel with all workstreams** (ideal for a dedicated teammate)

| # | Task | Type | Depends |
| - | ---- | ---- | ------- |
| 8.1 | `[ ]` Shared UI components — shadcn additions: `input`, `label`, `card`, `select`, `table`, `dialog`, `dropdown-menu`, `tabs`, `skeleton`, toast (button/badge already exist) | UI | — |
| 8.2 | `[x]` Result/error envelope utility — `src/lib/actions.ts`: `{success, data}` / `{success: false, error: {code, message}}` + the 9 error codes (API.md §9–10) | Server | — |
| 8.3 | `[ ]` Rate-limit implementation — per-IP sliding window for `submitFeedback` (security.md §14) | Server | — |
| 8.4 | `[ ]` Logging/observability — structured logs with request IDs; never log phone numbers, comments, passwords, tokens (API.md §26, security.md §23) | Server | — |
| 8.5 | `[ ]` Security headers — CSP, X-Content-Type-Options, Referrer-Policy, HSTS (security.md §24) | DevOps | — |
| 8.6 | `[/]` Unit tests — permission checks done; phone normalization, rating→bucket mapping, analytics calculations pending (workflow.md §12) | Tests | 3.1, 1.3 |
| 8.7 | `[ ]` Integration tests — Server Action → service → DB, including negative auth tests: `Manager → phone ❌`, `Analyst → delete ❌`, `Anonymous → self-register ❌` (security.md §26) | Tests | 1.x, 3.x |
| 8.8 | `[/]` E2E tests — patient flow ✓, admin login → dashboard → users ✓; role-restriction negative tests pending (workflow.md §13) | Tests | 3.x, 1.x |
| 8.9 | `[ ]` CI — uncomment the e2e job, add integration-test step to `.github/workflows/ci.yml` | DevOps | 8.7, 8.8 |
| 8.10 | `[ ]` Update the specs when implementation changes a documented contract (workflow.md §19) — e.g. new Server Actions → API.md, schema changes → database.md; fold into each task's PR rather than a separate task | Docs | — |

---

## 13. Recommended Ordering

```text
Week A — foundation (4 people in parallel)
   ├─ 0.1–0.4  DB bring-up                → 1 dev
   ├─ 1.1–1.3  Auth server core           → 1 dev (after DB up)
   ├─ 8.1–8.4  Shared UI + server utils   → 1 dev (independent)
   └─ 3.1–3.3  Feedback server (public)   → 1 dev (independent of auth)

Week B — first vertical slices
   ├─ 1.4–1.7 + 2.x  Login + user management
   ├─ 3.4–3.5        Patient form UI (after 3.1–3.3)
   └─ 4.1–4.2        Admin feedback actions (after 1.x + 3.x)

Week C
   ├─ 4.3–4.4, 5.x   Feedback UI + branch/service management
   └─ 6.1–6.4        Analytics actions (after 3.x)

Week D
   ├─ 6.5–6.7        Dashboard UI (largest UI task)
   ├─ 7.x            AI insights
   └─ 8.5–8.9        Headers, tests, CI
```

---

## 14. Assignment Guidance

* A single PR should map to **one task row** in this file (workflow.md §18).
* Check off a task only when it meets the Definition of Done (workflow.md §25):
  requirements, implementation, validation, authorization, tests,
  documentation, PR review.
* Before starting a task, read the docs referenced in its "Depends" cell and
  the specification sections cited in its notes.
* Branch naming per workflow.md §3, e.g. `feat/feedback-submission`.

---

## 15. Hard Rules for Every Task

From the specs — a task that violates these is not done:

```text
Server Actions only — no new REST routes (API.md §1; auth endpoints are the
exception and are library-provided)
Domain folders — src/features/<domain>/actions.ts (API.md §3)
Phone masking enforced server-side — never fetch raw for non-Admin
(security.md §8)
Analytics via SQL aggregation, not client-side computation (API.md §19)
Every sensitive mutation writes an AuditLog (database.md §19)
Branches/services/users: deactivate, don't hard-delete (database.md §14–17)
No Prisma from Client Components; no DATABASE_URL via NEXT_PUBLIC_*
(API.md §22, security.md §16)
Never send phone numbers to AI providers by default (security.md §20,
database.md §31)
```
