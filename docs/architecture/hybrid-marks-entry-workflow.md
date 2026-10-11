# Hybrid Manual and AI-Assisted Marks Entry Workflow

## Status

**Planning specification; implementation pending.** This document describes the shared teacher workflow for manual entry and AI-assisted document entry. It supplements M2.1–M2.9 and does not authorize feature implementation before the architecture-freeze gate.

## Product promise

Teachers can enter marks manually or upload a marksheet for AI-assisted extraction. Both paths use the same academic context, validation rules, marks lifecycle, permissions, audit history, and official marks engine. AI reduces typing; it does not decide or publish official marks.

```text
Manual entry ───────────────┐
                            ├─> validate -> human verify -> authorize -> official marks
Upload -> extract -> review ┘
```

The manual route remains usable when AI is unavailable, a document is unsupported, or the extracted data is unsuitable.

## Actors and authority

- **Teacher / marks operator:** opens an assigned marks task, enters or reviews marks, corrects errors, and submits it.
- **Authorized approver:** a different authorized person verifies and approves the submission. The approver may be a teacher or management user with the required permission and scope; the submitter cannot approve their own submission.
- **SchoolOS:** validates scope and data, records provenance and audit events, and commits approved marks through the central marks service.
- **AI/OCR service:** extracts and suggests values from uploaded files. It cannot approve, publish, or write official marks.

The server enforces tenant, assignment, exam-entry state, and permission checks for every read and command. UI controls do not grant authority.

## Shared academic context

Before either entry mode, the user selects:

```text
academic year -> class -> section -> exam -> subject / exam subject
              -> assessment component(s)
```

The server derives the school from the authenticated user and resolves every selection to its database identity. It verifies that the teacher is assigned to the selected scope, the exam is open for entry, the section and enrollments are eligible, and the configured assessment components belong to the exam subject.

The roster is generated from eligible enrollments in that context. Roll number is displayed as a useful human reference, but is not the official mark identity; the system resolves each row to the enrollment and component IDs. Context inferred from an uploaded document is only a suggestion. A mismatch with the selected context blocks processing until corrected.

## Entry mode A: manual

1. The user chooses **Enter manually** and opens the eligible student roster for the selected context.
2. Marks are entered in a keyboard-friendly grid. The grid supports configured components, tab/enter navigation, paste where allowed, and clear distinction between zero and statuses such as absent, exempt, missing, or not submitted.
3. Inline validation identifies invalid ranges, missing required values, duplicate or ineligible students, and inconsistent totals. Invalid records cannot be submitted.
4. The user saves a resumable draft. Saving a draft does not publish results or bypass the configured verification/approval lifecycle.
5. The teacher/operator verifies the completed grid and submits it. A different authorized approver checks the summary and exceptions before the marks engine commits it.
6. The system records the actor, context, values, changes, lifecycle transition, and approval decision in the audit history.

Manual entry must not require OCR, an AI provider, or an uploaded document.

## Entry mode B: AI-assisted document entry

1. The user chooses **Upload marksheet** from the same context and submits a supported image, PDF, CSV, or XLSX file through the private upload flow. File validation, quarantine, processing, and access control follow M2.1/M2.2.
2. The worker extracts a table and preserves source provenance, such as page, row, column, and cell coordinates. The extraction service returns suggestions only.
3. SchoolOS normalizes values, maps configured components, matches roll numbers within the selected enrollment context, and validates records under M2.4–M2.6. Names alone are not sufficient for automatic identity confirmation.
4. The user sees an import summary and review grid containing every extracted row. Each row shows its proposed student, roll number, component values/statuses, confidence, validation state, and source evidence. Rows needing attention are highlighted first; all other rows remain inspectable.
5. The teacher/operator verifies the extracted rows before submission. Clear, non-conflicting rows may be confirmed as an explicitly scoped batch after the affected records and values are shown. Low-confidence values, ambiguous matches, validation errors, and conflicts require individual review or correction. Corrections trigger revalidation and retain the original extraction.
6. A different human with `marks.import.approve` confirms the verified submission. The server rechecks context, permissions, unresolved blocking issues, rule version, and mark concurrency before committing through M2.8.
7. SchoolOS records the source file, extraction/processor version, original and corrected values, reviewer, approver where applicable, and final mark provenance. A failed or rejected import leaves official marks unchanged.

If processing fails or a format is unsupported, explain the failure and offer manual entry for the same academic context. Never silently substitute guessed values or treat an AI confidence score as approval.

## Shared rules and boundaries

- Both routes write to the existing marks/result domain; neither creates a parallel official marks store.
- The AI route stages extracted records separately. Only the authorized marks-service command can mutate official marks.
- Manual and AI-assisted entries use the same component definitions, status semantics, mark-range checks, exam lifecycle, enrollment eligibility, audit policy, and result calculations.
- Existing marks are never silently overwritten. Differing values create a conflict and follow the explicit update/correction policy in M2.8.
- Repeated submissions are idempotent. Stale edits or changed marks return a conflict for re-review rather than overwriting newer work.
- The submitter cannot approve their own manual or AI-assisted marks submission. Approval is not result publication; results and marksheets continue through their existing approval, publication, and document workflows.
- Do not log raw uploaded documents or unnecessary student data.

## User-facing status flow

```text
Manual:
DRAFT -> SUBMITTED -> APPROVED (if required) -> COMMITTED
   └──────────────> NEEDS_CORRECTION -> DRAFT

AI-assisted:
UPLOADED -> PROCESSING -> REVIEW_REQUIRED -> VERIFIED -> APPROVED -> COMMITTED
                  └────> FAILED       └────> REJECTED
```

`APPROVED` and `COMMITTED` are distinct: approval authorizes a server-side commit; only a successful marks-service transaction makes records official. Exact persisted state names remain subject to reconciliation with the M2 lifecycle and schema.

## Minimum experience

The marks task landing page should make both choices equally clear:

```text
Choose entry method
[ Enter marks manually ]   [ Upload marksheet ]
```

Both choices first establish the same academic context. The manual grid prioritizes keyboard entry and fast correction. The upload review page prioritizes exception handling while keeping every extracted value visible and verifiable. Each mode shows progress, saves recoverable drafts, and explains what remains before submission.

## Acceptance criteria

- Users can complete marks entry without AI or file upload.
- Users can upload a supported marksheet and see extracted values before any official mutation.
- Both modes enforce the same server-side school, assignment, exam, enrollment, component, and lifecycle rules.
- Every AI-proposed row is visible to a human verifier; batch confirmation is explicit and scoped to the values displayed.
- Low-confidence, ambiguous, invalid, or conflicting records cannot pass as clean records through a bulk action.
- Manual corrections to an AI draft trigger revalidation and preserve the original value and provenance.
- Failed processing, rejected review, stale writes, and failed commits do not silently alter official marks.
- Approved marks pass through the central marks service with idempotency, audit, and conflict handling.
- Test coverage includes mode parity for validation, tenant/assignment authorization, exam locks, status-vs-zero handling, duplicate submissions, conflicts, and provider failure.

## Related specifications

- [M2.1 AI/OCR document processing](m2-1-ai-ocr-processing.md)
- [M2.6 confidence and validation](m2-6-confidence-validation.md)
- [M2.7 human review interface](m2-7-human-review-interface.md)
- [M2.8 automatic marks import](m2-8-automatic-marks-import.md)
- [Requirements register](../requirements/requirements-register.md)
