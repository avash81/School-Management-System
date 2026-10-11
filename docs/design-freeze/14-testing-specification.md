# Document 14 — Testing Specification

## Test layers

| Layer           | Coverage                                                                                         |
| --------------- | ------------------------------------------------------------------------------------------------ |
| Unit            | rules, grades/GPA, status/lifecycle, matching, normalization, scope policy                       |
| Integration     | database constraints/transactions/migrations, jobs/outbox, storage/provider adapters             |
| API             | auth, tenant/scope permissions, validation/errors, pagination, concurrency, idempotency          |
| E2E             | role workflows from setup/admission through marks/result/document/portal                         |
| Security        | session/CSRF/rate limit, authorization, tenant leak, injection/XSS, uploads/secrets/dependencies |
| AI/data quality | labelled OCR/extraction/matching/calibration, duplicates, ambiguity, recovery                    |
| Accessibility   | keyboard, screen reader, contrast, responsive critical flows                                     |
| Performance     | 500/2k/5k/10k student scenarios, concurrent activity, jobs/backlog/large files                   |
| Acceptance      | pilot administrator/teacher/exam/principal/student/parent scripts                                |

## Test governance

Use synthetic/de-identified fixtures. Every case receives `TC-*` ID linked to Document 02. CI runs formatting/lint/typecheck/unit/integration/API/build/security scans; staging adds migrations, smoke, load and recovery checks. A failed tenant/security/data-integrity test blocks release. AI release requires approved metric thresholds and human-review safety evidence.

## Minimum end-to-end chain

School setup → academic context → teacher/student/enrollment/assignment → exam → manual or reviewed import marks → validation/approval → result calculation/publication → marksheet → authorized portal access. Include correction, provider failure, permission denial, restore, and retry paths.
