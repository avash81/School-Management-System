# SchoolOS Current-State Documentation Index

Generated: 2026-08-28

## Reading Order

1. **[01-current-position-gap-analysis.md](./01-current-position-gap-analysis.md)** — Start here. Executive summary, architecture diagram, what's COMPLETED (tooling/scaffolding), **CRITICAL GAP analysis (P0 8 items, P1 14 items, P2 12 items, P3 20+)**, module-by-module completion vs Master Development Plan gates, CR-01 16 missing entity register, remediation priority sequence.
2. **[02-code-reference-classes-functions-components.md](./02-code-reference-classes-functions-components.md)** — Exhaustive code map: every package/class/method/endpoint signature, behavior, known bugs, linked to exact source file line ranges. Covers root config, 14 shared packages, 5 apps (api, worker, ai, admin, web), 11 api modules (Auth, School, Academic, Student, Teacher, Exam, Document, Dashboard, Notice, Reports, App), Prisma schema, CI + Husky. Ends with architectural strengths observed in the scaffolding.
3. **[03-way-forward-execution-plan.md](./03-way-forward-execution-plan.md)** — Recommended approach A vs B, reference diagrams (system architecture + request pipeline), 4-tier priority matrix P0→P3 with every gap enumerated and test proof, 13-phase execution calendar Stage 0→Stage 5, risk register, per-stage DoD (definition of done), Stage 0 exit criteria.
4. **[04-remediation-execution-checklist.md](./04-remediation-execution-checklist.md)** — Actionable execution checklist covering the exact remediation order required for CR-01 to CR-04, HI-01 to HI-05, freeze gate, and the post-freeze foundation implementation path.
5. **[05-phase-13-rerun-readiness.md](./05-phase-13-rerun-readiness.md)** — Consolidated status of phases 0 through 7 showing what is complete, what remains for the final Phase 13 rerun, and the required freeze gate before implementation authorization.
6. **[06-user-centered-agile-discovery.md](./06-user-centered-agile-discovery.md)** — Research and prototype plan for validating priority school workflows and creating a traceable Agile backlog without bypassing the implementation gate.
7. **[07-user-research-recruitment-and-consent.md](./07-user-research-recruitment-and-consent.md)** — Draft, privacy-conscious outreach and consent materials; requires school and qualified privacy/safeguarding review before use.
8. **[08-marks-entry-low-fidelity-prototype.md](./08-marks-entry-low-fidelity-prototype.md)** — Fictional-data screen flow and acceptance walkthrough for manual marks entry, AI review, independent approval, and safe failure states.

## Governance

All documents cross-reference the authoritative Design-Freeze package. Where code scaffolding conflicts with frozen architecture spec, the spec wins. Per Document 29 (Phase 13 Final Consistency Audit) status 2026-08-19: **NO-GO for architecture freeze and feature coding.** See §1 of Way Forward plan for reconciliation approach options A and B with recommendation.

## Reference Map

| Document ID                   | File Location                                                                                                                      |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Current analysis              | [docs/current-state/01-current-position-gap-analysis.md](./01-current-position-gap-analysis.md)                                    |
| Code reference                | [docs/current-state/02-code-reference-classes-functions-components.md](./02-code-reference-classes-functions-components.md)        |
| Way forward plan              | [docs/current-state/03-way-forward-execution-plan.md](./03-way-forward-execution-plan.md)                                          |
| Remediation checklist         | [docs/current-state/04-remediation-execution-checklist.md](./04-remediation-execution-checklist.md)                                |
| Rerun readiness status        | [docs/current-state/05-phase-13-rerun-readiness.md](./05-phase-13-rerun-readiness.md)                                              |
| Master plan                   | [docs/roadmap/master-development-plan.md](../roadmap/master-development-plan.md)                                                   |
| Project spec (governing)      | [docs/requirements/master-project-specification.md](../requirements/master-project-specification.md)                               |
| Phase 13 audit                | [docs/design-freeze/29-phase-13-final-consistency-audit-report.md](../design-freeze/29-phase-13-final-consistency-audit-report.md) |
| Feature status register       | [docs/design-freeze/24-feature-status-register.md](../design-freeze/24-feature-status-register.md)                                 |
| DB authoritative spec (CR-01) | [docs/design-freeze/30-authoritative-database-specification-v1.md](../design-freeze/30-authoritative-database-specification-v1.md) |
| MVP API contracts (CR-03)     | [docs/design-freeze/33-mvp-api-contracts-v1.md](../design-freeze/33-mvp-api-contracts-v1.md)                                       |
| Formal permission matrix      | [docs/design-freeze/19-formal-permission-matrix.md](../design-freeze/19-formal-permission-matrix.md)                               |
| Formal state machines         | [docs/design-freeze/13-state-machines.md](../design-freeze/13-state-machines.md)                                                   |
