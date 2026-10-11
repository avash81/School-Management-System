# M2.2 File Upload and Document Processing Pipeline

## Status

**Architecture complete; implementation pending.** This specification defines the secure asynchronous pipeline for M2 imports. It does not yet add an upload endpoint, parser, OCR worker, or automatic marks mutation.

## Goal

Turn a teacher upload into a tenant-scoped, reviewable import job without blocking the API request:

```text
Upload -> validate -> quarantine -> persist metadata -> queue -> process -> review
```

Official marks remain isolated until a reviewer confirms the import through the existing marks service.

## Supported files

Initial formats:

- PDF
- JPG/JPEG
- PNG
- XLSX
- CSV

DOCX, HEIC, TIFF, and other formats are rejected explicitly until a later milestone.

## Request contract

The API should accept `multipart/form-data` at `POST /api/v1/imports` with:

- `file`
- `academicYearId`
- `classId`
- `sectionId`
- `examId`
- `subjectId`
- optional `formatProfileId`
- optional idempotency key

The server derives `schoolId` and `uploadedById` from the authenticated session. Client-supplied tenant IDs are ignored or rejected.

A successful request returns immediately:

```json
{
  "data": {
    "importJobId": "...",
    "status": "queued"
  },
  "meta": {}
}
```

The request must never wait for OCR or AI processing.

## Validation and quarantine

Validation order:

```text
Authentication
  -> permission
  -> tenant context
  -> request/context validation
  -> extension allowlist
  -> declared MIME check
  -> content signature check
  -> size limit
  -> checksum
  -> security scan
  -> private storage
  -> queue
```

The extension is only a hint. Content signatures and parsers are authoritative. Reject corrupted, oversized, unsupported, malformed, or security-scanner-failed files. Limits must come from configuration, not scattered constants.

Recommended initial configuration keys:

```text
IMPORT_MAX_FILE_BYTES
IMPORT_MAX_PDF_PAGES
IMPORT_ALLOWED_MIME_TYPES
IMPORT_SCAN_REQUIRED
IMPORT_MAX_RETRY_ATTEMPTS
```

## Storage contract

Use private object storage with generated keys:

```text
schools/{schoolId}/imports/{importJobId}/original/{uuid}.{safeExtension}
```

Never use the original filename as a path. Store the original name only as metadata. PostgreSQL stores metadata; object storage stores bytes.

Required metadata:

```text
schoolId
importJobId
originalFilename
storageKey
mimeType
sizeBytes
sha256
securityScanStatus
createdAt
```

Source files are immutable. Access requires authenticated, tenant-scoped authorization or a short-lived controlled download URL.

## Duplicate detection

Before queueing, check the school-scoped combination of:

- SHA-256 checksum
- exam
- subject
- academic context

A duplicate produces a warning and a reference to the existing job. It does not silently process the same source twice. A deliberate reprocess must have a new idempotency decision and audit event.

## Import job lifecycle

The current `Upload`, `OCRJob`, `ImportSession`, and `ImportRecord` models are the starting point. M2 implementation should add explicit job metadata or a dedicated `ImportJob` model for context, progress, retries, and stage history.

```text
UPLOADED
  -> VALIDATING
  -> PROCESSING
  -> PREPARING
  -> CLASSIFYING
  -> OCR_PROCESSING | STRUCTURED_PARSING | TEXT_EXTRACTION
  -> EXTRACTION
  -> MATCHING
  -> VALIDATION
  -> REVIEW_REQUIRED
  -> APPROVED
  -> IMPORTED
```

Terminal states:

```text
FAILED
CANCELLED
REJECTED
```

Each attempt records stage, processor, processor version, worker ID, start/end times, error code, retry count, and safe diagnostic metadata.

## Pipeline routing

```text
CSV/XLSX -> workbook parser -> sheet/header detection -> column mapping -> validation
PDF with text -> text/table extraction
Scanned PDF -> page preparation -> OCR -> table detection
JPG/JPEG/PNG -> image preparation -> OCR -> table detection
```

The router must select the cheapest reliable path. It must not send a structured spreadsheet through OCR unnecessarily.

## Resumability and retries

Stages must be idempotent and persist their outputs separately. If extraction fails after OCR succeeds, retry extraction from the stored OCR artifact rather than re-running OCR. Temporary provider/network failures may retry with bounded exponential backoff. Invalid files, unsupported formats, policy failures, and malformed context are terminal. Exhausted jobs go to a dead-letter queue for inspection.

Large PDFs should be split into bounded page work items, processed in parallel where safe, and recombined deterministically by page order. A single huge transaction must not hold an entire document in memory.

## Queue contract

The API creates a job and enqueues a durable message. Workers claim one stage at a time and update progress:

```text
{
  "jobId": "...",
  "stage": "ocr_processing",
  "attempt": 1,
  "processorVersion": "...",
  "correlationId": "..."
}
```

The worker must acknowledge only after durable stage output and job state are written. Re-delivery must be safe. Later stages should be separate queue messages so they can be retried or scaled independently.

## Progress and errors

Expose status without leaking stack traces or private document contents:

```text
File uploaded
File validated
Document classified
OCR/parser completed
Extracting records
Matching students
Validating marks
Review required
```

User-facing errors are stable codes such as `UNSUPPORTED_FILE`, `FILE_TOO_LARGE`, `SECURITY_SCAN_FAILED`, `PROCESSING_TIMEOUT`, or `TABLE_NOT_DETECTED`. Detailed diagnostics remain in restricted logs.

## Permissions and separation of duties

Use separate permissions:

```text
marks.import
marks.import.review
marks.import.approve
```

A school may configure one person for all steps or require:

```text
Teacher uploads -> coordinator reviews -> administrator approves
```

Every transition is authenticated, tenant-scoped, permission-checked, and audited.

## Official data handoff

Review records remain outside official marks. On approval:

```text
ImportSession approved
  -> central marks service
  -> mark validation and lifecycle
  -> result engine
```

The import service must not write directly to the marks table. Existing marks are shown beside proposed values, and corrections require an explicit reason and audit event. Repeating confirmation must be idempotent.

## M2.2 acceptance criteria

- Supported file allowlist and configuration limits are defined.
- Multipart upload derives tenant/user context from authentication.
- File signature, size, checksum, and security-scan gates are defined.
- Private generated storage keys and metadata are defined.
- Duplicate detection and idempotency rules are defined.
- Job lifecycle, progress, retries, dead-letter handling, and resumability are defined.
- Structured files bypass OCR where possible.
- Large documents can be split into bounded work items.
- User-safe error codes and restricted diagnostics are defined.
- Permissions and separation of duties are defined.
- Approval hands off through the existing marks service only.

## Next part

M2.3 should define OCR preprocessing, table detection, page geometry, merged cells, handwritten marks, multi-page reconciliation, and measurable extraction quality metrics.
