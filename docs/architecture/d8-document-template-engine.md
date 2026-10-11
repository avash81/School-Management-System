# D8 — Document and Template Engine

## Template model

Templates are tenant-owned, versioned, reviewed/approved, and activated deliberately. Use a restricted schema/DSL with allowlisted variables and collections; do not execute arbitrary template scripts or server-side code. Template versions are immutable after use.

## Document flow

Authorize source → choose approved template → save generation request with source/template revisions → queue renderer → produce artifact → checksum/private store → record history → permit authorized download. The same pipeline supports marksheets, ID cards, admit cards, certificates, reports, and notices with declared page/print/localization settings.

## Verification and batches

Verification codes are opaque, rate-limited, and return only minimal authenticity/status. Batch work creates traceable per-document jobs, supports partial failure reporting and retry, and never gives a user an archive containing records outside their scope.
