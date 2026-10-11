# Document 01 — Final Software Requirements Specification

## Part 1: Foundation

**Status:** draft for design-freeze review.  
**Product:** Intelligent School Management, Examination, Marks, Result and Document Automation System (SchoolOS).  
**Authority:** the Master Project Specification and its linked architecture documents.

## 1. Introduction

SchoolOS is a secure, configurable, multi-school platform for managing academic and administrative records. It centralizes school configuration, people, academic structure, attendance, examinations, marks, results, documents, reporting, notifications, and governed student/parent access. Its differentiating capability is AI-assisted extraction of marks data from uploaded sources, always subject to validation and human control.

This SRS defines what the system must do and the quality constraints it must satisfy. It does not prescribe source-code implementation details or select a deployment vendor.

## 2. Problem statement

Schools commonly manage student identity, enrollment, attendance, examinations, marks, results, and official documents across manual registers, spreadsheets, paper marksheets, and disconnected tools. This causes duplicated data, slow marks entry, inconsistent calculations, weak change traceability, inaccessible history, and high risk when converting scanned/PDF marks into official records.

The system must reduce these risks without replacing human academic accountability. AI/OCR is an assistance mechanism, not an authority that writes official marks independently.

## 3. Vision

Provide a reliable school operations platform in which each school controls its own data, academic rules, workflows, users, templates, and settings; staff can complete examination and document work efficiently; students and guardians access only permitted published information; and the system remains auditable, recoverable, and expandable.

## 4. Objectives

1. Centralize authoritative, tenant-isolated academic and administrative records.
2. Make academic configuration, assessment structures, grading, results, and templates configurable and versioned.
3. Support safe manual and reviewed import-based marks workflows.
4. Produce correct, historically reproducible results and official documents.
5. Enforce backend authorization by identity, permission, tenant, academic/resource scope, and lifecycle state.
6. Preserve history, audit high-risk actions, protect private files, and support recovery.
7. Establish a modular foundation for later portals, communication, AI/OCR improvements, and new school domains.

## 5. Scope

### In scope

School/organization configuration; users, roles, permissions, scopes and audit; academic years/periods/classes/sections/subjects/offerings/assignments; students/guardians/enrollments/teacher records; examinations and configurable components; marks/review/approval/correction/locking; result calculation/versioning/publishing; marksheets and document-template foundation; files; reports/notices; private exports; background work; security, observability, recovery, and testability.

### Architecturally supported, phased delivery

Attendance, ID/admit/certificate documents, student/parent portals, email/SMS, bulk generation, AI/OCR marks import, advanced analytics, feature flags, and multi-school platform administration. Their release priority is decided only through the frozen MVP scope and pilot evidence.

### Out of scope for the core release

Fees/finance, library, transport, payroll, inventory, unrestricted public files, fully autonomous OCR mark import, and ungoverned cross-school access.

## 6. Stakeholders and actors

| Stakeholder/actor                | Interest and authority                                         |
| -------------------------------- | -------------------------------------------------------------- |
| Product owner                    | scope, priorities, design-freeze/change approval               |
| System administrator             | platform tenants, operations, controlled support               |
| School administrator             | school configuration, users, records, governed operations      |
| Principal/management             | oversight, configured approvals, performance reporting         |
| Exam/academic coordinator        | exams, marks review, results, document workflows               |
| Teacher                          | assigned teaching context, attendance, marks, reviewed imports |
| School staff                     | explicitly delegated administrative work                       |
| Student                          | own published profile/academic/document information            |
| Parent/guardian                  | verified linked-child published information                    |
| Technical/domain/security owners | architecture, implementation evidence, school rule acceptance  |

## 7. System overview

```text
School configuration → academic structure → people/enrollment/assignment
→ examination → manual or reviewed-import marks → approved marks
→ results → approved/published snapshots → documents/reports/portals
```

Interactive clients call a transactional API. The API owns authorization and official business changes. Durable jobs handle imports, OCR stages, rendering, exports, and notifications. Private storage holds source and generated artifacts. AI/OCR may return proposals/evidence only.

## 8. Assumptions and constraints

### Assumptions

- Each school nominates authorized administrators and academic approvers.
- Pilot schools provide approved, privacy-governed test data and representative workflows.
- Schools accept configurable policy defaults where their own written policy is unavailable.

### Constraints

- Data must be isolated by school tenant and protected under least privilege.
- Official academic history, audit evidence, and published outputs cannot be silently overwritten.
- Canonical date/time data remains machine-readable; Nepali/English and AD/BS are display/document concerns.
- The initial architecture remains a modular monolith with worker and AI/OCR boundaries unless future evidence requires change.
- Production vendor, legal policy, retention schedule, and final operational targets require named-owner approval before launch.

## Part 1 acceptance criteria

The problem, vision, objectives, scope, stakeholders, system boundary, assumptions, and constraints are unambiguous enough for the functional and non-functional SRS sections that follow. Conflicts are resolved in favour of the Master Project Specification and final cross-cutting controls.

## Next

**Final SRS Part 2:** functional, module, business, AI/OCR, security, reporting, document, localization, performance, recovery, and acceptance requirements.
