# Freeze Gap 3 — Formal Permission Matrix

## Permission pattern

`operation.permission + school tenant + resource scope + lifecycle policy = decision`.

| Operation | School admin | Principal | Exam coordinator | Teacher | Staff | Student/parent | Platform |
| --- | --- | --- | --- | --- | --- | --- |
| Manage users/settings/flags | manage tenant | view/approved | — | — | — | — | platform tenant only |
| Configure/release academic and result policies | manage with policy permission | approve/release if granted | delegated configure/review if granted | — | — | — | emergency only |
| Manage academics/assignments | manage | view | delegated manage | assigned read | limited | — | emergency only |
| Students/guardians/enrollment | manage | view | assigned read | assigned read | delegated manage | own/linked read | emergency only |
| Attendance | manage/view | view | view | assigned write | delegated write | own/linked published read | emergency only |
| Exams/components | manage | view/approve policy | manage | assigned read | limited | published read | emergency only |
| Marks draft/submit | override policy | review | write/review | assigned write/submit | limited | published read | emergency only |
| Marks approve/lock/reopen | approve/override | approve policy | approve/review | never own approval by default | — | — | emergency only |
| Imports | manage/approve | view/exception approve | create/review/approve | assigned create/review | — | — | health only |
| Results publish/reopen | approve/publish (not own calculation) | approve/publish (not own calculation) | calculate/review; cannot approve/publish own snapshot | assigned read | limited | published own/linked | emergency only |
| Templates/documents | manage/generate | view | generate | permitted generate/read | delegated | own/linked read | emergency only |
| Reports/audit | tenant scoped | tenant scoped | exam scoped | assignment scoped | delegated | own/linked only | platform scoped |

Scope dimensions: school, academic year, class, section, subject/offering, exam, student relationship, document/audience. Every grant is auditable; deny on missing scope; sensitive actions require reason/revision/approval according to state. Policy configuration and release require an explicit school-scoped permission, are backend-enforced, and are never granted to student/parent roles. A school may delegate configuration/review to another staff role only through an explicit scoped grant.
