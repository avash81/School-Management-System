# M1.13 Final MVP Review

## Decision

**Status: NOT RELEASE-READY**

The SchoolOS architecture and repository foundation are ready for continued implementation, but the M1 MVP gate is not passed. The project must complete the release blockers below before calling M1 implemented or starting production pilot deployment.

## Verified complete

- Turborepo and pnpm workspace foundation
- Next.js admin and web applications build
- NestJS API and FastAPI service entrypoints
- Prisma schema composition and client generation
- Authentication with Argon2 password hashing
- Session cookies with production secure-cookie behavior
- Tenant-scoped queries in the implemented domain services
- School and academic setup APIs
- Student identity, enrollment history, guardians, search, pagination, and import preview foundation
- Teacher management and assignments foundation
- Examination, marks, result, and marksheet API scaffolding
- Dashboard summary, progress, pending-action, and activity endpoints
- Server-side student, result, and examination reports
- Notice creation, update, publish, archive, audience metadata, and history
- Liveness/readiness endpoints, security headers, CORS configuration, and CI quality gates
- Notice migration `0005_notices`

## Partial or not implemented

### Release blockers

- No real unit, integration, authorization, tenant-isolation, or E2E tests exist. `pnpm test` succeeds because no test files are discovered.
- PermissionGuard and permission decorators exist but are not applied to business endpoints.
- The worker only processes a startup heartbeat; document, report, import, and export jobs are not implemented.
- Document generation creates queued metadata but does not render PDFs or upload files to object storage.
- Bulk generation runs synchronously in the API request.
- Excel/CSV upload parsing and column mapping are not implemented; import currently accepts normalized JSON rows.
- Notice scheduling and automatic expiry are not processed by a worker.
- Report PDF/Excel/CSV export jobs are not implemented.
- File MIME/content validation, size limits, malware scanning, and private download authorization are incomplete.
- Backup, restore testing, load testing, monitoring alerts, and production smoke tests are not automated.
- Formatting baseline fails with repository-wide Prettier warnings.

### Scope clarification

The following are intentionally deferred from M1: OCR/AI extraction, advanced document designer, SMS/WhatsApp, fees, attendance, library, transport, hostel, payroll, mobile applications, and advanced analytics.

## MVP gate checklist

| Capability                      | Status  | Evidence or blocker                                                             |
| ------------------------------- | ------- | ------------------------------------------------------------------------------- |
| School setup                    | Partial | API foundation exists; needs authenticated end-to-end test                      |
| Students and enrollment history | Partial | API and admin screens exist; needs integration and permission tests             |
| Teachers and assignments        | Partial | API foundation exists; no role-specific access tests                            |
| Exams and marks                 | Partial | API exists; no complete verified flow test                                      |
| Results and snapshots           | Partial | Models/API exist; no result-engine test suite                                   |
| Marksheet PDF generation        | Blocked | Renderer, storage, and worker are incomplete                                    |
| Generic document engine         | Blocked | Current implementation is marksheet-specific                                    |
| Dashboard and reports           | Partial | Read APIs exist; exports and role-based views are incomplete                    |
| Notices                         | Partial | CRUD lifecycle exists; scheduling, attachments, permissions incomplete          |
| Security                        | Partial | Authentication and headers exist; authorization and upload hardening incomplete |
| Testing                         | Blocked | No actual test files                                                            |
| Deployment                      | Partial | CI and runbook exist; backups, monitoring, and smoke tests incomplete           |

## Go/no-go criteria for M2

M2 planning can begin because the core boundaries are defined. M2 implementation should wait until these interfaces are stable:

1. A central marks engine has executable tests.
2. A tenant and permission test harness exists.
3. Import jobs have explicit states and queue contracts.
4. Document generation has a renderer/storage contract.
5. Human review is mandatory before imported marks reach the marks engine.

## Next action

Execute the master development plan in [master-development-plan.md](../roadmap/master-development-plan.md), starting with test infrastructure, permission enforcement, and the worker/job contracts before expanding AI capabilities.
