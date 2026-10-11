# D14 — Testing Strategy

## Verification pyramid

| Layer       | Proof required                                                            |
| ----------- | ------------------------------------------------------------------------- |
| Unit        | grading, matching, lifecycle, scope policy, validation/normalization      |
| Integration | database constraints/transactions, jobs/outbox, adapters                  |
| API         | auth, permissions, tenant isolation, errors, idempotency, pagination      |
| UI/E2E      | role workflows from login to published result/document                    |
| AI          | labelled document accuracy, ambiguity, safety, provider failure           |
| Security    | authorization matrix, sessions/CSRF, upload and dependency/secrets checks |
| Performance | interactive paths, bulk paths, backlog/recovery                           |
| Acceptance  | administrator, teacher, exam, principal, student, parent scenarios        |

## Quality gates

Fixtures are synthetic/de-identified. CI runs formatting, lint/typecheck, tests, migrations/contract checks, and scans. A release is blocked by an unapproved critical security finding, tenant-isolation/permission failure, failed backup restore, missing traceability test, or unacceptable performance/AI safety metric.
