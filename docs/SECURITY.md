# HealSync — Security & Privacy

**Status: Draft — Phase 2 (design; Phase 1 principles verified in the
foundation)**

HealSync handles **healthcare-related feedback and personal information**
(patient phone numbers, free-text comments, clinic/staff data, admin
accounts). This document defines the security model and must be taken
seriously.

Related: [PRD.md](PRD.md) · [ARCHITECTURE.md](ARCHITECTURE.md) ·
[DATABASE.md](DATABASE.md) · [API.md](API.md) · [DEPLOYMENT.md](DEPLOYMENT.md)

---

## 1. Compliance Statement

> HealSync does **not** claim HIPAA, GDPR, or any other legal compliance.
> Compliance requirements depend on the deployment jurisdiction, clinic
> contracts, data-processing arrangements, and the exact information
> collected. A formal compliance assessment is a prerequisite before
> production deployment in any jurisdiction.

Design intent: HealSync aims to follow **privacy-by-design and
security-by-design** principles (data minimization, least privilege,
encryption in transit/at rest, access control, auditability) so that a
compliance assessment has a solid foundation.

---

## 2. Assets & Trust Boundaries

### 2.1 Assets to protect

| Asset                            | Sensitivity                                 |
| -------------------------------- | ------------------------------------------- |
| Patient phone numbers            | High (PII) — see §6                         |
| Feedback comments                | High (may contain health-adjacent context)  |
| Admin credentials & sessions     | High                                        |
| Clinic/branch/service/staff data | Medium (operational)                        |
| Analytics aggregates             | Low–medium (no personal data in aggregates) |

### 2.2 Trust boundaries

```text
Internet ──▶ Public feedback endpoint (POST /api/feedback)      [unauthenticated]
Internet ──▶ Auth endpoints (/api/auth/*)                       [authentication]
Internet ──▶ Admin UI + /api/admin/*                            [authenticated + authorized]
                    │
                    ▼
Application services ──▶ Prisma ──▶ PostgreSQL                  [server-side only]
```

- The patient boundary is **public by design** — it is protected by
  validation + rate limiting, not by authentication.
- The admin boundary is protected by **authentication** (Better Auth) and
  **authorization** (server-side).
- The database is reachable **only** through the application layer.

---

## 3. Threat Model

| Threat                                   | Mitigation                                                                                                                                         | Status        |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| Unauthorized admin access                | Better Auth sessions; server-side session checks on every admin route/API                                                                          | Design        |
| Brute-force login                        | Better Auth rate limiting; strong secret; monitoring                                                                                               | Design/config |
| Fake / spam feedback submissions         | Input validation, payload caps, rate limiting; CAPTCHA as post-MVP fallback                                                                        | Design        |
| Automated spam flooding the endpoint     | Per-IP rate limits at app + edge; abuse monitoring                                                                                                 | Design        |
| Malicious input (injection)              | Zod validation at boundary; parameterized Prisma queries (no string SQL)                                                                           | Design        |
| SQL injection                            | Prisma ORM with parameterized queries; no raw SQL without review                                                                                   | Built-in      |
| XSS (stored in comments)                 | React escapes output by default; comments rendered as plain text; never `dangerouslySetInnerHTML`                                                  | Design        |
| CSRF                                     | SameSite cookies (Better Auth defaults); state-changing endpoints only via POST with validation; no cookie-based mutations from cross-site origins | Design/config |
| IDOR (accessing others' data)            | Server-side ownership checks (e.g., branch-scoped admins); opaque ids; never trust client ids                                                      | Design        |
| Information leakage / excessive exposure | Masked phone by default; analytics return aggregates only; error contract hides internals                                                          | Design        |
| Credential theft                         | HTTPS everywhere; hashed passwords (Better Auth); secret management; no secrets in code                                                            | Design/config |
| Session theft                            | Signed, httpOnly, Secure cookies; short-lived sessions; rotation on privilege change                                                               | Config        |
| Abuse of public feedback endpoint        | §8 rate limiting + validation                                                                                                                      | Design        |
| Supply chain (dependency compromise)     | Lockfile (`pnpm-lock.yaml`), pinned CI Node/pnpm, dependency update policy                                                                         | In place      |

---

## 4. Authentication vs. Authorization

```text
Authentication = Who are you?        (Better Auth session)
Authorization  = What are you allowed to do?   (server-side permission checks)
```

- **Authentication** exists today (Better Auth, email + password, admin
  users).
- **Authorization** does **not** exist yet and is deliberately deferred.
  Principle: merely being authenticated grants **no** implicit permissions.
- A future **RBAC** model may distinguish e.g. _platform admin_ vs.
  _branch manager_ (see [PRD.md](PRD.md) §16). Until then, the single admin
  role must still pass explicit server-side checks on every admin entry
  point.

**Rules for Phase 3 implementation:**

- Every `/api/admin/*` handler and every `(admin)` route verifies the session
  server-side.
- Never trust client-provided flags (`isAdmin: true`), role strings, or ids.
- Admin pages never render phone numbers or sensitive fields to unauthorized
  roles; masking is enforced server-side, not just in the UI.

---

## 5. Patient Data & Data Minimization

### 5.1 Principle

**Collect only what the product requires** (PRD §6). The MVP collects:

1. Branch + service (operational context),
2. Phone number (contact/follow-up; PII),
3. Overall rating + optional comment.

Nothing else. No names, no email, no medical details, no account.

### 5.2 Phone number — full treatment (see also DATABASE.md §5)

| Aspect        | Policy (proposed)                                                                                                                           |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **Storage**   | Normalized (E.164) in the database; storage form (raw vs. hashed vs. encrypted) is an **open decision** — see [DATABASE.md](DATABASE.md) §5 |
| **Access**    | Only authenticated admins; masked by default in every UI/API response                                                                       |     | **Masking** | E.g. `+20 ••• ••• 1234`; raw value requires explicit, authorized request, and such access is recorded as an audit/access event (see [DATABASE.md](DATABASE.md) §3.7 `AuditLog`) |
| **Logging**   | **Never log raw phone numbers.** Logs may contain a masked form or a request id only                                                        |
| **Retention** | Defined retention period (open decision); automatic deletion per policy                                                                     |
| **Deletion**  | Feedback/phone deletion must support data-subject deletion requests; admin deletion is audited                                              |

### 5.3 Comments

- Treated as sensitive content.
- Stored as plain text; rendered escaped (no HTML).
- Length-capped; scanned (post-MVP) for PII before analytics display.

---

## 6. Public Feedback Endpoint Protection

`POST /api/feedback` is intentionally public; protections:

| Control           | Proposal (see [API.md](API.md) §8)                             |
| ----------------- | -------------------------------------------------------------- |
| Rate limiting     | Per-IP sliding window (app layer) + edge limits (platform)     |
| Input validation  | Zod; allowed values bound to the actual branch/service catalog |
| Payload limits    | Body size cap; comment length cap                              |
| Duplicate control | Optional phone-hash dedupe (post-MVP)                          |
| CAPTCHA           | Post-MVP option only; never require patient accounts           |
| Abuse detection   | Spike monitoring (post-MVP)                                    |

---

## 7. Logging Policy

**Never log:**

- raw phone numbers;
- authentication secrets / session tokens / passwords;
- sensitive feedback content unnecessarily;
- full request bodies containing PII.

**Do log (production):**

- request ids (correlate errors across the stack);
- errors (with request id, route, error class — no stack internals to
  clients, stacks to logs only);
- security events (failed logins, auth failures, rate-limit hits,
  unauthorized-access attempts);
- operational metrics (latency, error rate, feedback volume).

Logs are server-side only; nothing sensitive reaches the browser console.

---

## 8. Application Security Checklist (Phase 3 gate)

Before any admin or feedback feature ships:

- [ ] All external input passes Zod validation at the boundary
- [ ] All admin routes/APIs verify session server-side
- [ ] IDOR tests: client-supplied ids cannot reach others' data
- [ ] Phone numbers masked in all responses by default
- [ ] Error responses never expose internals (verified by tests)
- [ ] No raw SQL except via reviewed Prisma queries
- [ ] Comments render as escaped plain text (no XSS)
- [ ] Cookies: httpOnly, Secure, SameSite (production)
- [ ] No sensitive data in URLs, logs, or analytics payloads
- [ ] Rate limiting active on the public endpoint
- [ ] Audit log records admin mutations

---

## 9. Secrets & Configuration

Phase 1 already enforces:

- Secrets only in environment variables (`.env`, gitignored); `.env.example`
  holds placeholders only.
- `BETTER_AUTH_SECRET` required (Better Auth refuses to run without it).
- CI uses non-functional placeholder values — never real credentials.

Production secret management is covered in
[DEPLOYMENT.md](DEPLOYMENT.md) §5.

---

## 10. Open Decisions

- Phone storage strategy (raw / hashed / encrypted / optional) —
  see [DATABASE.md](DATABASE.md) §5.
- Which roles can view raw phone numbers (depends on RBAC design).
- Retention periods for feedback, comments, and phone numbers.
- RBAC design (roles, scope, delegation).
- Whether comment content is ever included in analytics/AI summaries and
  under what minimization.
- CAPTCHA / abuse-control trigger thresholds.
- Whether a formal privacy policy / patient consent notice is required by
  the deployment jurisdiction.
