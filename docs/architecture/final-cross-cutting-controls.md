# Final Cross-Cutting Architecture Controls

## Scope closure

This is the final planned category addendum. New product ideas are managed through change control; they do not expand the architecture baseline without impact review.

## Controls

1. **Feature flags:** tenant-scoped, audited flags control AI/OCR, portals, SMS/email, QR verification, attendance, and advanced reports. Flags are evaluated server-side and do not bypass permission/scope checks.
2. **Configuration versions:** grading, mark structures, templates, exam/result rules, and academic structures have immutable versions/effective periods. Official results/documents retain the exact referenced version.
3. **Concurrency:** interactive records use revision/ETag optimistic concurrency. A stale update returns conflict with safe current-version information; marks/results never silently overwrite.
4. **Transactions and atomicity:** official multi-write operations use database transactions. External work uses outbox/intents, idempotent retries, and reconciliation—not false distributed atomicity.
5. **Idempotency:** imports, jobs, bulk requests, and retried callbacks use idempotency keys/job identity and deduplicate by source checksum/context where applicable.
6. **Import mapping:** CSV/XLSX/OCR mappings are versioned, previewable, tenant-owned configurations from source column/field to normalized system field/component.
7. **Identity resolution:** exact match, possible match, ambiguous match, and no match are distinct outcomes. Ambiguity always requires human action.
8. **Formal state machines:** student, account, examination, marks, result, import, notification, document, and job states permit only documented transitions with actor/reason rules.
9. **Time/date policy:** store UTC instants and canonical dates; school timezone defaults to Asia/Kathmandu unless configured; render AD/BS/local formats at application/document layer; audit timestamps preserve UTC plus display context.
10. **Localization:** translation keys, Unicode-safe input/search, locale-aware numbers/dates, Nepali-capable PDF fonts, bilingual templates, and script-safe name handling are architectural requirements.
11. **Notification tracking:** created → queued → sent → delivered → read, with failed/retry states and provider evidence. Delivery never changes academic transaction outcome.
12. **Document integrity:** retain document ID, template/source/result version, student/academic year, generator, timestamp, checksum, status/revocation, and verification token.
13. **Feature versus data permission:** authorization is always operation permission plus resource/data scope; roles alone never authorize access.
14. **Maintenance mode:** privileged, time-bounded, audited maintenance state can block normal mutations while retaining read/health policy; emergency operations require reason and approval.
15. **Definition of done:** a feature is done only when requirements, data/migration, API/UI, validation, authorization/scope, audit, error/rollback, tests, documentation, observability, and release evidence are complete.

## Final design decision

Stop creating new planning categories. Next deliverables are consolidated final artifacts: SRS, traceability matrix, complete diagram set, database/ERD/data dictionary, architecture/API/security specifications, then formal review/freeze.
