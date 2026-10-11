# Technology Confirmation — Gate 2

## Decision

**Confirmed on 2026-08-18 for SchoolOS MVP:** retain the existing monorepo foundation. It matches the frozen architecture and avoids a disruptive rewrite before the core system is proven.

| Concern                   | Selected technology                                       | Role                                                  |
| ------------------------- | --------------------------------------------------------- | ----------------------------------------------------- |
| Workspace/build           | pnpm + Turborepo + TypeScript                             | shared packages, builds, quality commands             |
| Admin and portals         | Next.js + React                                           | admin console; future student/parent portal           |
| Transactional API         | NestJS                                                    | REST API, authorization, business workflows           |
| Primary database          | PostgreSQL + Prisma                                       | tenant-owned transactional data/migrations            |
| Jobs/cache                | Redis + BullMQ                                            | durable background work, ephemeral state/cache        |
| Binary storage            | S3-compatible object storage; MinIO locally               | private uploads and generated artifacts               |
| AI/OCR boundary           | Python + FastAPI                                          | independently deployable, provider-neutral AI service |
| Validation                | Zod at API boundaries plus database constraints           | request and domain/data integrity                     |
| Authentication            | server-side opaque session with Argon2id password hashing | session lifecycle and secure credentials              |
| Local service environment | Docker Compose                                            | PostgreSQL, Redis, MinIO, mail testing, AI service    |

## Why this stack fits

The TypeScript monorepo keeps UI/API/domain contracts close while NestJS/Prisma supports transactional academic workflows. PostgreSQL is appropriate for strongly related, auditable records. Redis/BullMQ isolates imports, rendering, exports, and notifications from request latency. FastAPI keeps OCR/provider libraries separate from core authority: it proposes data; the API/marks engine decides what becomes official.

## Non-negotiable production safeguards

- Use managed PostgreSQL/Redis/object storage or production-equivalent hardened services; local Docker passwords/images are development-only.
- Object buckets remain private. The existing development compose configuration that makes a bucket public must never be used in staging/production.
- Pin container images and dependency versions for deployable environments; do not use mutable `latest` tags.
- Add a managed secret store, TLS/HTTPS termination, malware scanning integration, backups/restore automation, structured logs/metrics/traces, CI security scanning, and staging.
- Use an HTML/PDF renderer adapter selected after a template proof-of-concept; do not couple document templates to a particular renderer yet.
- Select OCR providers through the adapter after accuracy, privacy, cost, language, table-layout, and data-processing evaluations; no provider is frozen in this decision.

## Deferred technology decisions

Production hosting/cloud, secret manager, email/SMS provider, OCR provider, PDF renderer, monitoring/error-tracking vendors, CI host, and object-storage provider remain deployment decisions. Their contracts are frozen by architecture; their vendors are not.

## Gate outcome

Technology selection is complete. The next required gate is development-environment and delivery-control setup. Application feature development is still not authorized until that checklist is complete.
