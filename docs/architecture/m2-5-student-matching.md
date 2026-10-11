# M2.5 Student Matching Engine Architecture

## Status

**Architecture complete; implementation pending.** M2.5 maps normalized extraction records to existing students and enrollment history. It never creates students automatically and never writes official marks.

## Goal

```text
Extracted row
  -> resolve academic context
  -> generate tenant-scoped candidates
  -> deterministic identifier matching
  -> name/similarity evidence
  -> conflict detection
  -> explainable score
  -> auto-match | review required | unmatched
```

A match is a proposal until the import workflow and permissions authorize it.

## Non-negotiable rules

1. Never search outside the authenticated school tenant.
2. Never use name alone for automatic identity assignment.
3. Never let a weak match override a conflicting admission number, student ID, or enrollment context.
4. Never create a student automatically during marks import.
5. Preserve all candidates, evidence, conflicts, scores, and manual overrides.
6. Match against historical `Enrollment` records for the requested academic year, not only current student status/class.
7. Dropped or transferred students may still match; whether their marks are importable is a later validation decision.

## Context resolution

Matching should receive the upload context when available:

```text
schoolId          authenticated context
academicYearId    required for roll-scoped matching
classId           optional or detected candidate
sectionId         optional or detected candidate
examId            import context
subjectId         import context
```

Document-level class, section, or academic-year suggestions are hints. Explicit teacher-selected context and school configuration take precedence, with conflicts surfaced for review.

## Candidate hierarchy

Generate candidates in this order, stopping only when the evidence is unambiguous:

1. Exact school-scoped admission number
2. Exact school-scoped academic/student ID
3. Exact roll number within academic year, class, and section
4. Exact roll number within academic year and class
5. Exact normalized name within the scoped enrollment set
6. Token and initial similarity within the scoped set
7. Transliteration-assisted similarity for supported languages
8. Manual review or unmatched

Admission number and academic ID use the existing unique student constraints. Roll matching uses `Enrollment`, because roll numbers are academic-context-specific.

## Candidate generation

Do not compare every extracted row with every student. Narrow the query first:

```text
school
  -> academic year
  -> class
  -> section
  -> exact identifiers / roll
  -> name index or bounded candidate set
```

For historical imports, include enrollments whose academic-year/class/section context matches even when the student is now graduated, transferred, dropped, or in another class. Exclude deleted records.

The implementation should use indexed equality lookups for identifiers and enrollment context. Fuzzy similarity runs only on a small unresolved candidate set.

## Identity normalization

Keep the source value and a separate matching representation:

```text
raw:        "Ram  K. Sharma"
normalized: "ram k sharma"
```

Conservative normalization may include trimming, Unicode normalization, case folding, repeated-space collapse, and basic punctuation handling. Configurable name ordering supports `given family` and `family given` formats.

Initials and token subsets can produce evidence, not certainty:

```text
Ram K. Sharma <-> Ram Kumar Sharma
```

Nepali/Devanagari values remain intact. Transliteration is an additional candidate signal and must retain the transliterator/version and confidence; it cannot guarantee identity.

## Evidence model

A matching result must be explainable:

```ts
{
  decision: "AUTO_MATCH" | "REVIEW_REQUIRED" | "UNMATCHED",
  studentId?: string,
  enrollmentId?: string,
  confidence: number,
  candidates: [{
    studentId: string,
    enrollmentId?: string,
    score: number,
    evidence: [
      { method: string, strength: number, detail: string }
    ],
    conflicts: string[],
  }],
  conflicts: string[],
  algorithmVersion: string,
}
```

Suggested evidence methods include `ADMISSION_EXACT`, `ACADEMIC_ID_EXACT`, `ROLL_EXACT`, `CLASS_EXACT`, `SECTION_EXACT`, `NAME_EXACT`, `NAME_TOKEN_SIMILARITY`, `INITIAL_MATCH`, `TRANSLITERATION_SIMILARITY`, and `CONTEXT_CONFLICT`.

Store evidence against the import record or matching run so reviewers can see why a candidate was proposed.

## Conflicts

Conflicts always block automatic matching:

- admission number resolves to one student but name resolves strongly to another
- roll resolves to a different student than an exact admission number
- selected class/section conflicts with the matched enrollment
- multiple candidates share the same strongest score
- extracted identity fields disagree with each other
- historical enrollment is missing for the requested academic context

Example:

```text
ADM-00125 -> Ram Sharma
Roll 17   -> Ram Sharma
Name      -> Sita Rai
Decision  -> REVIEW_REQUIRED / IDENTITY_CONFLICT
```

The engine must not silently choose the strongest-looking field and discard the conflict.

## Decision policy

Thresholds are configurable and must be evaluated with score margin and conflicts, not score alone:

```text
AUTO_MATCH
  exact strong identifier, correct tenant/context, no conflict,
  and sufficient candidate margin

REVIEW_REQUIRED
  plausible candidate but weak evidence, close candidates,
  missing context, or any conflict

UNMATCHED
  no candidate, invalid context, or insufficient evidence
```

Example scores such as admission `1.00`, roll-plus-context `0.95`, exact name `0.90`, and fuzzy similarity `0.70-0.90` are starting policy examples only. Thresholds must be calibrated with labeled school data in M2.11.

High confidence is not proof of correctness. Automatic matching should remain limited to deterministic, non-conflicting cases.

## Duplicate and ambiguity handling

If two students have the same name or the same roll in different sections, return all viable candidates and `REVIEW_REQUIRED`. Candidate ordering must be deterministic. Never select randomly or by database insertion order.

A candidate match does not alter student status, enrollment, class, section, roll number, or name. Those are separate authorized workflows.

## Manual override

Reviewers can select a different existing student or mark the row unmatched. A manual override records:

```text
importSessionId
importRecordId
previousDecision
selectedStudentId
selectedEnrollmentId
reviewerId
reason
createdAt
```

Creating a new student from an unmatched row, if ever supported, is a separate permission-controlled student-admission workflow and is not part of marks import.

## Historical and lifecycle behavior

A currently transferred or dropped student can still be matched to an older enrollment. The matching result reports both current student status and matched enrollment status. M2.6 decides whether the exam/year permits importing the record.

Roll changes do not invalidate admission or academic ID matches. Historical imports must use the enrollment belonging to the document's academic year rather than the latest roll.

## Performance and indexing

Required lookup patterns are supported by the current school-scoped student and enrollment indexes. Implementation should add or verify composite indexes based on query plans for:

```text
schoolId + admissionNo
schoolId + academicId
schoolId + academicYearId + classId + sectionId + rollNumber
schoolId + academicYearId + classId + sectionId + studentId
```

Fuzzy matching must be bounded by context and candidate limits. Do not run an expensive similarity algorithm over 100,000 students for every row.

## Audit and privacy

Do not log full source documents or unnecessary personal data. Matching audit records should contain identifiers, methods, scores, conflicts, algorithm version, reviewer decisions, and timestamps. Access to matching evidence is tenant- and permission-scoped.

## Boundary responsibilities

```text
M2.4 extraction
  -> normalized identity fields and provenance

M2.5 matching
  -> candidate students/enrollments and explainable decisions

M2.6 validation
  -> mark ranges, exam context, enrollment eligibility, totals, duplicates

M2.7 review
  -> human correction and approval interaction

M2.8 import
  -> central marks service only
```

M2.5 does not validate marks, calculate results, alter student records, or persist official marks.

## Acceptance criteria

- Admission and academic IDs are exact, school-scoped first-class matches.
- Roll numbers are scoped by historical enrollment context.
- Candidate search is bounded and index-aware.
- Names support conservative normalization, initials, tokens, and configurable order.
- Nepali and transliteration evidence is explicit and non-authoritative.
- Multiple candidates produce ambiguity rather than a random selection.
- Strong identifier conflicts are visible and block auto-match.
- Decisions are `AUTO_MATCH`, `REVIEW_REQUIRED`, or `UNMATCHED`.
- No automatic student creation occurs.
- Manual overrides and matching evidence are auditable.
- Dropped, transferred, and historical students remain matchable where enrollment context supports it.
- Thresholds and algorithm versions are configurable and testable.

## Next part

M2.6 should combine extraction, matching, school configuration, mark ranges, totals, duplicates, and lifecycle rules into an authoritative confidence and validation decision before human review.
