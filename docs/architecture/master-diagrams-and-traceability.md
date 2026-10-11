# Master Diagrams and Traceability

## Core end-to-end data flow

```mermaid
flowchart TD
  S[School configuration] --> A[Academic structure]
  A --> P[Students, guardians, teachers, assignments]
  P --> E[Examination configuration]
  E --> M[Manual marks]
  E --> I[AI/OCR import]
  I --> V[Match, confidence, validation, human review]
  V --> M
  M --> R[Approved marks]
  R --> C[Result calculation]
  C --> AP[Result approval and publication]
  AP --> D[Documents and reports]
  AP --> O[Student/parent published access]
```

## Critical AI import sequence

```mermaid
sequenceDiagram
  participant T as Teacher/Exam staff
  participant API as SchoolOS API
  participant ST as Private storage
  participant Q as Job queue/worker
  participant AI as OCR adapter/service
  participant RV as Review/approval
  participant M as Marks engine
  T->>API: upload + selected exam context
  API->>ST: validate, scan, store source
  API->>Q: create import job
  Q->>AI: preprocess/extract
  AI-->>Q: normalized values + evidence/confidence
  Q->>API: match, validate, create review records
  API-->>T: review-required or ready status
  T->>RV: correct/review
  RV->>M: approved, idempotent import command
  M-->>API: audited official mark outcome
```

## Marks and result state diagram

```mermaid
stateDiagram-v2
  [*] --> Draft
  Draft --> Submitted
  Submitted --> Reviewed
  Reviewed --> Approved
  Reviewed --> Rejected
  Rejected --> Draft
  Approved --> Published
  Published --> Locked
  Published --> Reopened: authorized reason
  Locked --> Reopened: exceptional policy
  Reopened --> Draft
```

## Container/component diagram

```mermaid
flowchart LR
  U[Admin/portal clients] --> API[NestJS modular API]
  API --> DB[(PostgreSQL)]
  API --> R[(Redis/BullMQ)]
  R --> W[Worker]
  W --> OS[Private object storage]
  W --> OCR[FastAPI/OCR adapter]
  W --> PDF[Document renderer adapter]
  W --> N[Notification provider adapter]
  API --> AUD[Audit/outbox]
  AUD --> DB
```

## Permission matrix baseline

| Capability             | School admin    | Principal               | Exam coordinator      | Teacher                | Staff               | Student/parent       | Platform operator    |
| ---------------------- | --------------- | ----------------------- | --------------------- | ---------------------- | ------------------- | -------------------- | -------------------- |
| Tenant/settings/users  | manage          | view/approved actions   | delegated view        | —                      | limited             | —                    | tenant/platform only |
| Students/guardians     | manage          | view                    | assigned view         | assigned view          | delegated manage    | own/linked view      | emergency only       |
| Academic configuration | manage          | view                    | delegated manage      | assigned view          | limited             | —                    | emergency only       |
| Attendance             | manage/view     | view                    | view                  | assigned write         | delegated write     | own/linked read      | emergency only       |
| Exam/marks             | manage/override | approve policy          | manage/review/approve | assigned entry/submit  | limited             | published view       | emergency only       |
| AI import              | manage          | view/exception approval | manage/review/approve | assigned upload/review | —                   | —                    | service health only  |
| Results/documents      | manage          | approve/view            | calculate/generate    | assigned view          | delegated documents | published own/linked | emergency only       |
| Audit/platform         | school audit    | school audit            | assigned audit        | own actions            | own actions         | —                    | platform audit       |

## API resource contract map

| Domain             | Resource prefixes                                                                                             | High-risk controls                          |
| ------------------ | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| Identity           | `/auth`, `/users`, `/roles`, `/permissions`                                                                   | sessions, scoped grants, access audit       |
| School/academic    | `/schools`, `/academic-years`, `/periods`, `/classes`, `/sections`, `/subjects`, `/offerings`, `/assignments` | tenant, configuration versions              |
| People/attendance  | `/students`, `/guardians`, `/teachers`, `/enrollments`, `/attendance`                                         | history, assignment/relationship scope      |
| Exam/marks/results | `/exams`, `/marks`, `/imports`, `/results`                                                                    | lifecycle, revision, idempotency, approvals |
| Documents/files    | `/templates`, `/documents`, `/files`, `/verification`                                                         | private objects, source/template versions   |
| Reports/comms      | `/reports`, `/exports`, `/notices`, `/notifications`                                                          | audience/filter scope, queued delivery      |
| Operations         | `/audit`, `/jobs`, `/platform`                                                                                | privileged support, redaction, time limits  |

## Traceability rules

Each `REQ-*` record in [Requirements Register](../requirements/requirements-register.md) maps to a D0.4 catalog row, a `BR-*` rule, entity set, endpoint group, screen, and automated/acceptance test. A change request cannot advance until all affected links are updated.
