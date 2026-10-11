# D2 — Data and Domain Design

## Ownership model

`School` owns academic years, people, assignments, exams, marks, documents, notices, and audit records. `Enrollment` joins a student to historical academic placement. `TeacherAssignment` is the access-bearing relationship for teaching scope. The marks module owns `MarkEntry`, `Result`, and publication snapshots.

## Essential entities

School, User, Role, Permission, PermissionGrant/Scope, AcademicYear, Class, Section, Subject, Student, Guardian, StudentGuardian, Enrollment, Teacher, TeacherAssignment, SubjectOffering, Exam, ExamSubject, AssessmentBlueprint/Component, MarkEntry/Revision, Result/ResultSnapshot, AttendanceRecord, Upload, ImportSession/Record/Issue, DocumentTemplate/Version, GeneratedDocument/History, Notice, Notification, AuditLog, Job/OutboxEvent.

## Integrity requirements

Tenant-local identifiers use compound unique constraints with `schoolId`. Foreign references validate tenant ownership. Soft deletion is used for operational records; published academic facts/audits are immutable. Use indexes for tenant + state + common filters, and revisions/unique keys for concurrency and idempotency.

## Data dictionary and ERD

Before migration, each field must document type, required/default, validation, sensitivity, index, retention, owner, and audit treatment. The ERD must be generated/reviewed against the Prisma schema; discrepancies block architecture freeze.
