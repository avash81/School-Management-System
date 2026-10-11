# D0.4 — Full Use Case Model

## Status

**Planning artifact.** This document maps SchoolOS capabilities to actors. It defines intended behaviour and ownership; it does not grant permissions. D0.25 will turn this model into the enforceable permission matrix.

## System boundary and notation

```text
Actor ── performs ──> (Use case inside SchoolOS)
(A) --<<include>>--> (B)  means A always performs B
(A) --<<extend>>--> (B)   means A conditionally adds to B
```

All school-level use cases include `Authenticate actor`, `Resolve school tenant`, `Authorize permission and scope`, and `Write audit event` when they mutate official or sensitive data. These cross-cutting actions are not repeated in every diagram below.

## Actor capability map

| Area                 | School admin              | Principal                    | Exam coordinator            | Teacher                | Operational staff         | Student / Parent    | Platform operator       |
| -------------------- | ------------------------- | ---------------------------- | --------------------------- | ---------------------- | ------------------------- | ------------------- | ----------------------- |
| Identity and access  | manage school users/roles | view delegated access        | —                           | manage own session     | —                         | manage own session  | manage platform access  |
| School setup         | manage                    | view                         | delegated view              | assigned view          | limited view              | —                   | manage tenants          |
| Students/enrollment  | manage                    | view                         | assigned view               | assigned view          | delegated manage          | own/linked view     | emergency support only  |
| Teachers/assignments | manage                    | view                         | view/manage delegated exams | view own               | limited view              | —                   | emergency support only  |
| Exams and marks      | manage/override           | approve when policy requires | manage/review/approve       | assigned entry/submit  | limited view              | published view      | emergency support only  |
| Imports/documents    | manage                    | approve/view                 | manage/review/generate      | assigned upload/review | delegated documents       | published documents | service operations only |
| Reports/notices      | manage                    | view/approve                 | exam reports                | assigned reports       | delegated reports/notices | published notices   | platform health only    |

## UC-01 Identity and access

```text
(Sign in)
  --<<include>>--> (Validate credentials)
  --<<include>>--> (Check account and school status)
  --<<include>>--> (Create session)

(Reset password)
  --<<include>>--> (Issue single-use reset token)
  --<<include>>--> (Notify account owner)
  --<<include>>--> (Revoke prior sessions after reset)

(Manage school user access)
  --<<include>>--> (Assign role and scoped permissions)
  --<<include>>--> (Audit access change)
```

Actors: all interactive users sign in/out/manage their own sessions; school administrator manages school access; platform operator manages platform access. Account invitation, activation, suspension, and support access are conditional extensions of user management.

## UC-02 School and academic configuration

```text
School administrator ──> (Manage school profile)
School administrator ──> (Manage academic year)
School administrator ──> (Manage class, section, subject)
School administrator ──> (Configure grading rules)
Exam coordinator ──────> (Configure assessment blueprint)

(Activate academic year) --<<include>>--> (Validate date range)
(Activate academic year) --<<include>>--> (Deactivate prior active year if policy permits)
(Configure assessment blueprint) --<<include>>--> (Version configuration)
```

Academic configuration cannot be destructively altered when referenced by published results. The conditional `Retire/archive configuration` use case preserves historical references.

## UC-03 Student and guardian management

```text
School administrator / authorized staff ──> (Register student)
School administrator / authorized staff ──> (Update student profile)
School administrator / authorized staff ──> (Manage guardian links)
School administrator / authorized staff ──> (Enroll student)
School administrator ────────────────────> (Transfer student)
School administrator ────────────────────> (Promote student)
School administrator ────────────────────> (Archive student)
Teacher / exam coordinator ──────────────> (View assigned student roster)
Student / parent ─────────────────────────> (View own or linked profile)

(Register student) --<<include>>--> (Validate identity uniqueness)
(Register student) --<<extend>>--> (Enroll student)
(Transfer student) --<<include>>--> (End active enrollment)
(Transfer student) --<<include>>--> (Create destination enrollment)
(Promote student) --<<include>>--> (Validate next academic placement)
```

Search and view functions are scope-aware. Student/parent self-service excludes internal notes, other guardians, draft results, import evidence, and audit records.

## UC-04 Teacher and assignment management

```text
School administrator ──> (Register/update teacher)
School administrator ──> (Assign teacher to academic context)
School administrator ──> (End/reassign teacher assignment)
Teacher ───────────────> (View own assignments and roster)
Principal ─────────────> (View teacher workload)

(Assign teacher) --<<include>>--> (Validate school, year, class, section, subject)
(View assigned roster) --<<include>>--> (Enforce assignment scope)
```

Assignments define teacher access; a role called “teacher” alone provides no broad student or marks access.

## UC-05 Attendance

```text
Teacher / delegated staff ──> (Record attendance)
Teacher / delegated staff ──> (Amend attendance)
School admin / principal ───> (View attendance report)
Student / parent ───────────> (View published own/linked attendance)

(Record attendance) --<<include>>--> (Load authorized class roster)
(Amend attendance) --<<include>>--> (Record reason and history)
```

Attendance is an MVP core use case. Amendments after the configured close period require elevated permission and an audit reason.

## UC-06 Examination management

```text
Exam coordinator / school admin ──> (Create examination)
Exam coordinator / school admin ──> (Configure exam subjects and components)
Exam coordinator / school admin ──> (Configure schedule and eligibility)
Exam coordinator / school admin ──> (Open/close marks entry)
Principal ─────────────────────────> (Review examination overview)

(Create examination) --<<include>>--> (Select academic year)
(Configure exam subject) --<<include>>--> (Attach versioned assessment blueprint)
(Open marks entry) --<<include>>--> (Validate teacher assignments and eligible enrollments)
```

Closing marks entry is not the same as publishing results; it stops normal editing and begins the review/approval workflow.

## UC-07 Manual marks lifecycle

```text
Teacher ─────────────────────> (Enter or save draft marks)
Teacher ─────────────────────> (Submit marks)
Exam coordinator ────────────> (Review marks)
Exam coordinator / approver ─> (Approve marks)
School admin / authorized role > (Request or authorize correction)

(Enter or save draft marks) --<<include>>--> (Load authorized exam roster)
(Enter or save draft marks) --<<include>>--> (Validate mark component and attendance status)
(Submit marks) --<<include>>--> (Validate completeness)
(Review marks) --<<extend>>--> (Reject marks with reason)
(Approve marks) --<<include>>--> (Verify lifecycle and approver scope)
(Authorize correction) --<<include>>--> (Record reason and reopen history)
```

No actor silently overwrites a submitted, approved, published, or locked mark. A policy may forbid an actor from approving their own submission.

## UC-08 AI/OCR marks import

```text
Teacher / exam coordinator ──> (Create marks import)
Teacher / exam coordinator ──> (Review extracted import rows)
Teacher / exam coordinator ──> (Correct proposed values and matches)
Authorized approver ─────────> (Approve import)
Authorized actor ────────────> (Retry, cancel, or reject import)

(Create marks import) --<<include>>--> (Validate and privately store source file)
(Create marks import) --<<include>>--> (Queue extraction job)
(Process import) --<<include>>--> (Extract table data)
(Process import) --<<include>>--> (Match students and validate marks)
(Process import) --<<extend>>--> (Route low-confidence rows to review)
(Approve import) --<<include>>--> (Revalidate reviewed rows)
(Approve import) --<<include>>--> (Apply official marks through marks engine)
```

AI/OCR service and worker are supporting system actors: they process only the job/artifact scope provided by SchoolOS. `Approve import` is idempotent and follows the same marks lifecycle restrictions as manual entry.

## UC-09 Results lifecycle

```text
Exam coordinator ────────────> (Calculate results)
Exam coordinator ────────────> (Review calculated results)
Authorized approver ─────────> (Approve results)
Authorized publisher ────────> (Publish results)
School admin / approver ─────> (Reopen published results)
Student / parent / teacher ──> (View published scoped result)

(Calculate results) --<<include>>--> (Validate approved required marks)
(Calculate results) --<<include>>--> (Apply versioned grading rules)
(Publish results) --<<include>>--> (Validate all results approved)
(Publish results) --<<include>>--> (Create immutable result snapshot)
(Publish results) --<<extend>>--> (Queue notifications and documents)
(Reopen published results) --<<include>>--> (Record reason and invalidate affected outputs)
```

Calculation does not implicitly publish. Empty/incomplete result sets fail visibly; they never become published merely because no invalid row was found.

## UC-10 Document and template management

```text
School administrator ─────────> (Manage document templates)
Exam coordinator / authorized staff -> (Generate document)
Authorized staff ─────────────> (Generate document batch)
Authorized user ──────────────> (Download private document)
Public verifier ──────────────> (Verify document authenticity)

(Generate document) --<<include>>--> (Load authorized published source data)
(Generate document) --<<include>>--> (Select approved template version)
(Generate document) --<<include>>--> (Queue render job)
(Generate document batch) --<<include>>--> (Create individual document jobs)
(Verify document authenticity) --<<include>>--> (Return minimal verification status)
```

Document generation is asynchronous. Document verification must not expose student data. Regeneration retains the prior document/history rather than replacing provenance.

## UC-11 Notices, reports, and analytics

```text
School administrator / authorized staff ──> (Draft, publish, archive notice)
Principal / school administrator ─────────> (View dashboards and reports)
Exam coordinator ─────────────────────────> (View exam reports)
Teacher ──────────────────────────────────> (View assigned reports)
Student / parent ─────────────────────────> (View published notice)
Authorized user ──────────────────────────> (Request report export)

(Publish notice) --<<include>>--> (Validate audience and dates)
(Publish notice) --<<extend>>--> (Queue audience notification)
(Request report export) --<<include>>--> (Apply report scope)
(Request report export) --<<include>>--> (Queue export job)
```

Exports are private generated artifacts, not direct unrestricted data dumps.

## UC-12 Platform administration and operations

```text
Platform operator ──> (Onboard, suspend, or manage tenant)
Platform operator ──> (Monitor service, job, backup, and provider health)
Platform operator ──> (Manage platform configuration/integrations)
Platform operator ──> (Request emergency support access)

(Request emergency support access) --<<include>>--> (Obtain approval and reason)
(Request emergency support access) --<<include>>--> (Time-limit and audit access)
```

Platform operations cannot be used as a routine path to alter school academic records.

## Included and extended relationships summary

| Primary use case         | Always includes                                        | Conditional extensions          |
| ------------------------ | ------------------------------------------------------ | ------------------------------- |
| Register student         | uniqueness validation, audit                           | enrollment                      |
| Save marks               | scope, roster, mark validation, audit                  | correction workflow             |
| Submit marks             | completeness/lifecycle validation                      | rejection after review          |
| Create import            | file validation, storage, queued processing            | low-confidence review           |
| Approve import           | revalidation, idempotent marks application, audit      | conflict escalation             |
| Calculate/publish result | approved-marks/grading validation, snapshot on publish | notifications/documents; reopen |
| Generate document        | source/template authorization, queued rendering        | batch generation                |
| Publish notice           | audience/date validation, audit                        | notification delivery           |

## MVP use-case boundary

The MVP must deliver UCs 01–07, UC-09, UC-10 for marksheets, UC-11 notices/core reports, and UC-12 operations. UC-08 AI/OCR and expanded student/parent portal capability may ship after the transactional marks engine, permissions, storage, jobs, audit, and test baseline are proven.

## D0.4 completion criteria

- Every human and system actor from D0.3 is mapped to one or more use cases.
- High-risk academic and import flows identify explicit approver/authorizer roles.
- Every mutation has validation, scope, lifecycle, and audit implications.
- The MVP boundary and deferred use cases are recorded.
- D0.5 can now specify the first mandatory use cases in executable detail.

## Next artifact

**D0.5 — Use Case Specifications.** Start with UC-STU-001, UC-MRK-001, UC-IMP-001/002, UC-RES-001, and UC-DOC-001.
