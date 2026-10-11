# Document 04 — Complete Activity Diagrams

## Shared activity controls

Every mutation includes authenticate → resolve tenant/scope → authorize → validate → transaction or durable job → audit/outbox → safe response. Exceptions do not expose cross-tenant data or silently discard evidence.

## Login and session

```mermaid
flowchart TD
 A[Open login] --> B[Submit identifier and password]
 B --> C{Credentials/account valid?}
 C -- No --> D[Generic error, rate-limit/lock policy] --> A
 C -- Yes --> E[Resolve school, role, permission, scope]
 E --> F[Create session and audit login] --> G[Role dashboard]
```

## Student admission and enrollment

```mermaid
flowchart TD
 A[Start admission] --> B[Validate identity/profile]
 B --> C{Unique in school?}
 C -- No --> X[Return duplicate conflict]
 C -- Yes --> D[Create student]
 D --> E{Enroll now?}
 E -- No --> F[Save applicant and audit]
 E -- Yes --> G[Validate year/class/section]
 G --> H{Placement valid?}
 H -- No --> I[Rollback and show error]
 H -- Yes --> J[Create enrollment, audit, end]
```

## Manual marks, review, and approval

```mermaid
flowchart TD
 A[Select exam context] --> B[Authorize assignment and load roster]
 B --> C[Enter mark/status]
 C --> D{Valid component/range/status?}
 D -- No --> E[Show validation error] --> C
 D -- Yes --> F[Save draft revision and audit]
 F --> G{Submit?}
 G -- No --> H[Draft retained]
 G -- Yes --> I{Complete and entry open?}
 I -- No --> J[Keep draft and report gaps]
 I -- Yes --> K[Submit]
 K --> L[Reviewer checks]
 L --> M{Approve?}
 M -- Reject --> N[Reason, return draft]
 M -- Approve --> O[Approved/locked lifecycle state]
```

## AI/OCR import

```mermaid
flowchart TD
 A[Upload source] --> B[Authorize context, validate type/size/signature/scan]
 B --> C{Safe source?}
 C -- No --> D[Reject and audit]
 C -- Yes --> E[Private store original, create idempotent job]
 E --> F[Queue preprocessing/OCR/extraction]
 F --> G[Normalize, map, match students, validate]
 G --> H{High confidence and no issue?}
 H -- No --> I[Review-required queue with evidence]
 I --> J[Human corrects/selects/revalidates]
 H -- Yes --> K[Ready for approval]
 J --> K
 K --> L{Authorized approval?}
 L -- No --> M[Reject/cancel/retry]
 L -- Yes --> N[Idempotent marks-engine transaction and audit]
```

## Results and documents

```mermaid
flowchart TD
 A[Request calculation] --> B[Load approved official marks and rule version]
 B --> C{Complete/valid?}
 C -- No --> D[Report unresolved marks]
 C -- Yes --> E[Calculate result revision]
 E --> F[Review/approve]
 F --> G{Publish authorized?}
 G -- No --> H[Keep review state]
 G -- Yes --> I[Create immutable snapshot, audit/outbox]
 I --> J[Optional document/notification jobs]
 J --> K[Private marksheet render/download]
```

## Remaining required activity flows

| Workflow                    | Controlled flow                                                                    | Decisions/exceptions                                      |
| --------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------- |
| School setup                | create tenant → initial admin → profile/settings → audit                           | duplicate code, initial admin rollback, archive retention |
| Academic year setup         | draft year → validate dates → activate/version → close/archive                     | overlap/active-year policy, referenced history            |
| Teacher assignment          | select teacher/context → validate offering → create assignment/audit               | inactive/conflicting assignment                           |
| Subject configuration       | create/retire subject/type → offering → blueprint version                          | duplicate code, in-use version immutable                  |
| Exam creation               | draft exam → schedule/subjects/components → validate → open entry                  | invalid dates/configuration/eligibility                   |
| Bulk marks import           | map/preview → validate rows → confirmation → queued batch → item outcome           | duplicate/idempotency, row errors, job retry              |
| Student matching            | deterministic identifier → candidate scoring → exact/possible/ambiguous/no-match   | ambiguous/no-match requires review/manual mapping         |
| Marks validation            | component/status/range → completeness/lifecycle → accept/reject                    | absent/missing/exempt distinct; conflict/stale revision   |
| Result approval/publication | calculated → review → approve → snapshot → publish/lock                            | missing approvals; reopen requires reason/version         |
| Marksheet generation        | authorize result/template → queue render → checksum/store → private download       | missing template/render retry/revocation                  |
| Promotion                   | validate next placement → end prior enrollment → create next → audit               | duplicate active enrollment/invalid target                |
| Transfer                    | validate destination → end current enrollment → append transfer enrollment → audit | invalid destination/history/legal constraint              |
| Graduation                  | validate policy → complete enrollment → issue eligible documents → archive state   | incomplete academic requirement/authorized override       |
| Notice/notification         | draft → validate audience → approve/publish → queued delivery                      | provider retry/opt-out/expiry                             |
| File upload                 | authorize → validate/scan → quarantine/private store → attach/version              | unsafe source, storage error, retention hold              |
| Export/bulk documents       | validate scope → create job → process chunks → item results → expiry               | failed item/retry/dead-letter/authorization loss          |
| Maintenance/support         | approval/reason → time-bounded mode/access → operation/audit → expire              | emergency escalation/read-only fallback                   |

## Completion

These activity flows define inputs, decisions, alternative paths, exceptions, approvals, and ends. Detailed sequence interactions are the next document.
