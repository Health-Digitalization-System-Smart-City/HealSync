# Security

**Document:** `security.md`
**Version:** 1.0
**Status:** Draft

## 1. Security Model

The system uses:

```text
Authentication → Authorization → Validation → Business Logic → Database
```

Security is enforced **server-side**. Client-side restrictions are only for UI.

---

# 2. Roles

The system has three predefined roles:

| Role        | Access                                            |
| ----------- | ------------------------------------------------- |
| **Admin**   | Full system access                                |
| **Manager** | Dashboard + analytics + permitted feedback access |
| **Analyst** | Dashboard + analytics                             |

Roles are fixed. Admins cannot create custom roles.

---

# 3. Permission Model

Use RBAC with predefined permissions.

```text
User → Role → Permissions
```

Example permissions:

```text
analytics.read

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
```

The exact permission matrix must be defined in the application seed/configuration and must not be editable through the dashboard.

---

# 4. Admin Privileges

Admin is the only role with full system management access.

Admin can:

* Create dashboard users
* Disable users
* Manage branches
* Manage services
* View all feedback
* Update/delete feedback
* View all analytics
* Access patient phone numbers
* Manage system configuration

Only Admin can register new dashboard users.

Admin creates dashboard users through the `createUser` Server Action
(`API.md` §14); public self-registration is disabled at the auth layer
(§9).

---

# 5. Manager

Manager can access operational dashboard functionality according to the predefined permission set.

Manager:

* Can view dashboard analytics
* Can view permitted feedback
* Cannot create dashboard users
* Cannot access patient phone numbers
* Cannot manage roles
* Cannot grant permissions
* Cannot perform Admin-only system operations

---

# 6. Analyst

Analyst is primarily read-only.

Analyst:

* Can view dashboard
* Can view analytics
* Can view permitted aggregated feedback data
* Cannot create users
* Cannot manage branches
* Cannot manage services
* Cannot delete feedback
* Cannot access patient phone numbers

---

# 7. Patient Access

Patients do not create accounts.

The public feedback flow allows:

```text
Phone Number
     ↓
Branch
     ↓
Service
     ↓
Rating / Text Feedback
     ↓
Submit
```

Patients can only create feedback.

They cannot:

* View existing feedback
* View analytics
* Access dashboard data
* Access other patients' information
* Modify administrative configuration

---

# 8. Phone Number Protection

Patient phone numbers are restricted data.

```text
Admin      → Visible
Manager    → Hidden
Analyst    → Hidden
Patient    → Hidden
Public     → Never exposed
```

This restriction must be enforced in server-side data access.

Do not fetch the phone number and merely hide it in React.

Prefer role-specific database queries/selects that do not return the field to unauthorized users.

---

# 9. Authentication

Dashboard users authenticate using:

```text
Email + Password
```

The project uses **Better Auth** (`better-auth`) as its authentication library.
It is configured in `src/lib/auth/index.ts`, and its endpoints are mounted
under `/api/auth/*` by the catch-all route handler in
`src/app/api/auth/[...all]/route.ts` (see `API.md` §30).

Requirements:

* Passwords must be securely hashed (handled by Better Auth).
* Passwords must never be stored in plaintext.
* Sessions must be securely managed (Better Auth session cookies).
* Disabled users cannot authenticate/access protected resources.
* Authentication state must be verified server-side — resolve the session with
  the auth library on the server; never trust session/role claims from the
  client.

Configuration notes:

* `BETTER_AUTH_SECRET` — required; signs session cookies and tokens. Never
  expose it through `NEXT_PUBLIC_*` (see `.env.example`).
* `BETTER_AUTH_URL` — public base URL of the application (no trailing slash).
* Auth data (users, sessions, accounts) is stored in PostgreSQL via the Prisma
  adapter (`src/lib/db`).
* Use Better Auth's documented configuration to extend behavior; do not build
  custom session logic.

### Dashboard user provisioning

Only Admin can create dashboard users. Public self-registration is disabled;
there is no open `/api/auth/sign-up/email` path.

Flow:

```text
Setup / seed   →  initial Admin created by a controlled bootstrap, never by a
                  public request (seed data in dev/staging; one-time bootstrap
                  in production)

Admin          →  createUser Server Action (requires user.create)
                    ↓
                    validate input (Zod): email, password, roleId
                    ↓
                    create the auth user server-side via the auth library's
                    admin API (bypasses disableSignUp; caller must be Admin)
                    ↓
                    assign one of the fixed roles (Admin / Manager / Analyst)
                    ↓
                    write an AuditLog record
                    ↓
                    return a safe result (never the raw password)
```

Rules:

* Configure `emailAndPassword.disableSignUp = true` (`src/lib/auth/index.ts`)
  so unauthenticated clients cannot self-register. Sign-in via
  `/api/auth/sign-in/email` remains available to all dashboard users.
* The `createUser` Server Action (`API.md` §14) is the only path for creating
  dashboard users. It must verify the Admin session and the `user.create`
  permission server-side; never trust client-provided roles or permissions.
* Role assignment uses the fixed role set (§2). Users start active
  (`isActive = true`); they can be disabled later via `disableUser`
  (`API.md` §14).
* The auth library's admin API requires its admin plugin to be enabled with
  Admin as the admin role; without it, server-side user creation is not
  available.
* Every user creation is audited (§18).

---

# 10. Authorization

Every protected Server Action must verify authorization.

```text
Server Action
    ↓
Authenticated?
    ↓
Correct Permission?
    ↓
Execute
```

Never trust:

```text
role
userId
permission
isAdmin
```

when supplied by the client.

These values must come from the authenticated server-side session/database.

---

# 11. Server Action Security

Every Server Action must:

1. Validate input.
2. Authenticate the caller when required.
3. Check permissions.
4. Verify resource ownership/access where applicable.
5. Perform the operation server-side.
6. Return safe errors.

Example:

```text
deleteFeedback(id)
       ↓
requireAuth()
       ↓
requirePermission("feedback.delete")
       ↓
validate id
       ↓
delete
       ↓
audit
```

---

# 12. Input Validation

All external input must be validated server-side.

Use Zod for:

* Phone numbers
* IDs
* Ratings
* Comments
* Dates
* Filters
* User information
* Branch/service data

Client-side validation improves UX but is never a security control.

---

# 13. Phone Number Handling

Phone numbers must be:

* Normalized before storage.
* Validated server-side.
* Excluded from unauthorized responses.
* Excluded from unnecessary logs.
* Excluded from AI requests by default.

Searching by phone number must require Admin authorization.

---

# 14. Feedback Protection

Public feedback submission must be protected against abuse.

Controls should include:

* Rate limiting
* Input validation
* Maximum comment length
* Request throttling
* Duplicate-submission protection where appropriate

Do not rely on the phone number alone as an authentication mechanism.

### Default rate-limiting policy

Concrete limits for the public `submitFeedback` action (`API.md` §11):

```text
Per-IP sliding window     10 submissions / 10 minutes
Request payload cap       16 KB
Comment length cap        1,000 characters
```

Platform-level limits may be applied at the edge in addition to the
application-layer limits above. The limits are tuned based on observed abuse;
any change must be documented here.

---

# 15. CSRF / Request Security

Server Actions must use the security mechanisms provided by Next.js and the application's authentication/session implementation.

Sensitive mutations must not be exposed through an uncontrolled client-side endpoint.

---

# 16. Database Security

Database access is server-only.

```text
Browser
   ✕
   │
   │ direct database access prohibited
   ▼
Next.js Server
   ↓
Prisma
   ↓
Neon PostgreSQL
```

Never expose:

```text
DATABASE_URL
database credentials
Prisma client
```

to the browser.

Never use `NEXT_PUBLIC_` for secrets.

---

# 17. Database Authorization

Application authorization must happen before sensitive queries/mutations.

Example:

```text
Manager requests feedback
        ↓
Permission check
        ↓
Query excludes phoneNumber
        ↓
Return safe data
```

Security must not depend only on UI visibility.

---

# 18. Audit Logging

Sensitive administrative operations must create an audit record.

Audit:

* User creation
* User disabling
* Branch changes
* Service changes
* Feedback updates
* Feedback deletion
* Permission-sensitive actions

Audit records should include:

```text
actor
action
resource
resourceId
timestamp
metadata
```

Avoid storing unnecessary patient information in audit metadata.

---

# 19. Data Deletion

Do not physically delete branches or services when doing so would destroy historical relationships.

Prefer:

```text
isActive = false
```

for configuration entities.

Feedback deletion must follow the retention policy and must be auditable.

---

# 20. AI Security

AI is not an authorization layer.

Before sending data to an AI provider:

```text
Authenticate
    ↓
Authorize
    ↓
Select required data
    ↓
Remove unnecessary sensitive data
    ↓
AI provider
```

Patient phone numbers must not be sent to AI unless a future documented requirement explicitly requires it.

AI output must never directly perform privileged database operations without server-side authorization and validation.

---

# 21. Secrets

Secrets must be stored in environment variables/secrets management.

Examples:

```text
DATABASE_URL
AUTH_SECRET
AI_API_KEY
```

Never commit secrets to Git.

Never expose secrets through:

```text
NEXT_PUBLIC_*
```

Never include secrets in logs.

---

# 22. Error Handling

Do not expose internal details to users.

Bad:

```text
PrismaClientKnownRequestError:
Unique constraint failed on ...
DATABASE_URL=...
```

Good:

```text
Something went wrong. Please try again.
```

Detailed errors belong in secure server logs.

---

# 23. Logging

Logs must not contain:

* Passwords
* Session tokens
* API keys
* Full phone numbers
* Unnecessary patient feedback
* Database credentials

Use request IDs and structured logs for debugging.

---

# 24. Security Headers

Production deployment should use appropriate security headers, including where applicable:

```text
Content-Security-Policy
X-Content-Type-Options
Referrer-Policy
Strict-Transport-Security
```

Configuration should be tested against the actual Next.js deployment environment.

---

# 25. Dependency Security

The team must:

* Keep dependencies updated.
* Review security advisories.
* Avoid unnecessary dependencies.
* Commit lockfile changes.
* Run dependency/security checks in CI where practical.

---

# 26. Security Testing

Before production, test at minimum:

```text
Authentication
Authorization
Role restrictions
Phone-number protection
Public feedback abuse
Input validation
Session handling
Admin-only operations
Database access
```

Important negative tests:

```text
Manager → access phone number       ❌
Analyst → delete feedback           ❌
Manager → create user               ❌
Analyst → create branch             ❌
Unauthenticated → dashboard         ❌
Anonymous → self-register           ❌
Patient → view feedback             ❌
Patient → view analytics            ❌
```

---

# 27. Security Rules for AI Agents

AI coding agents must:

1. Never bypass authorization.
2. Never expose `phoneNumber` to Manager or Analyst.
3. Never expose secrets to client code.
4. Never access Prisma from Client Components.
5. Never trust client-provided roles or permissions.
6. Validate all external input.
7. Preserve audit logging for sensitive mutations.
8. Avoid sending unnecessary patient data to AI services.
9. Never weaken security to make a feature "work."
10. Update `security.md` when a security requirement changes.

---

# 28. Security Principle

The system follows:

```text
Least Privilege
+
Server-Side Authorization
+
Data Minimization
+
Secure Defaults
+
Auditability
```

Security decisions must remain consistent with `PRD.md`, `Architecture.md`, `API.md`, and `database.md`.
