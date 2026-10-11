# D13 — Reliability and Recovery

## Failure model

Authoritative multi-write operations use database transactions. External work uses persisted intent/outbox plus idempotent retry and reconciliation; no workflow claims cross-service atomicity it cannot provide. Jobs have state, attempt count, timeout, idempotency identity, retry policy, dead-letter action, and operator visibility.

## Backups and recovery

Before production, approve RPO/RTO (provisional MVP: RPO ≤24 hours, RTO ≤8 hours). Encrypt PostgreSQL backups, preserve object-storage versions/backups, test restoration on a schedule, document owner/escalation, and retain evidence of restore drills. Schema migration and deployment plans include backup and forward-fix/rollback guidance.

## Observability

Structured logs, traces/correlation IDs, health checks, audit events, queue metrics, provider metrics, and alerts cover authentication failures, error rate, latency, backlog/failure, storage, backups, and AI quality regressions. Logs minimize personal data and have retention/access controls.
