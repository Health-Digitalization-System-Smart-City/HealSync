# Contributing to HealSync

Thanks for contributing! This document defines how the team works together on
this repository. Read it before creating a branch, committing, or opening a
pull request (PR). It is the single source of truth for the Git workflow.

Related documents:

- [README.md](README.md) — project overview, setup, and quality checks.
- `docs/` — product and engineering documentation (PRD, architecture, API,
  database, security, deployment).
- `.github/pull_request_template.md` — the PR template everyone fills in.

---

## 1. Project overview

HealSync is a feedback and analytics platform for private healthcare clinics.
Patients submit feedback without an account; administrators analyze
satisfaction, compare branches and services, and manage clinics.

We follow a **modular monolith**: one Next.js application owns the UI, server
logic, and API. Do not introduce infrastructure (microservices, queues,
caches, new frameworks) without a documented requirement. See
`docs/ARCHITECTURE.md` and `docs/PRD.md`.

**Phase status:** The repository currently contains the Phase 1 foundation and
the Phase 2 design documents. Product features (feedback, admin dashboard,
analytics) are not implemented yet. Do not build them outside of their planned
phase.

## 2. Development environment

Requirements:

- **Node.js** ≥ 20.9 (developed against 24.x)
- **pnpm** ≥ 10
- **PostgreSQL** ≥ 14 (local instance for development)

Setup:

```bash
pnpm install
cp .env.example .env   # then fill in real values (see §11)
pnpm prisma generate   # generate the Prisma Client (src/generated/prisma)
pnpm dev               # start the dev server at http://localhost:3000
```

Install dependencies with **pnpm only**. Never commit the lockfile changes
from another package manager (`npm`, `yarn`). Committing the `pnpm-lock.yaml`
keeps installs reproducible (`pnpm install --frozen-lockfile` in CI).

## 3. Branch strategy

- `main` is the **protected integration branch**. It is production-facing and
  never edited directly.
- All development happens on short-lived feature branches merged back into
  `main` through a pull request.

```text
main
  │
  ├── create branch
  │
  ↓
feature branch
  │
  ├── development
  ├── commits
  ├── push
  │
  ↓
Pull Request → main
  │
  ├── CI
  ├── review
  ├── fixes
  │
  ↓
Approval → merge (squash) → main
```

Do **not** create release, staging, or develop branches yet. The project is
small enough that `feature branch → main` is simpler. A release/staging branch
can be introduced later if deployment requirements justify it.

### Branch protection (`main`)

Branch protection is configured in the **GitHub repository settings** — it
cannot be set from files in this repository. The repository owner must enable
the following rule on `main` (Settings → Branches → Add branch protection
rule):

```text
main
├── Require a pull request before merging
├── Require approvals: 1
├── Require status checks to pass: "Quality checks"   ← CI job in .github/workflows/ci.yml
├── Require conversation resolution before merging
├── Do not allow force pushes
└── Do not allow deletion of the branch
```

- The required status check is **`Quality checks`** — that is the exact job
  name defined in `.github/workflows/ci.yml`. Selecting it makes CI a
  hard requirement for every merge.
- One reviewer + passing CI is the intended starting point for this team.
  Do not add heavier approval rules (e.g. multiple approvers) unless the team
  grows to need them.
- These rules prevent direct pushes to `main`; all changes must flow through
  a reviewed pull request.

## 4. Branch naming

Branches are created from `main` using a lowercase, hyphen-separated prefix:

| Prefix      | Purpose              | Example                        |
| ----------- | -------------------- | ------------------------------ |
| `feat/`     | New functionality    | `feat/patient-feedback`        |
| `fix/`      | Bug fix              | `fix/feedback-validation`      |
| `refactor/` | Code restructuring   | `refactor/feedback-service`    |
| `docs/`     | Documentation        | `docs/api-contract`            |
| `test/`     | Tests                | `test/feedback-service`        |
| `chore/`    | Maintenance/tooling  | `chore/update-dependencies`    |
| `perf/`     | Performance          | `perf/analytics-query`         |
| `security/` | Security changes     | `security/rate-limit-feedback` |
| `style/`    | Styling-only changes | `style/admin-dashboard`        |

Branch names must be **lowercase**, **hyphen-separated**, **short and
descriptive**, and describe the **work**, not the developer.

```text
Good:   feat/patient-feedback-form   fix/auth-session   docs/api-documentation
Bad:    John-feature   my-branch   new-feature   test   final   final-v2
```

## 5. Creating a branch

Always branch from an up-to-date `main`:

```bash
git switch main
git pull origin main
git switch -c feat/patient-feedback
```

After development:

```bash
git status
git add <files>          # add related files only; avoid `git add .` by default
git commit -m "feat: add patient feedback form"
git push -u origin feat/patient-feedback
```

Then open a pull request against `main` (see §7).

After the PR is merged:

```bash
git switch main
git pull origin main
git branch -d feat/patient-feedback
```

**Keeping your branch up to date** when `main` moves forward:

```bash
git fetch origin
git rebase origin/main    # preferred, on your own unshared branch
# or, if the team prefers merge commits:
git merge origin/main
```

Never rewrite history (`git rebase`, `git push --force`) on branches that
other developers are actively using. If rewriting is necessary, do it only on
your own unshared branch.

## 6. Commit conventions

We use **Conventional Commits**:

```text
<type>: <description>
```

| Type       | Purpose                                | Example                                            |
| ---------- | -------------------------------------- | -------------------------------------------------- |
| `feat`     | New functionality                      | `feat: add clinic branch selector`                 |
| `fix`      | Bug fix                                | `fix: prevent feedback submission without service` |
| `refactor` | Restructuring without behavior change  | `refactor: move feedback logic into service layer` |
| `docs`     | Documentation only                     | `docs: update API documentation`                   |
| `test`     | Tests                                  | `test: add feedback service tests`                 |
| `chore`    | Maintenance (deps, tooling, config)    | `chore: update dependencies`                       |
| `perf`     | Performance improvements               | `perf: optimize feedback aggregation`              |
| `security` | Security improvements                  | `security: add rate limiting to feedback endpoint` |
| `style`    | Formatting/styling, no behavior change | `style: improve feedback form layout`              |

**Quality rules:**

- Small, focused, logically grouped commits. Do not split one logical change
  across many commits, and do not bundle unrelated changes into one.
- Imperative, clear descriptions that say **what** and **why**.
- Avoid meaningless messages: `update`, `changes`, `stuff`, `fix`, `final`.
- Add a **body** for non-obvious changes:

```text
feat: add branch performance analytics

Add aggregated branch metrics for average satisfaction, feedback
volume, and rating distribution.

The aggregation is performed in the database rather than loading all
feedback records into application memory.
```

- **Breaking changes** are explicit:

```text
feat!: replace feedback API response format
```

or

```text
feat: replace feedback API response format

BREAKING CHANGE: clients must now read the `data` property.
```

Do not use breaking-change notation for ordinary refactors.

## 7. Pull requests

Every meaningful code change is submitted through a PR against `main`.

A PR should:

- have a clear title using the conventional prefixes, e.g.
  `feat: add patient feedback form`, `fix: prevent duplicate feedback`,
  `refactor: extract feedback service`, `docs: document feedback API`,
  `security: add public endpoint rate limiting`.
- explain **what** changed and **why**.
- describe how it was tested.
- mention relevant documentation changes (`docs/*.md`).
- include screenshots/videos for meaningful UI changes.
- be focused on one logical change. Do not combine unrelated work (e.g. a
  feedback form + an auth refactor + a database redesign + dashboard UI) in a
  single PR.

Use the pull request template (`.github/pull_request_template.md`) — it is
filled in automatically when the PR is opened.

**Before opening a PR**, run the full check suite locally:

```bash
pnpm lint
pnpm typecheck
pnpm format:check
pnpm test
pnpm build
```

If the change affects user-visible behavior, also run:

```bash
pnpm test:e2e
```

Do not open a PR that knowingly contains failing checks. If a check fails only
in CI, fix it and push again — do not bypass or disable CI to merge.

**Merge strategy: squash and merge.** Normal feature branches are squashed
into a single commit on `main`, keeping history clean. Because the PR title
becomes the squashed commit message, write it in Conventional Commit format
(`feat: ...`, `fix: ...`, etc.).

```text
main (squashed history):
feat: add patient feedback
feat: add branch analytics
fix: prevent duplicate feedback
```

## 8. Code review

At least one team member reviews meaningful PRs before merging. Reviewers
consider:

- **Correctness** — does it work?
- **Architecture** — does it follow `docs/ARCHITECTURE.md`?
- **Security** — does it expose sensitive data or introduce vulnerabilities?
  See `docs/SECURITY.md`.
- **Maintainability** — will another developer understand it?
- **Testing** — are important paths tested?
- **Performance** — does it introduce unnecessary expensive operations?
- **UX** — for user-facing changes, is behavior understandable and accessible?

Be respectful and constructive. Focus on the code, not the author. Approve
only when concerns are resolved. The author should address feedback and
re-request review rather than merging over an open thread.

## 9. Testing requirements

- Run the unit suite before pushing: `pnpm test` (Vitest).
- Add tests with new behavior: unit/integration tests for services and
  utilities, e2e tests (Playwright) for user-visible flows: `pnpm test:e2e`.
- Do not break the existing smoke tests.
- CI runs lint, typecheck, format check, and unit tests on every PR (see
  `.github/workflows/ci.yml`). E2E is documented in the workflow and can be
  enabled for CI once the first e2e suite is ready.

## 10. Database changes

HealSync uses **Prisma 7** (see `prisma.config.ts` and `prisma/schema.prisma`).
The schema currently contains only the Better Auth core tables; product tables
are designed in `docs/DATABASE.md` and implemented in their planned phase.

For schema changes:

```text
Modify prisma/schema.prisma
      ↓
Generate migration (local)
      ↓
Test locally
      ↓
Commit schema + migration
      ↓
PR → CI → review → merge
```

Concrete steps:

```bash
pnpm prisma migrate dev --name describe-the-change   # creates + applies a migration locally
pnpm prisma generate                                  # regenerate the client
```

Rules:

- **Never modify a production database.** Migrations are reviewed and applied
  through the normal PR/CI/review pipeline.
- Commit both the schema change **and** the generated migration files.
- **Never commit `src/generated/prisma/`** — the generated Prisma Client is
  gitignored and regenerated by `pnpm prisma generate` during setup and CI.
  Do not hand-edit generated files.
- Never commit `.env` or real database credentials.

## 11. Environment variables

Environment files:

- `.env.example` — tracked template. Document new variables here when you add
  them.
- `.env` / `.env.local` — local secrets. **Never committed** (gitignored).

Required variables (see `.env.example` and `README.md`):

| Variable             | Required         | Notes                                              |
| -------------------- | ---------------- | -------------------------------------------------- |
| `DATABASE_URL`       | Yes              | PostgreSQL connection string                       |
| `BETTER_AUTH_SECRET` | Yes (production) | Session signing secret (`openssl rand -base64 32`) |
| `BETTER_AUTH_URL`    | Yes              | Public base URL, e.g. `http://localhost:3000`      |

- Copy `.env.example` → `.env` and fill in real values locally.
- `pnpm dev`, `pnpm build`, and `pnpm test:e2e` require these to be set;
  Better Auth refuses to run without `BETTER_AUTH_SECRET` by design.
- CI sets safe placeholder values; they are never used to connect anywhere.
- Server-only secrets must not use a `NEXT_PUBLIC_` prefix.

## 12. Security rules

The application will process patient phone numbers, feedback, clinic and
staff information, and administrator accounts. Treat it accordingly.

**Never commit:**

```text
.env
.env.local
API keys
database passwords
private tokens
authentication secrets
production credentials
```

**If a secret is accidentally committed** (especially after a push):

1. Revoke/rotate it immediately.
2. Remove it from the repository.
3. Notify the appropriate team member.
4. Investigate whether it was accessed.

Removing a secret from the latest commit is **not sufficient** if it has been
pushed — it remains in history.

**Working with patient data:** follow `docs/SECURITY.md`. Do not log raw phone
numbers or feedback content unnecessarily, do not expose internal database
errors to users, and validate all external input on the server.

## 13. Common Git commands

```bash
# Start new work
git switch main
git pull origin main
git switch -c feat/my-feature

# Inspect and stage
git status
git diff
git add <files>

# Commit (Conventional Commits)
git commit -m "feat: add patient feedback form"
git commit -m "fix: ..." -m "Body explaining the change."

# Push and open a PR
git push -u origin feat/my-feature

# Sync your branch with main
git fetch origin
git rebase origin/main

# Finish after merge
git switch main
git pull origin main
git branch -d feat/my-feature
```

## Team communication

For potentially conflicting work, communicate **before** implementing large
changes, for example:

- Prisma schema redesign
- authentication architecture changes
- major UI restructuring
- changing API contracts (`docs/API.md`)
- changing deployment architecture
- introducing a new dependency

The goal is to avoid multiple developers independently solving the same
architectural problem. When in doubt, open an issue or a small RFC-style PR
that only changes documentation first.

## Definition of ready

A change is ready to merge when:

- [ ] `pnpm lint` passes
- [ ] `pnpm typecheck` passes
- [ ] `pnpm format:check` passes
- [ ] `pnpm test` passes
- [ ] relevant e2e tests pass
- [ ] `pnpm build` passes for meaningful changes
- [ ] no secrets or generated files committed
- [ ] docs updated if behavior/conventions changed
- [ ] reviewed and approved by at least one team member
