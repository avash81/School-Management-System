# D3 — System Architecture

## Architectural style

Use a modular transactional monolith for the API, with an independently deployable worker and AI/OCR service. This gives strong database transactions for academic workflows while keeping expensive workloads scalable.

```text
Next.js clients → NestJS API → PostgreSQL
                         ├→ Redis/BullMQ → Worker → object storage / renderer / notifier
                         └→ provider adapter → AI/OCR service
```

## Module boundaries

Identity, school, students, academics, teachers/assignments, attendance, examinations, marks/results, imports, documents, notices/notifications, reports, audit, and platform operations. Controllers call application services; services apply domain policies; repositories/adapters own persistence/provider access. A module cannot directly write another module's tables—use commands/events.

## Jobs and storage

Persist a job/import/document record before enqueueing. Jobs are idempotent, retryable, observable, and dead-lettered. Object storage has tenant-prefixed server-generated keys, checksums, classification, retention, and private access only.
