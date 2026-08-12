# HealSync

A feedback platform for private healthcare clinics. Patients share feedback
on the clinic, branch, and service they received; administrators analyze
satisfaction, compare branches, and manage clinics, services, and staff.

> **Current status: Phase 3 — first vertical slices implemented.**
> The full design documents (`docs/`) are in place. Implemented so far:
> the public patient feedback flow, and the **authentication + RBAC** layer
> (Better Auth `disableSignUp` + admin plugin, server-side `requireUser` /
> `requirePermission` helpers, login / password-reset pages, dashboard route
> guard, and admin user management). Analytics, branch/service management,
> and AI insights follow in later workstreams (see `docs/ROADMAP.md`).

---

## Table of contents

- [Technology stack](#technology-stack)
- [Requirements](#requirements)
- [Installation](#installation)
- [Environment setup](#environment-setup)
- [Database setup](#database-setup)
- [Development](#development)
- [Quality checks](#quality-checks)
- [Contributing](#contributing)
- [Project structure](#project-structure)
- [Documentation](#documentation)
- [Development philosophy](#development-philosophy)

## Technology stack

| Layer           | Technology                                       |
| --------------- | ------------------------------------------------ |
| Framework       | Next.js 16 (App Router) + React 19               |
| Language        | TypeScript (strict mode)                         |
| Styling         | Tailwind CSS v4 + shadcn/ui + Lucide icons       |
| Database        | PostgreSQL + Prisma 7                            |
| Auth            | Better Auth (administrators only)                |
| Validation      | Zod                                              |
| Forms           | React Hook Form                                  |
| Data fetching   | TanStack Query (client-side) + server components |
| Tables          | TanStack Table                                   |
| Charts          | Recharts                                         |
| Testing         | Vitest (unit) + Playwright (e2e)                 |
| Quality         | ESLint, Prettier                                 |
| Package manager | pnpm                                             |

## Requirements

- **Node.js** ≥ 20.9 (developed against 24.x)
- **pnpm** ≥ 10
- **PostgreSQL** ≥ 14 (local instance for development)

## Installation

```bash
git clone <repository-url> healsync
cd healsync
pnpm install
```

## Environment setup

Copy the environment template and fill in real values:

```bash
cp .env.example .env
```

| Variable             | Required         | Description                                                                                 |
| -------------------- | ---------------- | ------------------------------------------------------------------------------------------- |
| `DATABASE_URL`       | Yes              | PostgreSQL connection string, e.g. `postgresql://postgres:postgres@localhost:5432/healsync` |
| `BETTER_AUTH_SECRET` | Yes (production) | Secret used to sign session cookies/tokens. Generate with `openssl rand -base64 32`.        |
| `BETTER_AUTH_URL`    | Yes              | Public base URL, e.g. `http://localhost:3000`.                                              |

> Never commit real secrets. `.env` is gitignored; `.env.example` is tracked.
>
> **Important:** `pnpm dev`, `pnpm build`, and `pnpm test:e2e` require the
> environment variables above to be set. Better Auth deliberately refuses to
> run without `BETTER_AUTH_SECRET` (a production security check), and
> `prisma.config.ts` requires `DATABASE_URL`. Copy `.env.example` to `.env`
> before running them. CI sets safe placeholder values for these checks.

## Database setup

```bash
pnpm prisma migrate dev    # create the database tables and apply migrations
pnpm prisma generate       # regenerate the Prisma Client (src/generated/prisma)
```

The schema covers the full data model: Better Auth core tables (`user`,
`session`, `account`, `verification`), RBAC (`role`, `permission`,
`role_permission`), branches/services, feedback, and audit logs — see
[docs/DATABASE.md](docs/DATABASE.md).

> Prisma 7 note: connection configuration lives in `prisma.config.ts`, and
> the client requires the `@prisma/adapter-pg` driver adapter (wired in
> `src/lib/db`). Do not follow Prisma 5/6 tutorials for this repository.

## Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The home page is a
patient-facing landing page that guides visitors straight to the feedback
flow (`/feedback`).

## Quality checks

```bash
pnpm lint          # ESLint
pnpm typecheck     # tsc --noEmit (strict)
pnpm format        # Prettier (write)
pnpm format:check  # Prettier (verify)
pnpm test          # Vitest unit tests
pnpm test:e2e      # Playwright e2e tests (starts the dev server automatically)
```

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) before creating a branch, commit, or
pull request. It defines the branch naming conventions, Conventional Commits,
the PR/review workflow, the database-change procedure, and the checks that
must pass before merging.

## Project structure

```
├── .github/workflows/ci.yml   # CI pipeline
├── docs/                      # Project documentation (PRD, API, security, ...)
├── prisma/
│   └── schema.prisma          # Prisma schema (Phase 1: auth tables only)
├── public/                    # Static assets
├── src/
│   ├── app/                   # App Router: routes, layouts, API handlers
│   │   └── api/auth/[...all]  # Better Auth endpoints
│   ├── components/
│   │   └── ui/                # shadcn/ui components
│   ├── generated/prisma/      # Generated Prisma Client (do not edit)
│   ├── lib/
│   │   ├── auth/              # Better Auth configuration
│   │   ├── db/                # Prisma Client singleton
│   │   ├── validation/        # Zod schemas (future)
│   │   └── utils/             # Shared utilities (cn, ...)
│   ├── services/              # Application services (future)
│   └── types/                 # Shared types (future)
├── tests/
│   ├── unit/                  # Vitest tests
│   └── e2e/                   # Playwright tests
├── .env.example               # Environment template (tracked)
├── eslint.config.mjs
├── prettier.config.mjs
├── playwright.config.ts
└── vitest.config.mts
```

Only directories with a real purpose at this stage exist — feature
directories are created as their features are designed.

## Documentation

| File                                         | Status       | Purpose                              |
| -------------------------------------------- | ------------ | ------------------------------------ |
| [docs/PRD.md](docs/PRD.md)                   | Draft (Ph.2) | Product requirements (what & why)    |
| [docs/WORKFLOWS.md](docs/WORKFLOWS.md)       | Draft (Ph.2) | User & dev workflows                 |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Draft (Ph.2) | Architecture decisions & conventions |
| [docs/DATABASE.md](docs/DATABASE.md)         | Draft (Ph.2) | Data model & migration policy        |
| [docs/API.md](docs/API.md)                   | Draft (Ph.2) | API spec & conventions               |
| [docs/SECURITY.md](docs/SECURITY.md)         | Draft (Ph.2) | Security & privacy model             |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)     | Draft (Ph.2) | Deployment & operations              |

## Development philosophy

- **Modular monolith.** One Next.js application owns the UI, server logic,
  and API. No microservices, message queues, Redis, or other infrastructure
  will be introduced unless a real requirement emerges.
- **Business logic in services**, not scattered through components, route
  handlers, or database queries.
- **Type safety first.** Strict TypeScript; `any` only with a documented
  reason. Zod validation at external boundaries.
- **Tested incrementally.** Vitest for unit/integration tests, Playwright for
  e2e smoke tests; feature tests arrive with their features.
- **Documented as we go.** Architectural and security decisions are recorded
  in `docs/`.

## License

Private repository — internal use.
