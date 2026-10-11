# Document 08 — API Specification

## API conventions

Version prefix `/api/v1`; JSON DTOs; UTC canonical timestamps; cursor/bounded pagination; filter/sort allowlists; error `{ code, message, fields?, requestId }`; bearer/session authentication as finalized by security design. Every mutation performs authentication → tenant/scope authorization → DTO/domain validation → concurrency/idempotency check → transaction → audit/outbox.

| Resource group                                                                                    | Methods                                      | Permission/scope                     | Special controls                               |
| ------------------------------------------------------------------------------------------------- | -------------------------------------------- | ------------------------------------ | ---------------------------------------------- |
| `/auth`                                                                                           | login/logout/me/sessions/reset/verify        | self                                 | rate limit, safe errors, revocation            |
| `/users`, `/roles`, `/permissions`                                                                | CRUD/status/grants                           | tenant/platform access admin         | audited escalation, scope grant                |
| `/schools`, `/settings`, `/feature-flags`                                                         | read/update/configure/archive                | school/platform admin                | config version, maintenance gate               |
| `/academic-years`, `/periods`, `/classes`, `/sections`, `/subjects`, `/offerings`, `/assignments` | CRUD/retire                                  | academic scope admin                 | references/version rules                       |
| `/students`, `/guardians`, `/enrollments`, `/teachers`, `/attendance`                             | CRUD/transitions/list                        | tenant/assignment/relationship scope | history, pagination, concurrency               |
| `/exams`, `/exam-subjects`, `/marks`                                                              | CRUD/state actions                           | exam/assignment/approval scope       | lifecycle, revision, audit                     |
| `/imports`, `/files`                                                                              | create/status/review/approve/cancel          | selected exam scope                  | idempotency, private source/job                |
| `/results`                                                                                        | calculate/review/approve/publish/reopen/read | exam/approval/published relation     | snapshots/version rules                        |
| `/templates`, `/documents`, `/verify`                                                             | CRUD/version/generate/download/verify        | template/document scope              | private signed access; minimal public response |
| `/reports`, `/exports`, `/notices`, `/notifications`                                              | query/job/publish/preferences                | audience/report scope                | queued output, delivery tracking               |
| `/audit`, `/jobs`, `/health`, `/platform`                                                         | scoped read/operate                          | audited operations scope             | redaction, support time limit                  |

## HTTP and bulk rules

GET lists paginate/filter/sort; POST creates; PUT/PATCH updates with revision; state commands use explicit action endpoints; DELETE normally archives. Imports/exports/batches/jobs accept `Idempotency-Key`, return job/resource ID, and expose safe status. `401` unauthenticated, `403` forbidden, tenant-hidden `404`, `409` stale/duplicate conflict, `422` business violation, `429` throttled, `5xx` safe correlation error.
