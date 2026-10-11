# D0.4 — Parts 3–8: Remaining Use Case Modules

## Part 3 — Academic Structure Management

Actors: school administrator (manage), exam coordinator (delegated manage), teacher (assigned read). Use cases: create/activate/close academic year; manage term/semester and calendar; manage class/section; manage subject/type; define subject offering; define assessment components/blueprints; assign teacher.

Flow: configure year → periods/calendar → classes/sections → subjects/types → offerings → versioned assessment blueprint → teacher assignment. Every relation is tenant/year valid. Retiring a referenced item preserves history. `Configure offering` includes validating class/section/subject/teacher/year; `configure blueprint` includes non-overlapping component/range/pass-policy validation. Data: AcademicYear, AcademicPeriod, CalendarEvent, Class, Section, Subject, SubjectType, SubjectOffering, AssessmentBlueprint/Component, TeacherAssignment.

## Part 4 — Student, Guardian, Teacher, and Attendance Management

Actors: school admin/staff (records), teacher (assigned view/write attendance), student/parent (own/linked read), principal (oversight). Use cases: admission/profile/photo/guardian link; enrollment/subject enrollment; transfer/promotion/graduation/archive; teacher profile/employment/workload; daily/subject attendance and amendment/report.

Student lifecycle is applicant → admitted → active → promoted/transferred/graduated/dropped/expelled → archived. Transfer/promotion closes the prior enrollment and appends the new one. Attendance includes present/absent/late/leave and amendment reason/history. Data: Student, Guardian, StudentGuardian, Enrollment, StudentSubject, Teacher, TeacherAssignment, AttendanceRecord, AuditLog.

## Part 5 — Examination, Marks, Review, and Approval

Actors: exam coordinator (configure/review), teacher (assigned entry/submit), principal/admin (policy approval), student/parent (published view). Use cases: create/configure/open/close/lock exam; schedule/subject/component eligibility; manual/bulk entry; validate; submit/reject/review/approve; controlled correction/reopen.

`Save mark` includes assignment scope, eligible enrollment, component/status/range validation, revision and audit. `Submit` includes completeness. `Approve` includes legal transition and separation policy. Lifecycle is draft → submitted → reviewed → approved → published → locked, with rejection and governed reopen. Data: Exam, ExamSubject, Schedule, Blueprint/Component, MarkEntry/Revision, Approval.

## Part 6 — AI/OCR Import

Actors: teacher/exam coordinator (upload/review), authorized approver (approve), worker/OCR/matching service (bounded processing). Use cases: validate/scan upload; preprocess/OCR/table/field extraction; normalize/map format; identify/match student; score confidence; detect duplicate/error; review/correct; approve/import/rollback.

Pipeline: upload → private store → job → extraction → deterministic/fuzzy matching → confidence/business validation → review-required or approved → idempotent marks-engine import. Low/ambiguous confidence never directly commits. Rollback is a governed compensating correction retaining provenance. Data: Upload, ImportSession, OCRResult, ImportRecord, MatchingResult, ReviewTask, Job, MarkRevision.

## Part 7 — Results and Document Automation

Actors: exam coordinator (calculate), approver/principal/admin (approve/publish), authorized staff (generate), recipients (read/download), verifier (minimal public status). Use cases: calculate subject/overall total/percentage/grade/GPA/pass; approve/publish/lock/reopen result; marksheet/ID/admit/certificate/character certificate/report/notice template preview, generation, bulk generation, print/download/verify.

Only approved official marks feed calculations; publication snapshots source configuration. Documents use approved immutable templates plus source versions, private rendering jobs, checksum/history, and minimum verification response. Data: Result/ResultSnapshot, GradingScheme/Band, Template/TemplateVersion, GeneratedDocument/History, Certificate/VerificationCode.

## Part 8 — Reports, Notices, Notifications, Portals, Audit, Platform Administration

Actors: authorized staff/publisher; principal/admin/exam coordinator; student/parent; platform operator. Use cases: dashboards/reports/private export; draft/publish/archive notices; manage notification template/preferences/delivery; student/parent/teacher/admin portals; audit/login/activity history; platform tenant/health/integration/support operations.

Exports and notifications are queued, private, audited, and scope-filtered. Portals expose own/linked published data only. Platform support access requires reason, approval, time limit, and audit. Data: ReportProjection, ExportJob, Notice, Notification/Preference, AuditLog, ServiceHealth, SupportAccess.

## Relationships

```text
Academic configuration <<include>> offerings, blueprints, assignments
Student admission <<extend>> enrollment, guardian link, photo
Exam configuration <<include>> schedule, subjects/components, eligibility
AI import <<include>> upload validation, extraction, matching, validation
             <<extend>> review, retry, governed rollback
Publish result <<include>> approved marks, grading configuration, snapshot
             <<extend>> documents, notifications
Generate document <<include>> source/template authorization, render job
```
