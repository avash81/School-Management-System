# Requirements Register

## Status and conventions

**Planning baseline.** IDs are stable. Each requirement maps to the use-case catalog, rules, API/data/UI design, and tests in the traceability register. `MVP` means required before pilot; `R1` is post-core; `F` is future.

The canonical completion phases, gap backlog, dependencies, accountable roles, and current
evidence status are maintained in the [Requirements Completion Backlog and Delivery
Roadmap](./requirements-completion-roadmap.md). This register is a planning baseline:
candidate items and proposed priorities are not owner approval or implementation evidence.
Resolve the addendum references and decisions listed below before architecture freeze.

| ID           | Requirement                                                                                                                                                       | Release |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| REQ-AUTH-001 | Authenticate active accounts without credential enumeration; support logout, session revocation, reset, verification, and login history.                          | MVP     |
| REQ-AUTH-002 | Enforce user → role → permission → tenant/resource scope server-side for every protected operation.                                                               | MVP     |
| REQ-SCH-001  | Isolate every school’s people, academics, configuration, files, documents, and audit data.                                                                        | MVP     |
| REQ-SCH-002  | Version school grading, result, document, and locale configuration; do not hard-code school-specific academic rules.                                              | MVP     |
| REQ-ACA-001  | Maintain academic years/periods, classes, sections, subjects/types, offerings, components, calendars, and assignments.                                            | MVP     |
| REQ-STU-001  | Create, update, search, enroll, transfer, promote, graduate, archive students and link guardians without rewriting history.                                       | MVP     |
| REQ-TEA-001  | Maintain teachers and assignment-scoped class/section/subject access.                                                                                             | MVP     |
| REQ-ATT-001  | Record/view governed daily and subject attendance, including present, absent, late, and leave.                                                                    | R1      |
| REQ-EXM-001  | Configure exams, schedules, eligible offerings, assessment blueprints, status, and entry locking.                                                                 | MVP     |
| REQ-MRK-001  | Support manual and bulk marks with theory/practical/internal/custom components and distinct absent/missing/zero/exempt/not-submitted states.                      | MVP     |
| REQ-MRK-002  | Enforce marks lifecycle, assignment scope, validation, review, approval, correction, locking, and audit.                                                          | MVP     |
| REQ-AI-001   | Accept approved image/PDF/spreadsheet inputs through private validated upload, scan, queue, extraction, matching, confidence, review, approval, and audit stages. | R1      |
| REQ-RES-001  | Calculate versioned totals, grades, GPA, pass/fail, optional/absence policy; approve, snapshot, publish, lock, and reopen results.                                | MVP     |
| REQ-DOC-001  | Generate versioned private marksheets; support ID/admit/certificate/report templates, preview, bulk jobs, download, print, and minimal public verification.       | MVP/R1  |
| REQ-REP-001  | Provide tenant/scoped dashboards, reports, analytics, and private queued exports.                                                                                 | MVP     |
| REQ-NOT-001  | Publish notices and deliver governed in-app/email/SMS notifications using versioned templates/preferences.                                                        | R1      |
| REQ-PORT-001 | Provide student/parent self-service views limited to own/linked published information.                                                                            | R1      |
| REQ-AUD-001  | Retain append-only audit/activity history for security and official-record actions.                                                                               | MVP     |
| REQ-FIL-001  | Store uploads/documents privately with validation, retention, authorization, and provenance.                                                                      | MVP     |
| REQ-OPS-001  | Provide backups/restores, monitoring, structured logs, security/performance testing, staging, deployment, and incident/runbook controls.                          | MVP     |

## v0.3 supplemental requirements

These candidate requirements are captured in full in
[Software Requirements Addendum v0.3](./software-requirements-addendum-v0.3.md). Their release and
priority are preserved from the addendum; they are not owner-approved design or implementation
evidence. Overlaps and unresolved references must be closed in the atomic traceability update before
architecture freeze.

| ID           | Requirement family                                                | Release / priority |
| ------------ | ----------------------------------------------------------------- | ------------------ |
| REQ-STU-004  | Bilingual student/guardian names                                  | MVP / Must         |
| REQ-STU-005  | Student profile fields and configurable extensions                | MVP / Must         |
| REQ-STU-006  | Permissioned, audited sensitive student fields                    | MVP / Should       |
| REQ-STU-007  | Private student profile documents                                 | MVP / Should       |
| REQ-STU-008  | Phone and Unicode/control-character validation                    | MVP / Must         |
| REQ-STU-009  | Historical student/enrollment/marks import                        | MVP / Must         |
| REQ-ADM-001  | Admission inquiries and applications                              | R1 / Should        |
| REQ-ADM-002  | Configurable admission application statuses                       | R1 / Should        |
| REQ-ADM-003  | Accepted-applicant conversion with history                        | R1 / Should        |
| REQ-ADM-004  | Entrance-test scores and merit/waitlist ordering                  | R1 / Could         |
| REQ-STU-010  | Transfer-out, clearance, certificate, and archive workflow        | MVP / Should       |
| REQ-STU-011  | Character and bonafide/study certificates                         | R1 / Should        |
| REQ-ACC-001  | Multiple roles per school account                                 | MVP / Must         |
| REQ-ACC-002  | Multi-school accounts and explicit school switching               | R1 / Should        |
| REQ-ACC-003  | User invitations and bulk account creation                        | MVP / Must         |
| REQ-ACC-004  | User disable/enable, password reset, session revocation           | MVP / Must         |
| REQ-ACC-005  | Bulk student/parent accounts and safe credential delivery         | R1 / Should        |
| REQ-ACC-006  | User profile, password, session, and notification preferences     | MVP / Should       |
| REQ-ACC-007  | Parent view/switching across linked children                      | R1 / Could         |
| REQ-EXM-002  | Cumulative weighted results                                       | MVP / Must         |
| REQ-EXM-003  | Non-academic grading lifecycle                                    | MVP / Should       |
| REQ-EXM-004  | Governed report-card remarks                                      | MVP / Should       |
| REQ-EXM-005  | Versioned, audited grace marks/moderation                         | MVP / Should       |
| REQ-EXM-006  | Result recheck/re-total request workflow                          | R1 / Should        |
| REQ-EXM-007  | Supplementary exams and configurable result combination           | R1 / Should        |
| REQ-EXM-008  | Reviewed, audited promotion/detention proposals                   | MVP / Should       |
| REQ-EXM-009  | Exam logistics and seat plans                                     | R1 / Could         |
| REQ-EXM-010  | Student-level absence/exemption/make-up exceptions                | MVP / Must         |
| REQ-RES-004  | Explainable result calculation breakdown                          | MVP / Must         |
| REQ-RES-005  | Pre-publication result comparison                                 | MVP / Should       |
| REQ-RES-006  | Scoped, scheduled result publication/withdrawal                   | MVP / Should       |
| REQ-TT-001   | Class/teacher/room timetable                                      | R1 / Should        |
| REQ-TT-002   | Timetable conflict detection                                      | R1 / Should        |
| REQ-TT-003   | Expiring substitute-teacher assignment                            | R1 / Could         |
| REQ-STF-001  | Basic non-teaching staff records                                  | F                  |
| REQ-ACA-003  | Academic-year rollover and promotion records                      | MVP / Must         |
| REQ-ACA-004  | AD/BS calendar, holidays, and exam windows                        | MVP / Should       |
| REQ-DOC-005  | Document print specifications                                     | MVP / Must         |
| REQ-DOC-006  | Versioned school assets and authorized signatures                 | MVP / Must         |
| REQ-DOC-007  | QR and verification code on official documents                    | MVP / Must         |
| REQ-DOC-008  | Tamper-evident official PDFs                                      | R1 / Should        |
| REQ-DOC-009  | Safe versioned template designer                                  | MVP / Should       |
| REQ-DOC-010  | Required document types and variable lists                        | MVP / Must         |
| REQ-DOC-011  | Bulk print layouts and ordering                                   | MVP / Should       |
| REQ-DOC-012  | Nepali numerals/fonts and mixed-language rendering                | MVP / Should       |
| REQ-PLAT-001 | School branding in UI/documents                                   | MVP / Should       |
| REQ-PLAT-002 | Per-school domains                                                | R1 / Could         |
| REQ-PLAT-003 | Per-school feature toggles without data deletion                  | MVP / Must         |
| REQ-PLAT-004 | Approved tenant data export and offboarding                       | MVP / Must         |
| REQ-PLAT-005 | Contextual help and first-run setup checklist                     | MVP / Should       |
| REQ-PLAT-006 | In-app support reports and maintenance notices                    | R1 / Should        |
| REQ-PLAT-007 | Exam-entry prerequisite validation                                | MVP / Should       |
| REQ-PLAT-008 | Permission-aware global search                                    | MVP / Could        |
| REQ-PLAT-009 | Sortable/filterable/paginated lists and saved views               | MVP / Should       |
| REQ-PLAT-010 | Safe bulk actions with preview/undo                               | MVP / Could        |
| REQ-INT-001  | Pluggable SMS adapter and delivery controls                       | R1 / Must          |
| REQ-INT-002  | Pluggable email adapter and delivery controls                     | R1 / Must          |
| REQ-INT-003  | Versioned, replaceable OCR/AI adapter                             | R1 / Must          |
| REQ-INT-004  | Documented import/export templates                                | MVP / Should       |
| REQ-INT-005  | Configurable board/government reporting export                    | R1 / Could         |
| REQ-INT-006  | Tenant-scoped public API, keys, and webhooks                      | F                  |
| REQ-INT-007  | Payment adapter, contingent on a fees module                      | F                  |
| REQ-NOT-002  | Event-driven notification events                                  | R1 / Should        |
| REQ-NOT-003  | Sensitive-content safeguards for SMS/email                        | R1 / Should        |
| REQ-NOT-004  | Notification queue controls and recipient logs                    | R1 / Should        |
| REQ-PORT-002 | Feature/permission-scoped portal capabilities                     | R1 / Should        |
| REQ-PORT-003 | Structured parent-teacher messages/acknowledgements               | R1 / Could         |
| REQ-REP-002  | Standard academic, attendance, marks-progress, and import reports | MVP / Must         |
| REQ-REP-003  | Marks-entry progress dashboard                                    | MVP / Should       |
| REQ-REP-004  | Privacy-protected cross-year/cohort analytics                     | R1 / Could         |
| REQ-REP-005  | Provenance and draft indicators on exported/printed reports       | MVP / Should       |

The addendum refers to `REQ-AUTH-003`, `REQ-DOC-002`, `REQ-RES-001f`, and `REQ-PRIV-001`, which
are not defined in this register. Their intended behavior must be accepted and assigned a canonical
ID or remapped before freeze; see the addendum reconciliation notes.

These unresolved IDs are tracked by GAP-003 in the [completion roadmap](./requirements-completion-roadmap.md);
do not treat them as silently accepted or invent requirements to fill them.

## Non-functional requirements

| ID           | Requirement                                                                                                                             |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| NFR-SEC-001  | Passwords/tokens are never stored/logged plaintext; secrets are externally managed in non-local environments.                           |
| NFR-SEC-002  | Cross-tenant reads/writes, privilege escalation, unsafe uploads, and unauthorized document access are denied and tested.                |
| NFR-PERF-001 | Provisional target: p95 standard read <500ms; scoped student search <800ms; marks save <1s excluding network.                           |
| NFR-SCL-001  | Initial design supports 100 schools × 1,000 active students; bulk work uses queues and quotas.                                          |
| NFR-REL-001  | Provisional pilot RPO ≤24h and RTO ≤8h, backed by verified restoration.                                                                 |
| NFR-USE-001  | Keyboard access, visible focus, accessible validation, contrast, responsive desktop/tablet/mobile flows.                                |
| NFR-LOC-001  | Unicode-safe data; configurable English/Nepali display and reliable AD/BS rendering without noncanonical date storage.                  |
| NFR-AI-001   | OCR accuracy, match precision/recall, false acceptance, review rate, latency, and cost are measured against labelled data.              |
| NFR-PERF-003 | Handle marks-entry/result-publication surges; the proposed target is 500 concurrent portal readers per school and needs owner approval. |
| NFR-USE-003  | Autosave marks drafts, show save state, and retain unsaved work through connection loss/page refresh within the session.                |
| NFR-USE-004  | Responsive web is baseline; offline PWA drafts are proposed; native apps are out of v1.0 scope.                                         |
| NFR-USE-005  | Keyboard-driven marks entry/Excel paste/bulk selection; proposed three-click target needs owner approval.                               |
| NFR-LOC-002  | Store UTC timestamps and display Nepal Standard Time (UTC+05:45) unless configured otherwise.                                           |
| NFR-LOC-003  | Support BS academic-year boundaries and AD/BS input; identify the displayed calendar in reports.                                        |
| NFR-LOC-004  | Externalize strings for English/Nepali translation without code changes to add a language.                                              |
| NFR-LOC-005  | Support Nepali sorting/search; transliteration-friendly search is proposed as Could.                                                    |
| NFR-DAT-001  | Define and consistently enforce entity data quality rules in UI, API, and imports.                                                      |
| NFR-DAT-002  | Archive/soft-delete people and academic records; hard deletion only through governed retention.                                         |
| NFR-DAT-003  | Version migrations and make them reversible or forward-fixable; test realistic data volumes.                                            |
| NFR-OBS-001  | Trace reported issues by request ID without exposing unauthorized personal data.                                                        |
| NFR-OBS-002  | Alert on errors, latency, queue/job failures, backup, login failures, storage growth, and tenant usage.                                 |
| NFR-COST-001 | Meter per-tenant storage, SMS, OCR pages, and jobs for cost measurement and quotas.                                                     |
| NFR-API-001  | Standardize API versioning, error codes, pagination, idempotency, and OpenAPI/code synchronization.                                     |
| NFR-CMP-001  | Proposed support for the latest two major browser versions and documented minimum screen widths.                                        |
| NFR-A11Y-001 | Target WCAG 2.1 AA, including marks-grid screen-reader labels and non-color-only statuses.                                              |
| NFR-DR-001   | Document restore order and test tenant-isolated restore; target needs owner approval.                                                   |
| NFR-CONC-001 | Prevent silent concurrent overwrites of marks, results, and settings through locking/versioning.                                        |
| NFR-IDEM-001 | Make import/result/document/OCR jobs idempotent and resumable.                                                                          |

## Assumptions, constraints, risks

| Type       | Item                                                                          | Treatment                                                                     |
| ---------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Assumption | Schools can nominate administrator, teacher, examiner, and principal testers. | Validate in pilot onboarding.                                                 |
| Assumption | Official records are retained longer than operational drafts.                 | Confirm retention policy before launch.                                       |
| Constraint | Local stack is a modular monolith with separate worker/AI boundaries.         | Preserve interfaces; do not prematurely split services.                       |
| Risk       | OCR falsely matches a student or mark.                                        | Deterministic signals, confidence thresholds, required human approval, audit. |
| Risk       | Small schools lack separate approvers.                                        | Explicit configurable role combination; never remove history/checks.          |
| Risk       | Configuration changes invalidate results/documents.                           | Version policies/templates and snapshot publication.                          |
| Risk       | Multi-tenant data leak.                                                       | Scope queries, policy tests, private storage, audit/monitoring.               |
| Risk       | Pilot data/privacy exposure.                                                  | Approved data process, least privilege, private artifacts, backups.           |

## Stakeholders

Product owner; school administrator; principal; academic/exam coordinator; teachers; operational staff; students; parents/guardians; platform operator; technical owner; school-domain owner; pilot users. Each release requires named product, technical, and school-domain accountability.
