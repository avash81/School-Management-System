# D0.6 — Business Rules Catalog

## Identity and tenancy

- **BR-TEN-001:** all tenant-owned reads and mutations include the resolved `schoolId`; a missing or mismatched tenant is denied.
- **BR-ID-001:** only active, non-suspended, school-linked users may act.
- **BR-ID-002:** roles grant no access without a matching permission and resource scope.

## Student and academic structure

- **BR-STU-001:** admission number and academic ID are unique per school.
- **BR-STU-002:** at most one active enrollment exists per student and academic year.
- **BR-ACA-001:** a section belongs to its selected class and tenant; a subject offering references a valid year/class/section/subject/teacher assignment.
- **BR-ACA-002:** historical academic structures referenced by official results are retired, not destroyed.

## Marks and results

- **BR-MRK-001:** a present score is finite and between zero and that component's maximum.
- **BR-MRK-002:** absent, exempt, missing, and zero are distinct states.
- **BR-MRK-003:** lifecycle transitions are draft → submitted → reviewed → approved → published → locked; rejection and controlled reopen preserve history.
- **BR-MRK-004:** an actor cannot approve their own submission when segregation policy is enabled.
- **BR-RES-001:** calculations use approved marks and the grading configuration version selected by the exam.
- **BR-RES-002:** results publish only after approval and create immutable snapshots.

## Imports, documents, privacy

- **BR-IMP-001:** extraction is provisional; unresolved/invalid rows cannot create official marks.
- **BR-IMP-002:** import approval is idempotent and atomic for its accepted rows.
- **BR-DOC-001:** documents retain source/template versions and stay private by default.
- **BR-PRV-001:** students/parents see only their own/linked published information.

Each rule requires owner, rationale, enforcement layer, error code, and test ID in the traceability register.
