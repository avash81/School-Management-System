# Document 01 — Final Software Requirements Specification

## Part 3: Module Requirements

**Companion:** Parts 1–2 define the foundation and global requirements. This part assigns them to modules without duplicating detailed use-case flows.

| Module                  | Required behaviour                                                                                              | Key dependencies                              |
| ----------------------- | --------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| Identity & access       | Accounts, sessions, password lifecycle, roles, permissions, scope grants, security/audit history.               | School tenancy, notification delivery, audit. |
| School configuration    | Tenant profile, branding, contact/address, locale/time/date, policies, feature flags, versioned settings.       | Files, templates, academic/results engines.   |
| Academic structure      | Years/periods/calendar, classes/sections, subjects/types, offerings, components, assignments.                   | Tenant configuration, people, exams.          |
| People & enrollment     | Students, guardians, photos, teachers, employment/assignment, enrollment status/history.                        | Academic structure, files, audit.             |
| Attendance              | Daily/subject status, authorized rosters, amendments, reports/portal visibility.                                | Enrollment, assignments, notifications.       |
| Examination             | Exam lifecycle, schedule, offerings, eligibility, assessment blueprints and entry windows.                      | Academic structure, marks.                    |
| Marks                   | Manual/bulk input, component/status validation, revisions, submit/review/approve/lock/correct.                  | Assignment scope, exam, audit, results.       |
| Import & AI/OCR         | Private source ingest, mapping, jobs, extraction, matching, confidence, human review, governed import/rollback. | Files, queue, marks, audit.                   |
| Results                 | Deterministic calculation, grading/GPA/pass policy, revisions, review/approval/publish/lock/reopen.             | Approved marks, versioned rules, documents.   |
| Documents & templates   | Versioned approved templates, render jobs, private files, verification/revocation, bulk output.                 | Results/people/configuration/storage.         |
| Reports & analytics     | Scope-filtered dashboards, aggregates, queued private exports, data-quality visibility.                         | Every domain, queue/storage.                  |
| Notices & notifications | Audience policy, scheduling/publishing, event intents, preferences, delivery tracking.                          | Identity, templates, providers.               |
| Portals                 | Student/parent own/linked published views; teacher/admin role workspaces.                                       | Identity/scope, results/documents/notices.    |
| Audit & operations      | Immutable audit, health, failed jobs/imports, support access, maintenance mode.                                 | All modules, monitoring/backups.              |

## Required configuration boundaries

School-configurable: grading bands, GPA/pass/absence/optional policy; assessment components; academic structure; approval workflows; templates; locale/AD-BS display; feature flags; notification preferences. System-fixed: tenant isolation, server authorization, immutable audit/source history, private-file default, official-record correction workflow, and human control for ambiguous OCR.

## Module acceptance criteria

A module cannot be called complete unless its requirements map to use cases/rules/entities/APIs/UI/tests; authority/data scope is enforced; lifecycle and errors are defined; audit/observability are included where required; configuration versions are respected; and dependent modules have an explicit contract.

## Next

**SRS Part 4:** security, operational, data-governance, and final acceptance details.
