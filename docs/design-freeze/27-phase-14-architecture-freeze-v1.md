# RETIRED PRE-APPROVAL DRAFT — Phase 14 Architecture Freeze Proposal

> This file name is retained only for historical link compatibility. It is **not** an approved architecture freeze, does not establish version 1.0, and does not authorize feature development. The controlling status is `PHASE 13: REMEDIATION REQUIRED / NO-GO` until the final audit records a GO decision.

## Approval scope

**Prepared draft — not approved.** This document is ready to be used after the required Phase 13 design-review stop-and-review. It does not freeze the architecture, authorize implementation, certify legal compliance, or prove production readiness.

## Frozen decisions

1. Use a modular monolith API as the authoritative transactional boundary, with worker, OCR/AI, renderer, and notification adapters outside it.
2. Enforce backend authorization as permission + tenant + academic/resource/relationship scope + lifecycle state.
3. Treat PostgreSQL as official record authority; use durable jobs for external/bulk work; keep files private.
4. Version configuration, templates, marks, results, imports, and official document provenance.
5. Preserve historical enrollment/academic/audit records; corrections append revisions and never silently overwrite official history.
6. Implement manual marks and results before AI/OCR. AI/OCR remains provisional/reviewed and cannot directly alter official marks.
7. MVP scope: identity/RBAC/tenant controls, school/academic setup, people/enrollment/assignments, examinations, manual marks/results, marksheets, audit/files/reports. R1/deferred features remain behind documented scope/feature-flag decisions.
8. Apply state machines, idempotency, optimistic concurrency, transaction/outbox, testing, accessibility, localization, recovery, and operational controls defined by Documents 01–26.

## Change control

After this freeze, any material design change requires a change record with requirement/use-case/rule/state impact; data migration/history effect; API/UI/security/audit/test effect; release impact; owner; and approval. Implementation details may evolve without a new architecture decision when they preserve this contract.

## Remaining release gates

- Final production hosting/vendor/secret-manager selection
- Named operational, school-domain, security/privacy, and pilot owners
- Jurisdiction-specific legal/retention/communication review
- Implemented code, tests, CI, staging, restore drills, performance/AI measurements
- Training, pilot acceptance, production readiness review

## Phase outcome

**Phase 14 status: PLANNED.** The current stopping point is Phase 13 design review. Architecture freeze, technology finalization, repository/environment setup, and feature coding require explicit subsequent approval.
