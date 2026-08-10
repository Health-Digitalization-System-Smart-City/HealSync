# Database Design

**Document:** `database.md`
**Version:** 1.0
**Database:** PostgreSQL
**Provider:** Neon
**ORM:** Prisma

---

# 1. Database Architecture

PostgreSQL on **Neon** is the system of record.

```text
Next.js Server Actions
        ↓
Prisma ORM
        ↓
PostgreSQL (Neon)
```

The browser never connects directly to PostgreSQL.

---

# 2. Core Entities

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

Relationship overview:

```text
Role ───────< User

Branch ─────< BranchService >───── Service

Branch ─────< Feedback >────────── Service

User ───────< AuditLog
```

---

# 3. User

Represents an administrative dashboard user.

```text
User
├── id
├── email
├── passwordHash
├── roleId
├── isActive
├── createdAt
├── updatedAt
└── lastLoginAt
```

Rules:

* Email must be unique.
* Passwords must never be stored in plaintext.
* Disabled users cannot access the dashboard.
* Users belong to a role.
* Only authorized administrators can manage users.

---

# 4. Role

Represents an administrative access role.

```text
Role
├── id
├── name
├── description
├── createdAt
└── updatedAt
```

Examples:

```text
Admin
Manager
Analyst
```

Roles are fixed per `security.md` §2; the system does not support custom roles.

Roles should not be used as the only authorization mechanism.

Permissions should determine what a role can actually do.

---

# 5. Permission

Represents an individual capability.

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

analytics.read
analytics.ai

user.read
user.create
user.update
user.disable
```

Relationship:

```text
Role
  ↓
RolePermission
  ↓
Permission
```

This allows permissions to evolve without rewriting application logic.

---

# 6. Branch

Represents one clinic branch.

```text
Branch
├── id
├── name
├── code
├── isActive
├── createdAt
└── updatedAt
```

The system currently expects approximately **13 branches**.

Branches must be stored as database records rather than hard-coded in the frontend.

---

# 7. Service

Represents a service or department offered by the clinic.

```text
Service
├── id
├── name
├── description
├── isActive
├── createdAt
└── updatedAt
```

Services should be configurable by authorized users.

---

# 8. BranchService

A branch may offer multiple services, and a service may be available at multiple branches.

Therefore use a many-to-many relationship.

```text
Branch
   │
   ├── BranchService
   │
   └── Service
```

Example:

```text
Branch A
 ├── Laboratory
 ├── Pharmacy
 └── Reception

Branch B
 ├── Laboratory
 └── Pharmacy
```

Conceptual structure:

```text
BranchService
├── branchId
├── serviceId
├── isActive
├── createdAt
└── updatedAt
```

`branchId + serviceId` should be unique.

---

# 9. Feedback

The feedback table is the most important business entity.

```text
Feedback
├── id
├── phoneNumber
├── branchId
├── serviceId
├── rating
├── comment
├── createdAt
├── updatedAt
└── deletedAt
```

### Required

```text
phoneNumber
branchId
serviceId
rating
createdAt
```

### Optional

```text
comment
updatedAt
deletedAt
```

---

# 10. Phone Number Privacy

The patient's phone number is sensitive application data.

### Visibility rule

```text
Admin
  ↓
Can view phone number

Other dashboard roles
  ↓
Cannot view phone number

Patient
  ↓
Cannot view stored phone number

Public API/UI
  ↓
Never exposes phone number
```

The backend must enforce this rule.

Hiding the phone number only in the frontend is **not sufficient**.

---

# 11. Phone Number Storage

Store the normalized phone number rather than arbitrary user input.

Example:

```text
Input:
0912 345 678

Normalized:
+251912345678
```

The exact normalization rules should be finalized based on the clinic's supported country/number formats.

Phone numbers should have appropriate database indexing if they are used for duplicate detection or search.

---

# 12. Feedback Rating

The structured feedback should use a controlled set of values.

Example:

```text
VERY_SATISFIED
SATISFIED
MOSTLY_SATISFIED
GOOD
NEUTRAL
NOT_SATISFIED
POOR
VERY_POOR
```

The final list should be standardized before production.

Do not store arbitrary rating strings entered by clients.

---

# 13. Free-Text Feedback

`comment` stores the patient's original written feedback.

Rules:

* Optional.
* Must be validated for maximum length.
* Original text should be preserved.
* Never modify the original feedback because of AI analysis.
* AI analysis should be stored separately if persisted.

---

# 14. Feedback → Branch

Each feedback belongs to exactly one branch.

```text
Branch
   │
   └──< Feedback
```

A branch should not be physically deleted if historical feedback references it.

Prefer:

```text
isActive = false
```

This keeps historical analytics intact.

---

# 15. Feedback → Service

Each feedback belongs to the service selected by the patient.

The backend must verify:

```text
Selected Branch
       +
Selected Service
       ↓
Valid BranchService relationship
```

A patient must not be able to submit:

```text
Branch A + Service only offered at Branch B
```

---

# 16. Historical Data

Historical feedback must remain analyzable even when configuration changes.

Example:

```text
2026
Branch A
Laboratory
100 feedback records

↓ Service deactivated

2027

Historical records remain available.
```

Therefore:

* Prefer deactivation over deletion.
* Preserve foreign-key relationships.
* Avoid cascading deletes from Branch/Service into Feedback.

---

# 17. Soft Deletion

For important business records, prefer soft deletion/deactivation.

Potential fields:

```text
isActive
deletedAt
```

Use cases:

### Branch

```text
isActive = false
```

### Service

```text
isActive = false
```

### User

```text
isActive = false
```

### Feedback

Use `deletedAt` if the business requires deletion while retaining an audit trail.

### Data Retention (default policy)

Default retention rules:

```text
Branch / Service / User    never hard-deleted while historical records
                           reference them; deactivated with isActive = false

Feedback                   soft-deleted with deletedAt; physical deletion only
                           after the applicable retention period and
                           legal/compliance review

AuditLog                   retained for the organization's audit-retention
                           period
```

Final legal/compliance retention requirements remain an open product decision
(`PRD.md` §33 decision 15). The rules above are the technical default and must
be followed until a formal retention policy is approved. Server Actions such as
`deleteFeedback` (`API.md` §11) must follow this policy.

---

# 18. AuditLog

Administrative operations must be auditable.

```text
AuditLog
├── id
├── userId
├── action
├── entityType
├── entityId
├── metadata
├── createdAt
└── ipAddress
```

Examples:

```text
Admin created branch
Admin updated service
Admin deleted feedback
Admin created user
Admin changed user role
```

The exact metadata structure can evolve.

---

# 19. Audit Rules

Audit important mutations, especially:

```text
User creation
User disabling
Role changes

Branch creation
Branch update
Branch deletion/deactivation

Service creation
Service update
Service deletion/deactivation

Feedback update
Feedback deletion
```

Audit logs should not contain unnecessary sensitive patient information.

---

# 20. Database Constraints

Important constraints should be enforced at the database level where practical.

Examples:

```text
User.email             UNIQUE
Branch.code            UNIQUE
BranchService          UNIQUE(branchId, serviceId)
Role.name              UNIQUE
Permission.name        UNIQUE
```

Foreign keys should enforce valid relationships.

---

# 21. Indexing

Indexes should support the application's main queries.

Important candidates:

```text
Feedback.branchId
Feedback.serviceId
Feedback.createdAt
Feedback.rating

BranchService.branchId
BranchService.serviceId

User.email

AuditLog.userId
AuditLog.entityType
AuditLog.entityId
AuditLog.createdAt
```

Composite indexes should be added when query patterns justify them.

Do not add indexes blindly.

---

# 22. Analytics Query Model

The dashboard should query PostgreSQL using aggregation.

Example:

```text
Feedback
   ↓
WHERE branch/date/service filters
   ↓
GROUP BY
   ↓
COUNT / percentage / trends
   ↓
Analytics result
```

Do not retrieve every feedback record to the browser just to calculate statistics.

---

# 23. Core Analytics Metrics

The database/query layer should support:

### Volume

```text
Total feedback
Feedback per day
Feedback per week
Feedback per month
Feedback per year
```

### Satisfaction

```text
Rating distribution
Positive percentage
Negative percentage
Satisfaction rate
```

### Comparison

```text
Branch performance
Service performance
```

### Trends

```text
Daily trend
Weekly trend
Monthly trend
```

Metric definitions must remain consistent across the dashboard.

---

# 24. Transactions

Use Prisma transactions for operations that require multiple database changes to succeed together.

Example:

```text
Create Branch
    +
Create BranchService relationships
    +
Create AuditLog
```

All should succeed or fail together when atomicity is required.

---

# 25. Prisma Rules

Prisma should be the application's database access layer.

```text
Server Action
      ↓
Domain Service
      ↓
Prisma
      ↓
PostgreSQL
```

Do not:

* Use Prisma in Client Components.
* Expose Prisma to the browser.
* Put database credentials in client-exposed environment variables.
* Build raw SQL when Prisma can safely perform the operation.

Raw SQL may be used for specialized analytics queries when necessary, but it must be parameterized and reviewed.

---

# 26. Neon

Neon is the PostgreSQL hosting provider.

Environment configuration should keep database credentials server-only.

Conceptually:

```text
DATABASE_URL
```

must never be exposed through a `NEXT_PUBLIC_*` environment variable.

---

# 27. Migration Strategy

Database schema changes must use Prisma migrations.

Development:

```text
prisma migrate dev
```

Production:

```text
prisma migrate deploy
```

Never modify the production database schema manually when the change should be represented by a migration.

Every schema change should be committed to Git.

---

# 28. Seed Data

Development/staging environments should have seed data for:

* Roles
* Permissions
* Initial admin
* Example branches
* Example services
* Branch-service relationships
* Example feedback where appropriate

Production seed behavior must be handled carefully to avoid creating duplicate or unauthorized users.

---

# 29. Data Integrity Rules

The database must guarantee:

1. Every feedback belongs to a valid branch.
2. Every feedback belongs to a valid service.
3. The branch/service relationship is valid.
4. Ratings use approved values.
5. User emails are unique.
6. Roles and permissions are valid.
7. Historical feedback is not accidentally destroyed.
8. Administrative mutations can be audited.

---

# 30. Privacy Rules

Patient phone numbers:

* Must be stored server-side.
* Must never be exposed publicly.
* Must not be returned to unauthorized dashboard users.
* Must not appear in unnecessary logs.
* Must not be sent to AI providers unless explicitly required.
* Must not be included in analytics responses unless the requesting user has permission.

Free-text feedback may potentially contain personal or sensitive information, so it should receive similar protection.

---

# 31. AI Data Boundary

The database is the source of truth.

```text
PostgreSQL
     ↓
Required feedback data
     ↓
AI processing
     ↓
Structured insight
```

Do not send unnecessary information to the AI provider.

For example, the AI generally does not need:

```text
patient phone number
```

to determine:

```text
sentiment
themes
summary
```

Therefore phone numbers should be excluded from AI payloads by default.

---

# 32. Recommended Prisma Domain Model

Conceptually:

```text
User
 └── Role
      └── RolePermission
            └── Permission

Branch
 └── BranchService
      └── Service

Feedback
 ├── Branch
 ├── Service
 └── Rating

User
 └── AuditLog
```

The actual Prisma schema should implement these relationships with explicit foreign keys and appropriate indexes.

---

# 33. AI Agent Database Rules

AI coding agents must:

1. Read `PRD.md`.
2. Read `Architecture.md`.
3. Read `API.md`.
4. Read `database.md` before changing the schema.
5. Use Prisma migrations for schema changes.
6. Never expose `phoneNumber` to unauthorized roles.
7. Never delete historical feedback accidentally.
8. Add indexes based on actual query requirements.
9. Use transactions for atomic multi-write operations.
10. Update `database.md` when the schema's intended behavior changes.

---

# 34. Database Source of Truth

```text
PRD.md
   ↓
Business requirements

database.md
   ↓
Data model + integrity rules

schema.prisma
   ↓
Actual implementation

Prisma migrations
   ↓
Database evolution
```

`schema.prisma` and migrations are the executable database implementation; `database.md` explains the intended design and rules.
