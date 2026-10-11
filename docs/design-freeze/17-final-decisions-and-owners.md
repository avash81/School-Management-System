# Freeze Gap 1 — Final Decisions and Owners

## Proposed baseline decisions

| Decision           | Baseline                                                                                                                                                                                                     | Owner required before production   |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------- |
| MVP release        | Identity/RBAC, school/academic setup, people/enrollment, exams, manual marks/results, marksheets, audit/files/reports; AI/OCR, portals, attendance, ID/admit/certificate, notifications are R1 behind flags. | Product + school-domain            |
| Approval policy    | Teacher submit → exam coordinator review → principal/school-admin approve; explicit role combination only for small-school policy.                                                                           | School-domain                      |
| Pilot              | One school; named admin, teacher, examiner, principal; representative exam workflow; approved data process.                                                                                                  | Product + pilot school             |
| Architecture       | Modular monolith API + worker + AI/OCR adapter; no microservice split without evidence.                                                                                                                      | Technical                          |
| Production vendors | Managed PostgreSQL, private object storage, Redis queue, secret manager, TLS, monitoring; OCR/PDF/notification provider selected by evaluation.                                                              | Technical + product                |
| AI release         | OCR cannot auto-write official marks; human approval required until measured policy safely permits otherwise.                                                                                                | Product + school-domain + security |

## Accountability

Product owner: scope/release/change approval. Technical owner: architecture/operations/security evidence. School-domain owner: rules/workflows/acceptance. Security/privacy owner: data handling/retention review. Pilot owner: test users/data/training. Names must be recorded before freeze; these roles are not assumed fulfilled by this design document.
