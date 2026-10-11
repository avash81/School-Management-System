# SchoolOS Master Development Plan

This plan is the implementation order after the M1 architecture review. Each phase must finish its focused tests and documentation before the next phase expands the surface.

The locked visual direction is documented in [ui-brand-direction.md](../architecture/ui-brand-direction.md). The initial teal/light-gray palette is approved for the implementation design system.

## D0 System Design Phase

The project is now in planning-only mode. The D0 blueprint must be completed before development resumes:

```text
D0.1 Scope -> D0.2 Context -> D0.3 Actors -> D0.4 Use Cases
-> D0.5 Specifications -> D0.6 Activities -> D0.7 Sequences
-> D0.8 States -> D0.9 Data Flows -> D0.10 ERD -> D0.11 Domain Model
-> D0.12 Components -> D0.13 Dependencies -> D0.14 APIs
-> D0.15 Auth -> D0.16 Storage -> D0.17 AI/OCR -> D0.18 Notifications
-> D0.19 Audit -> D0.20 Errors -> D0.21 Security -> D0.22 Recovery
-> D0.23 Deployment -> D0.24 UI/UX -> D0.25 Permissions
-> D0.26 Integrations -> D0.27 Testing -> D0.28 Final Review
-> PLAN LOCK
```

D0.1 is documented in [d0-1-system-scope-boundary.md](../architecture/d0-1-system-scope-boundary.md). D0.2 is documented in [d0-2-system-context.md](../architecture/d0-2-system-context.md). The next artifact is D0.3 User and Actor Definition.

The complete D0 artifact map and plan-lock checklist are in [d0-system-design-index.md](../architecture/d0-system-design-index.md).

## After architecture freeze

Development is deliberately separate from planning. The approved delivery gates, module order, pilot-school process, and version roadmap are in [post-architecture-delivery-roadmap.md](post-architecture-delivery-roadmap.md). No application implementation starts until the D16 architecture freeze is approved.

## Phase 0: Release baseline

1. Add a test runner and API test utilities.
2. Add unit tests for grading, marks validation, absent handling, and student matching.
3. Add tenant-isolation and permission test fixtures.
4. Apply and verify Prisma migrations in development.
5. Resolve the formatting baseline and keep `format:check` in CI.

## Phase 1: Identity and authorization

1. Apply `PermissionGuard` and permission decorators to mutation and sensitive read endpoints.
2. Define administrator, staff, teacher, parent, and student permission matrices.
3. Add authorization and cross-school access tests.
4. Add session lifecycle tests for login, logout, expiry, reset, and throttling.

## Phase 2: School and people operations

1. Finish school setup validation and role administration UI.
2. Finish student CRUD/profile editing and enrollment transitions.
3. Add real CSV/Excel parsing, column mapping, duplicate review, error reports, and batch import jobs.
4. Finish teacher assignments and teacher-specific access filtering.

## Phase 3: Examination and result engine

1. Extract calculation, grading, pass/fail, and ranking logic into tested pure services.
2. Complete marks lifecycle transitions and correction audit records.
3. Complete result calculation, approval, publication, and immutable snapshots.
4. Add integration coverage from student enrollment through published result.

## Phase 4: Document engine

1. Define generic document types and template version entities.
2. Implement variable, nested collection, and conditional rendering with allowlisted variables.
3. Add HTML/PDF renderer abstraction and private object-storage contract.
4. Move bulk generation to BullMQ jobs with progress, retry, failure items, and ZIP packaging.
5. Add document permissions, verification, and generation integration tests.

## Phase 5: Dashboard, reports, and notices

1. Add role-specific dashboard projections.
2. Add report filters and database-side aggregations.
3. Add export job contracts for CSV, Excel, and PDF.
4. Add notice scheduling, expiry processing, attachment authorization, and permissions.
5. Add dashboard/report/notice integration tests.

## Phase 6: Operational hardening

1. Add upload MIME/size/content validation and malware scanning integration.
2. Add distributed rate limiting backed by Redis.
3. Add structured request/job metrics and alerting.
4. Automate encrypted PostgreSQL backups and restore verification.
5. Run load tests for student search, dashboard, reports, imports, marks, and document jobs.
6. Add staging deployment and smoke-test workflows.

## Phase 7: M1 release

1. Apply migrations in staging.
2. Run the full unit, integration, E2E, security, and load suites.
3. Verify the deployment checklist and rollback procedure.
4. Pilot with one school and record acceptance findings.
5. Only then mark M1 implemented and begin M2 implementation.

## M2 boundary

M2 receives structured, reviewed import records and sends them to the existing marks engine. It must not create a parallel marks or result database. The minimum M2 pipeline is:

```text
Upload -> classify -> extract -> match -> validate -> human review -> marks engine
```

The first M2 architecture specification is [M2.1 AI/OCR Document Processing](../architecture/m2-1-ai-ocr-processing.md). M2.2 should implement secure upload and processing-job contracts before any OCR provider integration.

M2.2 architecture is documented in [m2-2-file-upload-processing.md](../architecture/m2-2-file-upload-processing.md). The next architecture milestone is M2.3 OCR and table detection.

M2.3 architecture is documented in [m2-3-ocr-table-detection.md](../architecture/m2-3-ocr-table-detection.md). The next milestone is M2.4 student and marks extraction.

M2.4 architecture is documented in [m2-4-student-marks-extraction.md](../architecture/m2-4-student-marks-extraction.md). The next milestone is M2.5 student matching.

M2.5 architecture is documented in [m2-5-student-matching.md](../architecture/m2-5-student-matching.md). The next milestone is M2.6 confidence and validation.

M2.6 architecture is documented in [m2-6-confidence-validation.md](../architecture/m2-6-confidence-validation.md). The next milestone is M2.7 human review.

M2.7 architecture is documented in [m2-7-human-review-interface.md](../architecture/m2-7-human-review-interface.md). The next milestone is M2.8 automatic marks import.

M2.8 architecture is documented in [m2-8-automatic-marks-import.md](../architecture/m2-8-automatic-marks-import.md). The next milestone is M2.9 bulk processing and queues.

M2.9 architecture is documented in [m2-9-bulk-processing-queues.md](../architecture/m2-9-bulk-processing-queues.md). The next milestone is M2.10 AI error handling and safety.
