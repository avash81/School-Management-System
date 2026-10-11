# Master Project Specification

## Status

**Governing brief — adopted 2026-08-18.** The repository contains a functional scaffold, but the authoritative design-freeze package remains Phase 13 **NO-GO** for architecture freeze. On 2026-10-10, the user explicitly authorized starting constrained, test-backed feature coding before Phase 13 GO. This authorization is a recorded exception to the coding hold, not a Phase 13 pass, named-owner sign-off, architecture freeze, pilot approval, or production approval. Implementation presence is not evidence that requirements have been approved, behavior tested, or accepted.

## Product

**Intelligent School Management, Examination, Marks, Result and Document Automation System**

The platform manages multi-school academic and administrative operations: school configuration, academics, people, attendance, examinations, configurable marks/results/grades/GPA, documents, reports, notices, notifications, access control, audit, files, student/parent portals, manual school-management workflows, and AI-assisted intake, extraction, and draft-generation workflows.

## Non-negotiable principles

- Security, tenant isolation, data integrity, history, and auditability come first.
- Each school’s data must be private, isolated, and never visible across different school tenants.
- Every user must have a distinct account with role-based privileges for admin, principal, teacher, student, guardian, and support operator workflows.
- Use configuration and versioning for school/subject/assessment/grading/template policy; do not hard-code school rules.
- Where policy is configurable, expose only supported, versioned school-level choices. Only users with explicit school-scoped permissions may configure, approve, or release policy; student/parent accounts cannot administer school configuration. Backend authorization, tenant isolation, history, and audit remain mandatory.
- AI/OCR only proposes data. The chain is extraction → matching → confidence → validation → human review/approval → official marks and official student records.
- No official student record, marks entry, result publication, or report-card update may be created or changed without explicit human review and approval.
- Manual school-management operations must remain available for administrators, teachers, and principals to update student, academic, and marks data directly in the system.
- ABSENT, MISSING, ZERO, NOT_SUBMITTED, and EXEMPT are distinct domain states.
- Results use approved official marks—not raw OCR data.
- Backend independently enforces identity, role, permission, tenant, academic scope, and resource ownership.
- Prefer a modular monolith unless a separately deployable boundary is demonstrably necessary.
- Preserve academic/enrollment/marks/result/document history; do not destructively delete official records.

## Planning sequence

```text
discovery → actor analysis → requirements → use cases → business rules
→ workflows/sequences → data/ERD → architecture → security → APIs
→ AI/OCR → marks/results → documents → UI/UX → testing/operations
→ architecture freeze → technology selection → setup → staged delivery
```

Staged delivery uses short Agile iterations with continuous user feedback: discover and prototype a bounded workflow, implement a traceable end-to-end increment, verify it against acceptance criteria, demo it to representative users, and refine the backlog. The 2026-10-10 user authorization permits constrained coding while Phase 13 remains NO-GO; it does not waive security, privacy, human-approval, testing, or release controls. Production use remains prohibited until the applicable approval gates pass. Pre-freeze discovery and prototype validation may proceed without adding product behavior.

## Required planning outputs

Requirements/SRS with IDs; actor/responsibility/permission matrices; complete use case catalog/specifications; business-rule catalog; activity, sequence, state, data-flow, ERD/domain/component/deployment diagrams; API/database/security/AI/document/UI/testing/deployment documentation; and maintained traceability to tests/implementation.

## Delivery order after freeze

Foundation (identity, roles, school, academics) → people/enrollment/assignments → examinations/marks/results → documents/reports → AI/OCR human-review pipeline → portals/notifications/advanced reports → pilot → production → monitored iteration.

## Current work

**Current phase:** Phase 7 — constrained foundation implementation by explicit user authorization dated 2026-10-10; Phase 13 remains NO-GO and architecture is not frozen. Phase 0 user workflow validation and the requirements/design backlog remain open. The repository has code across core domains, but that code is not acceptance evidence and does not clear the design-freeze gate.
**Current D0.4 status:** the original baseline, v0.3 supplemental intake, and broad design artifacts are documented; user validation, atomic traceability, unresolved references, proposed-owner decisions, and Phase 13 findings remain open.
**Next required outputs:** follow the [Requirements Completion Backlog and Delivery Roadmap](./requirements-completion-roadmap.md): implement small traceable foundation increments under the recorded exception while validating priority workflows, reconciling implementation/readiness claims, closing requirements/design blockers, obtaining named-owner approval, and rerunning Phase 13. The user authorization permits controlled coding but does not authorize architecture freeze or production release; those remain separate gates.

## Requirement baseline

The current requirement-first summary is recorded in [requirements-baseline-report.md](./requirements-baseline-report.md). Supplemental candidate requirements are recorded in [Software Requirements Addendum v0.3](./software-requirements-addendum-v0.3.md) and indexed in the [Requirements Register](./requirements-register.md). They must be owner-approved and atomically traced before architecture freeze; they are not implementation claims.

The [Requirements Completion Backlog and Delivery Roadmap](./requirements-completion-roadmap.md) is the canonical phase plan and requirements-closure backlog. The [implementation-readiness-checklist.md](./implementation-readiness-checklist.md) records current evidence and readiness gates; neither document treats code presence as acceptance.

## Source relationships

This brief is implemented by the detailed documents in `docs/architecture`, beginning with D0.1–D0.4. Any conflict is resolved in favour of this master specification until the user explicitly changes it.

The additional operational, production-readiness, lifecycle, recovery, AI-quality, privacy, legal, support, and final-validation requirements are mandatory in [Further Work and Production-Readiness Blueprint](../architecture/further-work-production-readiness.md).

The final cross-cutting controls—feature flags, configuration versions, concurrency, transactions, idempotency, mappings, state/time/localization, document integrity, maintenance mode, and definition of done—are fixed in [Final Cross-Cutting Architecture Controls](../architecture/final-cross-cutting-controls.md).

## Final requirement summary

The completed requirement baseline is recorded in [requirements-baseline-report.md](./requirements-baseline-report.md). The project requirement is now defined as follows:

- SchoolOS supports both standard manual school-management workflows and AI-assisted bulk intake from Excel, PDF, and image-based documents.
- AI may extract, match, suggest, and pre-fill student, class, roll number, marks, and report-card data.
- AI output remains a reviewable draft until authorized reviewers or approvers confirm and accept it.
- No official student record, marks entry, result publication, or report-card update may be created or changed without explicit human review and approval.
- Each school has isolated tenant data and separate privacy boundaries.
- Each user has a distinct account and role-based permissions for admin, principal, teacher, student, guardian, and support functions.
- Security, auditability, retention, and privacy are mandatory controls that cannot be bypassed by automated workflows.
