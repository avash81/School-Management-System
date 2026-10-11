# M2.1 AI/OCR Document Processing Architecture

## Status

**Architecture approved for implementation planning.** No AI extraction or automatic marks mutation is implemented by this document.

M2 must extend the existing import and marks boundaries. It must not create a parallel marks, result, or marksheet database.

## Goal

Accept a teacher-provided PDF, image, or spreadsheet and turn it into structured, reviewable records that can be submitted to the existing marks engine only after human confirmation.

```text
Upload
  -> classify
  -> extract
  -> normalize
  -> match
  -> validate
  -> human review
  -> confirm
  -> existing marks engine
  -> result engine
  -> document engine
```

## Non-negotiable safety rules

1. AI output is always untrusted input.
2. AI must never publish marks or results.
3. Low-confidence identity or mark matches must require manual review.
4. Every confirmed mutation must retain the source upload, extraction version, reviewer, timestamp, and before/after values.
5. A failed or cancelled job must not partially mutate marks without an explicit, auditable batch policy.
6. Tenant scope comes from the authenticated request and is checked on every upload, job, record, and confirmation query.
7. Private source files and generated artifacts remain access-controlled; public URLs are not used for student data.

## Supported sources

| Source | M2.1 decision                  | Initial implementation                      |
| ------ | ------------------------------ | ------------------------------------------- |
| CSV    | Structured tabular input       | Yes, after parser contract is defined       |
| XLSX   | Structured tabular input       | Yes, after parser contract is defined       |
| PDF    | Text/table or scanned document | Classification and extraction contract only |
| Image  | Scanned marks table            | Classification and extraction contract only |
| Other  | Rejected explicitly            | No silent fallback                          |

## Pipeline stages

### 1. Upload and quarantine

The API creates an `Upload` record and stores the file in a private quarantine prefix. Validate authenticated tenant, file size, declared MIME type, filename, checksum, and content signature before queueing. The original object is immutable.

### 2. Classification

Classify the source as `student_import`, `marks_import`, `document_template`, or `unsupported`. Classification is metadata for routing, not permission to mutate data.

### 3. Extraction

An extraction adapter produces provider-neutral output:

```ts
{
  sourceType: "csv" | "xlsx" | "pdf" | "image",
  pages: [{ pageNumber: number, text?: string }],
  tables: [{
    pageNumber: number,
    headers: string[],
    rows: Array<{ values: string[], cells?: Array<{ text: string, confidence?: number }> }>
  }],
  provider: string,
  modelVersion: string,
}
```

The adapter must preserve page, row, column, and cell provenance so reviewers can inspect where each value came from.

### 4. Normalization

Map provider output to a canonical import shape without applying business decisions:

```ts
{
  examId: string,
  examSubjectId: string,
  studentReference: {
    admissionNo?: string,
    academicId?: string,
    rollNumber?: string,
    name?: string,
  },
  componentCode: string,
  value?: string,
  attendanceStatus?: "present" | "absent" | "exempted" | "withheld",
  confidence: number,
  provenance: { page?: number, row?: number, column?: number },
}
```

`value` remains raw until backend marks validation converts it to an exact decimal or rejects it. `ABSENT` is a status, never a zero value.

### 5. Matching

Use the existing student/enrollment identity rules in this order:

1. Admission number
2. Academic ID
3. Roll number within the selected enrollment context
4. Strong identifier combination
5. Name plus date of birth or other corroborating data
6. Manual review

Name-only matches are never automatically confirmed.

### 6. Validation

Validate tenant, exam, subject, enrollment, component, mark range, attendance state, duplicate keys, lifecycle state, and permissions. Validation must produce record-level errors and warnings without mutating marks.

### 7. Human review

The review screen shows extracted value, confidence, provenance, proposed student, existing mark, validation messages, and editable correction fields. A reviewer must explicitly accept, reject, or correct each actionable record or an explicitly defined safe batch.

### 8. Confirmation

Confirmation runs through the existing marks service in a controlled transaction or idempotent batch. It records the import session, source record, reviewer, and audit event. Replaying the same confirmed record must not create a duplicate mark.

## Job and record lifecycle

Existing `Upload`, `OCRJob`, `ImportSession`, and `ImportRecord` models are the starting point. M2.2 should add explicit source type, job kind, progress, cancellation, retry, and error metadata rather than overloading free-text fields.

```text
Upload: pending -> processing -> completed | failed | rejected
OCRJob: queued -> processing -> completed | failed | reviewed
ImportSession: draft -> validating -> review -> approved -> imported
                                      -> rejected | failed
```

No `approved` import session may bypass the marks service. The import service is an adapter into the central marks engine.

## Service boundaries

```text
API
  - authentication, tenant scope, upload authorization
  - job creation and status reads
  - review and confirmation commands

Worker
  - parsing, OCR provider calls, normalization, matching, validation
  - retries and progress updates

AI service
  - provider adapters and extraction only
  - no direct database writes to marks or results

Marks engine
  - authoritative mark validation, lifecycle, audit, and persistence

Result/document engines
  - consume finalized marks/results only
```

The AI service should communicate through versioned internal contracts. It should not receive unrestricted database credentials.

## Idempotency and retries

- Every upload has a checksum and immutable object key.
- Every processing request has an idempotency key.
- A job retry creates no duplicate import records.
- Confirmation uses a unique source-record key for the import session.
- Provider timeouts are retryable; invalid files, unsupported formats, and policy failures are terminal.
- Human corrections override extraction output and remain auditable.

## Observability

Record metrics and structured events for upload count, file rejection rate, extraction latency, provider failures, confidence distribution, unmatched records, validation failures, review duration, confirmation success, and retry count. Never log passwords, session secrets, raw private documents, or unnecessary student personal data.

## M2.1 acceptance criteria

- Provider-neutral extraction contract is documented.
- Source provenance is preserved to page/row/cell where available.
- AI output cannot directly write marks or results.
- Matching hierarchy and name-only restriction are explicit.
- Human review is mandatory for uncertain records.
- Upload, OCR, import, and confirmation states are explicit.
- Tenant isolation, idempotency, audit, and retry rules are defined.
- Worker, AI service, marks engine, result engine, and document engine responsibilities are separated.

## Next part

M2.2 should implement secure file upload and the document-processing job contract, beginning with CSV/XLSX validation and quarantine before adding OCR providers.
