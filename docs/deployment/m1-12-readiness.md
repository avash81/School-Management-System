# M1.12 Readiness Runbook

## Quality gates

Run these commands before merging or deploying:

```bash
pnpm --filter @schoolos/database db:generate
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

The CI workflow runs the same checks on every pull request and push to `main`.

## Environment safety

- Keep production secrets outside the repository and provide them through the deployment secret manager.
- Set `NODE_ENV=production`, a strong `JWT_SECRET`, and explicit `CORS_ORIGINS`.
- Use `secure` and `httpOnly` session cookies in production.
- Keep student files and generated documents in private object-storage buckets.
- Run Prisma migrations only after a verified database backup.

## Health and recovery

- Liveness: `GET /api/v1/health`
- Readiness: `GET /api/v1/readiness`
- Target RPO: 15 minutes
- Target RTO: 1 hour

Backups must be encrypted, retained according to school policy, and restored periodically in a separate environment to verify that recovery actually works.

## Deployment sequence

1. Build and scan the release artifact.
2. Back up PostgreSQL and verify the backup timestamp.
3. Run the reviewed Prisma migration.
4. Deploy API and worker processes.
5. Check liveness, readiness, queue connectivity, and storage connectivity.
6. Run smoke tests for login, tenant-scoped student access, notices, and document generation.
7. Monitor error rate, latency, database load, queue depth, and worker failures.

## Known follow-up work

M1.12 still needs dedicated unit/integration/E2E suites, real export and import load tests, object-storage malware scanning, distributed rate limiting, and an automated backup/restore job. These are release blockers for a production pilot even though the current repository quality gates are green.
