# D5 — API Design

## Contract rules

All endpoints are versioned beneath `/api/v1`, authenticated unless explicitly documented otherwise, and use stable DTOs—not database objects. Every endpoint documents permission/scope, request/response model, validation errors, pagination, audit effect, transaction boundary, and idempotency needs.

## API groups

`/auth`, `/schools`, `/users`, `/students`, `/guardians`, `/teachers`, `/assignments`, `/academic-years`, `/classes`, `/sections`, `/subjects`, `/attendance`, `/exams`, `/marks`, `/imports`, `/results`, `/documents`, `/notices`, `/reports`, `/jobs`, and platform-only `/platform`.

## Mutation pipeline

```text
authenticate → resolve tenant → authorize scope → validate DTO
→ enforce business/lifecycle rules → idempotency/revision check
→ transaction → audit/outbox → response
```

Use `Idempotency-Key` for imports, jobs, bulk requests, and retryable external callbacks. Use a revision/ETag for interactive edits. Return 401 for missing/invalid authentication, 403 for prohibited operations, 404 without cross-tenant disclosure, 409 for stale/duplicate conflict, and 422 for valid syntax that violates business rules.

## Error response

Errors include stable code, safe message, field details where safe, and request correlation ID. Provider/internal errors do not reveal stack traces or secrets. API documentation and contract tests are required for every public endpoint.
