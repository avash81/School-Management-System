# Requirements Completion Backlog and Delivery Roadmap

## Purpose and authority

This document is the working backlog for taking SchoolOS from its documented planning
baseline to an approved, testable product contract and then through controlled delivery.
It is subordinate to the [Master Project Specification](./master-project-specification.md)
and does not itself approve candidate requirements, architecture, or feature implementation.

**Current gate: constrained foundation implementation under an explicit user authorization
dated 2026-10-10; Phase 13 remains NO-GO and architecture is not frozen.** The authorization
permits coding before the independent review, but does not represent a Phase 13 pass, named
owner sign-off, production approval, or permission to bypass security, privacy, testing, or
human-review requirements. Discovery and non-product prototype validation remain active.
Technology selection is documented as confirmed; that is not architecture-freeze approval.

## Status and ownership rules

- **Done** means the required artifact or decision exists and has been checked against its
  acceptance criteria. A document merely existing is not evidence that it is approved,
  implemented, or accepted.
- **In progress** means work has started and has remaining acceptance criteria.
- **Blocked** means work needs a named owner or an explicit product/domain decision.
- **Not started** means no completion evidence is recorded.
- Owners below are accountable roles, not assigned people. Named owners and approvers must
  be recorded before approval; do not infer names or approvals.
- `Must` means required to pass the architecture-freeze gate. `MVP` means required before
  the pilot. `R1/F` items remain in the product scope only if an owner explicitly confirms
  the release; otherwise classify them as deferred or out of scope.

## Current baseline: completed and remaining

| Area                                         | Current state                                | Evidence / remaining work                                                                                                                    |
| -------------------------------------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Product intent and non-negotiable principles | Documented                                   | Master specification and baseline report exist; stakeholder validation and final owner approval remain.                                      |
| Requirement register and addendum intake     | Documented; not approved                     | Baseline and v0.3 candidate requirements are recorded; resolve candidate decisions, duplicates, malformed/missing IDs, and release scope.    |
| Architecture/design artifact set             | Broad baseline documented; freeze incomplete | D0-D16 and domain designs exist; reconcile them with the final requirements, close open decisions, and complete Phase 13 review.             |
| Technology selection                         | Confirmed as a planning decision             | Existing stack selection is documented; environment/delivery-control evidence and architecture sign-off remain separate gates.               |
| Traceability                                 | Incomplete                                   | D0.7 has representative mappings, not an evidenced complete requirement-to-release chain.                                                    |
| Stakeholder/user validation                  | Not evidenced                                | Validate priority workflows with representative school users and record decisions and acceptance criteria.                                   |
| Feature implementation and tests             | Unverified                                   | Repository code is not acceptance evidence; reconcile every claimed capability to approved requirements, current tests, and user acceptance. |
| Security, operations, pilot, production      | Not validated                                | Readiness checklist and production blueprint define work; execution evidence, named owners, and sign-offs remain.                            |

## Phase plan

Phases 0–6 complete the design and requirements gate. Phase 7 is controlled product
implementation and follows the delivery order in the master specification. Phase 8 is
pilot/production readiness. A phase may overlap only where its dependencies are met; a
later phase never bypasses the Phase 13 gate.

| Phase | Name and purpose                                                                                                                                                                   | Backlog                           | Exit evidence                                                                                              | Status                                                                                         |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| 0     | Discovery and user validation: confirm priority actors, workflows, pain points, constraints, and pilot profile. Prototype only to validate workflows; do not add product behavior. | GAP-001                           | Recorded findings, validated priority workflows, decisions, and acceptance criteria.                       | Current phase; validation not evidenced                                                        |
| 1     | Requirement governance: reconcile scope, candidate requirements, terms, conflicts, use cases, and rules; assign owners and close decisions.                                        | GAP-002–GAP-006                   | Approved SRS/use cases/rules and an owned decision log with no unresolved freeze-blocking ambiguity.       | Not complete                                                                                   |
| 2     | Domain and contract design: settle lifecycle/data/privacy, authorization, tenant boundaries, identity, school configuration, academics, and API/NFR contracts.                     | GAP-007–GAP-013, GAP-019          | Reviewed data/domain/API/security contracts with corresponding decisions and traceability.                 | Baselines exist; approval/reconciliation incomplete                                            |
| 3     | Core academic workflows: specify exam, marks, results, AI/import, document, portal, notice, report, localization, and accessibility behavior.                                      | GAP-014–GAP-018                   | Approved end-to-end workflows, edge cases, measurable acceptance criteria, and release classification.     | Baselines exist; closure incomplete                                                            |
| 4     | Assurance design: define threat/security validation and requirement-linked functional, negative, integration, performance, and end-to-end test evidence.                           | GAP-020–GAP-021                   | Reviewed security/test plans and requirement-to-test matrix with pass criteria.                            | Not complete                                                                                   |
| 5     | Operational and release design: settle support, training, incident response, privacy/retention, recovery, migrations, rollout, rollback, and feature flags.                        | GAP-022–GAP-023                   | Owned runbooks and measurable operational/release acceptance criteria.                                     | Documented in part; execution/approval incomplete                                              |
| 6     | Architecture freeze gate: resolve all blockers, obtain named product/technical/school-domain approval, and complete independent Phase 13 audit.                                    | GAP-024                           | Phase 13 GO decision, approved document set, decision/risk log, and architecture-freeze authorization.     | **Blocked — Phase 13 NO-GO; separate from the coding exception**                               |
| 7     | Constrained feature delivery: implement small traceable increments, test each against available acceptance criteria, demo to representative users, and refine backlog.             | Initial D1 increment below        | Accepted increment evidence; no unapproved policy or cross-tenant/security bypass.                         | **In progress by explicit user authorization dated 2026-10-10; architecture remains unfrozen** |
| 8     | Pilot and production readiness: run the agreed pilot, resolve critical findings, prove restore/security/operations, and obtain separate production sign-off.                       | GAP-021–GAP-023 and release gates | Pilot acceptance, recovery/security/operations evidence, known limitations, and named production approval. | Not started                                                                                    |

### Post-freeze delivery sequence

Deliver in this order, retaining the master specification's human-approval and history
controls. Coding under the recorded exception remains constrained and does not imply that
the full requirements/design gate has passed:

1. Foundation: identity, roles, school/tenant configuration, and academic structure.
2. People: students, guardians, teachers, enrollment, lifecycle, and assignments.
3. Examinations: exam setup, manual marks, validation, review, correction, approval, and results.
4. Documents and reports: approved-result documents, private files, reporting, and verification.
5. AI/OCR: validated intake, extraction, matching, confidence, and human review; never an
   authoritative writer.
6. Portals and notifications: only approved/authorized information, with privacy controls.
7. Pilot, production decision, and monitored iteration.

Each increment requires approved REQ/use-case/rule/data/API/UI/test traceability, automated
verification, security and tenant-scope checks where relevant, representative-user review,
and recorded acceptance before release.

## Requirement-completion backlog

Statuses describe planning evidence, not software implementation. Unless noted otherwise,
items remain open even where a related design document exists.

| ID      | Priority                        | Work item                                                                                                                                                                 | Accountable owner role                        | Depends on                                  | Status                                                                                        |
| ------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | ------------------------------------------- | --------------------------------------------------------------------------------------------- |
| GAP-001 | Must                            | Validate priority workflows and pilot profile with representative users                                                                                                   | Product owner / school-domain representatives | —                                           | Not started                                                                                   |
| GAP-002 | Must                            | Appoint named product, technical, security, domain, QA, and operations owners/approvers; establish decision log and gate authority                                        | Executive sponsor / product owner             | GAP-001                                     | Blocked — named owners required                                                               |
| GAP-003 | Must                            | Reconcile baseline and addendum: approve/reject/defer candidate items; resolve duplicates, missing references, priority/release, fixed vs configurable policy             | Product owner / domain leads                  | GAP-001, GAP-002                            | In progress — source intake exists; decisions open                                            |
| GAP-004 | Must                            | Complete atomic traceability for every retained requirement: use case, rule, entity, API, UI, test, release evidence                                                      | Business analyst / QA lead                    | GAP-003, GAP-005, GAP-006                   | Incomplete — representative mappings only                                                     |
| GAP-005 | Must                            | Complete actor-specific use cases, alternate/failure flows, permissions, pre/postconditions, and acceptance criteria                                                      | Business analyst / product owner              | GAP-001, GAP-003                            | In progress — catalogs/specs exist; reconcile and approve                                     |
| GAP-006 | Must                            | Close business rules and edge cases, including marks states, approvals, correction, absence, promotion, history, and configurable policy                                  | Domain leads / school approvers               | GAP-001, GAP-003, GAP-005                   | In progress — candidate rules need decisions                                                  |
| GAP-007 | Must                            | Approve data dictionary, entity lifecycle, provenance, versioning, archival, restore, retention, legal hold, deletion, and school offboarding                             | Data architect / privacy owner                | GAP-003, GAP-006                            | In progress — design baseline exists; policy approval open                                    |
| GAP-008 | Must                            | Approve role/resource/action/scope matrix, deny-by-default behavior, sensitive-field access, segregation of duties, and support break-glass                               | Security owner / product owner                | GAP-002, GAP-003, GAP-005                   | In progress — design baseline exists; exact decisions and approval open                       |
| GAP-009 | Must                            | Define and test tenant isolation across API, UI, background jobs, files, exports, search, support, and restore                                                            | Security owner / technical owner              | GAP-007, GAP-008, GAP-019                   | Not verified                                                                                  |
| GAP-010 | Must                            | Finalize invite, authentication, verification, reset, disable/enable, session revocation, multi-role, and multi-school account rules                                      | Identity owner / security owner               | GAP-008                                     | In progress — requirements exist; policy/test closure open                                    |
| GAP-011 | Must                            | Approve school setup, policy configuration/versioning, publishing, permissions, migration, and historical snapshot rules                                                  | School-domain owner / data architect          | GAP-003, GAP-007, GAP-008                   | In progress — live setup-status UI implemented; policy approval remains                       |
| GAP-012 | Must                            | Approve academic year/period, class/section, subject/offering, calendar, assignment, and rollover lifecycle                                                               | Academic-domain owner                         | GAP-006, GAP-011                            | In progress — class create/list UI builds; runtime and domain approval remain                 |
| GAP-013 | Must                            | Approve student/guardian/teacher lifecycle, admission/import, transitions, sensitive data, linkage, and assignment scope                                                  | Student/academic owners / privacy owner       | GAP-007, GAP-008, GAP-012                   | In progress — requirements exist; decisions and evidence open                                 |
| GAP-014 | Must                            | Define exam lifecycle and official marks state/validation/review/correction/locking rules for manual and bulk entry                                                       | Examination owner                             | GAP-006, GAP-012, GAP-013                   | In progress — design baseline exists                                                          |
| GAP-015 | Must                            | Approve result calculation, weighting, grades/GPA, exceptions, explainability, publication, snapshots, reopening, moderation, recheck, supplementary exams, and promotion | Examination owner / school approvers          | GAP-006, GAP-014                            | In progress — candidate requirements exist; policy decisions open                             |
| GAP-016 | Must for any AI release         | Define import formats, safety/provenance, confidence and matching thresholds, review/override/reject flows, evaluation data, and failure fallback                         | AI owner / security owner / exam owner        | GAP-009, GAP-014, GAP-019                   | In progress — architecture exists; measurable thresholds and approval open                    |
| GAP-017 | Must for official documents     | Approve template lifecycle, approved-result gate, rendering/print specifications, private access, verification, revocation, bulk jobs, and localization                   | Document owner / security owner               | GAP-007, GAP-015                            | In progress — design baseline exists                                                          |
| GAP-018 | Must for retained MVP scope     | Approve role-specific screens/workflows, portal scope, notices/notifications, reports, accessibility, mobile, and English/Nepali/AD-BS behavior                           | Product owner / UX and school-domain owners   | GAP-005, GAP-008, GAP-013, GAP-015, GAP-017 | In progress — design baseline exists; scope/acceptance open                                   |
| GAP-019 | Must                            | Finalize API/integration contracts and measurable non-functional targets for performance, capacity, concurrency, localization, browser support, and cost                  | Technical owner / product owner               | GAP-003, GAP-007                            | In progress — proposals exist; targets require owner decisions                                |
| GAP-020 | Must                            | Complete threat/risk review and security acceptance plan for identity, authorization, tenant isolation, files, APIs, AI, audit, and privacy                               | Security owner                                | GAP-008, GAP-009, GAP-010, GAP-016, GAP-017 | Not verified                                                                                  |
| GAP-021 | Must                            | Complete requirement-linked test matrix, fixtures, negative/security tests, E2E scenarios, performance targets, pilot criteria, and evidence/sign-off process             | QA lead / engineering owner                   | GAP-004, GAP-009, GAP-014–GAP-020           | Incomplete — test plans exist; executable/evidenced criteria open                             |
| GAP-022 | Must before pilot/production    | Assign and validate support, incident, maintenance, training, monitoring, backup/restore, RPO/RTO, retention, and recovery procedures                                     | Operations owner / privacy owner              | GAP-007, GAP-019, GAP-020, GAP-021          | In progress — blueprint exists; execution/owners unverified                                   |
| GAP-023 | Must before controlled delivery | Approve environments, CI gates, migrations, feature flags, staged rollout, rollback/forward-fix, release notes, and production criteria                                   | Technical owner / release owner               | GAP-019, GAP-021, GAP-022                   | In progress — policies partly documented; approval/evidence open                              |
| GAP-024 | Must                            | Run independent Phase 13 consistency audit; close findings; obtain named-owner GO/NO-GO and architecture-freeze record                                                    | Independent reviewer / named approvers        | GAP-002–GAP-023                             | Blocked — Phase 13 currently NO-GO; user-authorized coding exception does not close this gate |

## Phase 7 delivery increments under the recorded coding exception

These are delivery increments. Initial constrained coding is authorized by the recorded
exception; broad implementation, architecture freeze, and production still require their
respective gates.

| Increment | Scope                                                                                  | Required acceptance evidence                                                                       |
| --------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| D1        | Identity, school tenant, school configuration, and academic foundation                 | Role/tenant denial tests, policy/version history, academic lifecycle acceptance                    |
| D2        | Student, guardian, teacher, enrollment, and assignment workflows                       | Lifecycle/history, sensitive-data, relationship, and assignment-scope tests                        |
| D3        | Exams, manual marks, review, approval, result calculation, publication, and correction | State/edge-case matrix, deterministic calculation tests, audit/snapshot evidence                   |
| D4        | Private files, documents, reports, and official verification                           | Approved-result gating, authorization, rendering, revocation, export tests                         |
| D5        | AI/OCR and bulk intake, only after its own safety and quality gate                     | Dataset-based quality results, human-review proof, provenance and no-direct-write tests            |
| D6        | Portals, notifications, and advanced reports according to approved release scope       | Own/linked-record access, consent/preferences, publication and privacy tests                       |
| D7        | Pilot and production readiness                                                         | Real workflow acceptance, restore drill, security sign-off, support readiness, production decision |

### Initial coding increments

- **Scope:** validate academic setup API inputs for academic years, classes, sections,
  subjects, and subject offerings at the API boundary; preserve school-scoped service
  operations and add focused schema tests.
- **Backlog:** GAP-012 (initial slice); this does not close GAP-012 or claim the academic
  lifecycle is approved.
- **Status:** implemented; focused tests, API/validation typechecks, API build, lint, and
  formatting passed on 2026-10-10.
- **Acceptance:** reject malformed dates, reversed academic-year ranges, invalid numeric or
  boolean types, empty update payloads, and unknown fields with a client validation error;
  accept valid payloads; pass API and shared-validation typechecks and focused tests.
- **Guardrail:** no database schema changes, no production release, and no inference that
  Phase 13 passed.

### Second increment — live school setup status

- **Scope:** replace the static onboarding checklist with the authenticated setup-status API,
  truthful per-area completion states, loading/error/retry handling, and a dashboard Settings
  link.
- **Status:** implemented; admin typecheck/build and formatting passed on 2026-10-10.
- **Acceptance:** render the API-reported state for all six setup areas, never show all items
  complete before a successful response, provide an accessible loading/error state and retry,
  and provide dashboard navigation to Settings. Verified by production build/typecheck; manual
  browser interaction remains outstanding because the API-backed workflow was not exercised.
- **Guardrail:** the displayed six checks reflect the existing API contract only; they do not
  imply that every school setup requirement or governance decision is complete.

### Third increment — academic-year management UI

- **Scope:** create academic years using the guarded API, list active/inactive years and
  dates, and link setup checklist/dashboard Academics navigation to the functional page.
- **Status:** implemented; admin production build, typecheck, lint, formatting, and focused
  tests pass. Runtime acceptance against an authenticated API/database is not yet performed.
- **Acceptance:** authorized users can create and see academic years; invalid/reversed dates
  are rejected; active-year replacement is disclosed; loading, empty, success, and error
  states are visible; all UI controls remain behind server-side permission checks.
- **Verification:** admin build/typecheck and 8 focused frontend/validation tests pass;
  authenticated API/database integration and browser interaction remain pending.

### Fourth increment — class management

- **Scope:** list school-scoped classes and create a class with name, optional short name,
  display order, and optional age guidance through the existing permission-checked API.
  The setup checklist links only implemented academic-year and class workflows.
- **Status:** implemented; admin production build, typecheck, lint, formatting, and the
  focused frontend/validation test set pass on 2026-10-10.
- **Acceptance:** display returned school classes; submit valid class data; reject age ranges
  where minimum exceeds maximum; show loading, empty, success, and error/retry states; do not
  expose any cross-school selector or bypass backend authorization.
- **Verification limitation:** no authenticated API/database browser run was performed, and
  the focused tests do not exercise this page's form interactions.
- **Backlog:** GAP-012 (class-management slice only); academic lifecycle approval remains open.

### Fifth increment — section management

- **Scope:** list school-scoped sections and create a section for a selected class, with optional
  capacity, using the existing permission-checked section API. The setup checklist links to the
  Academics page for section setup.
- **Status:** implemented; admin production build, typecheck, lint, formatting, and 8 focused
  validation/API-client tests pass.
- **Acceptance:** show section, class association, and capacity; disable section creation until
  classes are available; show loading, empty, success, and error/retry states; retain API-side
  permission and school-scope enforcement.
- **Verification limitation:** browser form interaction and authenticated API/database acceptance
  remain outstanding; build/tests do not close GAP-012 or validate the broader academic lifecycle.
- **Backlog:** GAP-012 (section-management slice only); domain approval and academic lifecycle
  acceptance remain open.

### Sixth increment — subject catalog

- **Requirement:** REQ-ACA-001; this catalog slice does not complete the full requirement.
- **Scope:** list and create school-scoped subjects with name, code, category, optional short
  name, maximum marks, and credit through the existing permission-checked subjects API. Link the
  setup checklist to this workflow.
- **Status:** implemented; admin production build, typecheck, lint, formatting, and 9 focused
  validation/API-client tests pass. The development server rendered `/academics` on port 3002
  for visual review.
- **Acceptance:** display subject catalog data; create validated subjects; show loading, empty,
  success, and error/retry states; retain server-side authorization and school scoping.
- **Verification limitation:** the browser layout was inspected, but create/list behavior against
  an authenticated API/database remains unverified. The API and database were unavailable because
  the local Docker daemon was not running. Subject offerings, grading policy, and teacher
  assignment are not included in this slice.
- **Backlog:** GAP-012 (subject-catalog slice only); academic lifecycle approval remains open.

### Next increment

### Seventh increment — teacher directory

- **Requirement:** REQ-TEA-001; this directory slice does not complete teacher assignment scope.
- **Scope:** validate teacher create payloads at the API boundary and provide school-scoped
  teacher listing/creation through the existing permission-checked endpoints. Link setup and
  dashboard navigation to the teacher directory.
- **Status:** implemented; API and shared-validation typechecks/builds, admin build/typecheck/lint,
  formatting, and 10 focused tests pass. The `/teachers` form was exercised in the browser using
  a temporary mocked API response.
- **Acceptance:** reject malformed teacher identity/contact/date fields and unknown fields; list
  only the authenticated school's teachers; show loading, empty, success, and error/retry states.
- **Verification limitation:** the browser interaction verified rendering, form submission, and
  list refresh only against an in-browser mock; authenticated API/database acceptance remains
  outstanding because local services are unavailable. Assignment management and teacher
  access-scope enforcement are not included.
- **Backlog:** GAP-012 (teacher-directory slice only); REQ-TEA-001 remains open.

### Eighth increment — teacher assignment management

- **Requirements:** REQ-TEA-001 and REQ-ACA-001; assignment creation is one slice and does not
  establish the runtime teacher authorization boundary.
- **Scope:** strictly validate assignment references; require teacher, academic year, class,
  section, and subject records to exist in the authenticated school; reject a section/class
  mismatch and duplicate assignment; list and create assignments from the teacher directory.
- **Status:** implemented; API and shared-validation builds/typechecks, admin build/typecheck/lint,
  formatting, and 11 focused tests pass.
- **Acceptance:** assignment UI filters section choices by selected class; API independently
  verifies school ownership and selected class/section relationship; list shows resolved record
  names; failures surface without success-shaped fallback.
- **Verification limitation:** the assignment panel rendered in the browser, but its selector
  data stayed in loading because the API/database services are unavailable; selection and submit
  behavior and authenticated API/database acceptance remain outstanding. The current identity
  model does not link teacher records to authenticated users or materialize `user_scopes`; this
  slice validates assignment record integrity but does not prove or enable assignment-scoped
  teacher access to marks or student records.
- **Backlog:** GAP-012 (assignment-management slice only); REQ-TEA-001 access-scope enforcement
  remains open.

### Phase-sequence correction

- The delivery table above defines D1 as identity, school tenant, school configuration, and
  academic foundation; D2 is student, guardian, teacher, enrollment, and assignment workflows.
- Academic-year, class, section, and subject-catalog work are partial D1 slices. The teacher
  directory and teacher-assignment slices above are D2 work that was started before D1 exit
  evidence was complete. They must not be counted as D1 completion or D2 acceptance.
- **Current phase remains Phase 7; current delivery increment must return to D1.** D1 is not
  complete: role/tenant denial tests, approved configuration/policy history, academic lifecycle
  acceptance, and representative-user evidence remain open. Phase 13 is still NO-GO.
- No teacher-account linkage or user-scope schema should be added until the identity and scope
  decisions in GAP-008/GAP-013 have an approved contract. Use this corrected order for the next
  increments rather than treating the previously stated teacher-linkage work as the immediate
  next coding task.

### Ninth increment — permission guard denial tests

- **Scope:** add focused tests for the existing API permission guard's unauthenticated denial,
  missing-permission denial, complete-permission acceptance, and authenticated no-metadata behavior.
- **Status:** implemented; focused tests and API typecheck pass.
- **Limit:** this verifies permission membership behavior only. It does not prove tenant isolation,
  school-role policy, permission assignment history, data-scope enforcement, or endpoint-level
  denial behavior; those D1 requirements remain open.

### Tenth increment — require school context on tenant-scoped APIs

- **Scope:** reject authenticated requests with a missing or blank `schoolId` before they reach
  school-scoped controllers/services; apply the guard across academic, school, student, teacher,
  exam, result, document, AI, notice, report, and dashboard routes.
- **Status:** implemented; guard unit tests, API typecheck/build/lint, and formatting checks pass.
- **Acceptance:** unauthenticated requests remain 401; authenticated users without a school
  context receive 403; users with a school context continue to the existing permission checks.
- **Limit:** this is a request-context precondition, not cross-tenant integration proof. It does
  not implement school switching, validate school status on every request, prove the completeness
  of tenant filters, or close role/policy history and academic lifecycle acceptance.

### Eleventh increment — academic-year lifecycle service tests

- **Scope:** test that listing is school/deletion scoped, creating an active year deactivates
  active years only within that school in the same transaction, activating an existing year
  scopes deactivation and update to that school, missing/cross-school years are not found, and
  invalid date ranges are rejected before writes.
- **Status:** implemented; 5 focused service tests, API typecheck/build/lint, and formatting pass.
- **Limit:** mocked service tests verify query construction and lifecycle behavior but do not
  replace PostgreSQL integration/concurrency tests, prove tenant isolation across every service,
  establish a full academic lifecycle, or approve policy/version history.
- **Environment:** PostgreSQL integration remains blocked; the local Docker daemon is unavailable.

### Twelfth increment — strict school-profile update contract

- **Scope:** define a typed partial school-profile update schema for the fields already persisted
  by the school model; reject empty payloads, unknown fields, malformed email/year values, and
  wrong field types at the API boundary; pass validated data directly to the scoped service and
  retain its audit event.
- **Status:** implemented; shared-validation tests and school-service tests added.
- **Limit:** this does not implement school settings/timezone/language/calendar configuration,
  configuration version history, update authorization integration tests, or owner approval of
  profile-field policy.

### Thirteenth increment — active-school lifecycle guards

- **Scope:** update school profiles in a transaction only when the current school is not
  soft-deleted; make setup status return not-found for missing/deleted school context instead of
  reporting a success-shaped all-incomplete checklist.
- **Status:** implemented; 4 focused service tests verify authenticated-school targeting,
  deleted-school denial, setup-count tenant filters, and audit-on-success.
- **Limit:** mocked service tests do not prove database transaction behavior or tenant isolation
  across other services; suspended/archived school policy remains subject to the approved
  lifecycle contract.

### Fourteenth increment — academic master cross-school denial tests

- **Scope:** add service tests proving that class, section, and subject updates reject IDs not
  found within the authenticated school, and that a section cannot be created for a class from a
  different school.
- **Status:** implemented; included in the focused academic service test suite.
- **Limit:** mocked query tests do not replace PostgreSQL integration tests or broad tenant
  isolation tests for every endpoint, job, file, and export.

### Fifteenth increment — atomic school-profile audit

- **Scope:** write the school-profile audit record in the same Prisma transaction as the
  non-deleted, school-scoped profile update, so an audit write failure aborts the mutation.
- **Status:** implemented; service tests verify the transactional audit call and surfaced audit
  failure; API build/typecheck/lint pass.
- **Limit:** rollback behavior still needs verification against PostgreSQL; mocks cannot prove
  database transaction semantics.

### Sixteenth increment — mutable school settings

- **Requirements:** UC-SCH-009 mutable settings change flow; this is not the immutable release
  portion of that use case.
- **Scope:** add tenant-scoped GET/PATCH school settings for IANA timezone, English/Nepali
  language, date format, and supported ISO 4217 currency; gate updates with `settings.manage`,
  audit changed field names in the same transaction, add the currency column/migration, seed the
  setting permission for school administrators, and provide the admin settings form.
- **Status:** implemented; focused schema/service/auth/academic tests (44 tests), API build,
  typecheck and lint, validation/admin typechecks and lints, Prisma client generation, and
  formatting checks pass. The local admin `/settings` route returns HTTP 200.
- **Limit:** browser automation could not attach to the local browser session. Migration has not
  been applied to PostgreSQL, and authenticated API/database behavior is unverified. Configuration
  releases, result-policy snapshots/references, archive lifecycle, and owner approval remain open;
  this does not complete UC-SCH-009 or D1.

### Seventeenth increment — constrain active academic-year lifecycle

- **Scope:** add a PostgreSQL partial unique index permitting at most one non-deleted active
  academic year per school; translate Prisma uniqueness races to HTTP 409; write academic-year
  create/activation audit records in the same transaction as the mutation. The migration reports
  existing duplicate active years before attempting index creation.
- **Status:** implemented; 46 focused tests pass across settings, school scope, permissions, and
  academic lifecycle. API build/typecheck/lint pass.
- **Limit:** migration is unapplied; mocked tests do not prove PostgreSQL concurrent-write behavior
  or transaction rollback. Resolve any preflight duplicates, apply the index, then run concurrent
  activation/create acceptance against PostgreSQL.

### Eighteenth increment — reject overlapping academic years

- **Requirement:** UC-ACA-001 requires non-overlapping academic-year date ranges.
- **Scope:** check inclusive date-range overlap on create and update, exclude the row being edited,
  and serialize same-school date checks with a transaction-scoped PostgreSQL advisory lock. Return
  HTTP 422 `YEAR_DATE_OVERLAP` with the conflicting same-school year ID; do not write or audit on
  rejection.
- **Status:** implemented; 14 academic service tests pass, including boundary overlap on create,
  update rejection, and scoped transactional checks. API typecheck and lint pass.
- **Limit:** no PostgreSQL service is available, so advisory-lock behavior and concurrent writers
  remain unverified. All year writes must continue using this service/lock for race-safe checks.

### Next increment

- Continue D1 with PostgreSQL acceptance of the migration preflight, unique active-year index,
  overlap checks, and concurrent writers, plus cross-tenant endpoint evidence. Reconcile the
  remaining configuration-release contract and required policy/template source models before
  adding immutable release records or result references; the current database design is explicitly
  a remediation draft. Keep the teacher directory and assignment UI unaccepted until the relevant
  D2 identity linkage and scope gates are met. Do not infer that Phase 7 or Phase 13 is complete.

## Definition of backlog completion

The requirements/design backlog is complete only when:

- every retained requirement has a stable ID, priority/release, owner, decision status, and
  complete traceability; rejected/deferred items are recorded rather than silently removed;
- all freeze-blocking ambiguities, unresolved references, and owner decisions are closed;
- use cases, business rules, data/API/UI/security contracts and test criteria agree;
- named owners approve the relevant artifacts and the Phase 13 independent audit records GO;
- the implementation-readiness checklist reflects evidence, not historical or inferred claims.

Passing this gate authorizes controlled feature delivery, not production release. Pilot and
production require their own acceptance and operational gates.
