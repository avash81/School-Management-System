# D1 — Business Process Design

## Canonical workflows

Student registration: validate identity → create student → optionally enroll → audit. Promotion/transfer end the old enrollment and create a new one; historical marks remain tied to their original enrollment.

Marks: draft → submit → review → approve → publish → lock. Rejection returns to draft with reason. Correction of published work requires a reasoned reopen and new history revision.

Import: upload → validate/store → queue → extract/match/validate → human review → approve → idempotent marks-engine import → complete. Failed jobs retry safely; ambiguous data never auto-commits.

Results: calculate from approved marks → review → approve → publish snapshot → queue outputs. Reopen creates a governed exception path.

## Activity/state artefacts

Detailed diagrams must be maintained for registration, attendance, manual marks, import, result publication, documents, and notices. Each diagram includes input, decision, system action, actor action, failure state, retry/cancel route, and audit event.

## Approval policy

Policies are tenant-configurable but use defaults: teacher submits; exam coordinator reviews; principal/school administrator approves exceptional cases. Small schools may combine roles only with explicit configuration and retained audit evidence.

## Completion criteria

Every lifecycle has legal/illegal transitions, owner, reason requirements, retry/rollback story, and matching UI/API tests.
