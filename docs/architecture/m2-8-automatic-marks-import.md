# M2.8 Automatic Marks Import Architecture

## Status

**Architecture complete; implementation pending.** M2.8 is the controlled handoff from reviewed import records to official `MarkEntry` records. It does not bypass validation, review, permissions, audit, or the existing marks/result lifecycle.

The user-facing manual and AI-assisted paths that converge on this boundary are defined in the [hybrid marks-entry workflow](hybrid-marks-entry-workflow.md).

## Goal

```text
approved import
  -> lock context and import
  -> recheck validation
  -> resolve create/update/conflict plan
  -> transaction
  -> official MarkEntry records
  -> audit and import history
```

AI and OCR output never writes directly to official marks.

## Import lifecycle

```text
UPLOADED
  -> PROCESSING
  -> EXTRACTED
  -> MATCHED
  -> VALIDATING
  -> REVIEW_REQUIRED
  -> READY_TO_IMPORT
  -> IMPORTING
  -> COMPLETED
```

Failure paths:

```text
PROCESSING -> FAILED
IMPORTING  -> ROLLED_BACK | IMPORT_FAILED
```

Only a server-side command can transition to `READY_TO_IMPORT`, and only an authorized approval command can start `IMPORTING`.

## Staging and official data

Reviewed extraction, matching, validation issues, corrections, and import plans remain staging data. Official marks are created or updated only after approval:

```text
ImportRecord / proposed component
  -> ImportPlan
  -> approved transaction
  -> MarkEntry
```

The import plan records the exact context, rule-set version, source record, proposed value/status, and whether each operation is `CREATE`, `UPDATE`, `NO_CHANGE`, or `CONFLICT`.

## Academic context lock

Before approval and again immediately before commit, resolve and verify:

```text
schoolId
academicYearId
classId
sectionId
test/examId
examSubjectId
subjectId
```

The server derives school and user from authentication. Any mismatch between selected context, document suggestions, approved review state, or current exam configuration blocks import.

The exam subject and enrollment must belong to the same school and compatible academic context. Display labels are never used as the official identity.

## Official mark identity

The existing unique mark boundary is:

```text
examSubjectId + enrollmentId + assessmentComponentId
```

The import service must use this identity for create/update/conflict checks. Student, subject, exam, academic year, and enrollment are resolved to IDs before planning. A displayed name, roll, or component label is not sufficient.

## Create, update, and conflict plan

For each proposed component:

```text
no existing MarkEntry -> CREATE
same value/status/source-compatible -> NO_CHANGE
existing value differs -> CONFLICT or UPDATE_BY_POLICY
```

The default policy is conservative: differing existing marks require explicit approval and a reason. The import must never silently overwrite an existing mark.

The preview shows:

```text
new marks
unchanged marks
updates
conflicts
invalid records
unmatched records
```

Field-level imports update only explicitly present components. A theory-only upload must not clear existing practical or internal values.

## Duplicate and idempotency protection

Use both:

1. source fingerprint: school, file SHA-256, exam, subject, academic context
2. logical identity: enrollment, exam subject, assessment component, proposed value/status

A repeated approval command carries an idempotency key and returns the original import result instead of duplicating marks. A retry after an uncertain network response must be safe.

An identical source with a new filename is still eligible for logical duplicate detection. A deliberate re-import requires an explicit reviewer decision and audit event.

## Transaction boundary

The final commit must run in one database transaction for a bounded import batch:

```text
BEGIN
  recheck import state and permissions
  recheck context and unresolved issues
  acquire import lock
  check MarkEntry versions/identities
  create or update official marks
  create mark audit/provenance records
  update import status and summary
COMMIT
```

Any critical failure rolls back the transaction and leaves official marks unchanged. For very large imports, M2.9 may use controlled batches, but each batch needs explicit reconciliation, idempotency, and a visible job-level result; partial success must never be hidden.

## Concurrency and version checks

Official mark updates use optimistic concurrency. The import plan stores the expected existing record version or `updatedAt` value. If another user changes the mark before commit:

```text
CURRENT_VERSION != EXPECTED_VERSION
  -> CONCURRENT_MODIFICATION
  -> rollback current transaction
  -> require re-review
```

A per-import lock prevents two workers from executing the same final commit. It does not replace row-level version checks.

## Provenance and audit

Each imported official mark must retain or link to:

```text
source = ai_import | bulk_import
importId
uploadId / source file
source page/row/column/cell
original extracted value
reviewed/corrected value
final imported value
reviewer and approver
rule-set version
processor/extraction version
timestamp
```

The current `MarkEntry` fields `source`, `enteredById`, `confidenceScore`, and `notes` can carry summary metadata, while a dedicated provenance/history model should hold the complete immutable chain. Manual edits after import use a distinct `MANUAL_EDIT` audit action.

## Correction and update policy

If an existing mark is different:

```text
existing = 60
proposed = 67
```

show the conflict and require a configured approval policy. If replaced, record before/after values and reason. If the existing mark is already published or locked by the marks lifecycle, the import must reject or create a controlled correction request rather than mutate it silently.

## Rollback

Rollback is an authorized compensating operation, not an unconditional restore:

```text
imported before = 60
imported value  = 67
current value  = 69 (manual edit after import)
```

If current value equals the imported value and provenance matches, rollback may restore/delete according to the operation type. If current value changed after import, report `POST_IMPORT_MODIFICATION` and require administrator review. Never destroy a later manual edit blindly.

Rollback requires `marks.import.rollback`, explicit confirmation, a reason, and audit history. It must itself be transactional and idempotent.

## Permissions

Separate permissions should be enforced by the API:

```text
marks.import.approve
marks.import.override
marks.import.rollback
```

Approval requires no unresolved critical issues, a valid import state, current context, and an authorized user. Overrides require an explicit reason and are visible in the import history.

## Import summary and result

On completion, return a durable summary:

```text
students affected
marks processed
created
updated
unchanged
conflicts
rejected
failed
rolled back
```

The result links to import details and official marks. Marksheet generation remains a separate command using the existing document engine.

## API boundary

Conceptual commands:

```text
GET  /api/v1/imports/:id/preview
POST /api/v1/imports/:id/approve
GET  /api/v1/imports/:id
POST /api/v1/imports/:id/rollback
```

Approval and rollback must be server-side transactional commands. The frontend cannot decide which records are safe to write.

## Boundary responsibilities

```text
M2.6 validation
  -> authoritative issues and decision

M2.7 review
  -> corrections, matching choices, approval request

M2.8 import
  -> plan, duplicate/conflict checks, transaction, audit, rollback

M2.9 queues
  -> large import batching, progress, retries, reconciliation
```

M2.8 does not OCR, match names, calculate final results, or generate marksheets.

## Acceptance criteria

- Reviewed staging records are separate from official marks.
- Academic context is locked and rechecked before commit.
- Existing `MarkEntry` uniqueness defines official mark identity.
- Create, update, no-change, and conflict operations are explicit.
- Field-level imports do not clear unspecified components.
- File and logical duplicate detection are both defined.
- Approval is idempotent, permission-controlled, and transactional.
- Optimistic concurrency detects post-review mark changes.
- Provenance and audit records link every imported mark to its source and corrections.
- Published/locked marks cannot be silently overwritten.
- Rollback is version-aware and protects later manual edits.
- Failure leaves official marks unchanged for the transaction/batch.
- Large-scale batching is deferred to M2.9 with explicit reconciliation.

## Next part

M2.9 should define background import queues, bounded batches, page/record parallelism, progress, retry/dead-letter behavior, idempotent workers, and reconciliation for very large imports.
