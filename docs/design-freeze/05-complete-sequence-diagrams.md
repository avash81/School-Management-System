# Document 05 — Complete Sequence Diagrams

## Login

```mermaid
sequenceDiagram
User->>UI: credentials
UI->>API: POST /auth/login
API->>DB: find active user, verify password
API->>DB: resolve roles, permissions, scopes
API->>DB: create hashed session + audit
API-->>UI: secure session, public profile
```

## Student admission

```mermaid
sequenceDiagram
Admin->>UI: submit admission/enrollment
UI->>API: POST /students
API->>Policy: authorize tenant/permission
API->>DB: validate uniqueness and placement
API->>DB: transaction(student, guardian link, enrollment, audit)
API-->>UI: student/enrollment
```

## Manual marks

```mermaid
sequenceDiagram
Teacher->>UI: save/submit marks
UI->>API: PUT /marks/{id}
API->>Policy: assignment + lifecycle authorization
API->>DB: load exam/component/enrollment revision
API->>Domain: validate value/status/completeness
API->>DB: revision, transition, audit/outbox transaction
API-->>UI: updated state or conflict/errors
```

## AI/OCR import

```mermaid
sequenceDiagram
Teacher->>API: create import/upload
API->>Storage: private validated source
API->>DB: import session + idempotency + audit
API->>Queue: enqueue job
Worker->>Storage: retrieve source
Worker->>OCR: preprocess/extract
OCR-->>Worker: values/evidence/confidence
Worker->>DB: normalized rows, matches, issues
Reviewer->>API: correct/approve
API->>Marks: revalidate and apply command
Marks->>DB: transaction(marks, import state, audit/outbox)
```

## Result and document

```mermaid
sequenceDiagram
ExamStaff->>API: calculate/publish result
API->>DB: approved marks + rule version
API->>Domain: calculate
API->>DB: result revision/snapshot/audit/outbox
Worker->>DB: document request/source/template version
Worker->>Renderer: render
Renderer-->>Worker: artifact
Worker->>Storage: private checksum artifact
Worker->>DB: document history/status
```

## Operational sequence rules

Every sequence begins with authentication, tenant/scope authorization, and correlation ID; authoritative writes are transactional; external calls use durable intents/jobs and retry/reconciliation; notification delivery never decides academic transaction success.
