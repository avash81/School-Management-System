# D0.3 User and Actor Definition

## Status

**Planning artifact.** D0.3 defines who interacts with SchoolOS and the boundaries of each actor. It does not finalize the permission matrix; D0.25 will map every action formally.

## Actor categories

```text
Human actors
  -> platform operator
  -> school administrator
  -> principal
  -> exam coordinator
  -> teacher
  -> operational staff
  -> student
  -> parent/guardian

System actors
  -> web/admin clients
  -> background workers
  -> AI/OCR service
  -> object storage
  -> notification providers
  -> monitoring and backup systems
```

Human roles are school-scoped unless explicitly marked platform-scoped. System actors receive no independent business authority; they act only through authenticated, authorized contracts created by SchoolOS.

## MVP human actors

### Platform operator

Scope: platform-wide operations, not routine school records.

Responsibilities:

- onboard or suspend a school tenant
- manage platform health, deployment, support, and recovery
- inspect operational failures under controlled support access
- manage platform-level configuration and licensing when introduced

Restrictions:

- no routine access to student academic data by default
- support access must be time-limited, purpose-bound, and audited
- cannot bypass school approval workflows silently

### School administrator

Scope: one school tenant, or explicitly assigned schools for platform-managed deployments.

Responsibilities:

- configure school profile, academic years, classes, sections, subjects, and settings
- manage school users, roles, and permissions
- manage students, guardians, teachers, assignments, and enrollments
- create examinations and configure assessment structures
- oversee marks, results, documents, reports, notices, imports, and audit activity
- perform authorized overrides, rollback, and recovery workflows

Restrictions:

- all operations remain school-scoped
- published academic data changes require controlled workflows and reasons
- sensitive support and platform operations are not implied

### Principal

Scope: one school tenant, with governance and approval responsibilities.

Responsibilities:

- review school dashboards, reports, results, notices, and audit activity
- approve or publish configured academic outputs where policy requires
- authorize selected exceptional corrections or imports
- view school-wide academic and operational status

Restrictions:

- cannot access another school
- authority is policy-configurable and does not automatically grant platform operations

### Exam coordinator

Scope: assigned school and examination responsibilities.

Responsibilities:

- create or coordinate examinations when granted
- assign subjects/classes and monitor marks progress
- review marks submissions and AI import records
- resolve or escalate validation conflicts
- approve marks/imports where school policy permits
- view examination and result reports

Restrictions:

- access should be limited to assigned academic contexts where policy requires
- cannot create students or alter enrollment identity without explicit permission
- cannot bypass published-result correction workflow

### Teacher

Scope: assigned classes, sections, subjects, examinations, and students.

Responsibilities:

- view authorized students and enrollments
- enter, save, submit, and correct marks according to lifecycle policy
- upload marks documents for assigned contexts
- review extraction and matching issues
- view assigned examination progress and permitted reports
- create or view notices where granted

Restrictions:

- no access to unrelated classes or schools
- no automatic student creation from imports
- cannot approve critical overrides or rollback imports unless explicitly authorized
- cannot silently edit published marks

### Operational staff

Scope: school tenant and assigned operational modules.

Responsibilities may include:

- admissions and student records
- guardian/contact updates
- document preparation
- notices and administrative reports
- attendance or other later modules when assigned

Restrictions:

- least-privilege module access
- no marks approval, result publication, or sensitive configuration unless separately granted

### Student

Scope: own identity, enrollment, marks, results, documents, and notices.

Responsibilities:

- view permitted personal academic information
- consume published results, marksheets, notices, and documents
- manage permitted profile or account details

Restrictions:

- no access to other students
- no access to drafts, review evidence, source files, or internal audit details
- no mutation of official marks or results

### Parent or guardian

Scope: linked child or children only.

Responsibilities:

- view permitted child profiles, published results, documents, notices, and future attendance/fees information
- receive approved notifications

Restrictions:

- relationship must be verified and tenant-scoped
- no access to unrelated students or internal review/audit data
- no official marks or result mutation

## Future or conditional actors

These actors are not required for the first MVP but must not conflict with the model:

- accountant: fees, payments, accounting reports
- librarian: library circulation and catalog
- transport coordinator: routes and transport assignments
- HR/payroll officer: staff employment and payroll
- counselor/attendance officer: welfare and attendance modules
- external auditor: time-limited read-only audit access
- notification recipient: event delivery endpoint without interactive application access

Future roles must follow the same tenant, permission, audit, and data-minimization rules.

## System actors

### Web portal and admin console

Present UI and API data, collect commands, display progress/errors, and enforce usability constraints. They never decide authorization or write data stores directly.

### Background worker

Processes durable jobs such as imports, OCR stages, exports, documents, and notifications. It verifies job ownership, stage, version, and idempotency before writing durable outputs or acknowledging queue messages.

### AI/OCR service

Performs configured preprocessing, OCR, table/extraction provider calls, and provider-neutral output. It has no direct authority to write students, marks, results, or permissions.

### Object storage

Stores private bytes under server-generated tenant/job keys. It serves only through controlled access contracts and does not determine who may access a file.

### Notification provider

Attempts delivery of approved events. Delivery status is recorded separately from the domain operation and cannot prove that marks, results, or notices were successfully committed.

### Monitoring and backup systems

Collect operational signals and protect recoverability. They have no business mutation authority.

## Scope dimensions

Every human actor request is evaluated across these dimensions:

```text
platform scope
  -> school tenant
  -> academic year
  -> class
  -> section
  -> subject
  -> examination
  -> student relationship
  -> operation permission
```

A role alone is not enough to authorize a request. The final decision combines role/permission, resource ownership, assigned context, lifecycle state, and policy.

## Delegation and separation of duties

The default high-risk workflow is:

```text
Teacher uploads and reviews
  -> exam coordinator verifies
  -> school administrator or principal approves exceptional cases
  -> marks service commits
```

Small schools may combine roles through explicit configuration. Combining roles must not remove audit history, confirmation, or critical-issue checks.

## Account lifecycle

Human accounts follow:

```text
invited -> pending -> active -> suspended/locked -> archived
```

Access is denied for suspended, locked, archived, expired, or school-unlinked accounts. Role and permission changes are audited and take effect according to the session policy defined in D0.15.

## Actor-to-system interaction summary

| Actor                | Primary surfaces            | Typical capabilities                     | Primary data scope                  |
| -------------------- | --------------------------- | ---------------------------------------- | ----------------------------------- |
| Platform operator    | operations/admin tools      | tenant operations, health, recovery      | platform; restricted support access |
| School administrator | admin console               | full school configuration and governance | one school                          |
| Principal            | admin console               | oversight, approvals, reports            | one school                          |
| Exam coordinator     | admin console               | exams, marks review, result workflow     | assigned exam contexts              |
| Teacher              | admin console/teacher views | students, marks, imports, review         | assigned academic contexts          |
| Operational staff    | admin console               | assigned records, documents, notices     | assigned modules in one school      |
| Student              | web portal                  | own published information                | own record                          |
| Parent/guardian      | web portal                  | linked child information                 | linked children                     |
| Worker/provider      | service contracts           | bounded processing/delivery              | job/artifact scope only             |

## D0.3 decisions

1. MVP roles are platform operator, school administrator, principal, exam coordinator, teacher, operational staff, student, and parent/guardian.
2. Roles are not sufficient by themselves; tenant and resource context are always evaluated.
3. High-risk academic workflows support separation of duties and explicit policy-based role combination.
4. Students and parents receive published, relationship-scoped information only.
5. System actors have bounded contract authority and cannot become business-record authorities.
6. Future operational roles extend the permission model without changing tenant isolation.

## Next artifact

**D0.4 — Use Case Diagram**, mapping these actors to capabilities and identifying include/extend relationships between major workflows.
