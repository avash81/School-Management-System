# D6 — AI/OCR Architecture

## Pipeline

```text
authorized upload → file validation/scan → private storage → import session
→ durable queue → preprocess/OCR/table extraction → normalize
→ deterministic/fuzzy student matching → rules/confidence validation
→ human review → authorized approval → marks-engine transaction
```

## Provider boundary

The API talks to an internal provider-neutral adapter. Providers receive only the minimum signed artifact/reference and return a normalized extraction contract plus provenance/confidence. The provider cannot access SchoolOS data or write official records.

## Matching and review

Match deterministic identifiers first in the selected exam roster; use fuzzy matching only as a proposal with candidate evidence. Thresholds are configurable. Any ambiguity, low confidence, unknown reference, invalid mark, or lifecycle conflict stops automated progression. Reviewers can correct evidence but cannot waive mandatory validation.

## Safety and evaluation

Original file, normalized values, corrections, model/provider version, confidence, and decision history are retained under policy. Maintain a de-identified labelled dataset and monitor extraction accuracy, match precision/recall, false acceptance, review rate, latency, and cost. Provider failure uses bounded retry and an actionable failed state.
