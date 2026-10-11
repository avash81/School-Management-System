# Document 06 — ERD and Database Specification

## Relationship model

```mermaid
erDiagram
 SCHOOL ||--o{ USER : owns
 SCHOOL ||--o{ ACADEMIC_YEAR : has
 SCHOOL ||--o{ STUDENT : owns
 STUDENT ||--o{ ENROLLMENT : has
 ACADEMIC_YEAR ||--o{ ENROLLMENT : contains
 CLASS ||--o{ SECTION : contains
 SECTION ||--o{ ENROLLMENT : places
 SCHOOL ||--o{ TEACHER : owns
 TEACHER ||--o{ TEACHER_ASSIGNMENT : holds
 SUBJECT ||--o{ SUBJECT_OFFERING : offered_as
 EXAM ||--o{ EXAM_SUBJECT : contains
 EXAM_SUBJECT ||--o{ MARK_ENTRY : receives
 ENROLLMENT ||--o{ MARK_ENTRY : owns
 EXAM ||--o{ RESULT : produces
 ENROLLMENT ||--o{ RESULT : receives
 RESULT ||--o{ RESULT_SNAPSHOT : versions
 UPLOAD ||--o{ IMPORT_SESSION : sources
 IMPORT_SESSION ||--o{ IMPORT_RECORD : contains
 TEMPLATE_VERSION ||--o{ GENERATED_DOCUMENT : renders
```

## Entity specification

| Area             | Tables/entities                                                                                                                | Key constraints/indexes                                                                 |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| Tenancy/identity | School, SchoolSettings/ConfigVersion, User, Session, Role, Permission, UserRole, PermissionGrant, AuditLog                     | tenant indexes; unique tenant code/email policy; session hash unique; audit append-only |
| Academic         | AcademicYear, AcademicPeriod, Class, Section, Subject, SubjectType, SubjectOffering, Blueprint, Component, Teacher, Assignment | unique class/section/subject codes per tenant/year as policy; assignment scope index    |
| People           | Student, Guardian, StudentGuardian, Enrollment, StudentSubject, AttendanceRecord                                               | student IDs unique per school; one active enrollment/student/year; roster indexes       |
| Examination      | Exam, ExamSubject, ExamSchedule, MarkEntry, MarkRevision, Approval                                                             | unique mark per exam-subject/enrollment/component; status/revision indexes              |
| Results          | GradingScheme/Band, ResultPolicy, Result, ResultSnapshot                                                                       | unique exam/enrollment result; snapshot version unique                                  |
| Files/imports    | File/Upload, ImportSession, ImportRecord, MatchResult, ReviewTask, Job                                                         | checksum/context duplicate indexes; job/idempotency unique                              |
| Documents/comms  | Template, TemplateVersion, GeneratedDocument, DocumentHistory, Notice, NotificationIntent/Delivery                             | document verification token unique; template version unique                             |
| Operations       | ExportJob, HealthEvent, SupportAccess, RetentionHold                                                                           | tenant/status/time indexes                                                              |

## Data rules

All tenant-owned rows have `school_id`, creation/update timestamps, and lifecycle/soft-delete fields where operationally appropriate. Official marks/results/documents/configuration use revision/version/snapshot records; audit is append-only. Foreign keys enforce tenant-consistent relations at service and database design level. Canonical instants use UTC; plain academic dates use date types; display locale is not stored as arbitrary date strings.

## Migration and retention

Schema changes are versioned migrations, expand/contract compatible, reviewed/tested/backed up, and never manual production edits. Purge requires retention policy, authorization, audit, and legal-hold check; normal removal is archive/soft delete.
