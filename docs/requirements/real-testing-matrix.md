# Real Testing Matrix for SchoolOS

## 1. Testing objective

This matrix defines the minimum real-world validation required before the system is considered ready for broader pilot or production use. It is organized around actual school workflows, distinct user roles, and explicit pass/fail evidence.

## 2. Test environment prerequisites

Before testing starts, the following environment must be available and stable:

- API service running with the current application code
- PostgreSQL database with seeded school data
- Redis available for session and queue behavior
- object storage configured for private file uploads and generated documents
- worker service active for background jobs
- AI/OCR service available for upload and review scenarios
- reverse proxy or local routing consistent with deployment config
- test credentials for all required roles

## 3. Test roles and required user coverage

| Role             | Required test coverage                                                     |
| ---------------- | -------------------------------------------------------------------------- |
| Platform admin   | platform-level control, cross-school safety checks, system health checks   |
| School admin     | school onboarding, settings, user roles, academic setup, people management |
| Principal        | approval, oversight, result publication decisions, audit review            |
| Teacher          | marks entry, review queue, class/subject scope enforcement                 |
| Student          | own record access, published results, notices, privacy restrictions        |
| Guardian         | linked-student access only, private document access rules                  |
| Support operator | maintenance and incident access under controlled conditions                |

## 4. Functional test matrix

| Module              | Test case                                     | User role                    | Pass criteria                                                |
| ------------------- | --------------------------------------------- | ---------------------------- | ------------------------------------------------------------ |
| Identity and access | login with valid credentials                  | all roles                    | user is authenticated and session is created                 |
| Identity and access | login with invalid credentials                | all roles                    | generic failure response; no sensitive data leak             |
| Identity and access | cross-school access attempt                   | teacher / student / support  | system denies access and logs the event                      |
| School setup        | create and update school settings             | school admin                 | settings are saved under correct tenant                      |
| School setup        | versioned configuration change                | school admin                 | new version is created and old config remains intact         |
| Academic structure  | create academic year, class, section, subject | school admin                 | records are created and scoped correctly                     |
| Academic structure  | teacher assignment scope                      | school admin / teacher       | teacher sees only assigned scope                             |
| Student lifecycle   | create student and guardian                   | school admin                 | record created and linked correctly                          |
| Student lifecycle   | enroll student into class and section         | school admin                 | active enrollment is valid and historical record is retained |
| Student lifecycle   | transfer or promote student                   | school admin                 | old record preserved and new status is correct               |
| Teacher lifecycle   | create and update teacher profile             | school admin                 | teacher is in correct school and scope                       |
| Exam workflow       | create exam and components                    | exam coordinator             | exam is configured and remains within school scope           |
| Marks workflow      | manual marks entry                            | teacher                      | marks saved only within assigned scope                       |
| Marks workflow      | invalid or out-of-range mark                  | teacher                      | mark is rejected with validation error                       |
| Marks workflow      | imported marks review                         | teacher / exam coordinator   | draft import remains pending until review approval           |
| Results             | calculate results                             | exam coordinator / principal | official calculation uses approved marks only                |
| Results             | approve and publish result                    | principal / school admin     | result transitions correctly and audit record is created     |
| Results             | reopen published result                       | principal / admin            | reason is required and prior state is preserved              |
| Documents           | create template and generate marksheet        | school admin / teacher       | only approved result can generate document                   |
| Documents           | verify document code                          | public or user               | verification only reveals minimal, approved status details   |
| AI review           | upload file and create review session         | teacher / exam coordinator   | upload is stored and review queue is created                 |
| AI review           | review extracted row                          | reviewer                     | approved or rejected decision is recorded with reason        |
| AI review           | reject incorrect import                       | reviewer                     | official records are not changed without approval            |
| Notices and reports | create and publish notice                     | school admin                 | notice is visible only to allowed audience                   |
| Dashboard           | school dashboard summary                      | admin / principal            | summary reflects current approved school data only           |
| Audit               | critical action logging                       | admin / principal / support  | audit entry records user, action, entity, and time           |

## 5. Security and privacy test matrix

| Test area        | Scenario                                                 | Expected result                                     |
| ---------------- | -------------------------------------------------------- | --------------------------------------------------- |
| Tenant isolation | user from school A accesses data from school B           | request is denied with no cross-school data leakage |
| RBAC             | teacher tries to change school config                    | forbidden with permission error                     |
| Data leakage     | student tries to access another student record           | denied                                              |
| File privacy     | generated or uploaded file is accessed without authority | denied and logged                                   |
| Audit integrity  | critical mutation occurs without record                  | test fails; system must log all sensitive changes   |
| Session control  | revoked session continues to work                        | no; session is invalidated                          |

## 6. Recovery and support test matrix

| Test area          | Scenario                                                    | Expected result                                                      |
| ------------------ | ----------------------------------------------------------- | -------------------------------------------------------------------- |
| Backup and restore | restore a school dataset from backup                        | recovery succeeds within configured RPO/RTO                          |
| Retention policy   | old student or document data expires                        | policy is enforced and audit is created                              |
| Incident response  | admin or support requests access under break-glass workflow | action is logged and approved under policy                           |
| Maintenance window | service is scheduled for maintenance                        | system stays in controlled state and user expectations are preserved |

## 7. Pass/fail gating rule

A project release is not considered testing-ready if any of the following remain open:

- a critical school workflow fails in staging or pilot
- tenant or role isolation fails
- audit trail is missing for a sensitive action
- AI-generated draft data becomes official without human approval
- marks or results can be published without required review
- file or document access violates the privacy boundary

## 8. Required evidence pack

Each major workflow must produce evidence before sign-off:

- test case ID
- user role and school context
- setup steps
- expected result
- actual result
- screenshot or API response log
- pass/fail status
- defect or follow-up ticket if failed

## 9. Final gate

The project may proceed beyond pilot or staging only after all critical user-role workflows, security validations, recovery checks, and evidence packs are documented and signed off by the responsible owner.
