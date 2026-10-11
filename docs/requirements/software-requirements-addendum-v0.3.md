# SchoolOS Software Requirements Addendum v0.3

## Status and use

This addendum supplements the requirement baseline in
[requirements-register.md](./requirements-register.md). It preserves the proposed release and
priority for each item; it does not claim that any feature is designed, implemented, tested, or
owner-approved. `[PROPOSED]` values require an explicit product/technical owner decision.

The source grouped these items by domain. They are retained here for review before conversion to
atomic requirements and complete use-case, rule, data, API, UI, and test traceability.

## A. Student lifecycle

### A1. Student profile

| ID          | Release / priority | Requirement                                                                                                                                                                                                 |
| ----------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| REQ-STU-004 | MVP / Must         | Store student and guardian names in separate English and Nepali fields. Official documents can print either or both.                                                                                        |
| REQ-STU-005 | MVP / Must         | Support photo, date of birth, gender, address, contact numbers, emergency contact, previous school, and school-configurable extra profile fields.                                                           |
| REQ-STU-006 | MVP / Should       | Protect health notes, special needs, scholarship/quota category, and identity documents with separate permissions; deny access to roles without explicit permission and audit views and changes.            |
| REQ-STU-007 | MVP / Should       | Upload birth certificates, transfer certificates, and ID scans through the private file service and link them to the student profile.                                                                       |
| REQ-STU-008 | MVP / Must         | Validate +977 and other international phone formats; permit Unicode names and reject control characters.                                                                                                    |
| REQ-STU-009 | MVP / Must         | Import historical students, enrollments, marks, and results from Excel/CSV into the correct academic years without altering existing records; identify imported results as legacy in documents and reports. |

### A2. Admissions

| ID          | Release / priority | Requirement                                                                                                                                |
| ----------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| REQ-ADM-001 | R1 / Should        | Capture admission inquiries and applications, including applicant, guardian, desired class, and documents.                                 |
| REQ-ADM-002 | R1 / Should        | Support configurable application statuses: received, under review, test/interview scheduled, accepted, rejected, waitlisted, and enrolled. |
| REQ-ADM-003 | R1 / Should        | Convert an accepted applicant into a student without retyping data and retain application history.                                         |
| REQ-ADM-004 | R1 / Could         | Support entrance-test scores and merit/waitlist ordering.                                                                                  |

### A3. Transfer-out and certificates

| ID          | Release / priority | Requirement                                                                                                                                                                                                    |
| ----------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| REQ-STU-010 | MVP / Should       | Record transfer-out date and reason, check approved clearance items, generate a transfer certificate, and archive the student without deleting history. Dues clearance is proposed only if the school uses it. |
| REQ-STU-011 | R1 / Should        | Generate character, bonafide/study, and similar certificates through the template engine, with document verification, reissue, and revoke controls.                                                            |

## B. Accounts and identity

| ID          | Release / priority | Requirement                                                                                                                           |
| ----------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| REQ-ACC-001 | MVP / Must         | Allow one person multiple roles in one school. Permissions are the union of roles, subject to applicable segregation-of-duties rules. |
| REQ-ACC-002 | R1 / Should        | Allow one person account to belong to multiple schools, with explicit school switching and no cross-school data access.               |
| REQ-ACC-003 | MVP / Must         | Let school administrators invite users by email/SMS using single-use, expiring links and create accounts in bulk from a file.         |
| REQ-ACC-004 | MVP / Must         | Let administrators reset passwords and disable/enable users in their school. Disabling a user immediately revokes active sessions.    |
| REQ-ACC-005 | R1 / Should        | Create student and parent accounts in bulk from enrolled records; never expose passwords in plain text to administrators.             |
| REQ-ACC-006 | MVP / Should       | Let users manage their profile, password, active sessions (including logging out all devices), and notification preferences.          |
| REQ-ACC-007 | R1 / Could         | Let a parent see and switch between all linked children.                                                                              |

## C. Examinations and results

| ID          | Release / priority | Requirement                                                                                                                                                                  |
| ----------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| REQ-EXM-002 | MVP / Must         | Combine multiple exams/terms using configurable weights and rules for cumulative results; version and snapshot the policy and result.                                        |
| REQ-EXM-003 | MVP / Should       | Support co-curricular, conduct, discipline, and attendance-based grades through the governed marks lifecycle.                                                                |
| REQ-EXM-004 | MVP / Should       | Support subject-teacher, class-teacher, and principal report-card remarks with phrase banks and character limits.                                                            |
| REQ-EXM-005 | MVP / Should       | Apply enabled grace marks/moderation as an explicit, versioned, audited step; preserve and display original and adjusted marks separately.                                   |
| REQ-EXM-006 | R1 / Should        | Allow a student, guardian, or staff member to request a published-result recheck/re-total; record review and outcome, and use a controlled result reopen with a new version. |
| REQ-EXM-007 | R1 / Should        | Configure supplementary exams for failed/absent students and combine outcomes with original results using a configurable policy.                                             |
| REQ-EXM-008 | MVP / Should       | Propose promotion/detention/graduation after result publication using configurable rules; require review and an audited bulk application, never silent changes.              |
| REQ-EXM-009 | R1 / Could         | Support exam schedules, rooms, seat allocation, invigilator assignment, and printable seat plans/admit-card data.                                                            |
| REQ-EXM-010 | MVP / Must         | Record student-level absence reasons, component exemptions, and make-up tests; define their result effects by policy and retain history.                                     |
| REQ-RES-004 | MVP / Must         | Let authorized users inspect each result component, applied rule and policy version, and the derivation of total, grade, GPA, and pass/fail.                                 |
| REQ-RES-005 | MVP / Should       | Before publication, compare a result with a previous run/version and show what changed and why.                                                                              |
| REQ-RES-006 | MVP / Should       | Control publication by class/section/exam, allow scheduled publication, and allow controlled withdrawal of a published result.                                               |

## D. Academic operations

| ID          | Release / priority | Requirement                                                                                                                                                                       |
| ----------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| REQ-TT-001  | R1 / Should        | Define periods and assign class/section/subject/teacher/room to timetable slots; provide class, teacher, and room views.                                                          |
| REQ-TT-002  | R1 / Should        | Warn or block when a teacher, room, or class is double-booked.                                                                                                                    |
| REQ-TT-003  | R1 / Could         | Assign a substitute teacher for a day with temporary, assignment-scoped attendance access that expires automatically.                                                             |
| REQ-STF-001 | F                  | Maintain basic non-teaching staff records, including role, contact, and joining date.                                                                                             |
| REQ-ACA-003 | MVP / Must         | Create the next academic year by copying classes, sections, subjects, and offerings as editable drafts and carrying students forward through promotion records; never copy marks. |
| REQ-ACA-004 | MVP / Should       | Support AD and BS calendars with holidays and exam windows, displayed in the user's chosen calendar.                                                                              |

## E. Document engine

| ID          | Release / priority | Requirement                                                                                                                                                                                     |
| ----------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| REQ-DOC-005 | MVP / Must         | Support A4, Letter, and custom template sizes, margins, headers/footers, page numbers, and pre-printed stationery without a letterhead.                                                         |
| REQ-DOC-006 | MVP / Must         | Store school logos, seals, and authorized signatures per school; version them, apply them to templates, and restrict each signature to documents authorized by its signer.                      |
| REQ-DOC-007 | MVP / Must         | Put a QR code and verification code on each official document, linking to public verification.                                                                                                  |
| REQ-DOC-008 | R1 / Should        | Protect official PDFs against undetected tampering by digital signature or a stored hash checked by the verification page.                                                                      |
| REQ-DOC-009 | MVP / Should       | Let authorized administrators edit template layout/text using allowlisted variables, preview sample data, and publish a new version; prohibit arbitrary scripting.                              |
| REQ-DOC-010 | MVP / Must         | Support marksheets, report cards, transcripts/cumulative sheets, ID cards, admit cards, certificates (character, transfer, bonafide), and notice letters, each with a documented variable list. |
| REQ-DOC-011 | MVP / Should       | Support bulk print layouts, including N-up ID cards and marksheets ordered by class/section/roll number.                                                                                        |
| REQ-DOC-012 | MVP / Should       | Render Nepali numerals and mixed Nepali/English text with correct fonts and glyphs.                                                                                                             |

## F. Platform and tenant capabilities

| ID           | Release / priority | Requirement                                                                                                                                                                                      |
| ------------ | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| REQ-PLAT-001 | MVP / Should       | Apply school name, logo, colors, and address consistently in the UI and documents.                                                                                                               |
| REQ-PLAT-002 | R1 / Could         | Support per-school subdomains or custom domains.                                                                                                                                                 |
| REQ-PLAT-003 | MVP / Must         | Provide per-school feature toggles for attendance, subject attendance, notices, portal, admissions, timetable, ranking, and grace marks. Disabling a feature hides it without deleting its data. |
| REQ-PLAT-004 | MVP / Must         | Allow a school administrator, with platform approval, to export all school data (CSV/JSON plus files) and support governed deletion after export confirmation.                                   |
| REQ-PLAT-005 | MVP / Should       | Provide contextual help, a first-run school setup checklist (academic year, classes, subjects, grading scale, users), and sample import templates.                                               |
| REQ-PLAT-006 | R1 / Should        | Allow in-app problem reports with non-sensitive context (page, version, request ID) and display planned-maintenance announcements.                                                               |
| REQ-PLAT-007 | MVP / Should       | Before marks entry opens, validate that grading scale, offerings, assignments, and enrolled students exist, and list missing prerequisites.                                                      |
| REQ-PLAT-008 | MVP / Could        | Provide permission-aware global search over in-scope students, teachers, classes, and documents.                                                                                                 |
| REQ-PLAT-009 | MVP / Should       | Provide sortable, filterable, paginated lists, with saved filters and column selection for common lists.                                                                                         |
| REQ-PLAT-010 | MVP / Could        | Provide safe bulk actions with preview and an undo window where feasible.                                                                                                                        |

## G. Integrations

| ID          | Release / priority | Requirement                                                                                                                                  |
| ----------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| REQ-INT-001 | R1 / Must          | Provide a pluggable SMS provider with delivery reports, retries, per-tenant quotas, cost tracking, and a Nepal-compatible baseline provider. |
| REQ-INT-002 | R1 / Must          | Provide a pluggable email provider with SPF/DKIM-ready sender configuration, bounce handling, and unsubscribe for non-mandatory mail.        |
| REQ-INT-003 | R1 / Must          | Keep OCR/AI behind a replaceable adapter boundary independent of the marks engine, with versioned input/output formats.                      |
| REQ-INT-004 | MVP / Should       | Provide downloadable CSV/Excel templates for every importable entity, with documented columns and examples.                                  |
| REQ-INT-005 | R1 / Could         | Support configurable board/government reporting export when the required authority format is identified.                                     |
| REQ-INT-006 | F                  | Provide a public API with tenant-scoped keys, rate limits, and webhooks for external systems.                                                |
| REQ-INT-007 | F                  | Add a payment gateway adapter only when a fees module is approved.                                                                           |

## H. Notifications and portals

| ID           | Release / priority | Requirement                                                                                                                                                                                |
| ------------ | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| REQ-NOT-002  | R1 / Should        | Send event-driven notifications for result publication, marks review, approvals, import completion/failure, document readiness, invitations, password resets, and guardian absence alerts. |
| REQ-NOT-003  | R1 / Should        | Do not include marks or sensitive data in SMS/email unless the school enables it; default to a neutral “result available, log in to view” message.                                         |
| REQ-NOT-004  | R1 / Should        | Provide notification queue rate limits, quiet hours, deduplication, and per-recipient delivery logs.                                                                                       |
| REQ-PORT-002 | R1 / Should        | Show published results, marksheet downloads, attendance summaries, notices, and timetables according to feature toggles and permissions.                                                   |
| REQ-PORT-003 | R1 / Could         | Support structured parent-teacher messages or acknowledgements; keep free-form chat out of scope until moderation is designed.                                                             |

## I. Reports and analytics

| ID          | Release / priority | Requirement                                                                                                                                                                                                                     |
| ----------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| REQ-REP-002 | MVP / Must         | Provide class result ledgers, subject analysis, pass/fail summaries, grade distributions, top performers, student progress across exams, marks-entry completion by teacher/class, attendance summaries, and import/job history. |
| REQ-REP-003 | MVP / Should       | Show coordinators teacher/subject/section marks-entry status (submitted, pending, overdue) with optional reminders.                                                                                                             |
| REQ-REP-004 | R1 / Could         | Provide cross-year/cohort trends while preventing identification of individuals in small groups. Minimum aggregate group size is proposed for owner confirmation.                                                               |
| REQ-REP-005 | MVP / Should       | Include generation time, generator, filters, and a draft/unapproved-data indicator where relevant on every exported/printed report.                                                                                             |

## J. Non-functional requirements

The source's verification-code column had no legend and was malformed in places. The behaviors below
are retained; verification methods must be assigned in the atomic traceability update.

| ID           | Requirement and proposal status                                                                                                                                                                       |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NFR-PERF-003 | Handle marks-entry and result-publication surges. Proposed target: 500 concurrent portal readers per school without degradation, using cached published-result reads. Target requires owner approval. |
| NFR-USE-003  | Marks grids autosave drafts and show saved/unsaved/failed status; unsaved work survives a dropped connection and page refresh within the session.                                                     |
| NFR-USE-004  | Responsive web is the baseline. Offline draft caching in an installable PWA is proposed for marks entry; native apps are out of scope for v1.0.                                                       |
| NFR-USE-005  | Provide keyboard-driven marks entry (tab/enter, Excel paste) and bulk selection. Proposed target: no more than three clicks to daily tasks; requires owner approval.                                  |
| NFR-LOC-002  | Store timestamps in UTC and display Nepal Standard Time (UTC+05:45) unless the school configures otherwise.                                                                                           |
| NFR-LOC-003  | Support BS academic-year boundaries and AD/BS date input toggle; identify the displayed calendar in reports.                                                                                          |
| NFR-LOC-004  | Externalize UI strings for complete English and Nepali translation; adding a language requires no code change.                                                                                        |
| NFR-LOC-005  | Support Nepali/Devanagari sorting and search. Transliteration-friendly search is proposed as a Could item.                                                                                            |
| NFR-DAT-001  | Define required fields, formats, ranges, and uniqueness in the data dictionary and enforce them consistently in UI, API, and imports.                                                                 |
| NFR-DAT-002  | Archive/soft-delete people and academic records; permit hard deletion only through governed retention. The source references REQ-PRIV-001, whose definition is missing from the current register.     |
| NFR-DAT-003  | Version database migrations and make them reversible or forward-fixable; test against realistic data volumes.                                                                                         |
| NFR-OBS-001  | Let operators trace a report by request ID across logs, jobs, and audit without access to unauthorized personal data.                                                                                 |
| NFR-OBS-002  | Provide metrics/alerts for errors, latency, queue depth, job failures, backup success, login failures, storage growth, and per-tenant usage.                                                          |
| NFR-COST-001 | Meter per-tenant storage, SMS, OCR pages, and jobs to measure costs and enforce quotas.                                                                                                               |
| NFR-API-001  | Standardize API versioning, error codes, pagination, idempotency for create/import/publish, and OpenAPI/code synchronization.                                                                         |
| NFR-CMP-001  | Proposed browser baseline: latest two versions of Chrome, Edge, Firefox, Safari, and Android Chrome; define minimum screen widths per flow. Requires owner approval.                                  |
| NFR-A11Y-001 | Target WCAG 2.1 AA, including screen-reader labels on marks grids and no color-only status indicators.                                                                                                |
| NFR-DR-001   | Document restore order (database, object storage, queues) and test restoring one tenant without affecting others. The target is proposed and needs owner approval.                                    |
| NFR-CONC-001 | Use optimistic locking or versioning for marks, results, and settings so concurrent edits cannot silently overwrite one another.                                                                      |
| NFR-IDEM-001 | Make imports, result runs, document batches, and OCR jobs idempotent and resumable so retries do not create duplicates.                                                                               |

## K. Explicit v1.0 exclusions

- Fees, accounting, library, transport, hostel, payroll, and inventory.
- Learning management (lessons, homework, online classes, and quizzes).
- Free-form chat and social features.
- Native mobile applications.
- Biometric/RFID attendance hardware integration.
- Video/proctoring.
- Government-system integrations unless a required format is identified.

## L. Proposed release summary

| Release | Scope in this addendum                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| MVP     | Bilingual names, student profile/sensitive fields, legacy import, transfer-out, account roles/onboarding, cumulative results, remarks, grace/moderation, promotion rules, student exceptions, result explanation/comparison/publication controls, year rollover, calendar, document print/branding/signature/QR/template features, feature toggles, tenant export/offboarding, school setup checklist, standard reports, marks-progress dashboard, autosave, time zone, translation, data quality, concurrency, and idempotency. |
| R1      | Admissions, character/bonafide certificates, multi-school accounts, bulk student/parent accounts, rechecks, supplementary exams, exam logistics, timetables/substitutes, tamper-evident PDFs, subdomains, in-app support, SMS/email/OCR/board adapters, event notifications, portal additions, and trend analytics.                                                                                                                                                                                                              |
| F       | Non-teaching staff records, public API/webhooks, payment gateway, and other administration modules.                                                                                                                                                                                                                                                                                                                                                                                                                              |

## Reconciliation notes and open references

- `REQ-ACC-001` references `REQ-AUTH-003` for segregation of duties; that ID is absent from the current register and must be defined or replaced with the accepted authorization rule.
- `REQ-DOC-007` references `REQ-DOC-002` for public verification; the current register covers only minimal verification under `REQ-DOC-001`. Confirm whether to add the referenced ID or map it to the existing requirement.
- `REQ-EXM-006` references `REQ-RES-001f`; the current register uses broad `REQ-RES-001`. Create/confirm the atomic sub-ID during traceability work.
- `NFR-DAT-002` references `REQ-PRIV-001`, absent from the current register. Define it or map it to the approved privacy/retention requirements.
- Feature toggles, timetable, profiles, roles, report cards, notification preferences, locale, and private file handling overlap existing requirement families. Keep one authoritative ID per behavior when these are atomized; do not duplicate existing requirements.

## Traceability and approval gate

All items above are intake requirements, not evidence of implementation. Before architecture freeze,
decompose each into observable behaviors and trace it to approved use cases, business rules, data
contracts, APIs, UI, and executable acceptance tests. Confirm every `[PROPOSED]` value and release
assignment with named owners. This remains a Phase 13 no-go item until that work is complete and
the consistency audit is rerun.
