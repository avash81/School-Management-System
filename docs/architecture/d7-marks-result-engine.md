# D7 — Marks and Result Engine

## Configurable mark structure

An exam subject selects a versioned blueprint such as theory 75, practical 10, internal 15. Components define maximum/minimum/pass rule, whether required, attendance handling, and calculation contribution. Optional-subject and absence policies are configuration, not hard-coded assumptions.

## Lifecycle and corrections

Marks move draft → submitted → reviewed → approved → published → locked. Result calculation accepts only approved marks. Corrections are explicit reopen/revision workflows with reason, authority, prior values, and impact assessment; imports cannot bypass this path.

## Calculation

The calculation service is deterministic and testable: load versioned approved inputs → validate completeness → compute component/total/percentage → apply grade/GPA/pass rules → persist calculated revision. Result approval/publishing is separate from calculation. Publication creates immutable snapshots and invalidates/reissues outputs when a governed reopen occurs.

## Required tests

Boundary marks, absent/exempt/missing, optional subjects, component failure, rounding, grading bands, duplicate entries, lifecycle denial, self-approval policy, cross-scope attempts, correction history, and reproducibility from a snapshot.
