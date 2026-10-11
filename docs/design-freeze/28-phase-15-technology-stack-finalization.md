# Phase 15 — Technology Stack Finalization

## Status

**Prepared draft — not approved.** This is the proposed MVP stack for review after a future Phase 14 architecture freeze. It does not authorize repository/environment changes or feature implementation.

| Concern               | Selected stack                                                  | Decision                                           |
| --------------------- | --------------------------------------------------------------- | -------------------------------------------------- |
| Monorepo/build        | pnpm, Turborepo, TypeScript                                     | Fixed                                              |
| Admin and portals     | Next.js, React                                                  | Fixed                                              |
| Transactional API     | NestJS, TypeScript                                              | Fixed                                              |
| Validation            | Zod DTO validation + domain policies + PostgreSQL constraints   | Fixed                                              |
| Data access/migration | PostgreSQL, Prisma                                              | Fixed                                              |
| Background work/cache | Redis, BullMQ                                                   | Fixed                                              |
| Private file storage  | S3-compatible storage; MinIO locally                            | Fixed interface; production vendor deferred        |
| AI/OCR boundary       | Python 3.11+, FastAPI provider adapter                          | Fixed boundary; OCR vendor deferred                |
| Document rendering    | adapter behind queued worker                                    | Fixed boundary; renderer vendor deferred           |
| Notifications         | provider adapters for in-app/email/SMS                          | Fixed boundary; provider deferred                  |
| Local dependencies    | Docker Compose                                                  | Fixed                                              |
| Testing               | Vitest; later API/E2E/load/security tools by test specification | Fixed unit baseline; tooling expansion in Phase 16 |
| Observability         | structured logs, metrics, traces, health checks                 | Fixed requirements; vendor deferred                |
| CI/CD                 | Git-based workflow, pnpm/Turbo checks, staged deployment        | Fixed pattern; hosting provider deferred           |

## Why this is final for MVP

The stack supports modular transactional workflows, Prisma migrations, server-enforced authorization, private files, queue isolation, and independent AI/render scaling without premature microservices. Existing repository foundations match these decisions, reducing unnecessary rework.

## Provider evaluation criteria

Production storage/OCR/PDF/email/SMS/hosting/monitoring vendors must satisfy cost, Nepal support where relevant, security/privacy/data residency, service reliability, API maturity, exportability, observability, and contractual support. Provider selection may not alter the API/domain boundaries or permit direct external mutation of official academic records.

## Production safeguards

Use managed/hardened PostgreSQL, Redis, object storage, TLS, secret management, pinned images, private buckets, malware scanning, backups/restore drills, monitoring, staging, and CI security checks. Mutable `latest` images and development credentials are local-only and forbidden from deployment configuration.

## Phase outcome

**Phase 15 status: PLANNED.** It activates only after Phase 14 Architecture Freeze v1.0 is explicitly approved.
