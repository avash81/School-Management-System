# D0.7 — Requirements Traceability

## Required trace chain

Every product requirement follows this chain:

```text
Requirement → use case → business rule(s) → entities → API → UI → tests → release evidence
```

## Baseline register

| Requirement                     | Use case       | Rules                     | Core entities                       | Proof                             |
| ------------------------------- | -------------- | ------------------------- | ----------------------------------- | --------------------------------- |
| Tenant-isolated student records | UC-STU-001     | BR-TEN-001, BR-STU-001    | School, Student, Enrollment         | API cross-tenant denial test      |
| Assignment-scoped marks         | UC-MRK-001     | BR-ID-002, BR-MRK-001–004 | Assignment, MarkEntry               | policy and API tests              |
| Safe OCR import                 | UC-IMP-001/002 | BR-IMP-001–002            | Upload, ImportSession, ImportRecord | job/review/idempotency tests      |
| Published results               | UC-RES-001     | BR-RES-001–002            | Result, ResultSnapshot              | calculation/publication tests     |
| Private verifiable marksheets   | UC-DOC-001     | BR-DOC-001, BR-PRV-001    | Template, Document                  | storage/access/verification tests |

The release owner maintains this register in the delivery tracker. A requirement without a test or a test without a requirement is a review finding.
