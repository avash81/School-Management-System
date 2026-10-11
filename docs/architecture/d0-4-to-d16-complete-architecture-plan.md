# SchoolOS Complete Architecture Plan — D0.4 to D16

**Status:** planning baseline; implementation must follow an approved architecture freeze.

This document completes the remaining design path after D0.1 (scope), D0.2 (context), and D0.3 (actors). It is intentionally technology-aware: the current foundation is Next.js clients, a NestJS API, PostgreSQL/Prisma, Redis/BullMQ, object storage, and a separately deployable AI/OCR service. A component may be replaced only behind a documented interface.

## Governing decisions

1. Every tenant-owned record has a `schoolId`; authorization checks tenant and scope before returning or changing it.
2. Access is `user → role → permission → scope`, never a hard-coded job-title check.
3. AI/OCR may propose data only. An authorized human and the marks workflow create official academic records.
4. Academic records are never silently overwritten. Corrections are versioned, justified, authorized, and audited.
5. Long-running work is a persisted, retryable background job. HTTP requests initiate and observe work; they do not perform large imports or document batches inline.
6. All mutation APIs validate input, apply business rules in a transaction, emit an audit event, and are idempotent where retries are plausible.
7. Student, parent, and staff data are private by default. Generated files are private and served through authorized, time-limited access.

---

# D0 — Requirements and System Model

## D0.4 Full use-case model

| Area          | Primary use cases                                                                                      | Primary actors                                    |
| ------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------- |
| Identity      | sign in/out, reset password, manage sessions, manage users/roles                                       | all users; school admin                           |
| School setup  | maintain school profile, academic years, classes, sections, subjects, grading rules                    | school admin; exam staff where delegated          |
| People        | register, search, update, enroll, transfer, promote, archive students; maintain guardians and teachers | school admin; school staff; limited teacher reads |
| Teaching      | maintain assignments, view assigned rosters, record attendance                                         | teacher; school admin                             |
| Examinations  | configure exams, subjects, components, schedules, and eligibility                                      | exam staff; school admin                          |
| Marks         | enter draft marks, validate, submit, review, approve, correct, lock                                    | teacher; exam staff; configured approver          |
| AI import     | upload, process, review, correct, approve, import, retry/cancel                                        | teacher; exam staff                               |
| Results       | calculate, review, approve, publish, reopen, snapshot                                                  | exam staff; principal/admin approver              |
| Documents     | configure templates, generate, download, verify, revoke/regenerate                                     | exam staff; school admin; authorized viewers      |
| Communication | create, publish, expire notices; send notifications                                                    | authorized staff                                  |
| Self service  | view own/linked profile, attendance, published results, documents and notices                          | student; parent/guardian                          |
| Platform      | manage tenants, health, providers, emergency access                                                    | system administrator                              |

`Submit marks` includes validation and an audit event. `Approve marks` requires a different authorized user when the school’s segregation-of-duties policy is enabled. `Import official marks` includes review, conflict detection, and the same lifecycle checks as manual entry.

## D0.5 Use-case specification standard

Each use case must contain: identifier, goal, actor, permission and scope, trigger, inputs, preconditions, main flow, alternative/exception flows, postconditions, entities, audit event, API contract, UI surface, and tests.

The mandatory first specifications are:

| ID         | Use case                    | Non-negotiable postcondition                                                        |
| ---------- | --------------------------- | ----------------------------------------------------------------------------------- |
| UC-STU-001 | Register/enroll student     | Student and valid enrollment exist or neither exists.                               |
| UC-MRK-001 | Enter/save marks            | Only valid values are saved as draft; actor and prior value are audited.            |
| UC-MRK-002 | Submit/review/approve marks | Legal state transition only; approver scope is verified.                            |
| UC-IMP-001 | AI marks import             | Original file and reviewable extracted records are retained; no official marks yet. |
| UC-IMP-002 | Approve import              | Atomic, idempotent application of valid reviewed rows; conflicts are reported.      |
| UC-RES-001 | Calculate/publish result    | A reproducible snapshot exists for each publication.                                |
| UC-DOC-001 | Generate document           | A versioned template and source-data version are recorded.                          |

## D0.6 Business-rule catalog

| ID            | Rule                                                                                                                          |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| BR-TEN-001    | A request cannot read or mutate another school’s data.                                                                        |
| BR-STU-001    | A student has at most one active enrollment per academic year.                                                                |
| BR-STU-002    | Admission number and academic ID are unique within a school.                                                                  |
| BR-ASSIGN-001 | Teachers may act on marks/attendance only for an active assignment matching year, class, section, and subject.                |
| BR-MRK-001    | A present mark is numeric, finite, and within its assessment component’s configured range.                                    |
| BR-MRK-002    | Absent/exempt statuses are explicit; they are never interpreted as score zero.                                                |
| BR-MRK-003    | Submitted → reviewed → approved → published/locked is forward-only; correction follows a recorded reopen/correction workflow. |
| BR-RES-001    | Result calculation uses only approved marks and the versioned grading configuration selected for that exam.                   |
| BR-RES-002    | Results cannot publish until every required result is approved. Publishing creates immutable snapshots.                       |
| BR-IMP-001    | Import data is provisional until human approval; rows with validation errors cannot import.                                   |
| BR-IMP-002    | A repeated confirm request must return the original outcome and must not reapply marks.                                       |
| BR-DOC-001    | A generated document references template version, source record version, generator, and verification status.                  |

## D0.7 Requirements traceability

Maintain `requirement → use case → rule → entity → API → UI → test` rows in the delivery tracker. No requirement is considered delivered without a test reference; no endpoint is released without an owning use case and permission.

## D0.8 Release scope

**MVP:** tenant setup, identity/RBAC, student/guardian/teacher records, academic structure, assignments, attendance, exams, manual marks lifecycle, result lifecycle, private marksheets, notices, core reports, audit, and operational backup/monitoring.

**Post-MVP but architecturally supported:** AI/OCR import, customizable template studio, bulk generation, email/SMS, student/parent portals, advanced analytics, feature flags, and multi-school platform administration.

---

# D1 — Business Process Design

## D1.1–D1.6 Workflows, activities, states, approvals, lifecycle, exceptions

### Canonical marks workflow

```text
draft → submitted → reviewed → approved → published → locked
                     ↘ rejected ───────────────────────↗
published/locked → correction-requested → reopened → draft
```

Only explicitly authorized transitions are legal. The system records actor, time, reason, scope, previous state, and changed values. A school may require a reviewer distinct from the submitter.

### AI import workflow

```text
uploaded → validating → queued → processing → extracted → validating
        → review_required → approved → importing → completed
                         ↘ rejected / failed / cancelled
```

Retries create an attempt history, not a new official import. Provider failures are retryable with bounded exponential backoff. Matching ambiguity, invalid references, out-of-range values, and low confidence stop at `review_required`.

### Student lifecycle

```text
applicant → admitted → active → promoted | transferred | graduated | dropped | expelled → archived
```

Enrollment history is append-oriented. Transfers/promotion create a new enrollment and end the prior active enrollment; they do not rewrite historical results.

### Exception handling

Validation errors are actionable and field-specific. Authorization failures do not disclose data existence. Concurrency conflicts return a conflict response with current version information. Transient provider/database failures create a correlation ID and a safe retry path; partial multi-record work rolls back or is tracked as a resumable job.

---

# D2 — Data and Domain Design

## D2.1–D2.8 Domain model, ERD, dictionary, constraints, history

Core relationships:

```text
School ─┬─ AcademicYear ─ Class ─ Section
        ├─ Student ─ Enrollment ─┘
        ├─ Teacher ─ TeacherAssignment ─ SubjectOffering ─ Subject
        ├─ User ─ UserRole ─ Role ─ RolePermission ─ Permission
        ├─ Exam ─ ExamSubject ─ AssessmentComponent ─ MarkEntry
        │                         └─ Result ─ ResultSnapshot
        └─ Upload ─ ImportSession ─ ImportRecord / ImportIssue
```

Required additions or confirmations to the schema:

- Every tenant record is indexed by `schoolId`; compound uniqueness includes it where identifiers are tenant-local.
- `AttendanceRecord`, `Notification`, `DocumentTemplateVersion`, `GeneratedDocument`, `Job`, `ImportIssue`, and scope-aware permission grants need explicit data models before their features ship.
- Marks need `status`, source, entered/reviewed/approved identities and timestamps, a version/concurrency token, and correction linkage.
- Results and documents store immutable publication/source snapshots rather than only mutable foreign-key data.
- Soft deletion is used for operational entities. Academic/audit history is retained according to policy and is not silently hard-deleted.

Data dictionary requirements: type, nullability, default, validation, sensitive-data classification, index, ownership, retention, and audit behaviour for every column. Dates are stored in UTC; display supports configured locale, AD/BS calendar, and Nepali/English documents without altering canonical data.

---

# D3 — System Architecture

## D3.1–D3.8 Style, components, boundaries, jobs, storage

Adopt a modular monolith for the transactional API with explicit module boundaries, plus independently deployable worker and AI/OCR services. This avoids premature distributed transactions while letting expensive work scale separately.

```text
Next.js clients → NestJS API → PostgreSQL
                         ├→ Redis/BullMQ → Worker → storage / renderer / notifier
                         └→ AI adapter → AI/OCR service
```

API modules: identity, school, students, teachers/assignments, academics, attendance, examinations, marks/results, imports, documents, notices/notifications, reports, audit, and platform administration.

Allowed dependencies flow inward: controllers → application services → domain policies → repositories/adapters. Modules communicate by typed application commands and domain events, never by direct cross-module database writes. The marks engine is the sole owner of official marks and result inputs.

Storage separates original uploads, temporary processing objects, generated private documents, and backups. Objects have tenant-prefixed keys, content checksum, classification, retention policy, and no public bucket access.

---

# D4 — Security and Access

## D4.1–D4.7 Authentication, authorization, privacy, audit

Use secure, rotating server-side sessions or equivalent opaque tokens. Cookies are `HttpOnly`, `Secure` in production, appropriately `SameSite`, and protected against CSRF where cross-site credential use exists. Passwords use Argon2id; reset tokens are single-use, hashed, short-lived, and delivered through a configured notification provider.

Authorization middleware first authenticates, then evaluates permission and resource scope. Queries themselves must be scoped; an endpoint must never load an unscoped resource and check it later. Platform emergency access requires an approved, time-limited reason and a high-severity audit event.

Audit events are append-only and capture request/job correlation ID, actor/session, school, action, entity, prior/new values or version references, IP/device where appropriate, and result. Sensitive values such as passwords/tokens are never logged.

Privacy: collect only necessary student/guardian data; classify it as restricted; restrict export/download; define retention, school-exit export/deletion, and legal hold processes before production.

---

# D5 — API Design

## D5.1–D5.7 Contracts, validation, errors, transactions, idempotency

Version APIs under `/api/v1`. Use resource-oriented endpoints with cursor/page pagination, filtering, stable sort, explicit DTOs, and a common envelope/error format. Document every endpoint’s permission, resource scope, success response, validation errors, audit effect, and idempotency requirement.

Mutation contract:

```text
authenticate → authorize/scope → DTO validation → business validation
→ idempotency/concurrency check → transaction → audit/outbox event → response
```

Use an `Idempotency-Key` for imports, bulk jobs, and externally retryable writes. Use a version/ETag or revision field for interactive updates. Return `409 Conflict` for stale/duplicate work, `422` for business-rule violations, `403` for prohibited actions, and never expose another tenant’s existence.

---

# D6 — AI/OCR Architecture

## D6.1–D6.9 Upload, extraction, matching, review, evaluation

Upload flow: authorize → size/type/signature validation → malware scan → private store original → create upload/import job → queue. The OCR provider receives a time-limited copy/reference and returns a normalized extraction schema through an adapter.

Extraction records preserve raw provider output, normalized table cells, confidence, mapping version, and provenance. Student matching uses deterministic identifiers first (admission/roll number within the chosen exam scope), then controlled fuzzy matching; it never auto-matches ambiguous candidates. Configurable thresholds route rows to human review.

The reviewer can correct values and mapping but cannot bypass missing required references or lifecycle restrictions. Approval invokes the normal marks-engine command in a single idempotent transaction. Maintain a labelled evaluation dataset and track field accuracy, student-match precision/recall, review rate, provider latency/cost, and false-accept rate.

---

# D7 — Marks and Result Engine

## D7.1–D7.10 Mark components, calculation, approval

Exam subjects reference a versioned assessment blueprint: theory/practical/internal components, maxima, pass requirements, absent/exempt policies, optional-subject policy, and grading scheme. The result calculation service is deterministic and pure given approved marks plus its configuration version.

Calculation produces totals, percentage, grade, GPA, pass/fail and explanatory component outcomes. It must reject incomplete required marks, apply absence policy, and capture the exact grading rules used. Approval and publication use the D1 state machine; publication creates immutable result snapshots and queues document/notification events. Reopen requires reason and permission, preserves published history, and invalidates/revokes affected documents according to policy.

---

# D8 — Document and Template Engine

## D8.1–D8.8 Templates, documents, rendering, print

Templates are versioned, school-owned, and approved before active use. A restricted schema/DSL supplies allowlisted variables and collections; arbitrary server-side HTML/script execution is prohibited. Rendering occurs in a worker using a renderer adapter and produces a private immutable file with checksum and source snapshot.

Supported document definitions: marksheet, ID card, admit card, certificate, report, and notice. Each specifies page size, margins, language/date format, accessibility/print requirements, required signatures, and verification policy. Bulk jobs report per-item outcomes, support bounded retry, and package only authorized documents.

Public document verification is a narrowly scoped, rate-limited endpoint returning authenticity/status only—not student personal data.

---

# D9 — UI/UX Design

## D9.1–D9.10 System, navigation, responsive, accessibility

Use the approved teal design direction in `ui-brand-direction.md`. Define semantic tokens for primary/surface/text/border/success/warning/error, not component-specific hard-coded colors. The primary desktop navigation is Dashboard, Students, Teachers, Academics, Examinations, Marks, Attendance, Results, Documents, Reports, Notices, Settings; users see only permitted destinations.

Key screens must include: role-aware dashboard, searchable/paginated student list/profile, assignment-scoped teacher workspace, exam and marks grid with draft/submit/review states, import review queue, result approval/publish workspace, document job/history, and audit-aware settings.

All flows support keyboard operation, visible focus, semantic labels, accessible error summaries, contrast-compliant status indicators, responsive tables/cards, and non-colour-only state communication. UI validation improves usability but never replaces API validation.

---

# D10 — Notifications and Communication

## D10.1–D10.6 Events, channels, templates, preferences

Domain events such as `marks.submitted`, `results.published`, `document.ready`, `notice.published`, and `password.reset.requested` create notification intents through an outbox. Delivery adapters handle in-app, email, and SMS; provider failure does not roll back the originating academic transaction.

Templates are versioned, localized, allowlisted, and tested. Preferences control non-essential channels; security and legally required notices remain governed by policy. Store delivery status, provider message ID, retry history, and redacted failure reasons.

---

# D11 — Reporting and Analytics

## D11.1–D11.6 Reports, dashboards, export

Reports are authorization-scoped projections, not unrestricted database exports. MVP reports: enrollment, student list, attendance, exam completion, class/subject performance, result summary, teacher workload, documents, and audit activity. Dashboards show role-specific aggregates with clear filters and data freshness.

Large CSV/XLSX/PDF exports are jobs with expiry, access checks, audit records, and row-level tenant/scope filters. Metrics should avoid exposing individual student details where aggregate reporting suffices.

---

# D12 — Performance and Scalability

## D12.1–D12.7 Targets, database, cache, queues, capacity

Initial capacity target: 100 schools, 1,000 active students each, with growth planned to 1,000 schools. Set final targets before production; provisional targets are p95 ordinary API reads under 500 ms, student search under 800 ms, interactive marks save under 1 s excluding network, and 100-row imports acknowledged within 2 s then processed asynchronously.

Index tenant/filter/sort columns; use pagination and database aggregates; prevent N+1 queries. Cache only tenant-safe, short-lived read models and invalidate via domain events. Queue AI, exports, bulk documents and notifications with per-tenant quotas, dead-letter handling, job metrics, and concurrency limits. Load testing must validate tenant isolation as well as throughput.

---

# D13 — Reliability and Recovery

## D13.1–D13.7 Errors, transactions, rollback, backup, observability

Use database transactions for authoritative multi-write actions, plus an outbox for post-commit events. Do not claim distributed atomicity with storage/provider calls: persist intent, retry safely, and reconcile failures. Each job has states, attempts, visibility timeout, idempotency identity, and dead-letter escalation.

Set and approve recovery objectives before launch (provisional: RPO ≤ 24 hours, RTO ≤ 8 hours for MVP). Run encrypted PostgreSQL backups, object-store versioning/backups, periodic restore drills, and documented incident ownership. Emit structured logs, traces/correlation IDs, service/queue metrics, audit events, and alerts for auth failures, job backlog/failures, backups, storage errors, and AI quality regressions.

---

# D14 — Testing Strategy

## D14.1–D14.9 Verification layers

| Layer       | Required proof                                                                                 |
| ----------- | ---------------------------------------------------------------------------------------------- |
| Unit        | grading, state transitions, matching, scope policy, DTO/normalization rules                    |
| Integration | Prisma constraints, transactions, outbox/jobs, storage and provider adapters                   |
| API         | authentication, permission/scope denial, tenant isolation, validation, idempotency, pagination |
| UI/E2E      | role workflows from login through published result/document download                           |
| AI          | labelled documents, extraction/match metrics, unsafe ambiguity and provider-failure cases      |
| Security    | authorization matrix, CSRF/session/file-upload tests, dependency and secret scans              |
| Performance | search, marks grids, imports, exports, document batches, queue backlogs                        |
| Acceptance  | scripted school-administrator, teacher, examiner, principal, student and parent scenarios      |

Test fixtures must contain no real student data. CI blocks releases when required checks, migrations, security scans, or contract tests fail.

---

# D15 — Deployment and DevOps

## D15.1–D15.7 Environments, CI/CD, migrations, secrets, rollback

Use local development, test/CI, staging, and production environments with separate databases, storage buckets, Redis, credentials, and provider settings. Configuration is validated on boot; secrets use an environment secret manager and are never committed or logged.

Pipeline: format/lint/typecheck → unit/integration/API tests → build/image scan → deploy staging → migrations and smoke tests → approval → production deploy → post-deploy health/metrics verification. Migrations are backward-compatible and expandable/contracted in separate releases; each has backup and rollback/forward-fix guidance. Deploy API and workers independently with readiness/liveness probes, gradual rollout, and documented rollback criteria.

---

# D16 — Final Architecture Review and Freeze

## D16.1–D16.8 Review gate

Architecture may freeze only when all items below are approved by product, technical, and school-domain owners:

- D0.1–D0.8 complete, with MVP boundary, use cases, rules, and traceability accepted.
- D1 workflows/state machines include approval, correction, failure, retry, and rollback paths.
- D2 schema/ERD/data dictionary reconcile with migrations and retention requirements.
- D3 module ownership and external interfaces prevent cross-module direct writes.
- D4 permission matrix and tenant/scope rules have executable test scenarios.
- D5 API contracts, error model, transaction and idempotency policy are approved.
- D6 AI thresholds, review policy, dataset ownership, and safety metrics are approved.
- D7 grading/absence/optional-subject rules have school-domain sign-off.
- D8 document verification, template safety, and private-file access policy are approved.
- D9 accessibility, responsive navigation, localization, and teal design tokens are reviewed.
- D10–D13 define notification privacy, capacity targets, observability, backups, RPO/RTO, and incident response.
- D14 test plan is mapped to requirements; D15 staging, migrations, secrets, and rollback are rehearsed.

Open decisions must have an owner, deadline, and explicit release impact. Once frozen, changes require a change request that states affected use cases, data/API migration, permission/audit impact, and test updates. Only then may implementation move from foundation hardening to feature delivery.
