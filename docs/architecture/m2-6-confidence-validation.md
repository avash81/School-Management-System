# M2.6 Confidence and Validation Engine Architecture

## Status

**Architecture complete; implementation pending.** M2.6 is the safety boundary between extracted/matched import data and official marks. It produces decisions and issues; it does not write marks or calculate final results.

## Goal

```text
extraction + matching evidence
  -> structural validation
  -> context validation
  -> identity validation
  -> academic mark validation
  -> mathematical checks
  -> duplicate checks
  -> confidence policy
  -> AUTO_IMPORT | REVIEW_REQUIRED | REJECTED
```

AI confidence is evidence, not school confirmation. A high-confidence extraction cannot bypass a failed business rule or a required human review.

## Validation levels

1. Document: type, quality, supported format, processor state, page/table presence.
2. Table: required headers, mapping conflicts, row shape, repeated headers, table confidence.
3. Row: student-row classification, required identity fields, duplicate row detection.
4. Identity: matching decision, candidate margin, conflicts, tenant and enrollment context.
5. Mark: numeric format, decimal policy, minimum, maximum, special status, component mapping.
6. Subject: exam subject, assessment component, configured maximums, required components.
7. Mathematical: totals, fractions, percentages, configured rounding and precision.
8. Import: duplicate student matches, duplicate marks, lifecycle, permissions, rule version.

## Issue contract

Every finding is structured and explainable:

```ts
{
  status: "passed" | "failed" | "warning",
  severity: "info" | "warning" | "error" | "critical",
  code: string,
  message: string,
  field?: string,
  importRecordId?: string,
  sourceLocation?: {
    page?: number,
    row?: number,
    column?: number,
    boundingBoxes?: Array<{ x: number, y: number, width: number, height: number }>
  },
  metadata?: Record<string, unknown>,
  resolved: boolean
}
```

Stable codes drive UI, analytics, and tests. User-facing messages must not expose stack traces or provider secrets.

## Severity and blocking

- `info`: record context; never blocks.
- `warning`: requires attention but may be allowed if no critical field is affected.
- `error`: blocks automatic import and requires correction or explicit review resolution.
- `critical`: identity, tenant, permission, or official-data safety failure; blocks import until resolved through an authorized workflow.

A row with any unresolved error/critical issue cannot become `AUTO_IMPORT`. A rejected record cannot be approved by simply ignoring the issue.

## Rule engine and versioning

Rules are supplied by the school, academic year, exam subject, assessment blueprint, and component configuration. They must be versioned or snapshotted for the import:

```text
ValidationRuleSet
  schoolId
  academicYearId
  examId / examSubjectId
  version
  precision
  roundingMode
  componentRules
  confidencePolicy
```

Historical imports use the rules applicable to their academic context. Changing current configuration must not change the meaning of a previously reviewed import.

## Structural validation

Check:

- supported document and processing method
- table exists and has a usable mapping
- required identity/mark columns are present
- unknown or conflicting components
- malformed row shape
- row/table confidence thresholds
- page/table assembly warnings
- required provenance for reviewable fields

Structural uncertainty produces review or rejection according to configured policy; it does not get silently repaired.

## Context validation

Compare selected context with document suggestions and extraction metadata:

- academic year
- class
- section
- exam
- subject
- assessment component

Conflicts produce explicit codes such as `ACADEMIC_YEAR_CONTEXT_CONFLICT`, `CLASS_CONTEXT_CONFLICT`, `EXAM_CONTEXT_CONFLICT`, and `SUBJECT_CONTEXT_CONFLICT`. User-selected context does not erase the evidence; an authorized reviewer must resolve the conflict.

## Identity validation

Consume M2.5's match result. Require:

- tenant-scoped candidate
- valid `AUTO_MATCH` or explicit reviewer selection
- no unresolved strong-identifier conflict
- enrollment context compatible with the selected academic year/class/section
- no ambiguous candidate set

Examples:

```text
IDENTITY_CONFLICT
MATCH_REVIEW_REQUIRED
UNMATCHED_STUDENT
ENROLLMENT_CONTEXT_MISSING
```

A transferred or dropped student may match historically, but eligibility for mark import is a separate business rule. No student status or identity is altered by validation.

## Mark validation

For each configured component:

- preserve raw and normalized values
- enforce numeric format and decimal policy
- enforce minimum and maximum marks
- reject negative values unless explicitly configured
- distinguish zero, missing, absent, exempt, withheld, and ambiguous
- verify component belongs to the selected exam subject
- flag duplicate component values

Examples:

```text
MARK_EXCEEDS_MAXIMUM
MARK_BELOW_MINIMUM
DECIMAL_NOT_ALLOWED
INVALID_NUMERIC_FORMAT
MISSING_REQUIRED_MARK
AMBIGUOUS_MARK_STATUS
```

`ABSENT` remains null numeric value plus attendance/status evidence. It is never converted to zero by validation.

## Mathematical validation

Use exact decimal arithmetic and configured precision/rounding, not binary floating-point comparisons. Keep both values when comparing derived and document totals:

```text
calculatedTotal = 89
documentTotal = 95
issue = TOTAL_MISMATCH
```

A missing total may be derived only when the rule set permits it. Validation never silently replaces a source total. Percentage and fraction conversions require mapped column semantics and maximum-mark context.

The central result engine remains responsible for final grade, GPA, rank, and pass/fail calculation.

## Cross-record validation

Across the import session, detect:

- duplicate roll numbers in the same enrollment context
- duplicate student matches
- duplicate exam/subject/component marks
- conflicting records for one student/component
- suspicious roll sequence gaps as warnings
- inconsistent component totals
- repeated source rows across pages

A gap is not automatically an error; duplicate official targets are blocking unless explicitly allowed by context.

## Confidence policy

Keep confidence at document, table, row, match, identity-field, and mark-field levels. Do not average away a low-confidence critical field.

Use configurable field risk:

```text
identity, exam, subject, academic year, and marks -> strict
headers and table structure                  -> moderate
optional display metadata                    -> lower
```

A decision considers confidence, evidence, issue severity, and candidate margin:

```text
AUTO_IMPORT
  deterministic identity, valid context, all critical fields pass,
  no unresolved errors/critical issues, confidence policy satisfied

REVIEW_REQUIRED
  plausible data with warnings, medium confidence, corrections,
  conflicts, or any configured review condition

REJECTED
  unsupported/unsafe input, impossible marks, missing critical identity,
  tenant/permission failure, or unrecoverable structural error
```

Threshold values are policy examples until calibrated with labeled data in M2.11.

## Correction and resolution history

Review resolution must preserve:

```text
original raw value
normalized value
corrected value
issue code
reason
reviewerId
resolvedAt
source provenance
```

Resolving an issue changes the proposed import record, not the original extraction artifact. Every correction is auditable and can be compared before approval.

## Persistence concept

Validation findings should be separate from official marks:

```text
ValidationIssue
  id
  schoolId
  importSessionId
  importRecordId
  field
  code
  severity
  message
  metadata
  resolved
  resolvedBy
  resolvedAt
```

A validation run should have a rule-set version, engine version, and timestamp. Re-running validation should be deterministic for the same artifacts and configuration.

## Boundary responsibilities

```text
M2.4 extraction
  -> normalized values and provenance

M2.5 matching
  -> candidates, evidence, identity decision

M2.6 validation
  -> authoritative issues, confidence policy, import decision

M2.7 review
  -> human corrections and issue resolution

M2.8 import
  -> central marks service and official lifecycle
```

M2.6 does not create students, alter enrollment, write marks, publish results, or calculate final pass/fail.

## Acceptance criteria

- Structural, context, identity, mark, subject, mathematical, cross-record, and import validation are defined.
- Findings have stable codes, severity, field, source, metadata, and resolution state.
- School and academic rules are versioned for reproducibility.
- Decimal precision and rounding are explicit.
- Missing, zero, absent, exempt, withheld, and ambiguous values remain distinct.
- Totals are checked without silent correction.
- Critical fields use stricter policy than optional metadata.
- Match evidence and conflicts affect decisions.
- Decisions are `AUTO_IMPORT`, `REVIEW_REQUIRED`, or `REJECTED`.
- Corrections preserve original values and audit history.
- Official marks and result calculations remain outside the validation engine.

## Next part

M2.7 should define the human review interface: side-by-side source preview, row/field issues, corrections, evidence, keyboard workflow, bulk resolution, and permission-controlled approval.
