# D15 — Deployment and DevOps

## Environments

Separate local, CI/test, staging, and production databases, Redis, storage, provider credentials, and configuration. Bootstrap validates required configuration; secrets use a managed secret store, rotation, and least-privilege service identities.

## Delivery path

```text
format/lint/typecheck → unit/integration/API tests → build and scan
→ deploy staging → run migrations/smoke tests → approval
→ gradual production deploy → health/metric verification
```

API, worker, and AI service deploy independently with readiness/liveness probes. Migrations use expand/contract compatibility; no application release assumes a destructive schema change happened instantly. Every deploy has a named rollback/forward-fix plan and automated post-deploy checks.

## Operational readiness

Infrastructure as code, configuration review, access logging, dashboards/alerts, runbooks, backup verification, incident contacts, and staging rehearsal are required before production.
