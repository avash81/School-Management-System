# SchoolOS — Remediation Execution Checklist

**Status:** Design remediation active — HI-01 through HI-05 are in progress and must be closed before the final archive audit.

This checklist translates the NO-GO status from the Phase 13 audit into an execution plan that the team can execute in order. It is intentionally scoped to remediation and governance, not uncontrolled feature work.

## Governing rule

Feature implementation is blocked until the Architecture Freeze gate is cleared. The project may continue only with design remediation, documentation alignment, and controlled code fixes that make the existing scaffolding consistent with the frozen requirements.

---

## Phase 0 — Governance and freeze gate

- [ ] Confirm the project is still in remediation mode and not in implementation mode
- [ ] Confirm the Phase 13 audit remains the governing decision document
- [ ] Confirm named owners for product, architecture, school-domain, privacy/security, and release signoff
- [ ] Publish the working decision log and issue register
- [ ] Freeze scope for remediation work: no new domain features without an approved change request

Evidence:

- [docs/design-freeze/29-phase-13-final-consistency-audit-report.md](../design-freeze/29-phase-13-final-consistency-audit-report.md)
- [docs/design-freeze/17-final-decisions-and-owners.md](../design-freeze/17-final-decisions-and-owners.md)
- [docs/MASTER_EXECUTION_PROMPT.md](../MASTER_EXECUTION_PROMPT.md)

---

## Phase 1 — Resolve CR-01: authoritative database schema

- [x] Finalize table-by-table ERD and cardinality
- [x] Define all required columns, types, nullability, defaults, enums, and validation rules
- [x] Add tenant isolation strategy and school scoping model
- [x] Add explicit foreign keys, indexes, unique constraints, and delete behavior
- [x] Add versioning/revision controls for configuration, marks, results, and documents
- [x] Add approval and correction tables required by the marks and result policies
- [x] Add audit and provenance requirements for file, OCR, import, results, and permission changes
- [x] Close the gap for missing entities listed in the authoritative database spec
- [x] Validate schema against the data dictionary before coding changes

Primary references:

- [docs/design-freeze/30-authoritative-database-specification-v1.md](../design-freeze/30-authoritative-database-specification-v1.md)
- [docs/design-freeze/30a-authoritative-data-dictionary-v1.md](../design-freeze/30a-authoritative-data-dictionary-v1.md)
- [packages/database/prisma/schema.prisma](../../packages/database/prisma/schema.prisma)

Exit criteria:

- All required tables and fields are defined and agreed
- No unresolved ERD gap remains for the MVP domain
- Schema is ready to drive Prisma migration work

---

## Phase 2 — Resolve CR-02: atomic traceability

- [x] Normalize requirements into atomic rows
- [x] Map each atomic requirement to a use case, business rule, entity, API contract, UI screen, and test
- [x] Remove dangling UC/BR/TC references
- [x] Document ownership for each requirement
- [x] Ensure all major modules have traceability coverage
- [x] Confirm the requirement matrix is testable and not merely descriptive

Primary references:

- [docs/design-freeze/02-requirements-traceability-matrix.md](../design-freeze/02-requirements-traceability-matrix.md)
- [docs/design-freeze/31-atomic-requirements-traceability-registry-v1.md](../design-freeze/31-atomic-requirements-traceability-registry-v1.md)
- [docs/design-freeze/03-complete-use-case-specification.md](../design-freeze/03-complete-use-case-specification.md)

Exit criteria:

- No requirement is orphaned
- Every top-level requirement has traceable downstream evidence
- The traceability matrix is accepted by product and architecture owners

---

## Phase 3 — Resolve CR-04: marks and result policy contract

**Current state:** Document 32 contains a detailed remediation draft and candidate calculation fixtures. They are not approved school defaults or released policies. Project-owner direction recorded 2026-10-09: a marks submitter or correction requester cannot approve their own submission/request; a different authorized person must approve. Product/school-domain sign-off and consistency review remain pending.

Additional project-owner direction recorded 2026-10-09: `NOT_SUBMITTED` blocks result approval/publication by default; treating it as zero requires an explicit, versioned school policy.

Additional project-owner direction recorded 2026-10-09: the MVP should support raw component-total and normalized weighted-component calculation modes, explicitly selected and versioned by policy.

Additional project-owner direction recorded 2026-10-09: `ABSENT` remains distinct; an explicit, versioned school policy decides whether it blocks publication or yields a fail/zero outcome, without rewriting it as a present numeric zero.

Additional project-owner direction recorded 2026-10-09: the MVP should support configurable grace marks, disabled by default; enabled grace must have strict caps, approval, and audit.

Additional project-owner direction recorded 2026-10-09: this supersedes the prior direction on component-minimum grace. Each released school policy may configure whether grace can repair component minima; it remains disabled unless explicitly enabled, with strict caps, approval, and audit.

Additional project-owner direction recorded 2026-10-09: rounding method and display precision are configurable per versioned school result policy.

Additional project-owner direction recorded 2026-10-09: optional-subject contribution to overall percentage, GPA, and ranking is configurable per versioned school policy; optional subjects do not silently clear required-subject failures.

Additional project-owner direction recorded 2026-10-09: provide flexible school-configurable policies where appropriate, but configuration/change/release must require explicit school-scoped permission and be enforced server-side; student/parent users cannot administer school configuration.

Additional project-owner direction recorded 2026-10-09: the user who calculates/submits a result cannot approve or publish that same result snapshot; a different authorized person is required.

- [ ] Finalize distinct state model for zero, absent, missing, exempt, not-submitted, withheld, and ambiguous
- [x] Record project-owner direction that `ABSENT` remains distinct and its outcome is explicit policy
- [x] Record project-owner direction for the default `NOT_SUBMITTED` outcome and explicit-policy exception
- [x] Record project-owner direction to support raw-total and normalized weighted-component calculation modes in the MVP
- [x] Record project-owner direction to support policy-configured grace, disabled by default, with caps, approval, and audit
- [x] Record project-owner direction that component-minimum grace is configurable per released school policy and disabled unless explicitly enabled
- [ ] Reconcile these directions across requirements, rules, state machines, schemas, APIs, UI, and tests; obtain product/school-domain sign-off
- [ ] Finalize calculation order, rounding, and display precision
- [x] Record project-owner direction that rounding method and display precision are policy-configurable
- [ ] Define grade-band structures and per-school policy versioning
- [x] Record project-owner direction for versioned optional-subject contribution rules and no silent required-subject failure override
- [x] Record project-owner direction for permission-gated, tenant-scoped school policy configuration; reconcile permissions and authorization tests
- [ ] Define approval and publication state transitions
- [x] Record project-owner direction that marks submissions and correction requests require an independent authorized approver
- [ ] Reconcile independent approval across requirements, permission matrix, workflows, APIs, and tests; obtain product/school-domain sign-off
- [x] Record project-owner direction that result calculator/submitter cannot approve or publish that result snapshot
- [ ] Define locked result correction and reopen policy
- [ ] Define formula precedence and provenance for derived totals
- [ ] Define subject/component handling for theory, practical, internal, and optional components
- [ ] Define failure modes for incomplete or invalid policy execution

Primary references:

- [docs/design-freeze/11-marks-result-engine-specification.md](../design-freeze/11-marks-result-engine-specification.md)
- [docs/design-freeze/32-versioned-marks-result-approval-policy-v1.md](../design-freeze/32-versioned-marks-result-approval-policy-v1.md)
- [docs/design-freeze/20-formal-business-rule-catalog.md](../design-freeze/20-formal-business-rule-catalog.md)

Exit criteria:

- A school policy can be instantiated without ambiguity
- Marks calculation is reproducible and versioned
- Published results cannot be silently rewritten

---

## Phase 4 — Resolve CR-03: API contracts

- [x] Finalize resource paths and base conventions for `/api/v1`
- [x] Define DTOs for all MVP endpoints
- [x] Define request validation, enums, pagination, and filter semantics
- [x] Define success and error envelopes
- [x] Define 401/403/404/409/422 patterns and audit metadata
- [x] Define idempotency and revision conditions
- [x] Define bulk job endpoints and progress reporting
- [x] Define upload, review, and import contracts for AI/OCR flows
- [x] Document permission checks and scope filters per endpoint

Primary references:

- [docs/design-freeze/33-mvp-api-contracts-v1.md](../design-freeze/33-mvp-api-contracts-v1.md)
- [docs/design-freeze/19-formal-permission-matrix.md](../design-freeze/19-formal-permission-matrix.md)
- [docs/design-freeze/09-security-specification.md](../design-freeze/09-security-specification.md)

Exit criteria:

- API contract is implementation-ready
- Frontend and backend can develop against the same contract
- Error-handling policy is defined and consistent

---

## Phase 5 — Resolve HI-01 through HI-05

### HI-01: complete non-critical use case specs

- [x] Expand the critical admission/auth/session/academic/result/import flows to implementation-level detail
- [x] Fill the missing batch-2 use cases for teacher onboarding, class/section setup, subject offerings, student archive, result publication, onboarding, settings/releases, multi-school switching, export jobs, and file handling
- [ ] Close the remaining lower-priority use cases and any edge cases not yet covered by the freeze artifacts
- [ ] Confirm each remaining UC includes trigger, alternatives, exceptions, permissions, data, API, UI, and postconditions

Current state: CR-01, CR-02, and CR-03 remediation artifacts are in place and aligned with the authoritative design-freeze docs. The core gap is no longer broad discovery; it is the final sweep of remaining edge cases and the authoritative signoff checks before the final Phase 13 re-audit.

### HI-02: complete activity and sequence coverage

- [x] Add baseline activity flows for login, admissions, marks, AI/OCR import, and results/document generation
- [x] Add baseline sequence diagrams for login, admission, manual marks, AI/OCR import, and result/doc generation
- [ ] Add the remaining operational flows and the failure/retry/authorization boundaries for support, school setup, bulk export, retention, and maintenance events

### HI-03: complete security threat model

- [x] Capture the major STRIDE/DREAD threat register and control mapping in the security specification
- [x] Define core tenant-isolation, session, auth, and upload controls
- [x] Complete the remaining operational security documents: CSRF strategy, encryption key management SOP, rate-limit budget tiers, break-glass support access SOP, and file malware/quarantine control contract

### HI-04: complete UI specification

- [x] Define shared design-system principles, role surfaces, and interaction rules
- [ ] Expand the remaining screen-by-screen actions, field sets, permissions, states, and accessibility rules for the lower-priority flows
- [ ] Define final loading, empty, and error-state patterns for the full product surface

### HI-05: complete test cases

- [x] Convert the design strategy into executable fixtures and expected outcomes for security, data isolation, policy, and import workflows
- [x] Define test ownership, thresholds, and release gate rules for approval and publication flows
- [x] Add final performance and AI evaluation pass/fail criteria to the execution gate

Primary references:

- [docs/design-freeze/04-complete-activity-diagrams.md](../design-freeze/04-complete-activity-diagrams.md)
- [docs/design-freeze/05-complete-sequence-diagrams.md](../design-freeze/05-complete-sequence-diagrams.md)
- [docs/design-freeze/12-ui-ux-specification.md](../design-freeze/12-ui-ux-specification.md)
- [docs/design-freeze/14-testing-specification.md](../design-freeze/14-testing-specification.md)
- [docs/design-freeze/09-security-specification.md](../design-freeze/09-security-specification.md)

---

## Phase 6 — Final audit and freeze gate

- [ ] Re-run the Phase 13 audit with all CR items resolved
- [ ] Confirm there are zero Critical findings
- [ ] Confirm all High findings have owners and accepted mitigation
- [ ] Approve Architecture Freeze v1.0
- [ ] Publish the final freeze decision and implementation authorization

Primary reference:

- [docs/design-freeze/16-final-architecture-review-and-freeze.md](../design-freeze/16-final-architecture-review-and-freeze.md)

Exit criteria:

- Freeze is approved
- Implementation is authorized
- The codebase is now allowed to proceed into foundation work

---

## Phase 7 — Foundation implementation (post-freeze)

Only after the freeze gate is cleared:

- [ ] Complete environment bootstrap and dependency alignment
- [ ] Implement identity and RBAC
- [ ] Implement tenant isolation and school configuration models
- [ ] Implement core academic and enrollment structures
- [ ] Implement examinations and marks entry workflow
- [ ] Implement result engine and publication logic
- [ ] Implement documents, notices, and reports
- [ ] Implement AI/OCR staged import workflow
- [ ] Implement file storage and job orchestration
- [ ] Run tests, lint, typecheck, and security validation
- [ ] Prepare deployment and pilot stage

---

## Immediate next action for this sprint

Start with the remediation order below, in this exact sequence:

1. CR-01 database schema cleanup
2. CR-02 traceability registry completion
3. CR-04 result policy finalization
4. CR-03 API contracts completion
5. HI-01 to HI-05 follow-up
6. Final Phase 13 re-audit
7. Architecture Freeze approval
8. Foundation implementation

This is the shortest valid route to a safe, reviewable, and implementation-ready SchoolOS.
