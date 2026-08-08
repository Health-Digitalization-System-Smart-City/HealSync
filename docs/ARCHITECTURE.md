# HealSync — Architecture

**Status: Draft — Phase 2 (design; foundation implemented in Phase 1)**

This document defines how HealSync is built. It describes the **current
implementation** (what exists today) and the **planned architecture** (what
Phase 3+ will build). It must be read together with
[PRD.md](PRD.md) (what to build), [DATABASE.md](DATABASE.md) (how data is
stored), [API.md](API.md) (the API contract), [SECURITY.md](SECURITY.md)
(how it is protected), and [DEPLOYMENT.md](DEPLOYMENT.md) (how it runs).

---

## 1. Architecture Style: Modular Monolith

HealSync is a **modular monolith**: a single Next.js application that owns the
UI, server components, route handlers, server-side application logic,
authentication integration, and API endpoints.

```text
Browser
   ↓
Next.js (App Router)
   ├── Patient UI (public routes)
   ├── Admin UI (authenticated routes)
   ├── API Route Handlers (/api/...)
   ├── React Server Components
   └── Authentication (Better Auth)
        ↓
Application Services (src/services)
        ↓
Prisma Client (src/lib/db — Prisma 7 + @prisma/adapter-pg)
        ↓
PostgreSQL
```

### 1.1 Why not microservices?

For the current scale and stage, microservices would add cost without benefit:

- **Current scale does not justify them.** A single clinic network's feedback
  volume is comfortably handled by one well-structured application and one
  PostgreSQL database.
- **Easier local development.** One process, one command (`pnpm dev`), one
  database.
- **Simpler deployment.** One artifact on one platform (see
  [DEPLOYMENT.md](DEPLOYMENT.md)).
- **Easier team onboarding.** New developers understand one codebase, one
  deployment, one set of conventions.
- **Easier debugging.** A request's path through the system is short and
  traceable; no distributed tracing required.
- **Lower operational complexity.** No service discovery, no message buses, no
  per-service observability, no inter-service consistency problems.

### 1.2 What is deliberately NOT introduced (Phase 1–3)

Separate API servers (Fastify/Express), microservices, Redis, Kafka, message
queues, background workers, Kubernetes, GraphQL, and WebSockets are **not**
part of the architecture. Each may be revisited **only** when a concrete,
documented requirement emerges (e.g., a real need for background jobs).

---

## 2. Current Implementation (Phase 1 — verified)

| Concern              | What exists today                                                                      |
| -------------------- | -------------------------------------------------------------------------------------- |
| Framework            | Next.js 16 (App Router), React 19, TypeScript strict, Tailwind CSS v4, pnpm            |
| UI kit               | shadcn/ui (base-nova style, oklch theme), Lucide icons                                 |
| Database access      | Prisma 7 + `@prisma/adapter-pg` driver adapter, singleton in `src/lib/db`              |
| Auth foundation      | Better Auth 1.6 (`src/lib/auth`), mounted at `/api/auth/[...all]`, email+password      |
| Validation location  | `src/lib/validation` (Zod 4) — conventions only, no product schemas yet                |
| Data fetching client | TanStack Query installed (used where client-side server state is needed)               |
| Tables               | TanStack Table installed (for future admin data tables)                                |
| Charts               | Recharts installed (for future analytics)                                              |
| Forms                | React Hook Form installed (for future forms)                                           |
| Testing              | Vitest (unit) + Playwright (e2e) — smoke tests only                                    |
| Quality              | ESLint (flat config), Prettier, `pnpm lint/typecheck/format:check/test/test:e2e/build` |
| CI                   | GitHub Actions: install → prisma generate → lint → typecheck → format → unit tests     |

No product code (feedback, admin, analytics) exists yet, by design.

---

## 3. Directory Structure

### 3.1 Current

```text
src/
├── app/
│   └── api/auth/[...all]/route.ts   # Better Auth endpoints
├── components/ui/                    # shadcn/ui components
├── generated/prisma/                 # Generated Prisma Client (do not edit; gitignored)
├── lib/
│   ├── auth/index.ts                 # Better Auth configuration
│   ├── db/index.ts                   # Prisma Client singleton (lazy proxy)
│   ├── validation/index.ts           # Zod conventions (future schemas)
│   └── utils.ts                      # cn(), ...
├── services/                         # (empty — created with first service)
└── types/                            # (empty — created when needed)
```

### 3.2 Planned (Phase 3+)

```text
src/
├── app/
│   ├── (public)/                     # Patient-facing routes (feedback flow)
│   │   └── feedback/
│   ├── (admin)/                      # Administrator routes (dashboard, analytics, management)
│   ├── api/
│   │   ├── auth/[...all]             # Better Auth (exists)
│   │   ├── feedback/                 # Public feedback endpoint
│   │   └── admin/                    # Admin APIs (feedback, analytics, branches, ...)
│   ├── layout.tsx                    # Root layout (exists)
│   └── page.tsx                      # Landing page (exists)
├── components/
│   ├── ui/                           # shadcn/ui primitives (exists)
│   ├── feedback/                     # Patient flow components
│   ├── dashboard/                    # Admin dashboard components
│   ├── analytics/                    # Charts, metric cards
│   └── layout/                       # App shell, navigation
├── lib/
│   ├── auth/                         # Better Auth + session helpers (exists)
│   ├── db/                           # Prisma singleton (exists)
│   ├── security/                     # Rate limiting, masking, audit helpers
│   ├── validation/                   # Zod schemas, one file per feature (exists)
│   └── utils/                        # cn(), date helpers, ...
├── services/
│   ├── feedback/                     # Feedback service
│   ├── clinics/                      # Clinic/branch/service management
│   ├── analytics/                    # Aggregation queries
│   └── staff/                        # Staff management (if in MVP scope)
└── types/                            # Shared domain types
```

Only directories with a real purpose are created; feature folders are added
as their features are designed.

---

## 4. Architecture Layers

```text
┌──────────────────────────────────────────────────────────────┐
│ Presentation Layer   Next.js App Router · React · Tailwind ·  │
│                      shadcn/ui · Lucide                       │
├──────────────────────────────────────────────────────────────┤
│ API Layer            Next.js route handlers (/api/...)        │
├──────────────────────────────────────────────────────────────┤
│ Application Layer    Services (src/services) — business rules │
├──────────────────────────────────────────────────────────────┤
│ Validation Layer     Zod (src/lib/validation)                 │
├──────────────────────────────────────────────────────────────┤
│ Authentication Layer Better Auth (src/lib/auth)               │
├──────────────────────────────────────────────────────────────┤
│ Data Access Layer    Prisma Client (src/lib/db)               │
├──────────────────────────────────────────────────────────────┤
│ Persistence Layer    PostgreSQL                               │
└──────────────────────────────────────────────────────────────┘
```

### 4.1 Presentation Layer

Next.js App Router with React Server Components, Tailwind CSS v4, shadcn/ui
primitives, Lucide icons. Responsible for rendering, interaction, and
client-side state only — **no business rules, no direct database access from
client components.**

### 4.2 API Layer

Next.js route handlers expose a small, documented HTTP surface (see
[API.md](API.md)). Handlers are **thin**: validate input (Zod), authenticate
/ authorize, delegate to a service, map results to a predictable response
shape.

### 4.3 Application Layer (services)

Business logic lives in **services** under `src/services`, organized by
domain (feedback, clinics, analytics, staff). Rules:

- Route handlers and components **call services**; they do not implement
  business rules themselves.
- Services may call each other and the data-access layer, but not route
  handlers or UI.
- Each service exposes a typed, narrow interface.

```text
Route Handler
     ↓
Feedback Service (src/services/feedback)
     ↓
Prisma (src/lib/db)
     ↓
PostgreSQL
```

### 4.4 Validation Layer

All external input (API bodies, query params, forms) is validated at the
boundary with Zod schemas living in `src/lib/validation`, one file per
feature (`feedback.ts`, `auth.ts`, ...). Schemas export an inferred type
paired with the schema. The **server is always the final authority** —
client-side validation is convenience, not security.

### 4.5 Authentication Layer

Better Auth (email + password) for administrators. Already mounted at
`/api/auth/[...all]`. Patients do not authenticate. Authorization (who may do
what) is enforced **server-side** on every admin route and admin API call
(see [SECURITY.md](SECURITY.md) §Authorization).

### 4.6 Data Access Layer

A single lazy Prisma Client instance (`src/lib/db`) using the
`@prisma/adapter-pg` driver adapter. No other code creates Prisma Clients.

### 4.7 Persistence Layer

PostgreSQL, schema managed by Prisma migrations (see
[DATABASE.md](DATABASE.md)).

---

## 5. Server vs. Client

### 5.1 Use Server Components (RSC) for

- Initial dashboard data (secure database reads).
- Static content and the public feedback page shell.
- Anything that must not expose database queries or secrets to the browser.
- Server-side rendering and SEO-relevant pages.

### 5.2 Use Client Components for

- Interactive forms (React Hook Form).
- Charts requiring interaction (Recharts).
- Filters, dialogs, dropdowns, toggles.
- Browser APIs (localStorage, geolocation — none currently needed).
- Interactive tables (TanStack Table).

### 5.3 TanStack Query

Use TanStack Query only where **client-side server-state synchronization is
genuinely beneficial**:

- Interactive admin filters where results update without full page loads.
- Table pagination/search where round-trips are expected.
- Optimistic UI where a good user experience demands it.

Do **not** wrap every page in TanStack Query. Prefer server components and
server-side fetching for initial render; fetch client-side only when the UI
is genuinely interactive. This keeps the public feedback page light and fast.

---

## 6. Data Fetching & State Strategy

| Scenario                          | Approach                                           |
| --------------------------------- | -------------------------------------------------- |
| Public feedback page initial data | RSC fetches branches/services (server-side)        |
| Public form submission            | React Hook Form + server route handler (Zod)       |
| Admin dashboard initial load      | RSC with server-side queries (services)            |
| Admin filters / drill-downs       | TanStack Query (client) or server round-trips      |
| Analytics charts                  | Server-computed aggregates; Recharts for rendering |

Server-side data fetching uses the service layer; components never touch
Prisma directly.

---

## 7. Authentication & Authorization Architecture

```text
Browser ──POST /api/auth/sign-in──▶ Better Auth ──▶ Prisma (user, session, account)
   │
   └──(cookie)──▶ Admin route / API ──▶ Session check (server) ──▶ authorized?
```

- **Authentication** = verifying identity (Better Auth session cookie).
- **Authorization** = checking permissions (admin-only; future RBAC).
- Admin UI routes and `/api/admin/*` endpoints verify the session
  server-side on every request. Never trust client-side flags.
- A future middleware or server-side guard will protect the `(admin)` route
  group (see [API.md](API.md) §Admin API and [SECURITY.md](SECURITY.md)).

---

## 8. Error Handling Strategy

A consistent error model is defined in [API.md](API.md) §4 — that table is the
**single source of truth** for error codes and HTTP statuses (the summary
below is illustrative only):

| Error category | Example                       | HTTP status |
| -------------- | ----------------------------- | ----------- |
| Validation     | Invalid phone format          | 400         |
| Authentication | Missing/invalid session       | 401         |
| Authorization  | Not an admin                  | 403         |
| Not found      | Unknown branch id             | 404         |
| Business rule  | Service not offered at branch | 422         |
| Unexpected     | Internal error                | 500         |

Rules:

- Never expose Prisma stack traces, connection strings, or internal exception
  details to clients.
- Map known errors to the contract ([API.md](API.md) §4); log unexpected
  errors with a request id.
- The public feedback page shows friendly, generic messages on failure.

---

## 9. Analytics Architecture

```text
Feedback records (transactional)
        ↓
Service-layer aggregation (Prisma/SQL GROUP BY, filters, date range)
        ↓
Typed analytics DTOs
        ↓
Recharts / admin UI
```

- Analytics are **computed from transactional feedback data** via SQL
  aggregation. No data warehouse, event stream, or OLAP database in the MVP.
- All aggregations are parameterized (date range, branch, service, category)
  and always carry an explicit date range (PRD §10.5).
- Metric definitions (satisfaction %, thresholds) live in one typed module so
  they stay consistent everywhere (PRD §11).

---

## 10. Architectural Principles

1. **Server-first.** Do work on the server by default; push to the client
   only when interactivity requires it.
2. **Type safety.** Strict TypeScript; `any` only with a documented reason;
   domain types shared between services, APIs, and UI.
3. **Separation of concerns.** Presentation / API / application / data
   layers stay distinct.
4. **Explicit boundaries.** Route handlers are thin; services own rules;
   Prisma is accessed only via `src/lib/db`.
5. **Validation at external boundaries.** Every external input passes Zod.
6. **Authorization on the server.** Client-provided claims are never trusted.
7. **Centralized database access.** One Prisma Client instance.
8. **Reusable UI components.** shadcn/ui primitives + feature components;
   no copy-pasted markup.
9. **Modular domain services.** Services are organized by domain and keep
   their queries and rules together.
10. **Minimal infrastructure.** Add a service, queue, or cache only when a
    requirement demands it (PRD §4, §13).
11. **Observability-ready.** Structured logs with request ids, error
    boundaries, and no sensitive data in logs (see
    [SECURITY.md](SECURITY.md) and [DEPLOYMENT.md](DEPLOYMENT.md)).

---

## 11. Technology Rationale (why these choices)

| Choice                | Reason                                                                                       |
| --------------------- | -------------------------------------------------------------------------------------------- |
| Next.js 16 + RSC      | One codebase for UI, API, and server logic; RSC enables secure server-side data access.      |
| TypeScript strict     | Type safety across the whole system; catches errors early.                                   |
| Prisma 7 + adapter-pg | Modern Prisma architecture (driver adapters, `prisma-client` generator, `prisma.config.ts`). |
| Better Auth           | Server-side sessions, Prisma adapter, simple email+password for admins.                      |
| Zod                   | Boundary validation with inferred types.                                                     |
| TanStack Query        | Interactive client-server state where needed (not everywhere).                               |
| TanStack Table        | Admin data tables.                                                                           |
| Recharts              | Analytics charts.                                                                            |
| Vitest + Playwright   | Fast unit tests + real-browser e2e tests.                                                    |
| Tailwind v4 + shadcn  | Consistent, themeable UI with a component workflow.                                          |

---

## 12. Open Decisions

- **RBAC model:** single admin role vs. clinic-scoped roles — affects route
  guards and middleware design (see [PRD.md](PRD.md) §16).
- **Middleware vs. per-route guards** for admin protection (decided during
  implementation; both are viable with Next.js).
- **Server vs. client rendering of analytics pages** (RSC-first is proposed;
  heavy interactivity may push parts client-side).
- **Caching layer:** none in MVP; revisit only if dashboard queries become
  slow at scale (do not add Redis preemptively).
- **Rate-limiting implementation point** (application-level vs. platform
  edge) — see [API.md](API.md) and [DEPLOYMENT.md](DEPLOYMENT.md).
