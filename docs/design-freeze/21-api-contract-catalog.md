# Freeze Gap 5 — API Contract Catalog

| Endpoint                           | Request / response core                                  | Auth/control                | Audit/idempotency        |
| ---------------------------------- | -------------------------------------------------------- | --------------------------- | ------------------------ |
| `POST /auth/login`                 | `{identifier,password}` → `{user}` + session             | public, throttle/safe error | login event              |
| `POST /students`                   | student/profile/optional enrollment → student/enrollment | `students.create`, tenant   | transaction/audit        |
| `PATCH /students/{id}`             | partial DTO + `revision` → updated revision              | scoped update               | conflict/audit           |
| `POST /assignments`                | teacher/year/class/section/subject → assignment          | `assignments.manage`        | audit                    |
| `POST /exams`                      | name/year/dates/subjects → exam                          | `exams.manage`              | audit                    |
| `PUT /marks/{id}`                  | value/status/revision → mark revision                    | assignment write            | conflict/audit           |
| `POST /marks/{id}/submit`          | revision → state                                         | submit scope                | audit                    |
| `POST /marks/{id}/approve`         | reason/revision → state                                  | approver scope              | audit                    |
| `POST /imports`                    | context + file/idempotency key → import/job              | import scope                | idempotent/audit         |
| `POST /imports/{id}/approve`       | revision/idempotency key → outcome                       | approval scope              | atomic/audit             |
| `POST /results/calculate`          | exam/context → job/results                               | calculate scope             | audit/job                |
| `POST /results/{id}/publish`       | reason/revision → snapshot                               | publish scope               | audit/outbox             |
| `POST /documents`                  | type/source/template/idempotency → document job          | document scope              | idempotent/audit         |
| `GET /documents/{id}/download`     | signed/private response                                  | document scope              | sensitive download audit |
| `GET /verify/{token}`              | minimal status only                                      | rate limit/anti-enumeration | verification audit       |
| `GET /reports/*` / `POST /exports` | allowlisted filters/page or export DTO                   | report scope                | export job/audit         |

All list requests return `{data, meta:{page,limit,total}}` or cursor equivalent. DTO schemas forbid unknown fields; errors use the Document 08 envelope. Complete field schemas derive directly from Document 18 data dictionary and UI form specification before implementation.
