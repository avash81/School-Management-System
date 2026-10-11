# Phase 13 Remediation — Governance, Repository Hygiene and AI Controls

**Status:** REMEDIATION PACKAGE READY FOR FINAL PHASE 13 RERUN. This document records the second-pass audit findings and the controlled closure package. It is not an architecture freeze or implementation authorization.

## 1. Controlling project status

```text
PHASE 13 — DESIGN REVIEW
STATUS: REMEDIATION REQUIRED / NO-GO
  ↓
NO ARCHITECTURE FREEZE
NO FEATURE DEVELOPMENT
  ↓
Resolve all CRITICAL and HIGH findings
  ↓
Rerun Phase 13 audit → explicit GO only
```

Pre-freeze code is classified as **foundation/scaffolding**. It may be maintained for hygiene, but it must not dictate requirements or be called completed feature implementation.

The repository now includes the documented governance and remediation packet needed for the final Phase 13 rerun. The remaining gate is explicit signoff from named owners and a successful audit rerun; no feature implementation is authorized before that result.

## 2. Source-of-truth hierarchy

| Priority | Source                                                        | Authority                                                 |
| -------- | ------------------------------------------------------------- | --------------------------------------------------------- |
| 1        | Approved design-freeze artifacts and accepted change requests | Implementation contract once Phase 14 is approved.        |
| 2        | Approved Architecture Decision Records (ADRs)                 | Records a deliberate technical decision and consequences. |
| 3        | Atomic requirements traceability registry                     | Requirement intent and test linkage.                      |
| 4        | Supporting architecture/design notes                          | Explanation only; cannot override 1–3.                    |
| 5        | Roadmaps, prompts and planning discussions                    | Historical/planning guidance only.                        |

On conflict, the higher priority source wins. The conflict is logged as a change request; documents, API/database contracts, tests and implementation are updated together. An unapproved draft never overrides an approved source.

## 3. Secret and repository hygiene policy

- `.env.example` may be committed and contains placeholders only.
- `.env.development`, `.env.test`, and `.env.production` are ignored local/deployment files. Production secrets exist only in the deployment secret store, never in source control, issue attachments, or handoff ZIPs.
- If `.env.production` was ever archived, committed, or shared outside the deployment secret store, the secret owner rotates every contained credential and records the incident.
- Source handoffs exclude `node_modules/`, `.next/`, `dist/`, `.turbo/`, logs, caches, local environment files, and `.git/` unless an explicit forensic/archive purpose is approved.
- `db:push` is allowed only for an isolated disposable local development database. Staging and production use reviewed, version-controlled migrations; production `db push` is prohibited.

## 4. Dependency and processing-version policy

The release manifest fixes Node.js, pnpm, PostgreSQL, Redis, Python, Docker, supported browsers, OCR engine/provider, provider model version, prompt/configuration version and processing-pipeline version. Dependency upgrades use lockfiles, vulnerability scanning, changelog review, test evidence and an ADR where behavior/security changes.

Each OCR/import attempt stores `provider`, `provider_model_version`, `pipeline_version`, `mapping_version`, elapsed time, input SHA-256, confidence, correlation ID and retry attempt. An AI/OCR provider interface is required; business services depend on the interface, not a provider SDK. Approved official results do not change after provider/model upgrades.

## 5. AI usage and cost controls

Per school and per job, configure permitted file types, maximum size, pages, rows, batch count, processing time, retry count, concurrent jobs and monthly/period usage quota. A job exceeding a limit fails safely with a visible reason, preserves the source, and is auditable. Queue metrics alert on cost/volume/error thresholds. AI import always supports manual mapping/entry fallback.

## 6. Retention and portability controls

Every data class has an owner, legal/policy basis, retention period, restore/purge procedure and legal-hold behavior: student/official academic history; results/documents; audit; uploads/original OCR sources; OCR intermediate data; temporary files; logs; notifications; exports. Durations are school/legal-policy configuration, not invented in code.

A governed school-data export is distinct from backup: it is authorized, encrypted, scoped, audited, expires, and provides a documented import manifest/version for portability, school termination or controlled environment migration. It never bypasses retention/legal holds.

## 7. Quality completion items

Before GO: critical-screen accessibility acceptance cases (keyboard, labels, focus, contrast, error/form/table/modal behavior), browser/device support matrix, server/database/application/school display time policy, and a versioned non-production AI golden dataset with expected structured outputs. Golden data is anonymized/authorized, access controlled, and evaluated on every provider/pipeline change.

## 8. Correlation and observability

A single correlation ID propagates from HTTP request through audit event, queue job, OCR processing attempt, import session/record, notifications and generated document. Logs contain correlation IDs and redact secrets/PII according to policy. This is verified by an end-to-end import failure/retry test.
