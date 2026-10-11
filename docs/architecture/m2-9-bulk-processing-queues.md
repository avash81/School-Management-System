# M2.9 Bulk Processing and Queue Architecture

## Status

**Architecture complete; implementation intentionally deferred.** This document defines how large import workloads should execute asynchronously. It does not add worker code, queue consumers, migrations, or provider integrations.

## Goal

Scale the M2 pipeline from one small document to thousands of students without blocking API requests, exhausting memory, duplicating official marks, or losing a partial result silently.

```text
Approved import
  -> create durable job
  -> split into bounded work units
  -> queue stage messages
  -> process with workers
  -> retry transient failures
  -> reconcile results
  -> commit controlled batches
  -> complete or report partial failure
```

## Workload types

The queue architecture should support:

- document page processing
- OCR and table detection
- structured CSV/XLSX parsing
- extraction and matching batches
- validation batches
- approved marks-import batches
- report/export generation
- bulk document generation

Each workload declares its stage, input artifact, output artifact, retry policy, resource class, and idempotency key.

## Job hierarchy

```text
ImportJob
  ├── ProcessingRun
  ├── PageTask / ParseTask
  ├── ExtractionBatch
  ├── ValidationBatch
  ├── ImportBatch
  └── ReconciliationSummary
```

The parent job owns lifecycle and user-visible progress. Child tasks are independently retryable but cannot advance the parent past a stage until the stage barrier is reconciled.

## Parent lifecycle

```text
QUEUED
  -> PREPARING
  -> PROCESSING
  -> REVIEW_REQUIRED
  -> READY_TO_IMPORT
  -> IMPORTING
  -> COMPLETED
```

Failure and control states:

```text
FAILED
CANCEL_REQUESTED
CANCELLED
PARTIALLY_COMPLETED
DEAD_LETTERED
```

A job is never marked complete based only on a queue acknowledgement. Durable child outputs and reconciliation must succeed first.

## Stage queues

Use separate logical queues or routing keys so workloads can scale independently:

```text
import.prepare
import.parse
import.ocr
import.table
import.extract
import.match
import.validate
import.commit
import.reconcile
```

The exact BullMQ naming can be finalized during implementation. Queue messages must be versioned and contain only identifiers and safe metadata, not large files or raw private documents.

Example message:

```json
{
  "jobId": "...",
  "taskId": "...",
  "stage": "ocr",
  "attempt": 1,
  "artifactKey": "private/object/key",
  "processorVersion": "ocr-v1",
  "correlationId": "..."
}
```

Workers fetch private artifacts using authorized service credentials and never expose object-storage URLs to queue payloads.

## Bounded work units

Split large documents and imports into bounded units:

- one PDF page or safe page group
- one spreadsheet sheet or row range
- one extraction/matching batch
- one controlled marks commit batch

Batch size is configurable by resource type and must be small enough to bound memory and transaction duration. The parent job records the expected unit count before processing begins.

For a 20,000-student import, do not create one giant in-memory array or one unbounded database transaction. Use staged artifacts and controlled batches with reconciliation.

## Parallelism and ordering

Independent page, parse, extraction, and matching tasks may run in parallel. Results are assembled deterministically by page number, source row, and batch sequence. Commit operations for the same official mark identity must serialize through the M2.8 concurrency rules.

Workers use concurrency limits per queue and resource class. OCR/vision workloads may have lower concurrency than CSV parsing. Per-school quotas prevent one tenant from starving other schools.

## Progress model

Store both count and stage progress:

```text
stage: MATCHING
completedUnits: 6421
expectedUnits: 20000
percent: 32
currentMessage: "Matching student records"
```

Progress is derived from durable task states, not optimistic worker heartbeats. The UI can poll or receive events, but the API remains the source of truth.

Parent progress must distinguish:

- processed successfully
- waiting
- retrying
- failed
- dead-lettered
- skipped/cancelled

## Retry policy

Classify failures:

### Retryable

- network timeout
- temporary provider failure
- Redis/database transient error
- worker shutdown
- rate-limit response

Use bounded exponential backoff with jitter and a maximum attempt count.

### Terminal

- unsupported file
- invalid content
- malformed context
- permission/tenant failure
- deterministic parser error
- validation rejection
- unresolved business conflict

Terminal failures do not retry automatically. The error code and safe user message are stored on the task and parent job.

## Dead-letter handling

After retry exhaustion, move the task to a dead-letter state with:

```text
taskId
parentJobId
stage
attempts
processor/version
errorCode
safeMessage
restrictedDiagnosticReference
createdAt
```

The parent job becomes `FAILED` or `PARTIALLY_COMPLETED` according to policy. Administrators can inspect, retry after correction, or mark a task permanently skipped. Replaying a dead-letter task must preserve idempotency and create an audit event.

## Idempotency

Every task has a deterministic key such as:

```text
jobId + stage + sourceArtifactVersion + batchNumber + processorVersion
```

Before writing output, the worker checks whether the task already completed for that key. Re-delivery must return the existing result rather than create duplicate extraction records, validation issues, or official marks.

Commit tasks also use the M2.8 import idempotency key and official mark identity/version checks. Queue retries must never bypass review or rerun a completed commit blindly.

## Stage artifacts

Persist immutable or versioned artifacts between stages:

```text
original upload
preprocessed page
OCR output
structured table
extraction records
matching results
validation issues
approved import plan
commit summary
```

Workers pass artifact references, not large payloads. Every artifact records processor/version, checksum, parent artifact, tenant, and retention policy.

## Cancellation

Cancellation is cooperative:

```text
CANCEL_REQUESTED
  -> stop scheduling new child tasks
  -> allow current safe unit to finish or abort
  -> mark remaining tasks cancelled
  -> reconcile artifacts
  -> CANCELLED
```

A cancellation cannot undo already committed official batches automatically. If official marks were committed, the system reports the completed batch and requires the M2.8 rollback policy for reversal.

## Partial completion and reconciliation

Small imports default to all-or-nothing transaction behavior. Large imports may use controlled batches only when the approval policy explicitly allows it.

The reconciliation summary must report:

```text
total units
successful units
failed units
retrying units
cancelled units
records staged
records approved
marks created
marks updated
marks unchanged
marks rejected
```

No parent job may say `COMPLETED` while failed or unprocessed units are hidden. Use `PARTIALLY_COMPLETED` when policy permits successful batches alongside visible failures.

## Worker safety

Workers must:

- verify tenant and job ownership before processing
- use least-privilege service credentials
- avoid logging raw student documents, passwords, tokens, or full personal records
- set timeouts and memory limits
- heartbeat long tasks
- release leases on shutdown
- write durable state before acknowledging messages
- tolerate duplicate delivery
- expose queue and failure metrics

## Observability

Measure per queue, school, stage, provider, and processor version:

- queue depth and oldest waiting job
- processing latency
- throughput
- retry count
- dead-letter count
- failure codes
- memory/CPU usage
- provider cost and rate limits
- commit duration
- reconciliation discrepancies

Correlate API request, parent job, child task, and audit event with a safe correlation ID.

## Capacity and fairness

Define concurrency and quotas by workload:

```text
interactive review: high responsiveness
CSV parsing: high throughput
OCR/vision: bounded provider/resource capacity
official commit: strict serialization and database safety
```

Use per-school fair scheduling and global backpressure. When queues are overloaded, accept the job and show `QUEUED`; never make the API wait synchronously or silently drop work.

## Security boundaries

Queue messages and artifacts are tenant-scoped. Workers do not trust school IDs from user payloads; they resolve job ownership from authenticated API-created records. Private source files are accessed only through controlled service paths. Review and approval permissions remain enforced by the API, not workers alone.

## M2.9 acceptance criteria

- Parent jobs and bounded child tasks are defined.
- Stage queues and versioned message contracts are defined.
- Large documents and imports are split into bounded units.
- Parallel work and ordered deterministic assembly are defined.
- Progress is durable and distinguishes success, failure, retry, and cancellation.
- Retryable and terminal failures are separated.
- Dead-letter inspection and replay are defined.
- Task and commit idempotency prevent duplicate writes.
- Stage artifacts are immutable/versioned and referenced by key.
- Cancellation, partial completion, and reconciliation are explicit.
- Worker tenant/security/least-privilege rules are defined.
- Queue metrics, capacity, fairness, and backpressure are defined.
- Official mark commits continue to use M2.8 safeguards.

## Next part

M2.10 should define AI error handling and safety: provider failures, adversarial or malformed documents, unsafe suggestions, privacy boundaries, human escalation, and fail-closed behavior.
