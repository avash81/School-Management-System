# ADR-000 — Decision Log Governance

**Status:** Accepted for Phase 13 remediation.  
**Date:** 2026-08-19  
**Owner:** Technical owner, with product and school-domain review.

## Context

The project has multiple planning and design documents plus pre-freeze scaffolding. Without a decision log, later developers or agents may re-decide a contract or treat a draft as approved.

## Decision

Architecture decisions are stored in `docs/decisions/ADR-nnn-short-name.md`. Each ADR contains: decision/date/status/owner; context; options; selected option; rationale; consequences; dependencies; review trigger; and links to affected requirements/database/API/tests. Accepted ADRs sit below approved design-freeze artifacts and above supporting notes in the source-of-truth hierarchy.

## Initial ADR backlog

| ADR     | Subject                                            | Status   |
| ------- | -------------------------------------------------- | -------- |
| ADR-001 | Modular-monolith boundaries                        | Proposed |
| ADR-002 | PostgreSQL schema, tenant isolation and migrations | Proposed |
| ADR-003 | Authentication/session and scoped authorization    | Proposed |
| ADR-004 | Private object storage and file quarantine         | Proposed |
| ADR-005 | OCR/AI provider abstraction and versioning         | Proposed |
| ADR-006 | Result policy, snapshots and approval workflow     | Proposed |
| ADR-007 | Notifications/outbox and delivery tracking         | Proposed |

## Consequence

No ADR is accepted merely because code exists. A decision change after Phase 14 requires a change request and impact analysis.
