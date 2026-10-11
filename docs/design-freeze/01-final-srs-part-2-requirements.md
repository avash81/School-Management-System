# Document 01 — Final Software Requirements Specification

## Part 2: Requirements and Acceptance

**Status:** draft for design-freeze review.  
**Companion:** [Part 1 — Foundation](01-final-srs-part-1-foundation.md); detailed IDs are maintained in the [Requirements Register](../requirements/requirements-register.md).

## 9. Functional requirements

### Identity, school, and academic configuration

- The system shall authenticate active users, manage sessions/password recovery, and never expose account existence through authentication errors.
- The system shall manage tenant-scoped users, roles, permission grants, and resource scopes; backend authorization shall independently evaluate these controls.
- The system shall create, configure, archive, and isolate schools; schools shall version configuration used by academic history.
- The system shall maintain academic years/periods, calendars, classes, sections, subjects/types, offerings, assessment blueprints/components, and teacher assignments.

### People, attendance, examinations, and marks

- The system shall manage student/guardian/teacher records and append historical enrollment transitions for transfer, promotion, graduation, status changes, and archival.
- The system shall allow only assignment-scoped staff to record or view governed attendance and marks.
- The system shall configure examinations, schedules, eligible offerings, components, lifecycle states, and marks-entry availability.
- The system shall support manual/bulk marks with theory, practical, internal, and configured components; zero, absent, missing, exempt, and not-submitted shall remain distinct states.
- The system shall validate, revise, submit, review, approve, reject, lock, and correct marks through legal lifecycle transitions with audit/history.

### Imports, results, documents, reports, and portals

- The system shall support structured-file and AI/OCR import pipelines with private upload, validation, source preservation, extraction, matching, confidence, business validation, human review, approved idempotent import, and audit.
- The system shall calculate reproducible results from approved official marks and referenced versioned rules, then support review, approval, immutable publication, locking, governed reopening, and result versions.
- The system shall render private, versioned documents from approved templates and source versions; verification must reveal minimal status only.
- The system shall deliver scope-filtered reports/dashboards/exports, notices, notifications, files, audit/activity history, and platform health/support functions.
- Student/parent portals shall expose only own/verified-linked published data and documents.

## 10. Non-functional requirements

| Area            | Requirement                                                                                                                                           |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Security        | Least privilege, tenant/resource scope, secure credential/session/token handling, CSRF/rate-limit/upload defenses, audit, encryption/secret controls. |
| Integrity       | Transactions for official writes; revisions/snapshots; idempotency; optimistic concurrency; no silent overwrite.                                      |
| Performance     | Pagination/indexing/database aggregation/caching/queues; provisional p95 read <500ms and scoped search <800ms.                                        |
| Scale           | 100 schools × 1,000 active students initial target; queues/quotas for large imports, rendering, exports, notifications.                               |
| Reliability     | Graceful provider/dependency failure, retries, reconciliation, correlation IDs, and no loss of source evidence.                                       |
| Recovery        | Encrypted database/file backup, restore testing, provisional pilot RPO ≤24h/RTO ≤8h.                                                                  |
| Accessibility   | Keyboard, semantic labels, focus, contrast, error summary, responsive flows.                                                                          |
| Localization    | Unicode, English/Nepali, AD/BS rendering, locale numbers, Nepali-capable document fonts/search.                                                       |
| Maintainability | Modular boundaries, typed contracts, versioned migrations/configuration, testability, documentation, observability.                                   |

## 11. Domain business rules

1. All tenant data access is school-scoped.
2. A student has at most one active enrollment per academic year; history is retained.
3. Identifiers are unique per school under configured policy.
4. Teachers act only within current assignments and permitted exam contexts.
5. Mark value validation uses configured component range/status rules.
6. Only approved marks feed result calculation; raw/OCR proposals never do.
7. Published results and documents retain immutable versions/snapshots.
8. AI ambiguity routes to human review; no ambiguous record auto-imports.
9. Official corrections require authorization, reason, revision/audit, and result/document impact handling.
10. Configuration/template/rule changes create versions and do not rewrite prior official outputs.

## 12. AI/OCR, security, reporting, document, and localization requirements

AI/OCR accepts only authorized, validated, scanned private sources and records provider/model/mapping/confidence/provenance. Matching has exact/possible/ambiguous/no-match outcomes. Reports and exports are scoped, auditable, and private. Documents record template/source/result versions, generation actor/time, checksum, status, and revocation/verification state. Security mandates server-side permission plus data scope; localization keeps canonical dates internally and renders AD/BS/locale presentation externally.

## 13. Performance, backup, and recovery requirements

Heavy work runs in durable jobs with progress, retry, dead letter/cancellation, idempotency, quotas, and operator visibility. Backups include database and private files, encryption, retention, tested restoration, and recovery runbooks. Monitoring tracks API/database/storage/queue/worker/OCR/renderer/notification health, failures, latency, security events, and data-quality/AI metrics.

## 14. Assumptions, constraints, and future scope

The assumptions/constraints in SRS Part 1 apply. Future scope includes finance, library, transport, payroll, inventory, mobile applications, advanced analytics, and mature multi-school SaaS capabilities; none may weaken core isolation/history/security controls.

## 15. Acceptance criteria

The SRS is accepted only when each REQ has traceability to use cases, rules, data, API/UI, and tests; role/scoped workflows are demonstrably designed; formulas/configuration/versions are reviewable; failure/recovery paths are specified; documents/files are private; and open decisions have owners. Production acceptance additionally needs implementation, tests, pilot evidence, security/recovery verification, training, and critical-issue resolution.

## Next

**Document 02 — Requirements Traceability Matrix.**
