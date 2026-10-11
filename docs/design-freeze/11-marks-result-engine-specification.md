# Document 11 — Marks and Result Engine Specification

## Assessment model

An exam subject references an immutable blueprint version containing theory/practical/internal/project/oral/custom components, maxima/minima/pass requirements, weights, required flag, status rules, optional-subject policy, and rounding rules. A mark stores numeric value when applicable plus distinct attendance/submission state.

## Validation and lifecycle

Present values are finite and within configured range. ABSENT, MISSING, ZERO, NOT_SUBMITTED, and EXEMPT are never collapsed. Marks progress draft → submitted → reviewed → approved → published → locked; rejection returns to draft; controlled reopen/correction creates a new revision with reason/authority/audit. Imports invoke the same validation/lifecycle rules.

## Result algorithm

```text
approved marks + blueprint/rule versions → component validation
→ subject total/required-component pass → subject grade/status
→ overall total/percentage → GPA/overall pass-fail → result revision
→ review/approval → immutable published snapshot → lock
```

The exact grade/GPA/optional/absence/grace policy is configuration, not code. Calculation is deterministic and testable from its referenced inputs. Result publication requires all target results approved; reopen creates a new version, records reason, and evaluates affected documents/notifications.

## Integrity tests

Boundary/range/status cases; component/subject failure; optional-subject contribution follows the versioned policy and never silently clears required-subject failure; rounding; grade bands; incomplete marks; `ABSENT` retains its status and follows explicit versioned policy; `NOT_SUBMITTED` blocks by default and only an explicit versioned policy may treat it as zero; marks submitter, correction requester, and result calculator self-approval/publication rejection; stale revision; duplicate/import retry; correction/recalculation; snapshot reproducibility.
