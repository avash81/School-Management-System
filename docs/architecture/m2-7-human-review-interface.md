# M2.7 Human Review Interface Architecture

## Status

**Architecture complete; implementation pending.** M2.7 defines the teacher-facing workflow for correcting uncertain extraction and matching records. It does not import official marks; approval hands off to M2.8 through the central marks service.

The end-to-end relationship between this AI-assisted path and manual marks entry is defined in the [hybrid marks-entry workflow](hybrid-marks-entry-workflow.md).

## Goal

```text
Import job
  -> review summary
  -> attention queue
  -> source/evidence detail
  -> correction
  -> automatic revalidation
  -> ready summary
  -> permission-controlled approval
```

The default experience is exception-first: teachers review the records that need attention, not all successful records.

## Review summary

The review dashboard shows:

```text
Detected: 100
Ready: 94
Needs review: 4
Unmatched: 2
Reviewed: 4 / 6
```

It also shows academic context, processing status, validation version, last reviewer, and the number of unresolved blocking issues. The approval action is disabled while unresolved critical/error issues remain unless an authorized override policy applies.

## Review queue

Default filter: `needs attention`.

Supported filters:

- all
- needs review
- unmatched
- invalid marks
- identity conflict
- low confidence
- total mismatch
- resolved
- rejected

Search fields include extracted name, normalized name, roll number, admission number, student ID, and selected candidate. Sort by severity first, then source order, so identity conflicts and impossible marks appear before minor warnings.

Each row displays only enough information to scan safely:

```text
source row | student | roll | components | match | decision | top issue | confidence
```

Successful rows remain inspectable through the `all` filter but do not dominate the default queue.

## Review detail layout

Desktop-first layout:

```text
+---------------------------+------------------------------+
| Original document         | Extracted record             |
| page/image/PDF viewer     | identity, marks, issues      |
| highlighted source region | evidence and corrections     |
+---------------------------+------------------------------+
```

The right panel shows raw value, normalized value, confidence, provenance, validation issue, proposed student, candidate evidence, existing mark if any, and the editable correction control. The left viewer opens the affected page and highlights the source bounding box when available.

## Source viewer

The viewer supports:

- page number and previous/next navigation
- fit page, fit width, and bounded zoom
- source highlight for the selected field
- page/row/column/provenance metadata
- safe loading through tenant-authorized access

If a source position is unavailable, show the page and row reference rather than inventing a highlight. The original upload is immutable and never replaced by a corrected preview.

## Corrections

Editable fields include identity selection, roll/admission reference where permitted, mark components, status, total, and format mapping. Each correction keeps:

```text
original extraction value
corrected value
field
reason
reviewerId
source provenance
validation run/version
createdAt
```

Correction reasons may include `OCR_ERROR`, `WRONG_STUDENT`, `WRONG_COLUMN`, `WRONG_FORMAT`, `SOURCE_ERROR`, and `OTHER`. School policy can require a reason for critical fields.

A correction updates the proposed import record or review state, not the original OCR/extraction artifact. It immediately triggers validation again and refreshes the issue list.

## Student matching review

For ambiguous or unmatched rows, show candidate students with:

- name and normalized name
- admission/academic ID
- historical academic year/class/section/roll
- current student/enrollment status
- evidence methods and similarity
- conflicts

Reviewers may select an existing student, search the tenant-scoped student list, or leave the row unmatched. There is no automatic student creation from this interface.

## Revalidation behavior

After every saved correction:

```text
save review change
  -> persist correction audit
  -> run M2.6 validation
  -> update issues and decision
  -> update counters and next-issue queue
```

Example: changing `87` to `67` must recalculate configured totals and remove only the issues actually resolved. It must not erase unrelated warnings or source history.

## Bulk actions

Bulk operations are explicit and scoped:

- accept all high-confidence, non-conflicting matches
- apply a reviewed column mapping
- apply a confirmed exact correction pattern
- reject selected records
- resolve selected warnings where policy permits

Before execution, show affected rows, students, components, and marks. Never expose an unrestricted `approve everything` action. Bulk changes are one auditable command with per-record outcomes and partial-failure reporting.

## Approval summary

Before official import, display:

```text
students detected
automatically matched
manually matched
unmatched
marks ready
marks requiring review
validation errors
```

The confirmation dialog names the academic year, class, section, subject, exam, affected student count, and mark count. Approval requires a fresh server-side check of tenant, permission, import state, rule version, unresolved issues, and idempotency.

## Permissions and separation of duties

Use separate permissions:

```text
marks.import.view
marks.import.review
marks.import.correct
marks.import.approve
marks.import.override
```

A teacher may review and correct but be unable to approve critical overrides. An administrator may override only with a required reason. The API enforces these permissions; disabled buttons are only a usability feature.

## Review statuses

Record-level states:

```text
PENDING
REVIEW_REQUIRED
CORRECTED
VALIDATED
APPROVED
REJECTED
UNMATCHED
```

Import-level state remains controlled by the processing/import lifecycle. A row marked `VALIDATED` is not official until the import approval and central marks transaction complete.

## Draft persistence and concurrency

Save corrections as small, idempotent commands so browser closure does not lose work. The review page may use optimistic concurrency with a record version or `updatedAt` token. A stale save returns a conflict and asks the reviewer to reload rather than overwriting another reviewer's correction.

MVP policy: one active reviewer per import session. A lease or review-session record can be added later for multi-reviewer workflows.

## Keyboard and accessibility

The review loop should support keyboard-first operation:

- `Tab` and `Shift+Tab` move through fields
- `Enter` saves and advances
- `N` moves to the next issue
- `A` accepts a safe record
- `R` marks for review
- `Esc` closes the detail panel

Use visible focus, labels for every field, keyboard-accessible filters, readable error text, high contrast, and screen-reader announcements for revalidation results. Shortcuts must not bypass confirmation for destructive or official-data actions.

## Audit and privacy

Audit events include review open, candidate selection, field correction, issue resolution, bulk action, rejection, override, and approval. Avoid logging raw private documents or unnecessary personal data. All review reads and commands are tenant- and permission-scoped.

## API boundary

The implementation should expose review-oriented operations similar to:

```text
GET   /api/v1/imports/:id/review-summary
GET   /api/v1/imports/:id/records?filter=needs_review
GET   /api/v1/imports/:id/records/:recordId
PATCH /api/v1/imports/:id/records/:recordId/corrections
POST  /api/v1/imports/:id/records/:recordId/match
POST  /api/v1/imports/:id/revalidate
POST  /api/v1/imports/:id/approve
POST  /api/v1/imports/:id/reject
```

Exact routes may follow the existing API naming, but each command must validate the import tenant, current version, permissions, lifecycle state, and idempotency.

## Boundary responsibilities

```text
M2.6 validation
  -> issues, severity, decisions, and revalidation

M2.7 review
  -> presentation, corrections, candidate selection, review state

M2.8 import
  -> approval transaction through the marks service
```

The interface must not directly create students, write marks, calculate results, or publish documents.

## Acceptance criteria

- Exception-first review dashboard and counters are defined.
- Issue filters, search, prioritization, and next-issue flow are defined.
- Side-by-side source viewer with page navigation, zoom, and highlights is defined.
- Raw values, normalized values, evidence, confidence, and issues are visible.
- Corrections preserve immutable originals and audit history.
- Student candidate selection and tenant-scoped manual search are defined.
- Corrections trigger automatic revalidation.
- Bulk actions are explicit, reviewable, and auditable.
- Approval summary and critical-issue blocking are defined.
- Permissions and separation of duties are enforced server-side.
- Draft persistence, optimistic concurrency, keyboard workflow, and accessibility are defined.
- Official marks remain the responsibility of M2.8.

## Next part

M2.8 should define the approval-to-marks transaction: duplicate protection, create/update rules, rollback, idempotency, audit, and safe handoff into the existing marks lifecycle.
