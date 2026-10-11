# M2.4 Student and Marks Extraction Architecture

## Status

**Architecture complete; implementation pending.** M2.4 converts the intermediate table from M2.3 into normalized extraction records. It does not identify the database student, validate final business rules, display review UI, or write official marks.

## Goal

```text
Detected table
  -> header mapping
  -> row classification
  -> field normalization
  -> component extraction
  -> status and total analysis
  -> confidence and provenance
  -> extraction records
  -> M2.5 student matching
```

The output is reviewable application data, not official academic data.

## School configuration precedence

Configured school format profiles have priority over generic header inference and model suggestions:

```text
School configuration
  -> selected format profile
  -> detected headers
  -> generic aliases / model suggestion
  -> conflict warning
```

AI may suggest a mapping but cannot override a configured component, maximum, data type, or column meaning without explicit user approval.

## Header normalization

Normalize labels into semantic fields, never fixed column positions:

| Source labels                                  | Canonical field                      |
| ---------------------------------------------- | ------------------------------------ |
| `Roll`, `Roll No.`, `R.No`                     | `rollNumber`                         |
| `Name`, `Student`, `Student Name`, `Full Name` | `studentName`                        |
| `Adm No`, `Admission Number`                   | `admissionNumber`                    |
| `Written`, `Written Exam`, `Theory`            | configured theory component          |
| `Practical`, `Lab`, `Practical Exam`           | configured practical component       |
| `Internal`, `IA`, `Internal Assessment`        | configured internal component        |
| `Total`, `Obtained`                            | `total` or configured obtained field |
| `Grade`, `Letter Grade`                        | `grade`                              |

Preserve the original header, normalized label, mapping source, and mapping confidence. Unknown or conflicting headers become warnings requiring mapping review.

## Canonical extraction record

```ts
type ExtractedStudentRow = {
  sourceRow: number;
  rowType: 'student' | 'header' | 'subtotal' | 'total' | 'footer' | 'unknown';
  studentName?: FieldValue<string>;
  rollNumber?: FieldValue<string>;
  admissionNumber?: FieldValue<string>;
  studentCode?: FieldValue<string>;
  class?: FieldValue<string>;
  section?: FieldValue<string>;
  components: ExtractedComponent[];
  total?: ExtractedNumeric;
  percentage?: ExtractedNumeric;
  grade?: FieldValue<string>;
  extractedStatus?: ExtractedStatus;
  confidence: number;
  provenance: Provenance;
};

type FieldValue<T> = {
  rawValue: string;
  normalizedValue: T;
  confidence?: number;
  provenance: Provenance;
};

type ExtractedNumeric = FieldValue<number> & {
  maximumMarks?: number;
  numerator?: number;
  denominator?: number;
};

type ExtractedComponent = {
  code: string;
  label: string;
  value?: ExtractedNumeric;
  rawValue?: string;
  status: 'valid' | 'absent' | 'missing' | 'withheld' | 'exempt' | 'ambiguous' | 'invalid';
  confidence?: number;
  provenance: Provenance;
};

type Provenance = {
  page?: number;
  tableIndex?: number;
  row?: number;
  column?: number;
  boundingBoxes?: Array<{ x: number; y: number; width: number; height: number }>;
};
```

The exact persistence model can evolve, but raw source values and provenance must remain available for review and audit.

## Row classification

Not every detected row is a student. Classify rows using combined signals:

- roll/admission identifier presence
- name-like text
- expected component count
- header vocabulary
- subtotal/average/total keywords
- position within the table
- school format profile

A row containing a valid roll and name with blank marks remains a student row with missing values. Empty rows are ignored. Subtotal, total, footer, signature, and repeated-header rows are excluded from student extraction but retained as provenance.

## Student fields and names

Preserve the raw document value and create a conservative matching representation:

```text
rawName:        "RAM  K. SHARMA"
normalizedName: "ram k sharma"
```

Allowed normalization includes trimming, Unicode normalization, repeated-space collapse, case folding, and conservative punctuation handling. Do not change the official student record. Nepali/Devanagari text remains intact; transliteration is a matching-stage concern and must carry explicit confidence.

M2.4 extracts identifiers but does not decide which database student they represent. That is M2.5.

## Numeric values

Support configured numeric forms:

```text
"87"     -> obtained = 87
"87.5"   -> obtained = 87.5
"87/100" -> obtained = 87, maximum = 100
"87%"    -> percentage or marks according to the mapped column
```

Never assume a percentage is a mark without context. A fraction preserves both numerator and denominator. Decimal acceptance and range checks are recorded as extraction warnings here and enforced by M2.6/marks validation later.

Do not silently repair OCR values such as `387` into `87`. Preserve the raw value and flag it as suspicious or invalid.

## Grade and status values

Some documents contain grades instead of marks. Represent them as `valueType = grade`; do not force `A+` or `NG` into numeric values.

Normalize configured special values without losing raw text:

| Raw values            | Candidate status                           |
| --------------------- | ------------------------------------------ |
| `AB`, `ABS`, `Absent` | `absent`                                   |
| `Withheld`            | `withheld`                                 |
| `Exempt`, `EX`        | `exempt`                                   |
| `-`, `N/A`, `NA`      | `ambiguous` unless profile defines meaning |
| blank                 | `missing`                                  |
| explicit `0`          | numeric zero, `valid`                      |

Absent is represented as a null numeric value plus status, never as zero. Ambiguous values require later review.

## Configurable components

Components come from the school/exam configuration rather than hard-coded columns:

```text
code
name
type
maximumMarks
required
order
allowDecimal
```

Examples include theory, practical, internal, project, viva, assignment, and attendance. The extractor maps columns to configured components and reports unknown or duplicate component mappings.

## Totals and percentages

If configured as derivable, calculate a candidate total from valid component values. Preserve both the document total and calculated total:

```text
component sum = 89
document total = 95
issue = TOTAL_MISMATCH
```

Never replace a document total silently. If the profile says totals are derived, a missing total may receive a calculated candidate with provenance indicating it was derived. Percentage extraction follows the same rule and remains a candidate until business validation.

Missing is distinct from zero:

```text
blank -> value: null, status: missing
0     -> value: 0, status: valid
```

## Duplicate and consistency signals

Within the assembled document, flag duplicate student rows using available identifiers and context. Duplicates across pages are included in the same detection scope. M2.4 reports `DUPLICATE_STUDENT_ROW`; it does not choose which record wins.

Other extraction issues include:

- `HEADER_MAPPING_REQUIRED`
- `UNKNOWN_COMPONENT`
- `INVALID_NUMERIC_FORMAT`
- `AMBIGUOUS_STATUS`
- `MISSING_REQUIRED_FIELD`
- `TOTAL_MISMATCH`
- `DUPLICATE_STUDENT_ROW`
- `NON_STUDENT_ROW`
- `SUSPICIOUS_VALUE`

These are extraction issues, not permission to mutate official data.

## Confidence and provenance

Track confidence at document, table, row, identity-field, component-field, and total levels. Overall row confidence must not hide a low-confidence theory or practical field. Preserve source page, row, column, and bounding boxes for every extracted value where available.

Confidence is evidence, not correctness. M2.5 uses it for matching candidates; M2.6 combines it with business validation; M2.7 presents it to a human reviewer.

## Boundary responsibilities

```text
M2.3 OCR/table detection
  -> gives cells, coordinates, table and header candidates

M2.4 extraction
  -> gives normalized fields, components, statuses, totals, confidence

M2.5 matching
  -> chooses or proposes an existing database student

M2.6 validation
  -> applies authoritative mark/configuration rules

M2.7 review
  -> human correction and approval UI

M2.8 import
  -> writes through the central marks service
```

M2.4 must not write `marks`, alter student identity/status, calculate final results, publish results, or generate marksheets.

## Acceptance criteria

- Header aliases and school format precedence are defined.
- A canonical extraction schema preserves raw values and provenance.
- Student rows are separated from headers, totals, subtotals, and empty rows.
- Names and identifiers receive conservative normalization without changing official records.
- Numeric, decimal, percentage, fraction, grade, absent, missing, zero, and special values are represented safely.
- Configurable components and maximum-mark metadata are supported.
- Document totals can be compared with derived totals without silent correction.
- Duplicate rows and extraction inconsistencies are flagged.
- Confidence is available at field/component level.
- The handoff to matching, validation, review, and official marks remains explicit.

## Next part

M2.5 should define candidate generation, exact and fuzzy matching, duplicate-name handling, enrollment context, unmatched records, and the threshold for automatic suggestion versus mandatory review.
