# D0.5 — Use Case Specifications

## Purpose

This defines the mandatory specification format and the first five critical SchoolOS use cases. Every later feature must be written in this format before implementation.

## UC-STU-001 — Register and enroll a student

**Actors:** school administrator; delegated operational staff.  
**Permission/scope:** `students.create` and `enrollments.create` in the current school and academic year.  
**Preconditions:** authenticated active user; school, academic year, class, and section exist; admission number and academic ID are available.  
**Trigger:** actor submits the student registration form.

Main flow: validate request → verify identifiers are unique within school → create student → optionally validate academic placement → create active enrollment → write audit events → return student and enrollment. The operation is transactional: an invalid enrollment creates neither a partial enrollment nor an untracked student.

Alternatives: save as applicant without enrollment; link an existing guardian; return a duplicate conflict with no sensitive details. Postcondition: a tenant-owned student and, when requested, one active enrollment exist. Tests: duplicate IDs, cross-school IDs, invalid section/class combinations, rollback, permission denial, audit emission.

## UC-MRK-001 — Save and submit marks

**Actors:** assigned teacher; examination staff.  
**Permission/scope:** `marks.write` for exact school/year/class/section/subject/exam assignment.  
**Preconditions:** marks entry is open; eligible enrollment exists; assessment blueprint is active.

Main flow: load roster through assignment scope → validate component/attendance/value → save idempotent draft with revision → audit previous and new values → teacher submits → validate all required entries and legal state → transition to submitted. A submitted mark cannot be overwritten through the normal save route.

Alternatives: absent/exempt value; incomplete roster remains draft; stale revision returns conflict. Postcondition: draft or submitted marks have complete provenance. Tests: assignment escape, mark range, absence handling, stale save, double submit, published-mark edit denial.

## UC-IMP-001 / UC-IMP-002 — Import and approve marks

**Actors:** teacher/exam coordinator creates/reviews; configured approver approves.  
**Permission/scope:** import and marks permissions for the selected assessment context.  
**Preconditions:** source file passes validation; target exam and subject are selected.

Create flow: privately store original → create immutable import session and idempotency key → queue processing → normalize/extract → match students → validate → route problematic rows to review. Approval flow: verify session is reviewed, approval authority, and no unresolved errors → revalidate against current records → atomically apply rows through marks engine → mark session completed → audit summary. Repeating the request returns the first completed result.

Exceptions: malware/invalid file, provider failure, ambiguous match, changed roster, duplicate import, published-mark conflict. Tests: job retry, low confidence, unauthorized approval, all-or-nothing transaction, duplicate confirmation.

## UC-RES-001 — Calculate, approve, and publish results

**Actors:** examination staff; principal or designated approver.  
**Preconditions:** approved required marks and a versioned grading configuration exist.

Calculation is deterministic: load only eligible approved marks → apply absence/optional/pass rules → create calculated result revisions. Review/approval validates every result. Publication requires all target results approved, writes immutable snapshots, queues optional document/notification intents, and records an audit event. Reopen requires elevated permission and reason; it preserves published history and flags affected documents.

## UC-DOC-001 — Generate a marksheet or other document

**Actors:** authorized exam staff or school administrator; authorized recipient downloads.  
**Preconditions:** source result is published/eligible; approved template version exists.

Flow: authorize source data → create generation record with source/template versions → queue renderer → generate private artifact → checksum/store → record history → notify/requester can download with authorization. Verification is public only by opaque code and returns minimal authenticity/status. Tests: source scope, missing template, renderer retry, private-download denial, verification privacy.

## Completion criteria

All release use cases must derive from this form and map to an API, UI surface, business rules, data entities, audit event, and tests.
