# SchoolOS — User-Centered Agile Discovery and Design

**Status:** Discovery plan; research and validation have not yet been performed. This document does not approve feature implementation or lift the Phase 13 NO-GO gate.

**Data availability:** The project owner reports that no school/user data is currently available. No real-data research or school-specific validation has been performed. Begin with the synthetic fixture below; keep field research pending until suitable participants and approved research arrangements are available.

## Purpose

Prepare a small, evidence-led first product increment for SchoolOS using user-centered design and iterative Agile delivery. The product direction is to support both manual school operations and AI-assisted work, with AI outputs remaining drafts until authorized human review. The first discovery focus is the marks-entry journey because it exercises teacher usability, school policy, permissions, audit, and the manual/AI distinction.

## Delivery approach

Use a dual-track approach:

- **Discovery track:** understand user tasks, validate needs, prototype the workflow, and keep the product backlog evidence-based.
- **Delivery track:** after the Phase 13 and architecture-freeze gates are explicitly passed, build one small, end-to-end increment at a time.

Discovery, documentation alignment, and prototype validation may proceed while the design gate remains open. Do not add feature endpoints, entities, schema, or product behavior before implementation is authorized.

After authorization, use short, time-boxed iterations (proposed: two weeks; adjust with the delivery team). Each iteration has one measurable user outcome, a prioritized set of ready stories, tested implementation, a user-facing demo, and a retrospective. Sprint length does not change the security, approval, traceability, or release gates.

## Discovery sprint: marks-entry workflow

### Participants

Recruit representative users from pilot schools where possible:

- teachers who enter or review marks;
- exam coordinators or school administrators who configure exams and permissions;
- principals or authorized approvers;
- students and guardians for the released-results journey, where appropriate.

Record participant roles and context without collecting unnecessary personal or student data. Use anonymized or synthetic marksheets and scenarios; do not upload real student records into research or prototype tools. Use the draft [recruitment and consent pack](./07-user-research-recruitment-and-consent.md) only after school and privacy/safeguarding review.

Participant count, school selection, consent, and scheduling are open operational decisions. Do not describe desk research or owner assumptions as user validation.

### Synthetic workflow fixture

Use this fictional scenario for requirements walkthroughs, paper prototypes, and later automated acceptance tests. It is not a real school, roster, grading policy, or user-research result.

| Fixture context            | Value                                                   |
| -------------------------- | ------------------------------------------------------- |
| School / academic year     | `SAMPLE-SCHOOL` / `SAMPLE-YEAR`                         |
| Class / section            | `SAMPLE-CLASS-07` / `SAMPLE-SECTION-A`                  |
| Exam / subject / component | `SAMPLE-EXAM-01` / `SAMPLE-MATH` / `SAMPLE-WRITTEN`     |
| Component maximum          | 100 (fixture-only value; not a proposed school default) |
| Operator / submitter       | `SAMPLE-TEACHER-01`                                     |
| Independent approver       | `SAMPLE-APPROVER-01`                                    |

| Fictional enrollment   | Roll reference | Fixture value/state | What the workflow should make clear                                |
| ---------------------- | -------------- | ------------------- | ------------------------------------------------------------------ |
| `SAMPLE-ENROLLMENT-01` | `R-001`        | 87                  | Ordinary numeric mark                                              |
| `SAMPLE-ENROLLMENT-02` | `R-002`        | 0                   | A present numeric zero, not an absence                             |
| `SAMPLE-ENROLLMENT-03` | `R-003`        | `ABSENT`            | Distinct status; do not rewrite as numeric zero                    |
| `SAMPLE-ENROLLMENT-04` | `R-004`        | `MISSING`           | Distinct status requiring the configured workflow                  |
| `SAMPLE-ENROLLMENT-05` | `R-005`        | `EXEMPT`            | Distinct status; do not invent a numeric mark                      |
| `SAMPLE-ENROLLMENT-06` | `R-006`        | `NOT_SUBMITTED`     | Distinct status; fixture does not decide result/publication policy |

For the upload-path walkthrough, create a fictional marksheet that proposes the same rows, with the `R-006` roll reference deliberately obscured and flagged as an unresolved match. The reviewer must see the source evidence and choose or correct a match; the system must not silently guess. Submission by `SAMPLE-TEACHER-01` cannot be approved by that same account. Until an independent authorized approval succeeds, official marks and published results remain unchanged. These are scenario checks, not evidence of implemented behavior.

The fixture contains labels and workflow states only—no real names, contact details, birthdays, production credentials, or actual student records. Keep it separate from any production data.

### Tasks to observe and validate

1. A teacher selects the academic year, class, section, exam, subject, and assessment component, then enters and corrects a roster of marks manually.
2. The teacher handles zero, absent, missing, exempt, and not-submitted cases without conflating their meanings.
3. The teacher uploads a supported marksheet, reviews extracted suggestions, resolves uncertain student matches and values, and submits a draft for approval.
4. A different authorized approver reviews and approves or returns a submission; the submitter cannot approve their own work.
5. An administrator configures a supported school policy or permission, and the interface makes clear who can change and release it.
6. A student or guardian finds a published result and understands its status without seeing draft or internal review data.

For each task, capture the user's goal, current workaround, sequence, confusion, errors, recovery needs, accessibility or language needs, and what information is required to trust the result. Record observed behavior separately from opinions and assumptions. Measure baseline task time and correction/review effort where feasible, but do not set product thresholds until representative evidence is collected and owners agree them.

### Prototype and validation

The first marks-entry low-fidelity prototype and a completed fictional desk walkthrough are documented in [08-marks-entry-low-fidelity-prototype.md](./08-marks-entry-low-fidelity-prototype.md). The walkthrough exposed policy/workflow questions and is not user research, usability validation, or implementation evidence.

The prototype covers:

- marks task/context selection and equal manual/upload entry choices;
- keyboard-friendly manual marks grid and status selection;
- upload processing and review grid with source evidence, confidence, validation errors, and student-match exceptions;
- submission, independent approval, return-for-correction, and audit/provenance feedback;
- permission-gated school policy configuration;
- released result view for student/guardian.

Run task-based usability sessions with representative users. Observe whether participants can complete tasks without coaching, distinguish official values from AI suggestions, identify unresolved blockers, and understand who can approve or configure. Revise the prototype and record unresolved usability risks. Prototype feedback is not security validation or domain-policy approval.

## Initial product backlog candidates

These are discovery candidates, not approved implementation stories. Refine and prioritize them from user evidence and the approved requirement baseline.

| Priority candidate           | User outcome                                                                                               | Acceptance focus                                                                                                                                                        |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Manual marks entry           | A teacher can enter, validate, save, and submit marks for an authorized exam context without AI or upload. | Keyboard operation; correct roster/context; explicit mark statuses; draft recovery; server-side scope and permission checks; actionable validation and conflict states. |
| AI-assisted marks review     | A teacher can upload a supported file and review every proposed value before submission.                   | No official mutation before approval; visible source evidence and uncertainty; explicit match/value correction; same validations and marks service as manual entry.     |
| Independent approval         | An authorized person other than the submitter can approve or return a submission.                          | Server-enforced separation of duties; decision reason/status; audit history; concurrency and stale-data handling.                                                       |
| School policy administration | An authorized school user can configure supported, versioned policy options.                               | Explicit school-scoped permission; server-side authorization; version history and audit; no student/guardian administration.                                            |
| Published result access      | A student or linked guardian can find only the appropriate released result.                                | Relationship and tenant isolation; no draft/internal data exposure; understandable publication/status language.                                                         |

## Definition of Ready

A story may enter implementation only after the architecture gate is GO and it has:

- a named actor and evidence-backed user need;
- a bounded outcome and explicit in-scope/out-of-scope behavior;
- testable acceptance criteria, including error, empty, loading, recovery, and accessibility states where applicable;
- permission, tenant, academic-scope, audit, and data-history requirements;
- links to its requirement, use case, business rule, API/data/UI contract, and tests;
- dependencies and migration/rollout implications identified;
- product and relevant school-domain approval for policy behavior.

## Definition of Done

A story is done only when:

- acceptance tests pass for allowed and denied actions, including tenant/scope isolation;
- required unit, integration, and end-to-end tests pass;
- manual and AI paths use the same official validation/marks services where applicable;
- no AI suggestion mutates official records before explicit human approval;
- audit, history, error handling, accessibility, and documentation are verified;
- traceability and feature status are updated with actual evidence;
- the increment is demonstrated and accepted by the relevant user/product owner.

Passing typecheck or building a screen alone is not evidence that a user workflow is done.

## Exit criteria for discovery

- Research notes distinguish observations, assumptions, and decisions.
- Priority tasks and user pain points are supported by evidence or explicitly marked unvalidated.
- A tested prototype and revised workflow are available for review.
- Candidate stories are prioritized, traceable, and meet the Definition of Ready or clearly list blockers.
- Product and school-domain owners record acceptance or remaining decisions.
- The Phase 13 remediation and architecture-freeze decision remain separately tracked; discovery does not imply GO.

## Immediate action register

- [x] Record that no school/user data is currently available; distinguish the synthetic design fixture from field evidence.
- [x] Walk through both marks-entry paths with the synthetic fixture; record design questions, not user-research findings.
- [ ] Identify pilot-school contacts and user-research participants when available; obtain school approval and consent using the reviewed [recruitment and consent pack](./07-user-research-recruitment-and-consent.md).
- [ ] Schedule task-based discovery sessions for teacher, approver/admin, and (where appropriate) student/guardian workflows.
- [ ] Capture current manual marks-entry and marksheet-import workflows, pain points, and baseline measures.
- [ ] Create and test the low-fidelity prototype; record findings and revisions.
- [ ] Convert validated needs into traceable, prioritized backlog stories.
- [ ] Reconcile all existing implementation/readiness claims against code, tests, and user acceptance evidence.
- [ ] Complete the independent Phase 13 re-audit and obtain explicit Architecture Freeze approval before feature coding.
