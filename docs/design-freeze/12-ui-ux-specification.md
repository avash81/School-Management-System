# Document 12 — UI/UX Specification

## Design system

Use the approved teal design direction. Define semantic tokens for primary/surface/text/border/success/warning/error/focus, typography hierarchy, spacing, radius, shadows, icons, buttons, inputs, tables, cards, dialogs, empty/loading/error states. Status is never conveyed by color alone.

## Role surfaces

| Role             | Primary screens                                                                                            |
| ---------------- | ---------------------------------------------------------------------------------------------------------- |
| School admin     | dashboard, users, students, teachers, academics, exams, marks/results, documents, reports, settings, audit |
| Teacher          | dashboard, assignments, rosters, attendance, marks entry, upload/import review, permitted reports          |
| Exam coordinator | exam setup, components, imports/validation/approval, results, document jobs, reports                       |
| Principal        | oversight dashboard, approvals, results/reports/audit views                                                |
| Student/parent   | own/linked profile, attendance, published result, marksheet/document, notices                              |

## Interaction rules

Tables provide search/filter/sort/pagination/column visibility/bulk actions as authorized. Forms clearly show required fields, validation, draft/save/submit/cancel and conflict handling. Destructive/high-risk actions require clear confirmation, reason where required, and visible outcome/job progress. Portals never show draft/internal data.

## Accessibility/localization/responsive

Keyboard navigation, semantic labels, focus, contrast, screen-reader error summary, readable font scale, accessible tables, and mobile/tablet layouts are mandatory. Support Unicode/Nepali/English labels, AD/BS display, and locale-safe number/date/document rendering. Critical mobile flows: attendance, marks, upload/review, lookup, result view.
