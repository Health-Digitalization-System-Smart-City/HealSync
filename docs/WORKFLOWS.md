# Development Workflow

**Document:** `workflow.md`
**Version:** 1.0
**Status:** Draft

## 1. Purpose

This document defines how the team develops, reviews, tests, and merges changes.

The goal is:

```text
Issue → Branch → Implement → Test → PR → Review → Merge
```

---

# 2. Source of Truth

Before implementing a feature, developers and AI agents should check:

```text
PRD.md
Architecture.md
API.md
database.md
security.md
workflow.md
```

Use each document for its specific purpose.

If requirements conflict, **do not guess**. Raise the conflict before implementation.

---

# 3. Git Branching

Use short-lived feature branches.

```text
main
 ├── feat/feedback-submission
 ├── feat/dashboard-analytics
 ├── fix/feedback-validation
 ├── refactor/analytics-service
 └── chore/update-dependencies
```

Branch naming:

```text
feat/<name>
fix/<name>
refactor/<name>
chore/<name>
docs/<name>
test/<name>
```

Never develop directly on `main`.

---

# 4. Issue Workflow

Every meaningful change should start from a GitHub Issue.

Example:

```text
Issue #24
"Implement patient feedback submission"
```

The issue should contain:

* Problem
* Expected behavior
* Acceptance criteria
* Relevant documentation

Then create the branch from the issue.

---

# 5. Implementation Workflow

```text
1. Read relevant documentation
2. Understand acceptance criteria
3. Create branch
4. Implement smallest complete change
5. Test locally
6. Run quality checks
7. Commit
8. Push branch
9. Open PR
10. Review
11. Fix review comments
12. Merge
```

Avoid mixing unrelated changes in the same PR.

---

# 6. Commit Convention

Use Conventional Commits.

Format:

```text
<type>(<scope>): <description>
```

Examples:

```text
feat(feedback): add feedback submission
feat(analytics): add branch performance metrics
fix(auth): prevent disabled users from logging in
fix(feedback): validate branch service relationship
refactor(analytics): simplify aggregation queries
docs(api): document feedback actions
test(feedback): add submission tests
chore(deps): update prisma
```

Keep commits focused and understandable.

---

# 7. Pull Requests

Every PR should contain:

```text
## What changed

## Why

## How it was tested

## Screenshots
```

For UI changes, screenshots should be included where useful.

For database changes, mention:

* Migration added
* Schema changes
* Seed changes

For security-sensitive changes, explicitly mention the security impact.

---

# 8. PR Rules

A PR should:

* Have a clear purpose.
* Pass CI.
* Have no known TypeScript errors.
* Pass linting/formatting.
* Pass relevant tests.
* Not contain secrets.
* Not introduce unrelated changes.
* Have required reviews.

Do not merge a failing PR just because the feature appears to work locally.

---

# 9. Code Review

Reviewers should check:

### Correctness

Does it satisfy the issue?

### Architecture

Does it follow `Architecture.md`?

### API

Does it follow `API.md`?

### Database

Does it follow `database.md`?

### Security

Does it follow `security.md`?

### Maintainability

Is the implementation unnecessarily complicated?

---

# 10. Database Changes

Any schema change must include the corresponding Prisma migration.

Workflow:

```text
Modify schema.prisma
       ↓
Create migration
       ↓
Test migration locally
       ↓
Commit migration
       ↓
PR review
       ↓
Deploy migration
```

Never commit a schema change without its migration.

---

# 11. Database Migration Rules

Before merging a migration:

* Verify it works on a clean database.
* Verify existing data is preserved.
* Check foreign keys.
* Check indexes.
* Check unique constraints.
* Consider rollback/recovery implications.

Destructive migrations require extra review.

---

# 12. Testing Strategy

Use multiple levels of testing.

```text
Unit Tests
    ↓
Integration Tests
    ↓
End-to-End Tests
```

### Unit tests

Test isolated business logic.

Examples:

```text
rating calculation
permission checks
phone normalization
analytics calculations
```

### Integration tests

Test:

```text
Server Action
    ↓
Business Logic
    ↓
Database
```

### E2E tests

Test critical user flows.

---

# 13. Critical E2E Flows

At minimum:

### Patient

```text
Open feedback page
→ Enter phone
→ Select branch
→ Select service
→ Select rating
→ Submit feedback
```

### Admin

```text
Login
→ Open dashboard
→ View analytics
→ View feedback
→ Manage users
```

### Authorization

```text
Manager
→ Dashboard ✓
→ Phone number ✗
→ Create user ✗
```

```text
Analyst
→ Analytics ✓
→ Delete feedback ✗
→ Manage branch ✗
```

---

# 14. CI Pipeline

Every Pull Request should run automated checks.

Recommended:

```text
Install dependencies
       ↓
Lint
       ↓
Typecheck
       ↓
Unit tests
       ↓
Integration tests
       ↓
Build
```

E2E tests can run separately when they require additional infrastructure.

---

# 15. Local Development

Before opening a PR:

```text
Install dependencies
       ↓
Configure environment
       ↓
Run database
       ↓
Run migrations
       ↓
Run application
       ↓
Run tests
```

Use `.env.example` to document required environment variables.

Never commit `.env` files containing secrets.

---

# 16. Environment Separation

Maintain separate environments:

```text
Development
     ↓
Staging / Preview
     ↓
Production
```

Do not use production credentials locally.

Do not use production patient data for development/testing unless explicitly approved and properly protected.

---

# 17. Environment Variables

Environment variables should be documented in:

```text
.env.example
```

Example:

```text
DATABASE_URL=
AUTH_SECRET=
AI_API_KEY=
```

Rules:

* Secrets remain server-side.
* Never commit real values.
* Never use `NEXT_PUBLIC_` for private secrets.
* Production secrets are managed by the deployment platform.

---

# 18. Feature Development

Large features should be split into small deliverables.

Example:

```text
Feedback System
│
├── Feedback database model
├── Feedback Server Action
├── Feedback UI
├── Validation
├── Tests
└── Analytics integration
```

Avoid creating one huge PR containing the entire feature.

---

# 19. Documentation Workflow

When implementation changes a documented behavior:

```text
Code Change
    ↓
Check Documentation
    ↓
Update relevant .md
    ↓
Commit together
```

Examples:

```text
New Server Action
→ Update API.md

New database entity
→ Update database.md

New security rule
→ Update security.md

Architecture change
→ Update Architecture.md
```

Documentation should describe the **current intended system**, not historical implementation details.

---

# 20. AI Agent Workflow

AI agents are development assistants, not architectural decision-makers.

Before coding, an AI agent must read the relevant documentation.

Minimum:

```text
PRD.md
Architecture.md
API.md
database.md
security.md
```

Then:

```text
Understand issue
      ↓
Identify affected domains
      ↓
Plan changes
      ↓
Implement
      ↓
Run tests
      ↓
Review changes
      ↓
Report remaining issues
```

---

# 21. AI Agent Constraints

AI agents must:

* Follow existing architecture.
* Reuse existing utilities/services.
* Avoid unnecessary dependencies.
* Avoid unnecessary abstractions.
* Never bypass authorization.
* Never expose patient phone numbers.
* Never modify database schema without a migration.
* Never remove security controls to fix an error.
* Never silently change documented behavior.
* Keep changes scoped to the assigned task.

---

# 22. AI Agent Verification

Before declaring a task complete, the agent should verify:

```text
✓ TypeScript
✓ Lint
✓ Tests
✓ Build
✓ Database migration
✓ Authorization
✓ Security
✓ Documentation
```

If a check cannot be executed, the agent must state that instead of claiming it passed.

---

# 23. Code Quality Rules

Prefer:

```text
Simple
Readable
Typed
Testable
Modular
```

Avoid:

```text
Premature abstraction
Unnecessary libraries
Duplicated business logic
Huge functions
Huge components
Magic values
Dead code
```

Follow the existing project conventions before introducing a new pattern.

---

# 24. Feature Completion

A feature is considered complete only when:

```text
Requirements
    ✓

Implementation
    ✓

Validation
    ✓

Authorization
    ✓

Tests
    ✓

Documentation
    ✓

PR Review
    ✓
```

A feature that only works visually is not considered complete.

---

# 25. Definition of Done

A task can be merged when:

* Acceptance criteria are satisfied.
* Code follows the architecture.
* Server-side validation exists.
* Required authorization exists.
* Tests pass.
* CI passes.
* Database migrations are included when required.
* No secrets are committed.
* Documentation is updated when necessary.
* PR review is complete.

---

# 26. Development Principle

The team should optimize for:

```text
Small Changes
+
Clear Contracts
+
Strong Validation
+
Server-Side Security
+
Automated Testing
+
Simple Architecture
```

Do not add complexity unless the requirements justify it.
