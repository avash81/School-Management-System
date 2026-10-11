# Freeze Gap 7 — Operational Policy Baseline

## Retention/offboarding

Default: archive operational records; preserve official academic/audit/history under school/legal policy; private source/generated artifacts follow configured retention; legal hold blocks purge. School exit requires authorized export, access revocation, retention/hold review, deletion certificate where permitted, and audit. Final periods require legal/policy owner confirmation.

## Backup/recovery/continuity

Encrypted database and object backups; daily full plus tested point-in-time strategy where supported; least-privilege restore access; quarterly restore drill minimum; provisional RPO ≤24h/RTO ≤8h pilot. Database outage: safe unavailable/read-only response; queue/worker/OCR/renderer/notification outage: durable job/retry/status/manual fallback; storage outage: block new artifact mutation safely; source evidence never discarded.

## Privacy/legal/support

Collect minimum identity/contact/academic/file data; restrict export/logging; use qualified legal review for Nepal education/data/communication/record-retention requirements before production. Support tickets/incidents have severity, owner, correlation IDs, status, post-incident review, and training/FAQ updates.

## Production prerequisites

Named owners approve retention/legal/pilot/vendor decisions; secret manager/staging/monitoring/alerts/runbooks operate; branch/CI/migrations/security scans enforce gates; backup restore is evidenced; training and pilot acceptance complete; Document 16 checklist is signed.
