# Development Environment and Delivery Setup — Gate 3

## Purpose

This gate turns the confirmed technology stack into a safe, repeatable engineering environment. It is complete only when the checklist has evidence, not when source folders merely exist.

## Existing foundation

The repository already has a pnpm/Turborepo workspace, web/admin/API/worker/AI apps, Prisma database package, Docker Compose dependencies, environment templates, lint/typecheck commands, and initial infrastructure configuration.

**Current state (2026-08-18): partially complete.** Local Git, contribution guidance, CODEOWNERS placeholders, dependency update configuration, a Vitest smoke test, and passing lint/typecheck/test commands are in place. Remote branch protection, real code-owner identities, API/integration tests, isolated staging, secrets, backup/restore, monitoring, and deployment runbooks remain required before feature-stage delivery begins.

## Required completion checklist

### Repository and standards

- [x] Initialize local Git repository; configure a protected default branch after remote hosting is selected.
- [x] Define branch, pull-request review, conventional-commit, issue, and release-tag strategy in `CONTRIBUTING.md`.
- [x] Add `CODEOWNERS` placeholders for API, database, AI, infrastructure, and architecture documents; replace placeholders with real remote identities before branch protection.
- [x] Lock formatting/lint/typecheck/build/test commands in the existing CI workflow; make them required remote branch checks after repository hosting is selected.
- [ ] Define dependency-update and security-vulnerability response policy.

### Environments and secrets

- [ ] Validate `.env.example`, `.env.development`, `.env.test`, and production variable contracts without committing real credentials.
- [ ] Create isolated local, CI/test, staging, and production database/Redis/storage resources.
- [ ] Document secret manager, rotation, service accounts, least privilege, and emergency access.
- [ ] Verify development storage is private by default; remove public-bucket defaults outside an explicitly disposable local demo.

### Database and fixtures

- [ ] Make schema build/generate/migrate/seed repeatable from a clean machine.
- [ ] Create synthetic multi-tenant fixtures: users/roles, students/guardians, teachers/assignments, exams, marks, and documents.
- [ ] Establish migration review, backup-before-migration, expand/contract, and rollback/forward-fix procedure.
- [ ] Add a test database reset strategy that never points at a development/staging/production database.

### Quality and testing baseline

- [x] Add Vitest as the initial TypeScript test runner and a passing workspace unit-test smoke test.
- [ ] Extend CI with format, integration/API, migration, dependency/secret scanning, and coverage reporting; lint/typecheck/test/build are already present.
- [ ] Add minimum tenant-isolation, permission, session, audit, mark-lifecycle, and job-idempotency tests.
- [ ] Publish coverage/quality thresholds and failure policy.

### Service and delivery operations

- [ ] Verify Docker Compose starts PostgreSQL, Redis, private MinIO, mail testing, and AI service with health checks.
- [ ] Define local API/web/worker start commands and a one-command smoke-test path.
- [ ] Create structured logging, correlation-ID, metrics, and trace conventions.
- [ ] Create staging deployment, migration, smoke-test, backup, restore, incident, and rollback runbooks.

## Exit evidence

Gate 3 is complete when a new developer can clone the repository, use only documented non-secret setup, start dependencies, migrate/seed an isolated database, run all quality checks/tests, and execute a smoke test; CI can repeat the same checks; and staging has a tested deployment/rollback path.

## Verification evidence

- 2026-08-18: initialized local Git repository on `main`.
- 2026-08-18: installed Vitest and added a workspace smoke test.
- 2026-08-18: `pnpm test`, `pnpm typecheck`, and `pnpm lint` passed locally.
- 2026-08-18: test setup exposed and corrected leading/trailing whitespace handling in `toTitleCase`.

## Next authorization

Only after Gate 3 evidence is reviewed may controlled MVP **Foundation stage A** development begin: authentication hardening, role/permission enforcement, tenant controls, school setup, and academic-year foundations.
