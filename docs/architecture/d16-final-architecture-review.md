# D16 — Final Architecture Review and Freeze

## Review decision

Architecture freeze is a governance gate, not a promise that no future changes will happen. It means the approved MVP has a coherent, testable design and implementation can begin safely.

**Current review state: not ready for approval.** The governing master project specification confirms that D0.4 and the remaining planning artifacts are still in progress. This review must not be frozen until all required diagrams, specifications, requirements traceability, and unresolved decisions are complete and approved.

## Required sign-off checklist

- Scope, actors, use cases, business rules, traceability, and MVP boundary approved.
- Workflows/state machines cover approval, correction, failure, cancellation, retry, and recovery.
- ERD/data dictionary reconcile with schema/migration plan and retention/privacy duties.
- Module ownership prevents direct cross-module writes; API contracts and error/idempotency rules are approved.
- Permission matrix and tenant/scope controls have executable test cases.
- AI review thresholds, quality metrics, and provider boundaries are approved.
- Marks/grading/absence/optional-subject policies have school-domain sign-off.
- Templates, document verification, file privacy, localization, accessibility, reports, and notifications are reviewed.
- Capacity, monitoring, RPO/RTO, backup restore evidence, security model, testing strategy, environments, deployment, and rollback are accepted.

## Freeze output

Create a decision log listing approved documents, open risks, owner, due date, and release impact. Any change after freeze must state affected requirement/use case/rule, data migration, API/UI impact, authorization/audit impact, and updated tests. Only a completed checklist and named approvers authorize development.

## Final decisions required for freeze

| Decision                 | Proposed baseline                                                                                                                                     | Why approval is required                                                                                                     |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| MVP AI/OCR scope         | Deliver the safe manual marks engine first; release OCR extraction/import only after its review, evaluation, and safety targets pass.                 | The plan describes AI/OCR as both a special feature and a later/advanced delivery; the release boundary must be unambiguous. |
| MVP portals              | Admin/teacher/exam workflows in MVP; student/parent read-only portal in v1.1 unless required by pilot.                                                | Portal access changes identity, privacy, notification, and acceptance scope.                                                 |
| Approval policy          | Teacher submits; exam coordinator reviews; principal/school admin approves exceptional/published actions. Small schools may explicitly combine roles. | Schools differ in available staff and segregation-of-duties needs.                                                           |
| Attendance and documents | Attendance and marksheets in MVP; ID/admit/certificate delivery after the marksheet renderer is proven.                                               | The document types have different templates, print/layout, and validation requirements.                                      |
| Localization             | English-first MVP with Unicode-safe data; bilingual/Nepali documents and BS date display as configured release work.                                  | This affects templates, date handling, UI content, and acceptance criteria.                                                  |
| Recovery objectives      | Provisional RPO ≤24 hours and RTO ≤8 hours for the pilot.                                                                                             | Backup frequency, cost, and operating responsibilities depend on this target.                                                |
| Pilot school profile     | One school, approved synthetic/migrated data, named admin/teacher/exam/principal testers, and one real exam workflow.                                 | Acceptance evidence and launch safety depend on a defined pilot.                                                             |

## Superseded approval record

| Item              | Record                                                                |
| ----------------- | --------------------------------------------------------------------- |
| Prior record      | Superseded by the Master Project Specification on 2026-08-18.         |
| Current next gate | Continue D0.4 Part 3, then complete the remaining planning artifacts. |

Any future freeze must name product, technical, and school-domain approvers and state affected requirement/use case/rule, data migration, API/UI impact, authorization/audit impact, and updated tests.
