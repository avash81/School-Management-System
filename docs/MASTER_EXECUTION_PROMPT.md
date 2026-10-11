# Master School Management System — Execution Prompt

## Purpose

Use this document to govern all future work on SchoolOS. It defines execution order, required outputs, quality gates, and the boundary between planning and implementation.

## Mandatory status distinction

Never confuse:

```text
PLANNED ≠ DESIGNED ≠ IMPLEMENTED ≠ TESTED ≠ PRODUCTION-READY
```

Use the [Feature Status Register](design-freeze/24-feature-status-register.md) as the authoritative status record.

## Required sequence

```text
1. Final SRS
2. Requirements traceability matrix
3. Complete use cases
4. Activity diagrams
5. Sequence diagrams
6. ERD/database specification
7. System architecture
8. API specification
9. Security specification
10. AI/OCR specification
11. UI/UX specification
12. Testing specification
13. Design review
14. Stop and review
15. Architecture freeze v1.0
16. Technology-stack finalization and repository/environment setup
17. Controlled foundation implementation
18. Core module implementation and integration
19. AI/OCR implementation against the proven marks engine
20. Staging, pilot, production approval, deployment, and continuous improvement
```

## Instructions for every phase

For each phase, state: current phase/module, objective, requirements, actors, use cases, data, dependencies, rules, workflow, architecture/data/API/UI/security impact, tests, risks, decisions, completed work, and next step. Do not skip a phase. Identify material ambiguity, recommend a safe baseline, and obtain required owner approval before treating it as final.

Do not start feature implementation until Design Review and Architecture Freeze v1.0 pass. Start implementation with identity/RBAC/tenant controls, school/academic foundations, people/enrollment/assignments, examinations/marks/results, documents/reports, then AI/OCR. AI/OCR must never bypass the official marks engine.

## Required outputs

The Design-Freeze Package must include final SRS, traceability, use cases, activity/sequence/state diagrams, ERD/data dictionary, architecture, APIs, security, AI/OCR, marks/results, UI/UX, testing, deployment/operations, approval/decision records, and final consistency audit.

## Definition of done

Production-ready requires documented/approved requirements and architecture; completed core implementation; passing unit/integration/API/E2E/security/performance/AI/accessibility tests; backup and restore evidence; monitoring/alerts/runbooks; approved deployment; trained users; completed pilot; resolved critical issues; and synchronized documentation.

## Package links

The design artifacts are indexed in [Design-Freeze Package](design-freeze/README.md). This prompt is an execution framework, not evidence that any feature is implemented or production-ready.
