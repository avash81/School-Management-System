# D0.1 System Scope and Boundary

## Status

**Planning artifact.** D0.1 defines what SchoolOS is responsible for, what remains outside the system, and the boundaries that later diagrams and specifications must preserve. No implementation work is authorized by this document.

## Product mission

SchoolOS is a multi-tenant school-management platform for authorized school users to manage people, academic structure, examinations, marks, results, official documents, notices, reports, and controlled AI-assisted marks imports.

The system is designed around one source of truth:

```text
Configured school rules
  -> students and enrollments
  -> exams and marks
  -> results
  -> documents, reports, and notices
```

AI/OCR is an input assistant. It produces staged, reviewable proposals that may enter the official marks workflow only after validation, human review, permission checks, and a transactional import.

## System boundary

### Inside SchoolOS

- tenant and school configuration
- authentication, sessions, roles, permissions, and tenant isolation
- student identity, guardians, enrollment history, and student documents
- teachers, assignments, classes, sections, subjects, and academic years
- examinations, assessment components, marks, results, approvals, and snapshots
- document templates, document metadata, rendering jobs, and verification
- dashboards, reports, notices, audit/activity history, and settings
- AI-assisted file imports, OCR/extraction staging, matching, validation, review, and approved marks handoff
- background jobs, progress, retries, reconciliation, and operational telemetry

### Outside SchoolOS but integrated through contracts

- PostgreSQL: durable business data
- Redis/BullMQ: queue, cache, leases, and ephemeral workflow state
- MinIO or compatible object storage: private files and generated artifacts
- FastAPI AI service: provider adapters and OCR/AI processing
- PDF/rendering providers: document rendering implementation when selected
- email/SMS/WhatsApp providers: future notification delivery adapters
- monitoring, logging, backup, and deployment infrastructure

External services never become the authority for student identity, official marks, results, permissions, or tenant scope.

## Core MVP scope

The first usable school-management release must support:

1. Create and configure a school.
2. Configure academic years, classes, sections, subjects, and teachers.
3. Manage users, roles, permissions, and school-scoped access.
4. Create students, guardians, and historical enrollments.
5. Create examinations and assessment structures.
6. Enter, verify, approve, publish, and audit marks.
7. Calculate and preserve results through the central result engine.
8. Create basic document templates and generate official marksheets/documents.
9. View dashboard summaries and server-side reports.
10. Create, publish, and audit school notices.
11. Upload structured or document-based marks imports into a staged review workflow.
12. Validate, review, approve, import, audit, and safely reconcile approved marks.
13. Operate with tested tenant isolation, authorization, backups, health checks, and deployment gates.

A capability is not considered MVP complete merely because its model or endpoint exists. The relevant user workflow, authorization, failure path, audit behavior, and focused tests must also exist.

## Deferred scope

The following remain outside the initial MVP unless explicitly promoted by a later decision:

- OCR/AI implementation beyond the architecture and controlled import pipeline
- advanced visual document designer
- attendance beyond the minimum domain boundary
- fees, accounting, payroll, library, transport, hostel, and inventory
- parent and student mobile applications
- SMS, WhatsApp, and broad notification-provider integrations
- biometric integrations
- advanced analytics and predictive insights
- subscription billing and licensing automation
- full handwriting recognition
- unrestricted automatic student creation from imports

Deferred capabilities may have interfaces or architecture contracts, but they must not silently expand MVP acceptance criteria.

## Internal module ownership

| Module                | Owns                                                                       | Must not own                                  |
| --------------------- | -------------------------------------------------------------------------- | --------------------------------------------- |
| Identity/Auth         | users, sessions, roles, permissions                                        | school business records without authorization |
| School/Academic       | school settings, academic years, classes, sections, subjects               | student marks or AI decisions                 |
| Students              | student identity, guardians, enrollments, history                          | changing marks or results                     |
| Teachers              | teacher profiles and assignments                                           | bypassing exam permissions                    |
| Examination/Marks     | exams, components, mark lifecycle, mark validation                         | OCR/provider concerns                         |
| Results               | calculation, grading, pass/fail, snapshots, publication                    | raw extraction or document layout             |
| Documents             | templates, rendering, generated-document metadata                          | becoming source of academic truth             |
| Imports/AI            | upload staging, extraction, matching, validation, review, approved handoff | direct uncontrolled writes to official marks  |
| Reports/Dashboard     | projections, aggregations, exports                                         | mutating source records                       |
| Notices/Notifications | notice lifecycle and delivery events                                       | provider-specific policy in core domain       |
| Audit/Operations      | immutable activity, health, metrics, recovery evidence                     | replacing domain authorization                |

## Cross-cutting invariants

1. Every school-owned query and command is tenant-scoped.
2. Authentication identifies the user; authorization decides the operation.
3. Historical student identity and enrollment records are not overwritten for convenience.
4. Official marks are written only through the marks service and lifecycle.
5. Results are calculated centrally and published through controlled states.
6. AI output is untrusted until validated and reviewed.
7. Original files and extraction artifacts are immutable or versioned.
8. External providers are replaceable adapters, not domain authorities.
9. Important mutations produce audit records without logging unnecessary sensitive data.
10. Long-running work is asynchronous and observable.
11. Destructive or official-data operations are idempotent, transactional, and reversible where policy permits.
12. Configuration-driven school rules are versioned when they affect historical interpretation.

## Primary end-to-end boundary

```text
User
  -> frontend
  -> authenticated API
  -> authorized domain module
  -> PostgreSQL / private storage / queue
  -> controlled worker or external adapter
  -> staged result or official domain operation
  -> audit and observable outcome
```

The frontend never talks directly to PostgreSQL, Redis, object storage, or AI providers for business operations.

## Scope decisions still required later

D0 must still decide and document:

- formal actor and role model
- complete use cases and acceptance criteria
- requirements traceability from requirement through test
- business rules, CRUD matrix, and lifecycle/versioning policy
- shared database versus schema/database isolation strategy
- canonical API resource and error conventions
- concurrency, idempotency, transaction, and rollback policy
- search, filtering, sorting, import, and export contracts
- notification and integration contracts
- localization, Nepali/English, AD/BS, accessibility, device, and connectivity policy
- feature flags, school configuration, seed data, and migration strategy
- observability, AI evaluation, cost, capacity, and performance targets
- retention and privacy policies
- backup/recovery targets and deployment topology
- final domain model and ERD reconciliation
- design-system typography and component library

These are intentionally deferred to the named D0 artifacts and cross-cutting packages in [d0-system-design-index.md](d0-system-design-index.md) rather than guessed inside D0.1.

## D0.1 exit criteria

D0.1 is complete when:

- system mission and source-of-truth rule are explicit
- internal and external boundaries are explicit
- MVP and deferred scope are separated
- module ownership and non-ownership are documented
- cross-cutting invariants are listed
- the frontend/backend/infrastructure boundary is clear
- unresolved design decisions are carried forward visibly

## Next artifact

**D0.2 — System Context Diagram**, showing actors, SchoolOS, data stores, workers, AI/OCR, storage, notifications, monitoring, and deployment boundaries.
