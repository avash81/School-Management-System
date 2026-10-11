# D0.4 — Full Use Case Model, Part 2: School & Organization Management

## Scope and tenant boundary

A school is an independent tenant. Its users, students, teachers, academics, examinations, results, templates, settings, files, and audit records belong to that school. A query or mutation must never cross a tenant boundary merely because identifiers happen to be known.

```text
Platform
  ├─ School A → own users, data, templates, settings
  ├─ School B → own users, data, templates, settings
  └─ School C → own users, data, templates, settings
```

## Actors

System administrator creates, suspends, and archives tenant organizations. School administrator manages only their authorized school configuration. Principal and explicitly authorized staff have configured read/approval access. Storage, renderer, notification, and audit services are secondary systems with bounded service authority.

## Use cases

| ID         | Use case                     | Primary actor                                    | Main flow                                                                                                             | Alternative/exception                                                   | Postcondition, permission, rules, data                                                               |
| ---------- | ---------------------------- | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| UC-SCH-001 | Create school                | System administrator                             | Enter tenant information → validate unique code/name policy → create school → create initial administrator → audit    | Duplicate code; initial-admin failure rolls back tenant setup           | Ready tenant with initial controlled access; `platform.schools.create`; School, User, Role, AuditLog |
| UC-SCH-002 | View school                  | School admin; principal; authorized staff        | Authorize tenant scope → load approved profile/current academic context/settings view                                 | Cross-tenant request is denied without disclosure                       | Tenant-scoped profile; `school.read`; School, AcademicYear, Settings                                 |
| UC-SCH-003 | Update school                | School administrator                             | Validate allowed profile fields → save revision → audit old/new values                                                | Invalid contact/logo reference; archived school disallows normal update | Updated profile/history; `school.update`; School, AuditLog                                           |
| UC-SCH-004 | Configure school             | School administrator                             | Choose configuration area → validate policy → version/save → audit                                                    | Invalid/incompatible setting; change affects active/published records   | Versioned school policy; `school.configure`; Settings, PolicyVersion, AuditLog                       |
| UC-SCH-005 | Manage logo                  | School administrator                             | Validate image type/size/scan → private store → set active logo → retain prior reference/history                      | Unsafe file/upload failure; renderer cannot access logo                 | Central authorized logo asset; `school.branding.manage`; Upload, SchoolBranding                      |
| UC-SCH-006 | Manage contact information   | School administrator                             | Validate official email/phone/website/emergency contact → save/audit                                                  | Invalid format; unauthorized field change                               | Current contact profile; `school.update`; SchoolContact, AuditLog                                    |
| UC-SCH-007 | Manage address               | School administrator                             | Enter validated country/province/district/municipality/ward/location/postal data → save/audit                         | Missing required local display fields                                   | Canonical structured address and document display form; `school.update`; SchoolAddress               |
| UC-SCH-008 | Manage general settings      | School administrator                             | Set language/timezone/date format/calendar/pagination/notification defaults → validate → version/audit                | Invalid timezone/date configuration                                     | Tenant preferences; `school.settings.manage`; SchoolSettings                                         |
| UC-SCH-009 | Configure academic settings  | School administrator                             | Configure academic years/classes/sections/subjects/calendar policy → validate references → activate governed versions | Retire/change conflicts with active or published work                   | Academic configuration ready; `academics.configure`; AcademicYear, Class, Section, Subject           |
| UC-SCH-010 | Configure grading system     | School administrator; exam coordinator delegated | Define grade bands/GPA mappings → validate non-overlap/coverage → version/activate                                    | Overlapping gaps; configuration already used by official result         | Versioned grading scheme; `grading.configure`; GradingScheme, GradingBand                            |
| UC-SCH-011 | Configure result rules       | School administrator; exam coordinator delegated | Define pass/component/absence/optional/rounding policy → validate → version/activate                                  | Incompatible with used blueprint; ambiguous policy                      | Versioned result policy; `results.configure`; ResultPolicy, AssessmentBlueprint                      |
| UC-SCH-012 | Configure marksheet settings | School admin; exam coordinator view/use          | Select approved marksheet template/version, defaults, signatures, locale → save                                       | Unsafe/unapproved/inactive template                                     | School document policy; `documents.configure`; TemplateVersion, DocumentSettings                     |
| UC-SCH-013 | Configure ID-card settings   | School administrator                             | Select approved ID template, field policy, barcode/QR validity policy → save                                          | Missing permitted photo/signature/fields                                | ID-card document policy; `documents.configure`; TemplateVersion, DocumentSettings                    |
| UC-SCH-014 | Configure document settings  | School administrator                             | Configure document types, templates, print/localization/signature/retention policy → audit                            | Active documents block destructive change                               | Central document configuration; `documents.configure`; DocumentSettings, TemplateVersion             |
| UC-SCH-015 | Manage school users          | School administrator                             | View/search/create/update/disable only tenant users → assign approved roles/scopes → audit                            | Attempt to manage foreign/platform account; role escalation denied      | Tenant-limited identity management; `users.manage`; User, UserRole, PermissionGrant                  |
| UC-SCH-016 | View school activity         | School admin; principal                          | Apply authorized tenant/time/entity filters → display redacted immutable activity                                     | Sensitive/cross-scope metadata omitted                                  | Explainable school operations; `audit.read`; AuditLog, JobHistory                                    |
| UC-SCH-017 | Archive school               | System administrator; school admin requests      | Confirm policy/retention/export → suspend normal operations → archive tenant → audit                                  | Legal hold/active recovery obligation; operation cancelled              | Archived tenant with retained history; `platform.schools.archive`; School, RetentionHold, AuditLog   |

## Configuration relationships

```text
(Configure school) <<include>> (Configure academic settings)
                     (Configure grading system)
                     (Configure result rules)
                     (Configure document settings)
                     (Audit configuration change)

(Manage school logo) <<include>> (Validate file) (Private store asset)
(Configure marksheet/ID card) <<include>> (Select approved template version)
(Manage school users) <<include>> (Authorize tenant) (Assign role/scope) (Audit change)
(Archive school) <<include>> (Confirm retention/export policy) (Suspend normal operations)
```

## Governing decisions

1. School-specific behaviour is configuration, not hard-coded subject or result logic. The configuration chain is `school policy → subject/assessment blueprint → exam configuration → marks/result engine`.
2. Store canonical dates as reliable date/time values; render AD/BS and language-specific representations from configuration. Never store display dates as arbitrary strings.
3. Grading, result rules, and templates are versioned. A revision already used by official results/documents remains historically available and cannot be silently mutated.
4. Logos, templates, and generated official files are private assets accessed through authorization, not public bucket URLs.
5. Archiving is a lifecycle state—not destructive deletion. It prevents ordinary operations while preserving records under retention and legal-hold policy.

## Data and audit requirements

Required data includes School, SchoolContact, SchoolAddress, SchoolSettings, SchoolBranding, AcademicYear, GradingScheme/Band, ResultPolicy, DocumentSettings, Template/TemplateVersion, User/Role/PermissionGrant, Upload/FileMetadata, AuditLog, and retention/archive state. Sensitive configuration and tenant lifecycle changes record actor, previous/new version/reference, reason where required, correlation ID, and outcome.

## Completion criteria

All subsequent academic, examination, result, document, notification, and portal modules must read tenant configuration through approved services and version references. The next D0.4 module is **Academic Structure Management**: academic year, term/semester, class, section, subject, subject type, and teacher assignment.
