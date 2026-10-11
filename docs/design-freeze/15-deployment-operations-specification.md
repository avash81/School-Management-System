# Document 15 — Deployment and Operations Specification

## Environments and delivery

Separate local, test/CI, staging, and production resources/configuration/secrets. Pipeline: format/lint/typecheck/tests/security scan/build → staging deploy/migration/smoke → approval → gradual production deploy → health/metric check. API, worker, and AI services deploy independently with probes; infrastructure is defined/reviewed as code.

## Data and recovery

Use versioned migrations with expand/contract compatibility, backup before production change, tested rollback/forward-fix, and no manual production schema edits. Encrypt database/object backups; define retention/access; perform scheduled restore drills. Provisional pilot RPO ≤24h and RTO ≤8h need actual evidence before production claim.

## Observability and incidents

Structured logs/traces/request IDs, audit, metrics, dashboards, alerts, health checks, queue/dependency/AI quality indicators, and redacted error reports are mandatory. Runbooks cover database/storage/queue/worker/OCR/renderer/notification outages, failed jobs, security incident, maintenance mode, migration rollback, backup restore, and support access.

## Release control

Semantic versioning, release notes, feature flags, staged rollout, rollback/hotfix process, change record, training/support readiness, and pilot feedback triage are required. Production readiness requires all Document 16 evidence, not a successful deploy alone.
