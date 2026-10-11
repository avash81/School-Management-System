# Further Work and Production-Readiness Blueprint

## Status taxonomy

Every capability is reported as exactly one of: **COMPLETED**, **IN TESTING**, **PILOT**, **PLANNED**, **DEFERRED**, or **NOT APPLICABLE**. Design is not implementation. Current core feature status is **PLANNED/DESIGNED** unless separate evidence shows otherwise.

## 1. Requirements and traceability gap review

Review requirements for gaps, duplicates, contradiction, ambiguity, fixed-versus-configurable policy, and future scope. Maintain the mandatory chain:

```text
REQ → use case → rule → entity → API → UI → test → release evidence
```

Missing/ambiguous requirements are logged with owner, recommended assumption, decision deadline, and downstream impact. Configuration belongs to school policy (grading, results, templates, approval levels); tenant isolation, private files, backend authorization, audit, and human control of ambiguous OCR are fixed controls.

## 2. Lifecycle, retention, and history

| Entity               | Mutable phase                   | Official/history policy                             | Delete/restore                                      |
| -------------------- | ------------------------------- | --------------------------------------------------- | --------------------------------------------------- |
| Student/teacher/user | governed updates/status changes | identity and action history retained                | soft delete/archive; restore by authority           |
| School               | configured updates while active | archive preserves tenant history                    | platform-governed archive; no routine hard delete   |
| Academic structures  | mutable before official use     | referenced versions retired, not mutated            | restore only if policy permits                      |
| Exam/marks/result    | draft/review revisions          | approved/published snapshots immutable              | correction/reopen creates history; no silent delete |
| Templates/documents  | new versions only               | generated output identifies source/template version | revoke/archive, retention-governed removal          |
| Upload/OCR/audit     | workflow metadata controlled    | provenance/audit append-only under retention        | purge only after policy/legal hold review           |

Retention schedule, legal hold, school-offboarding export, deletion authorization, and restore windows require school-policy and legal review before production. The provisional backup targets remain RPO ≤24h and RTO ≤8h for pilot; they are not evidence of actual recovery until restore drills pass.

## 3. Continuity, backup, audit, approvals, and correction

- Database/storage/queue/worker/OCR/PDF/notification outages expose safe degraded states, correlation ID, retry/resume/manual fallback, and never discard source files or partial official records.
- Backups cover encrypted database and private file objects with frequency, retention, access control, restore runbook, and scheduled restoration proof.
- Audit minimum: login/logout; user/role/permission; school/config/template; student/teacher/enrollment; marks/review/approval/correction; result calculation/publication; imports/OCR corrections; exports/downloads; document generation; support access. Events include actor, time, action, entity/version, prior/new state where appropriate, source, result, reason, tenant, and correlation ID.
- Approval workflows are versioned/configurable policy graphs. Default: submitter → examiner review → principal/admin approval. Role combination is explicit and audited.
- Locked-mark correction requires request/reason → authorized review → approved revision → affected result/document impact assessment → audit. Published results use versioned snapshots and never silently overwrite prior official output.

## 4. Files, bulk operations, search, reports, dashboards, and notifications

Files are centralized private objects with size/type/magic-byte/scan validation, server-generated tenant keys, checksum/version, retention, authorization, and no unrestricted public URL. Imports/exports/bulk generation/notifications use preview, validation, error report, confirmation, audit, idempotency, quotas, queue jobs, retry, progress, and per-item outcomes.

Search supports scoped identifiers/names/roll/registration/class/section/subject and teacher/document queries with pagination/filter/sort. Reporting distinguishes real-time aggregates, safe caches, and queued heavy exports. Role dashboards show relevant KPIs, pending approvals, alerts, recent activity, and notifications—not generic overloaded screens. Notification intents are event-driven and channel/provider independent, with preference/consent rules and delivery records.

## 5. Verification, localization, UX, and performance

Official verification uses opaque unguessable token/QR/barcode, rate limit, revocation, minimal status, and anti-enumeration controls. Localization supports Unicode, Nepali names/address structures, English/Nepali content, AD/BS rendering, and appropriate number formatting while canonical dates remain real values.

Accessibility requires keyboard flow, screen-reader labels, contrast, text scale, form/error clarity, and mobile usability. Responsive priority: teacher marks/attendance, AI upload/review, student lookup, and parent result viewing. Performance engineering applies indexes, pagination, caching, queues, batches, and measured limits. Load plans cover 500/2,000/5,000/10,000+ students, concurrent logins/marks/imports/results/PDF/report jobs.

## 6. AI quality and human control

Maintain anonymized, governance-approved multi-format datasets; track OCR/provider/model/mapping version, character/field/table/marks accuracy, match precision/recall, false positives/negatives, confidence calibration, review rate, latency, and cost. Ambiguous matching always needs human selection. Failure preserves source, records reason, permits bounded retry/alternate mapping/manual entry, and never removes official evidence.

## 7. Security, privacy, operations, and release management

Before production: dependency/vulnerability/secret scans; authentication/authorization/tenant/file/API/CSRF/XSS/injection/rate-limit tests; penetration testing where feasible; privacy/data-minimization and legal/policy review by qualified owners. Observability includes application/security/audit/performance/database/queue/OCR metrics and alerts for error rate, jobs, dependencies, storage, authentication attacks, and backups.

CI/CD promotes development → test → staging → production with lint/test/build/security/migration checks, staged rollout, rollback/forward-fix, semantic versions, release notes, hotfix policy, and feature flags for high-risk rollout. Database changes are versioned, backward compatible through expand/contract, tested, backed up, and never manually edited in production.

## 8. Training, support, data quality, health, and final validation

Prepare role-specific administrator, teacher, exam staff, principal, student/parent, developer, and maintenance guides; AI training emphasizes review before official acceptance. Support covers feedback, tickets, incidents, announcements, FAQ, and troubleshooting. Data-quality checks flag duplicates, missing enrollment/offering, invalid marks, invalid assignments, duplicate exam entries, and inconsistent results. Health views cover API, database, storage, queue/worker, OCR, renderer, email/SMS, and external dependencies.

Production readiness requires: reviewed requirements/use cases/rules/data/API/UI/security/localization/accessibility; tested backup restoration, AI/bulk/performance/audit/error workflows; monitoring; training; pilot completion; critical finding resolution; final end-to-end chain from school setup through authorized portal publication.

## 9. Required final documentation

Final SRS, use-case/rule/ERD/architecture/API/UI/security/AI/testing/deployment/backup documentation; role manuals; developer/maintenance guide; known limitations; future roadmap; and an evidence-backed feature-status register. No document may call a feature complete based only on design.
