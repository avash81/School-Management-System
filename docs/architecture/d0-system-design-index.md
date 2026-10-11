# D0 System Design and Architecture Blueprint

## Status

**Planning-only blueprint index.** D0 is the design package that must reach review and plan lock before production development resumes.

## Design rule

Every major capability must be specified through the same lens:

```text
scope -> actors -> inputs -> outputs -> entities -> owner
-> dependencies -> normal flow -> alternatives -> failures
-> permissions -> audit -> APIs -> UI -> tests
```

A feature is not architecture-complete until those responsibilities and boundaries are explicit.

## D0 artifact map

| Artifact                          | Purpose                                                            | Required decision                                     |
| --------------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------- |
| D0.1 Scope and Boundary           | Product mission, MVP, deferred scope, ownership, external boundary | What belongs inside SchoolOS?                         |
| D0.2 Context Diagram              | Actors, system, stores, workers, providers, deployment boundary    | Who and what interacts with the system?               |
| D0.3 Actors                       | Formal roles and external actors                                   | Who uses or affects each capability?                  |
| D0.4 Use Case Diagram             | Capability map by actor                                            | What can each actor do?                               |
| D0.5 Use Case Specifications      | Preconditions, flows, errors, postconditions                       | How does each important use case behave?              |
| D0.6 Activity Diagrams            | Workflow branches and decisions                                    | How does work move through the system?                |
| D0.7 Sequence Diagrams            | Cross-module and external interactions                             | Who calls whom, and when?                             |
| D0.8 State Diagrams               | Lifecycles for imports, marks, exams, users, documents             | Which transitions are legal?                          |
| D0.9 Data Flow Diagrams           | Level 0, 1, and 2 data movement                                    | Where does data originate and go?                     |
| D0.10 ER / Database Design        | Entities, relationships, keys, indexes, constraints                | What is persisted and how is integrity enforced?      |
| D0.11 Domain/Class Model          | Domain objects, behavior, invariants                               | Where does business behavior live?                    |
| D0.12 Component Architecture      | Frontend, API, modules, workers, stores, adapters                  | What deployable/runtime components exist?             |
| D0.13 Dependency Map              | Allowed module dependencies and cycles                             | Which modules may communicate?                        |
| D0.14 API Architecture            | Resources, requests, responses, errors, side effects               | What are the stable service contracts?                |
| D0.15 Auth Architecture           | Login, sessions, role resolution, authorization                    | How is access established and enforced?               |
| D0.16 File / Storage Architecture | Uploads, private files, generated artifacts, retention             | Where do bytes live and who can access them?          |
| D0.17 AI/OCR Architecture         | Providers, extraction, review, marks boundary                      | How does AI remain replaceable and non-authoritative? |
| D0.18 Notification Architecture   | Events, templates, channels, preferences                           | How are users informed without coupling providers?    |
| D0.19 Audit Architecture          | Events, provenance, old/new values, retention                      | What must be explainable later?                       |
| D0.20 Error Flows                 | User-safe errors, retries, fallbacks, recovery                     | What happens when each major path fails?              |
| D0.21 Security Architecture       | Threats, tenant isolation, upload/API/session security             | How is the system protected?                          |
| D0.22 Backup and Recovery         | RPO, RTO, backup, restore, failover, verification                  | How does the system recover?                          |
| D0.23 Deployment Architecture     | Environments, topology, scaling, migrations, rollback              | How is the system operated?                           |
| D0.24 UI/UX Architecture          | Screen map, design tokens, responsive/accessibility rules          | How do users navigate and work?                       |
| D0.25 Permission Matrix           | Actor x action x resource x scope                                  | Who may perform each operation?                       |
| D0.26 Integration Map             | Internal and external contracts                                    | Which dependencies are optional or replaceable?       |
| D0.27 Testing Architecture        | Unit, integration, API, UI, AI, security, performance, E2E         | How is each requirement proven?                       |
| D0.28 Final Review                | Traceability, gaps, decisions, plan lock                           | Is development safe to begin?                         |

## Cross-cutting packages

The following are mandatory inputs to the D0 artifacts rather than optional future notes:

- Requirements traceability matrix: requirement -> use case -> screen -> API -> entity -> test.
- Business rules catalog: academic, lifecycle, permission, transaction, and configuration rules.
- CRUD and permission matrix: create/read/update/delete/restore per actor and entity.
- Data lifecycle and retention: active, archived, soft-deleted, retained, and purged states.
- Versioning and history: marks, rules, templates, imports, settings, and corrections.
- Workflow governance: draft, submitted, review, approved, published, locked, reopened.
- Concurrency and idempotency: stale writes, duplicate requests, locks, retries, and conflicts.
- Import/export contracts: CSV, XLSX, PDF, printable output, and background jobs.
- Localization: English/Nepali, Unicode names, AD/BS dates, numerals, and bilingual documents.
- Accessibility and device strategy: keyboard, contrast, screen readers, desktop/tablet/mobile priorities.
- Connectivity policy: online-only MVP or explicit offline/sync scope.
- Event and notification contracts: domain events separated from delivery providers.
- Observability: logs, metrics, traces, queues, AI accuracy, cost, and alert thresholds.
- AI evaluation: labeled datasets, accuracy, false-match rate, correction rate, and thresholds.
- Resource/cost model: storage, AI usage, rendering, bandwidth, and tenant quotas.
- Capacity/performance targets: response times, import throughput, concurrency, and scale assumptions.
- Feature flags and configuration: school-specific capabilities without code forks.
- Migration and seed strategy: schema evolution, demo data, fixtures, and rollback.
- Privacy and retention: collection purpose, access, school exit, deletion, and sensitive artifacts.

## Plan-lock checklist

Before development resumes:

- scope and MVP boundary approved
- context, actors, use cases, and workflows reviewed
- business rules and lifecycle states approved
- ERD and domain model reconciled with the schema
- module dependencies and API contracts approved
- permissions mapped and tenant isolation proven on paper
- file, AI, notification, audit, and error boundaries defined
- security, privacy, retention, backup, and recovery decisions recorded
- UI/UX, accessibility, localization, and device policy recorded
- testing, performance, capacity, observability, and AI evaluation targets defined
- requirements traceability has no unowned requirement
- open risks have owners and mitigation plans
- D0.28 review approved

## Current position

- D0.1 Scope and Boundary: [d0-1-system-scope-boundary.md](d0-1-system-scope-boundary.md)
- D0.2 Context Diagram: [d0-2-system-context.md](d0-2-system-context.md)
- D0.3 Actors: [d0-3-user-actor-definition.md](d0-3-user-actor-definition.md)
- D0.4 Use Case Model: [d0-4-full-use-case-model.md](d0-4-full-use-case-model.md)
- D0.4 Full Use Case Catalog: [d0-4-use-case-catalog.md](d0-4-use-case-catalog.md)
- D0.4 Part 1 — Authentication & User Management: [d0-4-1-authentication-user-management.md](d0-4-1-authentication-user-management.md)
- D0.4 Part 2 — School & Organization Management: [d0-4-2-school-organization-management.md](d0-4-2-school-organization-management.md)
- D0.4 Parts 3–8: [remaining use-case modules](d0-4-3-to-8-remaining-use-case-modules.md)
- Master diagrams and cross-cutting traceability: [master-diagrams-and-traceability.md](master-diagrams-and-traceability.md)
- D0.4-D16 complete planning baseline: [d0-4-to-d16-complete-architecture-plan.md](d0-4-to-d16-complete-architecture-plan.md)
- Phase documents: [D0.5](d0-5-use-case-specifications.md), [D0.6](d0-6-business-rules.md), [D0.7](d0-7-requirements-traceability.md), [D0.8](d0-8-functional-scope.md), [D1](d1-business-process-design.md), [D2](d2-data-domain-design.md), [D3](d3-system-architecture.md), [D4](d4-security-access-design.md), [D5](d5-api-design.md), [D6](d6-ai-ocr-architecture.md), [D7](d7-marks-result-engine.md), [D8](d8-document-template-engine.md), [D9](d9-ui-ux-architecture.md), [D10](d10-notification-communication.md), [D11](d11-reporting-analytics.md), [D12](d12-performance-scalability.md), [D13](d13-reliability-recovery.md), [D14](d14-testing-strategy.md), [D15](d15-deployment-devops.md), and [D16](d16-final-architecture-review.md).
- Governing brief: [Master Project Specification](../requirements/master-project-specification.md)
- Plan lock: not reached; D0.4 and the remaining planning artifacts are in progress
- Next gate: continue D0.4 module-by-module, beginning with Academic Structure Management
- Production implementation: intentionally paused pending architecture freeze
- Final package: [Design-Freeze Package](../design-freeze/README.md)
