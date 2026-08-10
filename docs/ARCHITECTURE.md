# Architecture

**Document:** `Architecture.md`
**Version:** 1.0
**Status:** Draft

## 1. Architecture Overview

The system is a **Next.js full-stack application** backed by **PostgreSQL**.

```text
                    ┌─────────────────────┐
                    │     Patient UI       │
                    │   Mobile / Web       │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │      Next.js        │
                    │                     │
                    │  UI / Server Actions │
                    │  Route Handlers      │
                    │  Auth                │
                    │  Business Logic      │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
        PostgreSQL        Analytics          AI Service
                              Engine          (optional)
              │                │                │
              └────────────────┼────────────────┘
                               ▼
                    ┌─────────────────────┐
                    │   Admin Dashboard   │
                    └─────────────────────┘
```

---

# 2. Core Stack

| Layer           | Technology          |
| --------------- | ------------------- |
| Framework       | Next.js             |
| Language        | TypeScript          |
| UI              | React               |
| Styling         | Tailwind CSS        |
| Components      | shadcn/ui           |
| Database        | PostgreSQL          |
| ORM             | Prisma              |
| Authentication  | Email + Password    |
| Validation      | Zod                 |
| Charts          | Recharts            |
| Testing         | Vitest + Playwright |
| Package Manager | pnpm                |

AI provider is intentionally abstracted so the application is not tightly coupled to one provider.

---

# 3. Application Structure

Use a modular structure based on **domain boundaries**, not one large collection of generic utilities.

```text
src/
├── app/
│   ├── (public)/
│   │   └── feedback/
│   ├── (auth)/
│   │   └── login/
│   ├── dashboard/
│   └── api/
│
├── features/
│   ├── feedback/
│   ├── branches/
│   ├── services/
│   ├── analytics/
│   ├── users/
│   └── ai-insights/
│
├── server/
│   ├── auth/
│   ├── db/
│   ├── permissions/
│   └── services/
│
├── components/
├── lib/
└── types/
```

The exact folder structure may evolve, but domain boundaries should remain clear.

---

# 4. Request Flow

## Patient Feedback

```text
Patient
  ↓
Next.js UI
  ↓
Server Action / Route Handler
  ↓
Validation
  ↓
Business Logic
  ↓
PostgreSQL
  ↓
Success Response
```

The browser must never directly access PostgreSQL.

---

## Dashboard

```text
Admin
  ↓
Authentication
  ↓
Authorization
  ↓
Dashboard UI
  ↓
Server-side data access
  ↓
Analytics queries
  ↓
PostgreSQL
  ↓
Charts / KPIs
```

Authorization must happen server-side.

---

# 5. Authentication

Administrative users authenticate using:

```text
Email + Password
```

Patients do **not** need accounts for feedback submission.

Authentication responsibilities:

* Password hashing
* Login
* Logout
* Session management
* Password reset
* Account disabling
* Session expiration

Authentication implementation details belong in `security.md`.

---

# 6. Authorization

Use **RBAC + permissions**.

```text
User
  ↓
Role
  ↓
Permissions
```

Example:

```text
Admin
 ├── users.*
 ├── branches.*
 ├── services.*
 ├── feedback.*
 └── analytics.*

Manager
 ├── analytics.read
 └── feedback.read
```

The frontend may hide unavailable actions, but the backend must always enforce permissions.

---

# 7. Core Domains

## Feedback

Responsible for:

* Patient feedback submission
* Structured ratings
* Free-text feedback
* Feedback retrieval
* Feedback modification/deletion

---

## Branches

Responsible for:

* Branch creation
* Branch updates
* Branch activation/deactivation
* Branch-service relationships

---

## Services

Responsible for:

* Service management
* Branch availability
* Service activation/deactivation

---

## Analytics

Responsible for:

* Aggregations
* Satisfaction metrics
* Branch comparisons
* Service comparisons
* Time-based trends

Analytics should calculate metrics from authoritative database data.

---

## Users

Responsible for:

* Dashboard users
* Roles
* Permissions
* Account status

---

## AI Insights

Responsible for:

* Sentiment analysis
* Feedback categorization
* Theme detection
* Summaries
* Management insights

AI should consume feedback/analytics data but must not become the source of truth.

---

# 8. Database Architecture

PostgreSQL is the system of record.

Core entities:

```text
User
Role
Permission

Branch
Service
BranchService

Feedback
FeedbackRating

AuditLog
```

Additional tables may be introduced when required by the finalized database design.

Detailed schema belongs in `database.md`.

---

# 9. Analytics Architecture

Analytics should primarily use **database aggregation queries**.

```text
Feedback
   ↓
SQL Aggregations
   ↓
Analytics Service
   ↓
Dashboard
```

Examples:

* Feedback count
* Satisfaction percentage
* Branch performance
* Service performance
* Daily/weekly/monthly trends

Do not send all feedback records to the browser and calculate everything client-side.

---

# 10. AI Architecture

AI is a secondary analysis layer.

```text
PostgreSQL
    ↓
Feedback / Analytics
    ↓
AI Service
    ↓
Structured AI Result
    ↓
Dashboard
```

AI results should be:

* Structured
* Traceable to source data
* Versionable where necessary
* Clearly labeled as AI-generated

AI failures must not break normal feedback collection or core analytics.

---

# 11. Data Ownership

| Domain      | Source of Truth                |
| ----------- | ------------------------------ |
| Users       | PostgreSQL                     |
| Roles       | PostgreSQL                     |
| Permissions | PostgreSQL                     |
| Branches    | PostgreSQL                     |
| Services    | PostgreSQL                     |
| Feedback    | PostgreSQL                     |
| Analytics   | PostgreSQL + analytics queries |
| AI insights | AI service + stored metadata   |

---

# 12. Security Boundaries

```text
Browser
   │
   │ Untrusted
   ▼
Next.js Server
   │
   │ Validate + Authorize
   ▼
Domain Services
   │
   ▼
PostgreSQL
```

Rules:

* Never trust client input.
* Validate server-side.
* Never expose database credentials to the browser.
* Never perform authorization only in React.
* Use parameterized/ORM queries.
* Protect administrative routes.
* Audit sensitive administrative actions.

Detailed security rules belong in `security.md`.

---

# 13. Error Handling

Use a consistent error model.

```text
Validation Error
Authentication Error
Authorization Error
Not Found
Conflict
Rate Limit
Internal Error
```

The application should return safe errors to users while logging useful diagnostic information server-side.

---

# 14. Observability

The application should provide:

* Structured server logs
* Error tracking
* Request IDs
* Authentication/security event logs
* Audit logs
* Database error visibility
* AI processing error visibility

Patient phone numbers and feedback content should not be unnecessarily written to logs.

---

# 15. Performance Principles

### Patient flow

Optimize for:

```text
Fast page load
→ Fast validation
→ Fast submission
```

### Dashboard

Use:

* Server-side aggregation
* Pagination
* Appropriate database indexes
* Filtered queries
* Caching where justified

Do not prematurely introduce Redis, queues, microservices, or separate workers unless actual requirements justify them.

---

# 16. Deployment Model

Initial deployment should remain simple:

```text
                Internet
                   │
                   ▼
             Next.js App
                   │
             ┌─────┴─────┐
             ▼           ▼
        PostgreSQL      AI API
```

The application should be deployable as a **single Next.js application**.

Infrastructure should be separated only when there is a concrete operational need.

---

# 17. Architecture Principles

### 1. Modular monolith

Start with a modular monolith rather than microservices.

### 2. Server-first

Sensitive business logic and database operations remain server-side.

### 3. Domain-oriented

Organize code around business domains.

### 4. Database as source of truth

Analytics and AI derive from authoritative database data.

### 5. Least privilege

Users receive only required permissions.

### 6. Simple infrastructure

Avoid unnecessary services until scale requires them.

### 7. Replaceable AI

AI providers should be abstracted behind an application-level interface.

### 8. API contracts first

Frontend and backend boundaries should use explicit, documented contracts.

---

# 18. Architecture Decision Summary

| Decision           | Choice                        |
| ------------------ | ----------------------------- |
| Architecture       | Modular monolith              |
| Application        | Next.js full-stack            |
| Language           | TypeScript                    |
| Database           | PostgreSQL                    |
| ORM                | Prisma                        |
| Authentication     | Email + password              |
| Authorization      | RBAC + permissions            |
| Patient accounts   | No                            |
| Dashboard accounts | Yes                           |
| Analytics          | Server/database-driven        |
| AI                 | Separate provider abstraction |
| Initial deployment | Single application            |
| Microservices      | No                            |
| Redis              | Not required initially        |
| Background workers | Not required initially        |

---

# 19. AI Agent Rules

AI coding agents working on this repository must:

1. Read `PRD.md` before implementing product functionality.
2. Read `Architecture.md` before changing architecture.
3. Preserve the modular-monolith approach unless a documented requirement changes it.
4. Keep database access server-side.
5. Enforce authorization server-side.
6. Keep domain logic separated.
7. Avoid introducing unnecessary infrastructure.
8. Update relevant documentation when architectural decisions change.
9. Never silently introduce a new external service for functionality that can reasonably remain inside the application.
10. Prefer the simplest architecture that satisfies the documented requirements.
