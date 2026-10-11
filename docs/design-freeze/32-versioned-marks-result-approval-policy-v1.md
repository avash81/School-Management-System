# CR-04 — Versioned Marks, Result and Approval Policy v1.0

**Status:** REMEDIATION DRAFT — owner review and approval pending. This proposes a mathematical contract for versioned `result_policies`, `grade_bands`, assessment blueprints and approval policies in CR-01A. It is not an approved school policy or implementation authorization. The examples below are test fixtures only; they are not defaults. A school must select an owner-approved, released policy before an exam enters marks entry.

## 0. Owner direction recorded — 2026-10-09

- **Independent approval:** the person who enters or imports a marks submission must not approve that same submission. Approval requires a different authorized person. The approver's eligible role and scope are governed by the permission matrix; this decision does not require the approver to be a management user in every case.
- **Approval of corrections:** the requester must not approve their own correction request. A different authorized person must approve it before the new mark revision becomes official.
- **Result approval/publication:** the user who calculates or submits a result snapshot cannot approve or publish that same snapshot. A different authorized person must perform approval/publication. Their role and tenant/academic scope are permission-controlled.
- **ABSENT:** retain `ABSENT` as a distinct stored status. An owner-approved, versioned school policy explicitly determines whether an absent result blocks publication or contributes a fail/zero outcome. Never silently rewrite the status to `PRESENT` with numeric zero.
- **NOT_SUBMITTED:** default to `INCOMPLETE`, blocking result approval/publication. A school may treat it as zero only through an explicit, versioned, owner-approved policy; the stored status remains distinct and the conversion is auditable.
- **Calculation modes:** the MVP should support both raw component-total and normalized weighted-component calculations. The selected mode and its configuration must be explicit and versioned in the school/exam policy; implementations must not mix the two denominators implicitly.
- **Optional subjects:** a versioned school result policy explicitly configures how optional subjects affect overall percentage, GPA, and ranking, including exclusion, inclusion, or replacement where applicable. Optional subjects never silently clear a failure in a required subject.
- **School-level flexibility and authorization:** where a behavior is school-configurable, expose it as an explicit, versioned policy choice rather than a code fork. Only authenticated users with the specific school-scoped configuration/release permission may create, change, approve, or release that policy. Students and parents cannot configure school academic/result policies; their access is limited to authorized own/linked information. Backend authorization is mandatory.
- **Grace:** the MVP should support policy-configured grace marks, disabled by default. If enabled, the released policy must define strict eligibility and aggregate/per-subject caps; every application requires authorized approval and audit evidence. Grace must not rewrite the entered mark.
- **Component-minimum grace:** each released school policy explicitly configures whether grace may repair individual component minimums. This capability is disabled unless explicitly enabled in that versioned policy; any use is bounded, separately recorded, approved, and audited.
- **Rounding and display precision:** the rounding method and display precision are configurable per versioned school result policy; the released policy records the method and the stages at which rounding is applied.
- **Status:** this is the project owner's direction captured during remediation. Product/school-domain owner review and cross-artifact reconciliation are still required before CR-04 is closed or this draft is released.

## 1. Fixed definitions

| Term                         | Definition                                                                                                                                      |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Raw mark                     | `numeric(10,4)` entered against one assessment component revision. It is never rounded destructively on entry.                                  |
| Component maximum/pass       | Immutable values in the blueprint version referenced by the exam subject.                                                                       |
| Attendance/submission status | `PRESENT`, `ABSENT`, `MISSING`, `EXEMPT`, `NOT_SUBMITTED`, `WITHHELD`, `CHEATING`, or `INCOMPLETE`; status is not inferred from a numeric zero. |
| Subject result               | One result-subject snapshot computed from all components of an exam subject for an enrollment.                                                  |
| Overall result               | One result snapshot computed from the applicable subject results for an exam/enrollment.                                                        |
| Policy release               | Immutable released configuration containing rounding, absence, optional-subject, component/subject pass and grade/GPA rules.                    |
| Official input               | Only the latest approved mark revision for every required component, selected in a repeatable transaction and fingerprinted.                    |

## 2. Calculation pipeline (mandatory order)

```text
lock calculation input set
  → validate exam/result-policy/blueprint release
  → load latest APPROVED mark revisions
  → component eligibility and status resolution
  → component score/weight calculation
  → component-pass determination
  → subject total and component-minimum determination
  → apply eligible grace adjustment if explicitly enabled
  → subject-pass determination
  → subject percentage → subject grade/GPA
  → optional-subject treatment
  → overall numerator/denominator
  → overall percentage → overall grade/GPA/pass
  → rank eligible published results only
  → write immutable result + subject snapshots with input fingerprint
```

No stage may read a formatted UI value. Intermediate arithmetic is `numeric(10,4)`; policy defines display precision. If any required input is missing or illegal, calculation produces `INCOMPLETE`, not a provisional pass/fail value.

## 3. Status resolution and validation

| Status | Numeric mark allowed? | Subject consequence by default | Notes |
| --- | --- | --- |
| PRESENT | Required | contributes raw/weighted score | `0` is a valid present score. |
| ABSENT | No | Per explicit versioned school policy: block publication, or produce the configured fail/zero outcome while retaining `ABSENT` | Never rewrite to `PRESENT` or store a numeric mark as if one was entered; policy-based outcome and reason are auditable. |
| MISSING | No | subject/overall `INCOMPLETE`; blocks approval/publication | data problem, not academic outcome. |
| EXEMPT | No | omitted from denominator only if policy/blueprint permits | exemption reason required. |
| NOT_SUBMITTED | No | `INCOMPLETE`; blocks approval/publication by default | A school may explicitly configure a versioned zero-treatment rule; preserve the stored status, reason, policy version, and audit trail. |
| WITHHELD | No | result `WITHHELD`; not publishable | authorization/discipline reason required. |
| CHEATING | No | subject `FAIL` with policy-defined score/grade; review required | cannot be auto-approved. |
| INCOMPLETE | No | `INCOMPLETE`; blocks publication | review/rectification required. |

For `PRESENT`, enforce `0 <= mark_value <= component.max_marks`. Decimal entry is allowed only where the blueprint `allow_decimal` flag is true. For all non-present statuses, `mark_value` is null; a conversion requires a revision and audit.

## 4. Exact formulas

Let a subject have applicable components `C`. For a component `c`, raw value `r(c)`, maximum `m(c)`, configured weight `w(c)`, and pass threshold `p(c)`. The released policy must select exactly one calculation mode for the subject:

| Mode                             | Score and denominator                                                                                           | Percentage                                            |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `RAW_COMPONENT_TOTAL`            | `subject_raw_total = Σ r(c)`; `subject_maximum = Σ m(c)` for applicable components.                             | `100 × subject_raw_total / subject_maximum`           |
| `NORMALIZED_WEIGHTED_COMPONENTS` | `subject_weighted = Σ ((r(c) / m(c)) × w(c))`; `subject_weight_denominator = Σ w(c)` for applicable components. | `100 × subject_weighted / subject_weight_denominator` |

An exempt component is included or excluded, and its weight re-normalized or not, only as explicitly declared by the released policy. The calculation mode, component weights/maxima, applicable component set, score basis, denominator, and policy version are persisted with the result snapshot. A component passes where `r(c) >= p(c)` if that component has an individual pass threshold. Grace may be applied only if enabled by the released policy and all configured eligibility and cap conditions pass. Whether it can satisfy only the subject-level threshold or also an individual component minimum is an explicit policy setting; component-minimum repair is disabled unless explicitly enabled. Store any grace adjustment separately from the original mark and retain actor, reason, approver, policy version, and audit event. A subject passes only when all required component-pass checks pass after any permitted adjustment **and** the unrounded policy-adjusted subject score meets the configured subject pass rule. Grace is disabled unless explicitly enabled.

Overall values are computed over applicable, non-exempt required subjects using the overall score basis and denominator explicitly selected by the released policy; raw and weighted subject scores must not be implicitly combined. Each released policy explicitly declares how optional subjects affect overall percentage, GPA, and ranking (for example, exclusion, inclusion, or replacement where supported). Optional subjects never silently clear a required-subject failure. Optional treatment, eligibility, and any replacement rule are versioned and captured in the result snapshot (Section 6):

```text
overall_raw_percentage = 100 × Σ subject_raw_total / Σ subject_maximum
overall_weighted_percentage = 100 × Σ subject_weighted_score / Σ subject_weight_denominator
overall_gpa = weighted mean of eligible subject GPA values using subject credit
```

The released policy selects one compatible overall percentage basis; it must not mix raw and weighted scores or denominators. `overall_gpa` is not the arithmetic average of rounded displayed GPA values. Grade-band lookup uses the unrounded policy-specified score. Inclusive/exclusive boundary rule is: a band satisfies `min_percentage <= score < max_percentage`, except the final band includes its maximum. Band gaps/overlap prevent a policy release.

## 5. Rounding and precision

1. Store entered and calculated raw values at four decimals.
2. Do **not** round component values before summing.
3. Apply a policy’s `HALF_UP`, `HALF_EVEN`, `FLOOR`, or `CEILING` rule to display-only subject total/percentage/GPA after calculation.
4. Grade lookup uses unrounded percentage unless `grade_lookup_precision` is set in the released policy; where set, it rounds once immediately before lookup using the same named rounding rule.
5. Overall total/percentage/GPA is calculated from raw subject totals, not rounded subject displays; it is then rounded once for display.
6. A test must cover every grade boundary at `boundary - 0.0001`, `boundary`, and `boundary + 0.0001`.

## 6. Candidate reference policy fixtures — not released

These candidate configurations provide deterministic examples for review and future tests. They are not released policies, approved defaults, or evidence of an adopted Nepal-wide grading standard. Product and school-domain owners must approve the policy schema, semantics, examples, and release procedure before any configuration is treated as authoritative. An actual school selects or configures an approved policy; released policy versions do not alter historical exams.

### Candidate POL-NEP-100-1 — 100-mark component fixture

| Item             | Value                                                                                                                                                                                 |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Components       | Theory 75 (pass 27), practical 25 (pass 10), both required; subject maximum 100.                                                                                                      |
| Subject pass     | Each component must pass and raw total must be at least 40.00/100.                                                                                                                    |
| Overall pass     | Every required subject passes; no grace.                                                                                                                                              |
| Optional subject | Excluded from required pass determination; its GPA may replace the lowest required GPA only if it is higher, but it never repairs a failed required subject.                          |
| Status policy    | ABSENT = subject absent and overall fail/unpublishable until governed decision; MISSING/NOT_SUBMITTED/INCOMPLETE = incomplete; EXEMPT only when entire subject exemption is approved. |
| Rounding         | HALF_UP; percentage 2 decimals, GPA 2 decimals; grade lookup unrounded.                                                                                                               |
| Grade bands      | A+: 90–100 GPA 4.00; A: 80–<90 3.60; B+: 70–<80 3.20; B: 60–<70 2.80; C+: 50–<60 2.40; C: 40–<50 2.00; NG: 0–<40 0.00/fail.                                                           |

**Worked example:** theory 54.25 and practical 18.50 → raw 72.75/100 → 72.75% → `B+`, GPA 3.20, provided both component minima pass. Theory 39 and practical 25 totals 64, but theory is below 27? No; it passes. Theory 26.99 and practical 25 totals 51.99 but component fail → subject fail despite total.

### Candidate POL-WGT-200-1 — weighted 200-mark fixture with optional credit

| Item          | Value                                                                                                                                                                                                                                                                                              |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Components    | Internal 40 (pass 16, weight 30), theory 120 (pass 42, weight 50), practical 40 (pass 16, weight 20); raw maximum 200, weighted denominator 100.                                                                                                                                                   |
| Subject pass  | All required components pass; weighted score at least 40.0000/100.                                                                                                                                                                                                                                 |
| Overall GPA   | Credit-weighted mean of subject GPAs; required subjects only. Optional contributes `(optional GPA − 2.00) × optional credit` only when positive, divided by total required credit; it cannot exceed 4.00.                                                                                          |
| Grace         | Enabled only in this candidate fixture: maximum 1.00 raw mark per subject, maximum two required subjects, may satisfy subject total pass but not a component minimum; applied before subject pass/grade lookup. A policy approval action is required. Grace is disabled in the MVP default policy. |
| Status policy | Absent in any required component is subject `ABSENT`; withheld/cheating blocks publication; exempt component re-normalizes only its explicitly defined weight.                                                                                                                                     |
| Rounding      | HALF_EVEN; raw calculations 4 decimals, displayed percentage 2, displayed GPA 3; grade lookup uses score rounded to 2 decimals.                                                                                                                                                                    |
| Grade bands   | A+: 90–100 / 4.000; A: 80–<90 / 3.600; B+: 70–<80 / 3.200; B: 60–<70 / 2.800; C+: 50–<60 / 2.400; C: 40–<50 / 2.000; NG: below 40 / 0.000.                                                                                                                                                         |

**Worked example:** internal 32, theory 90, practical 30 gives weighted `(32/40×30)+(90/120×50)+(30/40×20)=76.5000`; each component passes; grade `B+`. The raw-total mode on those same marks yields `152/200 = 76.0000%`, demonstrating that the selected policy mode matters. Internal 16, theory 41.99, practical 40 has a weighted score above 40 but theory component fails: subject is fail; grace cannot repair that component.

## 7. Approval and correction policy

| Workflow   | Required transitions and evidence                                                                                                                                                                                                                                                                                                                     |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Marks      | `DRAFT → SUBMITTED → REVIEWED → APPROVED → LOCKED`; reject returns to draft with reason. Teachers may draft/submit only within assignment scope. A submitter cannot approve their own submission; an approval action requires a different authorized actor. Eligible approver roles and scope are defined by the released permission/approval policy. |
| Correction | A locked/approved mark requires `CORRECTION_REQUESTED → APPROVED/REJECTED`. The requester cannot approve their own correction request. Approval records actor, authority, reason, target revision and whether recalculation is required. Approved correction creates a new mark revision; old revision remains immutable.                             |
| Results    | `CALCULATED → REVIEWED → APPROVED → LOCKED → PUBLISHED`. All target results must have required approvals. The calculator/submitter cannot approve or publish that snapshot; a different authorized person must do so. Publication references the exact snapshot version.                                                                              |
| Reopen     | Only an authorized result approver with reason may reopen. It creates a new result version from explicit input revisions; it does not mutate the published snapshot. Existing generated documents are flagged as superseded/revoked according to document policy.                                                                                     |

Every transition executes in one transaction with row-version checks, policy-release validation, `approval_actions`, audit event, and an outbox/job event where a downstream notification/document is needed. The server enforces actor separation for marks submissions, correction requests, and result snapshots; UI checks are not sufficient.

## 8. Minimum deterministic test vector set

| Case        | Input / expected assertion                                                                                                                                                                                         |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| MRK-POL-001 | Present 100.0000 at max accepts; 100.0001 rejects; negative rejects.                                                                                                                                               |
| MRK-POL-002 | PRESENT 0 versus ABSENT/MISSING/EXEMPT/NOT_SUBMITTED yields five distinct stored/result outcomes.                                                                                                                  |
| RES-POL-001 | POL-NEP-100-1 example yields 72.75/B+/3.20.                                                                                                                                                                        |
| RES-POL-002 | Total pass with component fail yields fail.                                                                                                                                                                        |
| RES-POL-003 | Each grade boundary and rounding edge yields the declared band.                                                                                                                                                    |
| RES-POL-004 | Optional positive contribution may improve GPA but never changes a required subject failure.                                                                                                                       |
| RES-POL-005 | Grace does not repair component failure and cannot exceed configured subject/count caps.                                                                                                                           |
| RES-POL-006 | Changing an approved mark produces a new mark revision/result snapshot and preserves the published prior version.                                                                                                  |
| RES-POL-007 | Repeating a calculation with the same policy/input fingerprint is idempotent.                                                                                                                                      |
| RES-POL-008 | Incomplete, withheld, missing, and default `NOT_SUBMITTED` status block approval/publication; zero treatment for `NOT_SUBMITTED` requires an explicit versioned policy.                                            |
| RES-POL-009 | A test vector with component maxima not proportional to configured weights produces the declared distinct raw-total and normalized-weighted results; snapshots retain the selected mode and denominator.           |
| RES-POL-010 | Grace is disabled by default; when explicitly enabled, eligibility/caps are enforced, the versioned policy's component-minimum setting is honored, and the adjustment is separately approved, stored, and audited. |
| RES-POL-011 | Optional-subject effects on percentage/GPA/ranking follow the versioned policy; optional results never silently convert a failed required subject into a pass.                                                     |

## 9. Release validation gates

A result policy cannot be released unless its bands cover 0–100 without gap/overlap, all blueprint component maxima/pass values are valid, status/grace/optional semantics validate against JSON schema, two independent manual calculation examples match engine output, and a school-domain owner approves it. The exact released policy ID is persisted on every calculation snapshot.

Configuration is flexible only within the policy schema and fixed platform invariants. A policy edit creates a new draft/version; it cannot rewrite a released version or silently change an exam/result snapshot that already references it. Only a user with the specific school-scoped policy permission may review/release it. Students and parents may not create, edit, approve, or release result policies. The API must enforce tenant, permission, lifecycle, and audit checks on every policy operation.
