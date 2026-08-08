# HealSync — Deployment & Operations

**Status: Draft — Phase 2 (design; deployment not yet configured)**

This document describes how HealSync runs in production. It is a design —
no deployment infrastructure has been set up yet. The foundation currently
runs locally (`pnpm dev`) with CI in GitHub Actions.

Related: [ARCHITECTURE.md](ARCHITECTURE.md) (modular monolith) ·
[API.md](API.md) (public surface) · [SECURITY.md](SECURITY.md) (protection) ·
[DATABASE.md](DATABASE.md) (migrations) · [CONTRIBUTING.md](../CONTRIBUTING.md)
(CI expectations)

---

## 1. Deployment Architecture (initial target)

```text
GitHub (source + CI/CD)
   ↓
Vercel (Next.js application)
   ├── Patient UI & Admin UI
   ├── API route handlers (incl. /api/auth/*, /api/feedback, /api/admin/*)
   └── Authentication (Better Auth runs inside the application)
        ↓
PostgreSQL (managed database)
```

Key properties:

- **One deployable unit:** the Next.js application. No separate API server.
- **Authentication runs inside the app** (Better Auth sessions are
  application-level; the database stores users/sessions).
- **Prisma connects to PostgreSQL** using the `@prisma/adapter-pg` driver
  adapter (already configured).
- **PostgreSQL provider is undecided** (managed options such as Neon,
  Supabase, RDS, or self-hosted are all viable) — see §7.

---

## 2. Environments

| Environment     | Purpose                                  | Notes                                                         |
| --------------- | ---------------------------------------- | ------------------------------------------------------------- |
| **Development** | Local: `pnpm dev`, local PostgreSQL      | Real `.env` from `.env.example`; migrations via `migrate dev` |
| **Staging**     | Pre-production validation (mirrors prod) | **Not set up yet**; recommended before production             |
| **Production**  | Real clinics and data                    | Strict env isolation, backups, monitoring                     |

Differences to define when staging is created: separate database, separate
env vars, deploy-on-merge-to-`main` (or a release branch), and e2e smoke
tests run against staging.

---

## 3. Environment Variables

Only variables actually used by the project are listed (nothing invented):

| Variable             | Scope  | Secret | Notes                                                         |
| -------------------- | ------ | ------ | ------------------------------------------------------------- |
| `DATABASE_URL`       | Server | Yes    | PostgreSQL connection string (Prisma, via `prisma.config.ts`) |
| `BETTER_AUTH_SECRET` | Server | Yes    | Signs session cookies/tokens; **required**; ≥ 32 chars        |
| `BETTER_AUTH_URL`    | Server | Yes*   | Public base URL; must be the deployed origin                  |

- `BETTER_AUTH_URL` is not secret data but must match the public origin, so
  it is treated as server-side config.
- There are **no `NEXT_PUBLIC_*` variables** in the project today. If any are
  ever needed, they must be explicitly public and never contain secrets.
- Each environment gets its own values; production values live in the
  platform's secret store, never in the repository.

---

## 4. Database Deployment

### 4.1 Migrations

- Migrations are versioned in `prisma/migrations/` (see
  [DATABASE.md](DATABASE.md) §10).
- **Local/staging:** `pnpm prisma migrate dev`
- **Production:** `pnpm prisma migrate deploy` — applied as part of the
  release pipeline **before** the new application code serves traffic.
- **Ordering:** apply migrations → then deploy code → then run post-deploy
  checks. Never let new code run against an un-migrated schema.

### 4.2 Connection management

- One Prisma Client instance per runtime (singleton, see
  [ARCHITECTURE.md](ARCHITECTURE.md) §4.6), using the `@prisma/adapter-pg`
  pool. Pool size is provider-dependent; start with defaults and tune from
  production metrics.

### 4.3 Backups & restore

- Backups are the **provider's responsibility** when using a managed
  PostgreSQL service; verify scheduled backups and point-in-time recovery
  (PITR) are enabled.
- Define a restore runbook (see §9) and test it before going live.
- Retention must align with data-retention decisions in
  [SECURITY.md](SECURITY.md) §10 and [DATABASE.md](DATABASE.md) §5.

### 4.4 Monitoring

- Database monitoring: connection count, query latency, slow queries,
  disk/storage growth. Provider dashboards or a lightweight metrics tool
  (decided during implementation — nothing installed yet).

---

## 5. Deployment Security

| Control                 | Policy                                                                                                            |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Secret management**   | Platform secret store (env vars per environment); never in the repo; rotate `BETTER_AUTH_SECRET` if leaked        |
| **HTTPS**               | Enforced by the hosting platform (TLS everywhere; redirect HTTP)                                                  |
| **Cookies**             | Production: `httpOnly`, `Secure`, `SameSite` (Better Auth defaults; verify)                                       |
| **Production env vars** | All three required variables set; no placeholders                                                                 |
| **Database access**     | Least privilege: the app's DB user can only do what the app needs; no public exposure of the DB port if avoidable |
| **Least privilege**     | Deployment/branch permissions on GitHub; review-before-merge enforced by branch protection                        |
| **Dependency updates**  | Regular `pnpm outdated` review; CI pins Node/pnpm versions; Renovate/Dependabot is a recommended follow-up        |

---

## 6. CI/CD Pipeline

Current CI (exists): install → prisma generate → lint → typecheck → format
check → unit tests. E2E step is scaffolded but disabled (no product flows
yet).

Intended full pipeline:

```text
Pull Request
     ↓
install dependencies
     ↓
lint
     ↓
typecheck
     ↓
format check
     ↓
unit tests
     ↓
e2e tests
     ↓
review & approval
     ↓
merge into main
     ↓
staging deploy (recommended)
     ↓
production deploy (release)
```

**Governance:**

- Production deployment does **not** occur merely because code was pushed.
- CI never connects to a production database; it uses placeholder env values
  and `prisma generate` (no DB connection needed).
- Production deploy runs `prisma migrate deploy` as part of the release.

---

## 7. PostgreSQL Provider

**Undecided (open).** Options:

| Option      | Notes                                                                             |
| ----------- | --------------------------------------------------------------------------------- |
| Neon        | Serverless Postgres, branching, generous free tier; good for CI/staging databases |
| Supabase    | Managed Postgres + extras; hosted                                                 |
| AWS RDS     | Traditional managed Postgres; VPC controls                                        |
| Self-hosted | Full control; more operational burden                                             |

Decision criteria: cost at expected volume, backup/PITR quality, latency to
the hosting region, team familiarity, compliance posture. **Decision to be
made with the team before production.**

---

## 8. Observability

Required before/at production (not installed yet — none is forced into MVP):

- **Structured logs** with request ids (see [SECURITY.md](SECURITY.md) §7 —
  no PII in logs).
- **Error tracking** (e.g. Sentry — evaluate when implementing) to catch
  unexpected errors in production.
- **Uptime monitoring** on the public feedback page and admin login.
- **Database monitoring** (see §4.4).
- **Request correlation** via request ids across logs.

---

## 9. Runbooks (draft)

### Deploy a release

1. Merge reviewed PR into `main` (CI green).
2. Pipeline runs `pnpm install --frozen-lockfile`, quality checks.
3. Run `pnpm prisma migrate deploy` against the production DB (staging first).
4. Deploy the Next.js build (platform deploy).
5. Post-deploy: smoke-check `/`, `/api/auth/get-session`, submit a test
   feedback via the staging URL.

### Rollback

- The platform keeps previous deployments; roll back to the last known-good
  build.
- Schema migrations are forward-only; a data rollback requires a restore
  from backup (tested runbook), not a code revert.

### Restore from backup

1. Restore latest backup + PITR window into a fresh DB.
2. Point `DATABASE_URL` at the restored DB.
3. Verify integrity with analytics smoke checks.

---

## 10. Scaling Considerations (future, not MVP)

- The modular monolith scales by raising the platform tier first; a second
  instance only if the provider requires it.
- PostgreSQL indexing/partitioning for very large feedback tables is
  documented in [DATABASE.md](DATABASE.md) §8 — revisit only at scale.
- No caching layer (Redis) or background workers are introduced until a
  measured need exists ([ARCHITECTURE.md](ARCHITECTURE.md) §12).

---

## 11. Open Decisions

- PostgreSQL provider (Neon / Supabase / RDS / self-hosted).
- Staging environment setup and its deploy trigger (merge-to-main vs. manual).
- Error-tracking and monitoring tooling choices.
- Backups: frequency, retention, PITR window, and restore-test cadence.
- Whether production deploys are manual (release button) or automated from a
  release branch.
- Domain/URL, region, and jurisdiction (affects compliance posture —
  [SECURITY.md](SECURITY.md) §1).
