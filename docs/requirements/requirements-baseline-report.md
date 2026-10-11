# SchoolOS Requirements Baseline and Product Functionality Report

## 1. Purpose of this document

This document defines the current product requirement baseline for SchoolOS in implementation-ready and traceability-ready terms. It answers four questions clearly:

1. What do we actually want to build?
2. Who will use it?
3. What will users get from it?
4. How should each major function behave, and how does it map to the project’s atomic requirement model?

This baseline is intentionally aligned to the project’s authoritative requirement and design-freeze structure, not just a generic product summary.

---

## 2. Traceability and requirement alignment

The project requirement model is organized around atomic statements with stable IDs and explicit traceability to data, APIs, UI, and tests. The product baseline below should be read as the human-readable interpretation of the formal IDs in the project register.

### Requirement families and mapped IDs

| Domain                   | Requirement family                                         | Representative IDs                                 |
| ------------------------ | ---------------------------------------------------------- | -------------------------------------------------- |
| Identity and access      | authentication, authorization, multi-tenant policy         | REQ-AUTH-001, REQ-AUTH-002                         |
| School configuration     | school isolation and versioned policy/config               | REQ-SCH-001, REQ-SCH-002                           |
| Academic structure       | academic years, classes, sections, subjects, teacher scope | REQ-ACA-001, REQ-TEA-001                           |
| Student lifecycle        | admissions, enrollments, guardianship, transitions         | REQ-STU-001                                        |
| Marks and results        | exams, marks, approvals, result versioning                 | REQ-EXM-001, REQ-MRK-001, REQ-MRK-002, REQ-RES-001 |
| Documents and files      | secure uploads, document generation, verification          | REQ-FIL-001, REQ-DOC-001                           |
| AI import                | OCR and import workflow with review gate                   | REQ-AI-001                                         |
| Reporting and operations | dashboards, exports, monitoring, restore, retention        | REQ-REP-001, REQ-OPS-001, REQ-AUD-001              |

This means each business capability below is expected to map to one or more atomic requirement statements, one or more data tables, one or more API contracts, and one or more acceptance tests.

---

## 3. Product vision

SchoolOS is a digital school management platform for multi-school academic and administrative operations. It is designed to help schools:

- manage students, guardians, teachers, classes, sections, and curriculum structures
- manage academic years, subjects, exams, marks, and results
- support both manual entry and AI-assisted data ingestion from Excel, PDF, image, and scanned document sources
- automate review and approval of school records
- issue documents, notices, reports, and student communication
- keep every academic and operational action auditable and secure
- support AI-assisted marks import, student data extraction, and report-card drafting while keeping human review and policy control in the loop

The system is not just a database or a website. It is a governed academic and administrative platform where school data must remain correct, secure, traceable, policy-driven, legally defensible, and manageable through both standard administrative workflows and AI-assisted review workflows.

---

## 4. Main users and their needs

### 4.1 School administrator

Needs:

- create and manage school setup
- manage people and academic structure
- manage permissions and roles
- monitor academic operations and reports
- approve major operations and maintain school policy

What they get:

- central control over school operations
- ability to manage students, staff, academics, and results
- a consistent view of compliance and operational health

### 4.2 Teacher

Needs:

- take attendance where applicable
- enter marks within assigned courses and sections
- review student performance and submit work
- stay within their assigned academic scope

What they get:

- clear classroom work interface
- role-based access to only relevant classes/sections/subjects
- safe and structured marks submission

### 4.3 Exam coordinator / academic coordinator

Needs:

- create exam structures
- define components and weights
- review imported marks
- approve or reject results before publication

What they get:

- a controlled exam workflow
- transparent validation and approval chain
- consistent result publication logic

### 4.4 Principal / approver

Needs:

- oversee student and school performance
- review approval steps
- approve final publication of results and reports
- monitor audits and compliance

What they get:

- oversight dashboard and approval tools
- secure, reviewable academic decision flow

### 4.5 Student and parent/guardian

Needs:

- view their own information, performance, and published documents
- see relevant notices and results
- access only their own records and permitted school information

What they get:

- self-service access to approved information
- private and role-scoped access to results and notices

### 4.6 Platform operator / support staff

Needs:

- maintain infrastructure and support access safely
- manage backups, staging, monitoring, and maintenance controls
- protect the system from misuse

What they get:

- controlled maintenance workflow
- auditable support operations
- safe operational recovery routines

### 4.7 AI/OCR workflow reviewer

Needs:

- review uploaded marks sheets and imported records
- fix mismatches and approve or reject extracted data
- maintain data quality while preserving the official marks chain

What they get:

- a guided review process for import data
- confidence-based review and control over any automated suggestions

---

## 5. Core product requirement summary

### R1. Identity, access, and security requirement

Mapped requirement family: REQ-AUTH-001, REQ-AUTH-002, REQ-SCH-001

The system must ensure that every user is identified securely, has the right authorization, and only sees authorized data.

Atomic behavior:

- valid active credentials allow session creation
- invalid, suspended, expired, or locked credentials fail generically
- protected requests without valid identity or permission are denied
- tenant and resource scope is enforced server-side for every data access
- each role has a clearly defined permission boundary for student, teacher, principal, admin, and support operations

User value:

- users can log in safely
- different roles have different access
- no user can access another school’s data
- each user sees only the information relevant to their account
- record changes are tracked and accountable

How it works:

- user logs in with verified credentials
- session is created with secure cookie and refresh flow
- permissions are resolved from roles and school scope
- every request is checked for identity, permission, tenant, and resource scope
- denied requests return a consistent error

Key rules:

- unauthorized access is blocked before data is returned
- school data is never shared across tenants
- login and reset errors are generic to prevent information leakage
- sensitive actions are audited
- privilege boundaries are enforced per account type: admin, principal, teacher, student, guardian, and support operator

### R2. School configuration and tenant management requirement

Mapped requirement family: REQ-SCH-001, REQ-SCH-002

The system must support multiple schools with separate configuration and academic data.

Atomic behavior:

- each school is isolated by its tenant scope
- school configuration becomes versioned when released
- historical configuration is immutable while new releases are created

User value:

- each school operates independently
- policies can be configured without affecting other schools
- school settings remain versioned and controlled

How it works:

- each school is isolated by tenant ID and school context
- settings are stored per school and versioned when required
- official configuration snapshots are kept immutable when published

Key rules:

- one school cannot see another school’s data
- released config cannot be silently modified after publication
- configuration changes must not impact already published official results without a new version

### R3. Academic structure requirement

Mapped requirement family: REQ-ACA-001, REQ-TEA-001

The system must manage the school’s academic organization.

Atomic behavior:

- academic year, class, section, subject, and offering records are created and constrained by school scope
- teacher assignment defines academic access boundaries
- student records can be assigned to specific class, section, and academic year

User value:

- schools can structure classes, sections, subjects, terms, and years
- school administration can assign offerings and class flows properly
- principals and admins can review on-time academic assignments and student placement

How it works:

- the system stores academic year, class, section, subject, and offering records
- teacher assignments are linked to class/section/subject combinations
- academic rules can be configured and versioned
- student records can be enrolled and updated manually or through AI-assisted intake

Key rules:

- class and section relationships must remain valid
- subject offerings must be scoped to the correct academic year and school
- overlapping academic-year constraints must be enforced
- assignment and enrollment data must not be silently overwritten without review

### R4. Student and guardian management requirement

Mapped requirement family: REQ-STU-001

The system must support end-to-end student lifecycle: admission, enrollment, transfer, promotion, archive, and guardianship.

Atomic behavior:

- a student can be created with a valid school-specific identity
- a student may have multiple guardians, but only one active primary guardian
- enrollment transitions are atomic and historical records are retained
- student data can be entered manually or imported through AI-assisted document ingestion and then reviewed before final save

User value:

- schools can onboard and track students over time
- guardians and student records are linked safely
- historical records remain preserved
- admin and academic staff can update student details through normal school-management workflows

How it works:

- new students are created with validated identity and school-specific identifiers
- guardians are linked with controlled rules for primary contact
- students are enrolled in academic sections and years
- transfer, archive, or graduation actions update status while preserving historical records
- AI can extract name, class, section, roll number, profile details, and parent information from uploaded files, but the extracted data enters a review queue before official save

Key rules:

- a student cannot have duplicate conflicting active enrollment for the same year
- only one primary guardian is allowed per student unless explicit override is approved
- historical student data remains available even after archive or graduation
- no student record is finalized without review and approval if it originated from an AI-assisted import

### R5. Teacher and assignment management requirement

Mapped requirement family: REQ-TEA-001

The system must support teacher records and assignment-controlled academic access.

Atomic behavior:

- teacher identity and assignment scope are unique and auditable within a school
- assignment scope grants academic access only inside defined year/class/section/subject boundaries
- teachers can update subject, class, and marks-related data only within their assigned scope

User value:

- teachers are assigned to the right courses and sections
- teacher access is limited to assigned academic scope
- school can manage human resources with a proper school-level identity
- principals and administrators can manage teacher profiles and permissions through standard admin workflows

How it works:

- teacher records are stored with employment data and scope
- assignments define which class/section/subject the teacher can access
- user scope is materialized to permission and assignment filters at runtime
- teachers can update marks, student performance notes, and assessment data for their own assigned classes

Key rules:

- teacher access is limited by academic scope
- duplicate assignment conflicts are prevented
- assignment data is auditable
- teacher records can be edited manually by admin/HR or school management roles, but not outside authorized scopes

### R6. Examination and marks requirement

Mapped requirement family: REQ-EXM-001, REQ-MRK-001, REQ-MRK-002

The system must support exam creation, marks entry, validation, review, correction, and approval.

Atomic behavior:

- exam configuration is frozen before marks entry opens
- marks status states are distinct and not collapsed into a single value
- approval follows policy and prevents self-approval where restricted
- marks can be added manually, imported from files, or generated through AI-assisted extraction, but every non-trivial marks update must be reviewed before official acceptance

User value:

- teachers can record marks in a controlled way
- academic coordinators and principals can review and approve marks without bypassing policy
- bulk marks from scanned sheets or PDF files can be handled faster without compromising integrity

How it works:

- exam definition includes type, schedule, components, and assessment rules
- marks are entered according to valid scopes and ranges
- each marks record has a lifecycle: draft, submitted, reviewed, approved, locked
- policy rules determine valid values, absent states, and approval checks
- AI can extract marks from uploaded sheets or images into review drafts, which are then validated before becoming official

Key rules:

- zero, absent, missing, exempt, and not-submitted are distinct states
- teachers cannot approve their own marks unless explicitly allowed by policy
- stale version conflicts block overwrites
- only valid approved marks can be used for results
- marks from AI extraction must be reviewed before final update

### R7. Results and grade policy requirement

Mapped requirement family: REQ-RES-001

The system must calculate official results in a reproducible, versioned, and policy-controlled manner.

Atomic behavior:

- result calculation uses only approved marks and versioned policy
- published results are immutable and reopened via a new version rather than silent edit
- AI can draft a report card or computed result preview, but a final result card must be reviewed and approved before publication

User value:

- schools get consistent grade calculation and pass/fail evaluation
- students and parents receive fair and traceable results
- principals and administrators can publish official academic outcomes with confidence and audit trail
- report cards can be generated from uploaded exam or marks data with review guardrails

How it works:

- official marks are loaded under approved policy versions
- formulas are executed with versioned grade rules and rounding rules
- calculated results are stored as snapshots
- result approval and publication follow explicit state transitions
- AI can compile mark data into a report-card draft preview, but the final result remains subject to verification before release

Key rules:

- result snapshots are immutable once published
- reopens create a new result version rather than modifying the old one
- calculation must be deterministic and reproducible
- policy changes do not alter already published official records
- report-card generation is review-driven, not auto-published

### R8. Document generation and verification requirement

Mapped requirement family: REQ-DOC-001, REQ-FIL-001

The system must generate academic and official documents such as marksheets, certificates, and reports in a private and traceable manner.

Atomic behavior:

- documents are generated from an approved source snapshot and immutable template version
- public verification reveals only minimal validity status and never exposes private student data without authorization

User value:

- schools can issue official documents without manual rework
- data remains private and governed
- documents can be verified without exposing sensitive data

How it works:

- document requests use approved templates and source content
- rendering jobs create official generated artifacts
- result or record data is stored with provenance and checksums
- verification endpoints reveal only minimal information required for proof

Key rules:

- documents are produced from approved source records
- template and source versions are retained
- verification endpoint does not leak private data
- documents must be downloadable only when user rights allow it

### R9. Notice, notification, and communication requirement

Mapped requirement family: REQ-NOT-001

The system must support internally managed school communication and official messaging.

Atomic behavior:

- audience, schedule, and template validation must occur before notice publication
- delivery attempt and status is tracked independently for each recipient and each notification event

User value:

- schools can publish notices to the right audience
- students and guardians receive relevant communication
- communication is tracked and auditable

How it works:

- notices are created with target audience, timing, and content rules
- notifications are sent to the correct recipients through approved channels
- delivery states are tracked for not sent, queued, sent, failed, and retried

Key rules:

- notice recipients must belong to the correct tenant/scope
- opt-out preferences must be respected
- communication content should not expose secret or internal data directly

### R10. File upload and document storage requirement

Mapped requirement family: REQ-FIL-001

The system must safely accept, validate, store, and manage uploaded files such as student photos, proof documents, marks sheet scans, and report files.

Atomic behavior:

- uploaded files are validated before they are made available for processing or download
- private downloads require authorization and do not expose public object URLs

User value:

- schools can upload files securely and reliably
- invalid or unsafe files are rejected
- files are stored privately with audit

How it works:

- files are checked for size, type, extension, MIME, magic bytes, and malicious signatures
- files are stored in quarantine before approval where applicable
- duplicates are detected with hash checks
- only approved files are used for business workflows such as imports or documents

Key rules:

- malware, executable content, or malicious upload attempts are blocked
- file names are sanitized and stored safely
- sensitive files require authorization to download
- uploads are tracked with provenance and retention rules

### R11. AI import and OCR requirement

Mapped requirement family: REQ-AI-001

The system must accept file-based school data imports and transform them into reviewable, approved official data via a governed AI pipeline.

Atomic behavior:

- import requests are idempotent and traceable
- OCR output is provisional evidence, not direct official data mutation
- ambiguous and low-confidence matches require review before official records change
- AI can extract student lists, marks, class names, roll numbers, and report-card data from PDF, Excel, and image uploads, but the system must create reviewable drafts before final acceptance

User value:

- staff can import marks or academic data efficiently
- automation reduces manual work
- AI output remains reviewable and does not bypass school policy
- administrators and academic staff can process bulk academic intake faster while preserving quality control

How it works:

- upload source is validated and stored privately
- OCR or extraction process reads the source
- extracted values are matched to known entities
- review process validates confidence, duplicates, and mismatches
- approved records are applied through official marks flow
- image or scanned report cards can be turned into draft marks or draft record entries for human approval

Key rules:

- AI does not directly modify official school marks without human review and approval
- low-confidence or ambiguous records are routed to review
- import job state is auditable
- duplicate entries are prevented with idempotency controls
- any student list, roll number assignment, report-card draft, or marks extraction must be confirmed before publication

### R12. Reporting and dashboard requirement

Mapped requirement family: REQ-REP-001

The system must provide role-appropriate dashboards, summaries, data views, and export jobs.

Atomic behavior:

- report queries are scoped to the authenticated tenant and allowed filters
- export jobs run asynchronously and produce private downloadable artifacts with audit record

User value:

- users can track academic and operational status quickly
- administrators can monitor operational health and school progress
- reports are scoped to the user’s tenant and permissions

How it works:

- dashboards aggregate operational and academic data into read-only summaries
- export jobs produce secure, scoped data outputs
- user access to reports is filtered by scope and permission

Key rules:

- reports never leak data outside the current tenant or allowed scope
- exports are tracked, time-bound, and auditable
- heavy reports run asynchronously

### R13. Audit, retention, and platform operations requirement

Mapped requirement family: REQ-AUD-001, REQ-OPS-001

The system must preserve operational integrity, legal retention, and safe operational recovery.

Atomic behavior:

- actions with policy or official-record impact are append-only and auditable
- backup/restore and support access follow approved, logged, and time-bounded controls

User value:

- school records remain reliable and recoverable
- incidents can be investigated and traced
- platform operations remain safe and governed

How it works:

- audit events capture major user and system actions
- retention rules govern storage and disposal of data
- backups, restore checks, disaster recovery, and support access are governed with policy controls

Key rules:

- audit logs are append-only and protected
- support access is approved, time-bound, and recorded
- scheduled maintenance and recovery should not bypass safety checks

---

## 6. Non-functional requirements and measurable design constraints

The following are the minimum measurable requirements expected by the design freeze and the project requirement register.

### 6.1 Security requirements

- NFR-SEC-001: passwords, tokens, and secrets are never stored or logged in plaintext; secrets are managed externally in non-local environments
- NFR-SEC-002: cross-tenant reads/writes, privilege escalation, unsafe uploads, and unauthorized document access are denied and tested
- all requests must be authenticated and authorized
- every tenant must be isolated in application logic and database queries
- uploads must be validated before use
- audit trails must be retained for sensitive actions

### 6.2 Performance requirements

- NFR-PERF-001: provisional target is p95 standard read under 500ms; scoped student search under 800ms; marks save under 1 second excluding network delay
- dashboards and common read operations must be fast enough for daily use
- bulk imports, document generation, and large report jobs must be queued and processed asynchronously
- large queries must be paginated and scoped
- the system must support school growth without major architectural breakage

### 6.3 Reliability and resilience requirements

- NFR-REL-001: pilot RPO ≤ 24 hours and RTO ≤ 8 hours, backed by verified restoration
- DB, queue, and storage failures must be handled without silent data loss
- retries and dead-letter handling must be supported for jobs
- backup restoration procedures must be tested and evidence retained

### 6.4 Privacy and retention requirements

- all student, guardian, and document data must be private and access-controlled
- legal retention and deletion rules must be configurable and auditable
- exports and downloads must expire and be authorized
- retention purge must be blocked by legal hold and recorded with actor and reason

### 6.5 Accessibility requirements

- NFR-USE-001: critical user workflows must have keyboard-operable controls, visible focus, accessible validation, and usable mobile/desktop layouts
- screen readers, keyboard navigation, and visible focus must be supported for critical flows
- forms must provide clear validation and error messages
- color must not be the only method of conveying status

### 6.6 Localization requirements

- NFR-LOC-001: system must support Unicode-safe data, English/Nepali display, and reliable AD/BS date behaviors without noncanonical date storage
- date, time, and number formatting must be localized safely
- academic history must not lose meaning through locale conversion

### 6.7 AI quality requirements

- NFR-AI-001: OCR accuracy, match precision/recall, false acceptance, review rate, latency, and cost must be measured against labelled data
- AI must assist but not override policy control
- confidence thresholds must be defined and reviewed
- review quality and accuracy must be measured against labeled test data

---

## 7. Operational control requirements

These are critical project controls, not optional extras. They are required because SchoolOS handles official academic records and sensitive school data.

### 7.1 Audit and official-record integrity

- all official-record transactions must generate append-only audit events
- approval, publication, correction, reopen, document generation, and support access must be auditable
- record changes must preserve actor identity, timestamp, reason, and impact

### 7.2 Job and import control

- background jobs must be idempotent and retryable
- terminal job failures must be visible without losing the original source data
- OCR and import flows must never write official marks directly without a review and approval gate

### 7.3 Support and maintenance control

- maintenance/support access must be approved, least-privileged, time-bound, and auditable
- support access must never bypass normal role and tenant checks
- system health, deployments, and rollback actions must be traceable

### 7.4 Data retention and privacy control

- legal hold must block purge for protected records
- purge actions must require explicit reason and actor identification
- retention policy must be consistent with official academic record protection

### 7.5 Business continuity and restore control

- restoration drills must be tested against approved RPO/RTO thresholds
- restore operations must create evidence records
- recovery procedures must protect integrity and preserve version history

---

## 8. Scope by release

### MVP scope

The minimum set that should be delivered before broader rollout:

- identity and access control for admin, principal, teacher, student, guardian, and support users
- tenant isolation and school configuration
- academic structure and enrollment management
- teacher management and assignment scope
- student management with manual updates and AI-assisted bulk import review
- exam setup and manual plus AI-assisted marks entry with approval workflow
- marks approval and result calculation
- report-card generation and result publication after review
- report access, file uploads, and audit controls

### R1 scope

- attendance and attendance review workflows
- notices and notifications
- student/parent portal self-service
- advanced AI/OCR import with review pipeline
- richer workflow automation and optimization

### R1 scope

- attendance and attendance review workflows
- notices and notifications
- student/parent portal self-service
- advanced AI/OCR import with review pipeline
- richer workflow automation and optimization

### Future scope

- advanced analytics and intelligence
- broader automation features
- additional integrations and third-party communication channels
- more advanced data portability and legal compliance flows

---

## 9. What users actually get

### For administrators

- one controlled system for school operations
- academic structure, teachers, students, results, and reports in one place
- safe role-based access and audit visibility
- ability to create and manage all school user accounts, school settings, academic structure, and overall administrative operations

### For teachers

- a role-bound academic workspace
- marks entry and review without unintended access to unrelated data
- a clear record of submitted and approved work
- ability to manage their assigned classes, subjects, and student marks within assigned scope

### For students and guardians

- controlled viewing of their own school information
- access to official results and documents when authorized
- notifications and notices aligned to their status
- ability to view only their own profile, academic status, and approved records

### For principals and exam managers

- oversight of academic policies and final result publication
- approval process with traceable decisions
- operational control without bypassing rules
- access to review panels for class performance, exam approvals, results, and compliance checks

### For platform operators

- secure infrastructure administration
- structured operations and support access controls
- reliable recovery and monitoring

### For all user types

- each person has a separate account with permissions based on role
- no one shares unrestricted access across the entire system
- access is governed by the user’s account privileges, school scope, and approval role

---

## 10. High-level functional flow of the system

The product works as a controlled academic and administrative workflow that supports both normal manual operation and AI-assisted bulk intake:

1. School setup and user accounts are created for admin, principal, teacher, student, guardian, and support users.
2. Academic structure is defined for the school.
3. Students and teachers are onboarded and assigned permissions based on role and scope.
4. Students are enrolled and assigned to classes and sections.
5. Exams and components are configured.
6. Data can be entered manually or uploaded from Excel/PDF/image files for AI-assisted extraction.
7. The AI creates draft entries, suggested values, and report-card previews.
8. Reviewers validate class, section, roll number, student identity, and marks before approval.
9. Approved records become official student data, marks, or result records.
10. Results are calculated according to policy and versioning rules.
11. Results are published, and documents are generated.
12. Students and guardians access approved data.
13. Every step is logged for audit and compliance.
14. Files, imports, and communication are all tracked and protected by policy.

This sequence ensures academic decisions are reliable, reviewable, secure, and governed by policy while still supporting efficient bulk digital intake.

---

## 11. Acceptance criteria summary

The requirement baseline is acceptable when:

- every user role has a clear purpose and controlled access
- separate admin, principal, teacher, student, guardian, and support accounts operate under distinct privilege boundaries
- no cross-school data leakage is possible
- user data can be managed manually through a normal school-management interface and also imported via AI-assisted file workflows
- class, section, roll number, student identity, and marks data from uploads are reviewed before official acceptance
- marks and results are versioned and auditable
- documents and files are private and justified
- AI output cannot silently alter official data
- reports and notice flows respect school and user scope
- support access, restore operations, and retention actions are time-bound, approved, and traced
- all critical functional and operational requirements are mapped to formal atomic IDs and executable tests

---

## 12. Formal requirement checklist and traceability matrix

The following is the project’s formal, implementation-ready checklist. Each item is a requirement family that should be traced to the authoritative registry, data model, API contracts, UI contracts, and executable test IDs.

| Requirement ID | Requirement summary                                                                                   | Priority | Representative trace target                                          |
| -------------- | ----------------------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------- |
| REQ-AUTH-001   | User authentication, session creation, refresh, reset, and secure login lifecycle                     | MVP      | TC-AUTH-001-A, TC-AUTH-001-B, TC-AUTH-001-C, TC-AUTH-001-D           |
| REQ-AUTH-002   | Server-side authorization, permission checks, and tenant/resource validation                          | MVP      | TC-SEC-001-A, TC-SEC-001-B, TC-SEC-001-C                             |
| REQ-SCH-001    | School tenant isolation and secure data boundaries across all school data                             | MVP      | TC-SEC-001-C                                                         |
| REQ-SCH-002    | Versioned school configuration and policy releases                                                    | MVP      | TC-CFG-001-A, TC-CFG-001-B                                           |
| REQ-ACA-001    | Academic years, classes, sections, subject offerings, and assignment structure                        | MVP      | TC-ACA-001-A, TC-ACA-001-B, TC-ACA-001-C                             |
| REQ-TEA-001    | Teacher identities and assignment-scoped access model                                                 | MVP      | TC-TEA-001-A, TC-TEA-001-B                                           |
| REQ-STU-001    | Student creation, guardianship, enrollment, lifecycle transitions, and historical retention           | MVP      | TC-STU-001-A, TC-STU-001-B, TC-STU-001-C, TC-STU-001-D, TC-STU-001-E |
| REQ-EXM-001    | Exam configuration, schedule, assessment blueprint, and frozen academic rules                         | MVP      | TC-EXM-001-A, TC-EXM-001-B                                           |
| REQ-MRK-001    | Marks lifecycle, state distinction, validation, input ranges, and submission rules                    | MVP      | TC-MRK-001-A, TC-MRK-001-B, TC-MRK-001-C, TC-MRK-001-D               |
| REQ-MRK-002    | Approval, correction, conversion, and lock policy enforcement for marks                               | MVP      | TC-MRK-002-A, TC-MRK-002-B                                           |
| REQ-RES-001    | Result calculation, versioned policy execution, snapshotting, approval, and reopening                 | MVP      | TC-RES-001-A, TC-RES-001-B, TC-RES-001-C, TC-RES-001-D               |
| REQ-DOC-001    | Official document generation, evidence provenance, verification, and private access                   | MVP      | TC-DOC-001-A, TC-DOC-001-B                                           |
| REQ-FIL-001    | Secure upload, quarantine, validation, provenance, and private download control                       | MVP      | TC-FIL-001-A, TC-FIL-001-B                                           |
| REQ-AI-001     | AI-assisted extraction, import, review, confidence handling, and final approval gate                  | MVP/R1   | TC-AI-001-A, TC-AI-001-B, TC-AI-001-C, TC-AI-001-D                   |
| REQ-REP-001    | Tenant-scoped dashboards, exports, and report generation                                              | MVP      | TC-REP-001-A, TC-REP-001-B                                           |
| REQ-NOT-001    | Notice publication, delivery tracking, and communication governance                                   | R1       | TC-NOT-001-A, TC-NOT-001-B                                           |
| REQ-AUD-001    | Audit retention and append-only official record tracking                                              | MVP      | TC-AUD-001-A                                                         |
| REQ-OPS-001    | Background jobs, operations controls, support access, restore testing, and privacy retention controls | MVP      | TC-OPS-001-A, TC-OPS-001-B, TC-REL-001-A, TC-PRV-001-A               |

### Requirement verification rule

No requirement family is considered complete unless the following are in place:

1. one or more atomic requirement IDs exist and are linked to a requirement statement
2. the relevant database tables and data lifecycle are defined
3. the relevant API contract and UI contract exist
4. one or more acceptance or system tests are defined
5. the requirement is tied to a release designation: MVP or R1/F
6. the requirement is explicitly reviewed against tenant isolation, privacy, and access-control rules

### Checklist status

- [x] Identity, auth, roles, and access management defined
- [x] School isolation and configuration versioning defined
- [x] Student lifecycle and guardianship defined
- [x] Teacher and assignment access defined
- [x] Exams, marks, and result policy defined
- [x] Document generation and document verification defined
- [x] File upload and AI-assisted intake defined with approval gate
- [x] Reporting, audit, operations, and privacy controls defined
- [x] Role-based accessibility and account separation defined for all user categories

---

## 13. Final requirement statement

SchoolOS must provide a secure, multi-school academic and operations platform that enables schools to administer people, academics, marks, results, documents, and communication with policy control, auditability, tenant isolation, and measurable operational governance. It must support both standard manual school-management workflows and AI-assisted bulk data intake from Excel, PDF, image, and scanned document sources. All extracted or auto-suggested student, class, roll number, marks, and report-card data must remain in a reviewable draft state until authorized reviewers or approvers validate and confirm it. The system must maintain separate accounts and access privileges for administrators, principals, teachers, students, guardians, and support operators, ensuring that each user can work only within the scope of their role and authorized school data.
