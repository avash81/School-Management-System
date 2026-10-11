# Document 10 — AI/OCR Technical Specification

## Pipeline

```text
authorize context → validate/scan/private source → persisted job → preprocess
→ OCR → layout/table detection → field extraction → normalization/mapping
→ deterministic/fuzzy matching → confidence + business/duplicate validation
→ human review → approval → idempotent marks-engine import → audit
```

## Contracts and safety

The provider-neutral adapter receives a minimum authorized source reference and returns normalized fields, evidence coordinates, confidence, provider/model/mapping version, and errors. It cannot write academic records. Input supports configured images/PDF/spreadsheets; mapping versions bind source headers/fields to student identifiers, exam context, components, absent/status values, and totals.

Match outcomes: exact, possible, ambiguous, no-match. Confidence bands: high may become ready for approval; medium requires review; low/ambiguous cannot import. Review presents source evidence, candidates, corrections, validation issues, and full provenance. Approval revalidates current records and calls the normal marks engine transaction.

## Quality and recovery

Retain source/provenance under policy; preserve original on failure. Retry bounded jobs, alternate mapping/provider/manual entry, dead-letter/escalate failures. Evaluate anonymized labelled samples for character/field/table/mark accuracy, match precision/recall, false rates, calibration, review rate, latency, and cost; version all processing metadata.
