# Document 02 — Requirements Traceability Matrix

## Rules

Every requirement has one accountable module and at least one use case, business rule, data model, API/UI surface, and test. `TBD` is forbidden at design freeze; a deferred item receives release `R1/F` and a trace row, not a missing link.

| Requirement                              | Use case               | Rule                  | Data                                            | API                                       | UI                     | Test            |
| ---------------------------------------- | ---------------------- | --------------------- | ----------------------------------------------- | ----------------------------------------- | ---------------------- | --------------- |
| REQ-AUTH-001 Login/session/reset         | UC-AUTH-001–007        | BR-ID-001             | User, Session, ResetToken                       | `/auth/*`                                 | Login/security screens | TC-AUTH-001–006 |
| REQ-AUTH-002 Scoped authorization        | UC-AUTH-009–018        | BR-TEN-001, BR-ID-002 | Role, Permission, Grant, Assignment             | all protected endpoints                   | user/access screens    | TC-SEC-001–006  |
| REQ-SCH-001 School lifecycle/isolation   | UC-SCH-001–003,017     | BR-TEN-001            | School, status, audit                           | `/schools`                                | school profile         | TC-TEN-001–003  |
| REQ-SCH-002 Versioned settings/flags     | UC-SCH-004,008–014     | BR-CFG-001            | Settings, ConfigVersion, Flag                   | `/schools/me/settings`                    | settings               | TC-CFG-001–004  |
| REQ-ACA-001 Academic structure           | UC-ACA-001–009         | BR-ACA-001–002        | Year, Period, Class, Section, Subject, Offering | `/academic-*`, `/classes`, `/subjects`    | academics              | TC-ACA-001–008  |
| REQ-TEA-001 Teacher/assignment           | UC-TEA-001–005         | BR-ASSIGN-001         | Teacher, Assignment                             | `/teachers`, `/assignments`               | teachers/assignments   | TC-TEA-001–005  |
| REQ-STU-001 Student/guardian/enrollment  | UC-STU-001–010         | BR-STU-001–002        | Student, Guardian, Enrollment                   | `/students`, `/guardians`, `/enrollments` | students/profile       | TC-STU-001–010  |
| REQ-ATT-001 Attendance                   | UC-ATT-001–005         | BR-ATT-001            | AttendanceRecord                                | `/attendance`                             | attendance grid        | TC-ATT-001–005  |
| REQ-EXM-001 Exam setup/lifecycle         | UC-EXM-001–008         | BR-EXM-001            | Exam, ExamSubject, Schedule                     | `/exams`                                  | examinations           | TC-EXM-001–008  |
| REQ-MRK-001 Components/statuses          | UC-MRK-001–004         | BR-MRK-001–002        | Blueprint, Component, MarkEntry                 | `/marks`                                  | marks grid             | TC-MRK-001–006  |
| REQ-MRK-002 Review/approval/correction   | UC-MRK-005–010         | BR-MRK-003–004        | MarkRevision, Approval                          | `/marks/*/submit                          | review                 | approve         | reopen` | review queue | TC-MRK-007–014 |
| REQ-AI-001 Secure AI/OCR import          | UC-IMP-001–012         | BR-IMP-001–002        | Upload, ImportSession, Row, Match, ReviewTask   | `/imports`, `/files`                      | upload/review          | TC-AI-001–015   |
| REQ-RES-001 Result engine/versioning     | UC-RES-001–008         | BR-RES-001–002        | Result, Snapshot, GradeRule                     | `/results`                                | results/approval       | TC-RES-001–010  |
| REQ-DOC-001 Templates/documents          | UC-DOC-001–012         | BR-DOC-001            | TemplateVersion, Document, History              | `/templates`, `/documents`, `/verify`     | document/template      | TC-DOC-001–010  |
| REQ-REP-001 Reports/exports              | UC-REP-001–008         | BR-REP-001            | Projection, ExportJob                           | `/reports`, `/exports`                    | dashboards/reports     | TC-REP-001–006  |
| REQ-NOT-001 Notices/notifications        | UC-NOT-001–010         | BR-NOT-001            | Notice, Intent, Delivery, Preference            | `/notices`, `/notifications`              | notices/preferences    | TC-NOT-001–008  |
| REQ-PORT-001 Student/parent portals      | UC-PORT-001–006        | BR-PRV-001            | AccountLink, Student, Result                    | `/portal/*`                               | portal views           | TC-PORT-001–006 |
| REQ-FIL-001 Private file management      | UC-FIL-001–008         | BR-FIL-001            | File, Upload, checksum                          | `/files`                                  | file manager           | TC-FIL-001–008  |
| REQ-AUD-001 Audit/forensics              | UC-AUD-001–004         | BR-AUD-001            | AuditLog, LoginEvent                            | `/audit`                                  | audit viewer           | TC-AUD-001–006  |
| REQ-OPS-001 Operations/support           | UC-OPS-001–008         | BR-OPS-001            | Job, Health, SupportAccess                      | `/jobs`, `/health`, `/platform`           | operations             | TC-OPS-001–008  |
| REQ-CFG-001 Feature flags                | UC-SCH-004             | BR-CFG-002            | FeatureFlag, ConfigVersion                      | `/feature-flags`                          | settings               | TC-CFG-005      |
| REQ-CON-001 Concurrency conflict         | UC-MRK-002, UC-RES-004 | BR-CON-001            | revision/version                                | mutation endpoints                        | conflict dialog        | TC-CON-001–003  |
| REQ-IDEM-001 Idempotency/retry           | UC-IMP-010, UC-DOC-006 | BR-IDEM-001           | idempotency key, Job                            | imports/jobs/documents                    | job status             | TC-IDEM-001–004 |
| REQ-LOC-001 Locale/date/time             | UC-SCH-008, UC-DOC-003 | BR-LOC-001            | locale/timezone/canonical dates                 | locale-aware endpoints                    | locale settings        | TC-LOC-001–004  |
| REQ-SEC-001 API/file/session security    | all sensitive UCs      | BR-SEC-001–006        | session, audit, file metadata                   | all endpoints                             | security messages      | TC-SEC-007–015  |
| NFR-PERF-001 Performance/scale           | UC-REP-005, UC-IMP-003 | BR-PERF-001           | indexes/cache/job metrics                       | list/export/job endpoints                 | pagination/progress    | TC-PERF-001–006 |
| NFR-REL-001 Recovery/continuity          | UC-OPS-003–008         | BR-REL-001            | backup/restore/job history                      | health/admin endpoints                    | health/incident view   | TC-REL-001–005  |
| NFR-USE-001 Accessibility/responsive     | all UI UCs             | BR-UX-001             | n/a                                             | n/a                                       | all role screens       | TC-UX-001–008   |
| NFR-AI-001 AI quality/evaluation         | UC-IMP-003–009         | BR-AI-001             | OCR metadata/evaluation set                     | import quality endpoints                  | review metrics         | TC-AI-016–020   |
| NFR-PRV-001 Privacy/retention/legal hold | UC-FIL-006, UC-SCH-017 | BR-PRV-002            | retention, hold, deletion log                   | privacy/admin endpoints                   | retention tools        | TC-PRV-001–006  |

## Completion rules

The test IDs are specification IDs, not evidence of implemented tests. Document 14 defines the detailed test cases. The data/API/UI names are contract targets; Document 06/08/12 make them final. Change requests must update every affected row.

## v0.3 addendum traceability intake

The added requirements are registered in [Requirements Register](../requirements/requirements-register.md)
and specified in [Software Requirements Addendum v0.3](../requirements/software-requirements-addendum-v0.3.md).
The rows below identify the design surfaces that must be updated; they are **not completed atomic
traces**. Do not use them as evidence of design approval, implementation, or test execution.

| Requirement family                        | Addendum IDs                                                                                                                                                                   | Design artifacts requiring atomic trace          |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------ |
| Student lifecycle and admissions          | REQ-STU-004–011, REQ-ADM-001–004                                                                                                                                               | Documents 03, 06, 08, 09, 12, 18, 22             |
| Accounts and identity                     | REQ-ACC-001–007                                                                                                                                                                | Documents 03, 06, 08, 09, 12, 19, 22             |
| Exams, marks, results                     | REQ-EXM-002–010, REQ-RES-004–006                                                                                                                                               | Documents 03, 06, 08, 11, 13, 20, 21, 22, 32     |
| Timetable, staff, academic year           | REQ-TT-001–003, REQ-STF-001, REQ-ACA-003–004                                                                                                                                   | Documents 03, 06, 08, 12, 18, 22                 |
| Documents                                 | REQ-DOC-005–012                                                                                                                                                                | Documents 03, 06, 08, 09, 12, 18, 21, 22         |
| Platform and tenant capabilities          | REQ-PLAT-001–010                                                                                                                                                               | Documents 03, 06, 07, 08, 09, 12, 18, 19, 22, 23 |
| Integrations                              | REQ-INT-001–007                                                                                                                                                                | Documents 07, 08, 10, 15, 21, 22, 23             |
| Notifications and portals                 | REQ-NOT-002–004, REQ-PORT-002–003                                                                                                                                              | Documents 03, 06, 08, 09, 12, 18, 22             |
| Reports and analytics                     | REQ-REP-002–005                                                                                                                                                                | Documents 06, 08, 11, 12, 18, 22                 |
| Cross-cutting non-functional requirements | NFR-PERF-003, NFR-USE-003–005, NFR-LOC-002–005, NFR-DAT-001–003, NFR-OBS-001–002, NFR-COST-001, NFR-API-001, NFR-CMP-001, NFR-A11Y-001, NFR-DR-001, NFR-CONC-001, NFR-IDEM-001 | Documents 06–15, 18–23                           |

**Trace state:** open; atomic UC/BR/data/API/UI/test IDs and owner-approved acceptance criteria have
not yet been assigned. The addendum also contains unresolved references to REQ-AUTH-003,
REQ-DOC-002, REQ-RES-001f, and REQ-PRIV-001; resolve or remap these before the Phase 13 audit is
rerun. Proposed values and release assignments remain subject to owner approval.
