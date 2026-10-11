# Freeze Gap 2 — Data Dictionary and Governance

## Common columns

Every tenant entity: `id UUID PK`, `school_id UUID FK/index`, `created_at timestamptz`, `updated_at timestamptz`, and where applicable `deleted_at timestamptz`. Official/history entities also have `revision/version`, `status`, actor/time/reason references. UTC instants and ISO date types are canonical.

| Entity                    | Required business columns                                      | Key/constraint/index                                  | Sensitivity/lifecycle              |
| ------------------------- | -------------------------------------------------------------- | ----------------------------------------------------- | ---------------------------------- |
| School                    | code, name, status, locale, timezone                           | unique code; status index                             | tenant archive only                |
| User/Session              | email, password_hash, status; session_hash, expiry, revoked_at | email unique per policy; session hash unique          | restricted; sessions expire/revoke |
| Role/Permission/Grant     | code, role_id, permission_id, scope JSON/version               | unique codes/grants                                   | access history retained            |
| AcademicYear/Period       | name, start_date, end_date, status, version                    | tenant/year unique; active index                      | retire/version                     |
| Class/Section/Subject     | code/name/type/order/status                                    | tenant uniqueness; relationship indexes               | soft retire                        |
| Offering/Assignment       | year/class/section/subject/teacher IDs, active interval        | scope composite indexes                               | append/end history                 |
| Student/Guardian/Link     | identifiers, names, contacts, status; relationship             | tenant identifier uniqueness                          | restricted; archive/hold           |
| Enrollment                | student/year/class/section, status, dates                      | unique student/year active; roster indexes            | historical append                  |
| Exam/ExamSubject/Schedule | year, name, dates, status, blueprint version                   | tenant/status/date indexes                            | versioned/locked                   |
| Blueprint/Component       | version, type, max/pass/weight/required/status                 | immutable version once used                           | policy history                     |
| Mark/Revision/Approval    | component value/status, lifecycle, revision, actor/reason      | unique examSubject/enrollment/component; status index | official revision history          |
| Result/Snapshot           | totals/grade/GPA/status, rule version, snapshot                | unique exam/enrollment; version unique                | immutable published snapshot       |
| File/Upload               | key, checksum, MIME, size, scan/status, retention              | checksum/context index                                | private/retention hold             |
| Import/Row/Match/Review   | job/state, normalized values, confidence, decision             | idempotency/source-context unique                     | provenance retained                |
| Template/Document         | version, source version, checksum, verification token, status  | template/version unique; token unique                 | private/revoke/archive             |
| Notice/Notification       | audience, publish/delivery states, preference                  | audience/status/time indexes                          | retention policy                   |
| Audit/Job/Export          | action/entity/old/new/result/correlation; state/idempotency    | append-only/time/entity indexes                       | restricted/retained                |

## Governance rules

Restricted data includes identity/contact/photos/academic documents. Soft archive is default; purge requires retention expiry, no legal hold, authority, audit, and backup policy. Published snapshots/audit records are immutable. Each column’s final nullability/default/enum/foreign key is finalized in the migration review from this dictionary.
