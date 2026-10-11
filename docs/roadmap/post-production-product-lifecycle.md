# SchoolOS Post-Production Product Lifecycle

## Purpose

Production v1.0 begins the product lifecycle; it does not end the project. This roadmap governs post-pilot readiness, production operations, and later expansion. Delivery sequencing and the D16 architecture-freeze gate remain defined in the [post-architecture delivery roadmap](post-architecture-delivery-roadmap.md).

```text
D16 freeze → Controlled delivery → Pilot school → Stabilization/readiness gate
→ Production v1.0 → Monitoring/feedback → v1.x improvements
→ Controlled capability expansion → Multi-school scale-up
```

## Continuous operating loop

1. **Operate and monitor:** health, latency, queue backlog, backup success, security alerts, OCR quality, document/job failures, and tenant usage.
2. **Triage feedback:** classify as critical bug, security/reliability incident, usability issue, feature request, or future idea.
3. **Decide and design:** assess impact on use cases, rules, permissions, data, APIs, privacy, migration, and tests before work is scheduled.
4. **Build and verify:** use the same staged development, CI, review, staging, and rollback controls as v1.
5. **Release and learn:** progressively release, monitor outcomes, and update documentation/metrics.

## Operating workstreams

### Maintenance

Prioritize security vulnerabilities, data-integrity defects, failed imports, document/render failures, backup/recovery issues, and production incidents. Preserve evidence in audit/log/incident records and create regression tests before closing a defect.

### Usability improvements

Use teacher, examination-staff, administrator, principal, student, and parent feedback to shorten safe workflows. Measure task completion time, validation/rejection rate, support requests, and satisfaction; do not remove controls merely to reduce clicks.

### AI improvement

For each approved, privacy-governed document sample: collect extraction/match outcomes and human corrections → measure errors by provider/layout/quality → improve mappings, matching policy, thresholds, or provider configuration → validate against a held-out dataset → deploy behind safeguards. Never train or share student documents without an approved data-governance process.

### New modules

After core stability, evaluate bounded modules in this order of dependency and user value: parent portal/notifications/analytics; then fees, library, transport, inventory, payroll, and other administration. Each module is a new architecture/use-case/security/data/testing change, not an unreviewed add-on.

### Multi-school SaaS expansion

Scale tenant onboarding only after tenant isolation, quotas, observability, support access, backups, performance, billing/contract needs, and school-level configuration have been validated. Validate each capability in the pilot where applicable; verify billing and other multi-tenant concerns before onboarding additional schools. Schools share platform infrastructure but never operational data, templates, users, settings, or files unless a deliberately designed platform feature permits it.

## Version policy

- **v1.0:** stable core school operations proven with a pilot school.
- **v1.x:** maintenance, security, usability, and low-risk improvements.
- **v2.0:** approved major capability expansion after architecture/design review.
- **v3+:** additional independently scoped domains such as finance, library, transport, payroll, or inventory.

## Current priority

The project remains in requirements/design remediation and governance validation; D16 is not yet ready for approval. The immediate gate is to continue D0.4 Part 3, [Academic Structure Management](../architecture/d0-4-3-to-8-remaining-use-case-modules.md), then complete atomic traceability, resolve open references and proposed-owner decisions, and address the Phase 13 findings. Obtain named-owner approval and rerun Phase 13; only a GO decision authorizes architecture freeze and controlled feature delivery. After that gate, use the [post-architecture delivery roadmap](post-architecture-delivery-roadmap.md) to reach the pilot and later production phases. The post-pilot phases below are future decision gates and do not authorize implementation or expansion ahead of their required approvals and evidence.

## Post-pilot execution phases

### Phase 1 — Stabilize the pilot and prove operational readiness

After the pilot school has completed real academic cycles, the product enters a stabilization window. The focus is not feature breadth but evidence. Review operational reliability, data integrity, support burden, and staff trust before expanding scope.

Key decisions during this phase:

- Confirm that student, roster, marks, approvals, publishing, and document workflows are stable across normal and exceptional cases.
- Close production defects by severity and user impact, with regression coverage for every user-visible fix.
- Measure support load, time-to-resolution, rejected or failed imports, and any workflow confusion experienced by teachers, exam staff, or administrators.
- Review privacy, logging, permission boundaries, backups, restore drills, and audit completeness before broadening access or data volume.
- Establish a release-readiness bar for each production change: impact review, test evidence, rollback plan, and owner approval.

**Exit gate:** Record workflow acceptance, defect disposition, operational metrics, and restore/security review results. Do not recommend production release with an unresolved critical defect; document mitigation and obtain explicit risk acceptance for any remaining high-risk issue.

### Phase 2 — Production v1.0 release

A production v1.0 release is justified only when the system demonstrates repeated, trustworthy use in a real-school environment. Release criteria should exceed technical readiness alone; they must include human readiness.

Required release evidence:

- core academic workflows work with live school data and real operational exceptions;
- exams, marks, approvals, publication, and reporting are auditable and reproducible;
- document generation, download, and verification processes remain private and secure;
- alerts, metrics, and incident response actions are tested and understood by the operating team;
- support, training, and rollback procedures are ready for school-day operations.

Production v1.0 should be a controlled release with clear support ownership, operational monitoring, and a narrow change window. Record the release decision, accountable owner, rollout and rollback procedures, and monitoring results. The product remains in a growth phase even after launch; it is not a “finished” state.

### Phase 3 — Real use, monitoring, and incremental improvement

Once in production, apply the continuous operating loop above to observe outcomes, triage feedback, assess impact, verify changes, and monitor releases. Prioritize data correctness, privacy, reliability, and school-day usability over feature volume.

This is the normal rhythm for v1.x: safe improvements, measured outcomes, public trust, and low-risk increments.

### Phase 4 — Controlled capability expansion

Only after core stability and operational confidence should the product expand into adjacent domains. Expansion must be gated by architecture review, data isolation, permission design, support capability, and acceptable operating load.

The expansion order remains bounded and deliberate:

- parent portal and communication features;
- analytics and operational reporting;
- advanced document and publication workflows;
- fee, library, transport, inventory, payroll, and similar administration modules;
- broader multi-school SaaS capabilities.

Each new module is a separate, reviewable product increment. It is not treated as an afterthought or a shortcut around architecture discipline.

Before scheduling a module, record the validated user need, scope, architecture and data impact, permission model, acceptance evidence, and accountable owner; approve the design before implementation.

### Phase 5 — Multi-school SaaS scale-up

Multi-school expansion begins only after the platform proves tenant isolation, secure sharing rules, billing support, observability, backups, and school-level configuration management. The objective is controlled growth, not broad unbounded launch.

A school can be added only when:

- tenant data boundaries and permissions are verified;
- support access is isolated and auditable;
- backups, restore, and incident handling are validated for each customer context;
- performance is acceptable for subject, roster, marks, and document volume at scale;
- onboarding and configuration workflows are repeatable and documented.

Onboard schools incrementally and verify the isolation, support, backup, and capacity gates for each onboarding before proceeding to the next.

Schools share platform infrastructure, but they do not share operational data, settings, files, users, or templates unless those boundaries are explicitly designed and approved for a platform feature.

## Decision principle

The product lifecycle is not linear in the sense of “build once, ship once.” It is a disciplined loop of evidence, learning, and controlled release. The immediate goal remains safe, reliable core school operations. Every visible expansion is justified by measured use, validated architecture, and operational control.

## Governance cadence

Governance does not stop after the initial release. Every post-production change should be classified and approved according to its operational impact before work begins.

- **Hotfix or incident response:** urgent defect or risk mitigation with owner approval, evidence, rollback readiness, and post-incident review.
- **v1.x improvement:** user-visible improvement or low-risk enhancement that passes impact assessment, regression coverage, and release/readiness checks.
- **Major capability expansion:** new module, platform feature, or broader multi-school change requiring architecture, privacy, security, staffing, support, and operational review.
- **Operational evidence required:** user need, scope, data/privacy impact, permission model, migration and rollback plan, test evidence, owner approval, and monitored release outcome.

No improvement or expansion should be treated as routine if it changes workflow risk, permission boundaries, educational data handling, AI/OCR policy, billing, or tenant isolation. The purpose of the loop is not speed alone; it is sustained trust.
