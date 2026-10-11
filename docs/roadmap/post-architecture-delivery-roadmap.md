# SchoolOS Post-Architecture Delivery Roadmap

## Status

**Future delivery roadmap.** Technology confirmation and project setup begin only after the D16 architecture freeze. The governing master specification currently keeps the project in D0.4 planning mode and does not authorize application implementation.

## Delivery journey

```text
planning → architecture freeze → technology confirmation → project setup
→ controlled MVP modules → module testing → integration
→ AI/OCR delivery → acceptance testing → staging/production deployment
→ one-school pilot → feedback/improvement → v1.0 → future versions
```

## Gate 1 — Architecture freeze

Review the complete design package: use cases, workflows, states, data/ERD/domain model, components/deployment, API contracts, permission matrix, AI/OCR workflow, business rules, UI/UX, data/privacy, and tests. Resolve or explicitly defer every open decision. Approval produces the D16 decision log.

## Gate 2 — Technology confirmation and setup

Confirm technologies against the frozen architecture: frontend, API, database, object storage, queues, AI/OCR adapter, renderer, notifications, monitoring, and deployment platform. The current repository foundation is a candidate, not a substitute for this decision.

Set up repository governance, branch/review strategy, environment configuration, development/test/staging infrastructure, migrations, seed fixtures, code conventions, CI/CD baseline, secret management, and operational runbooks.

## Controlled MVP module order

| Delivery stage    | Modules                                                                             | Exit evidence                                      |
| ----------------- | ----------------------------------------------------------------------------------- | -------------------------------------------------- |
| A — Foundation    | authentication, users, roles, permissions, tenant/school, academic years            | session, RBAC, tenant-isolation, audit tests pass  |
| B — Academic core | students/guardians, teachers, classes, sections, subjects, assignments, attendance  | real roster/assignment workflows pass              |
| C — Examination   | exams, subjects/components, schedules, manual marks entry and validation            | marks lifecycle and scope tests pass               |
| D — Results       | calculation, grades/GPA, pass/fail, approval, publication/snapshots                 | reproducible results and approval tests pass       |
| E — Documents     | marksheets first, then ID/admit/certificates/reports                                | private rendering/download/verification tests pass |
| F — AI/OCR        | secure upload, extraction, matching, confidence, review, approval into marks engine | labelled evaluation and safety tests meet targets  |

No stage proceeds on the assumption that unfinished prior-stage controls will be “added later.” Each has design review, implementation review, automated tests, and domain-owner acceptance.

## Integration and validation

Validate end-to-end workflows such as:

```text
register student → enroll → assign teacher/subject → create exam
→ enter or reviewed-import marks → calculate → approve → publish
→ generate marksheet → authorized download/verification
```

Run API contract, cross-tenant, authorization, data-migration, job-retry, file-security, and audit tests alongside UI/E2E coverage.

## Pilot school

Start with one school—not broad rollout. Use progressively realistic, approved datasets (10, 50, 100, 500, then 1,000+ students) and real academic workflows. AI/OCR evaluation must include varied print/scan quality, document layouts, names/roll numbers, absences, missing values, and exception cases. Do not use production student data in development/testing without an approved privacy process.

## Acceptance, security, and performance

Teachers validate roster/marks/import workflows; examination staff validate review/results; administrators validate setup/records; principals validate oversight; students/parents validate permitted published views. Before production, complete security testing for identity, permission, tenancy, files, APIs, and audit; complete load tests for lists, marks grids, imports, document batches, uploads, concurrency, and queues.

## Deployment and production

Promote development → test → staging → production with approved migrations, backups, monitoring, logs, alerting, recovery procedures, and rollback/forward-fix plans. Pilot feedback is triaged as critical bug, usability issue, planned feature, or future idea.

## Release evolution

**v1.0:** stable core operations, academics, examinations, marks/results, documents, permissions/audit, reports, and approved AI/OCR scope.  
**v2:** parent portal, advanced analytics, notification automation, more templates, advanced AI.  
**v3+:** fees, library, transport, payroll, inventory, and other bounded school operations.

Changes after architecture freeze require impact assessment for requirements, workflows, data migration, API/UI contracts, authorization/audit, tests, and release schedule.

After v1.0, use the [post-production product lifecycle](post-production-product-lifecycle.md) for maintenance, feedback, AI improvement, new-module evaluation, and controlled multi-school expansion.
