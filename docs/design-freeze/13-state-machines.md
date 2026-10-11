# Document 13 — Formal State Machines

| Entity       | Legal states/transitions                                                                                                                                               |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Account      | invited → pending verification → active → suspended/locked → archived; active can reset/session revoke; archived is non-operational                                    |
| Student      | applicant → admitted → active → promoted/transferred/graduated/dropped/expelled → archived; enrollment history appended                                                |
| Examination  | draft → scheduled → ongoing/marks-entry → submitted/review → approved → locked → published; governed reopen only                                                       |
| Mark         | draft → submitted → reviewed → approved → published → locked; rejected → draft; correction request → reopened → draft revision                                         |
| Result       | calculated → reviewed → approved → published → locked; reopened produces next revision before recalculation                                                            |
| Import       | uploaded → validating → queued → processing → extracted → validating → review-required/ready → approved → importing → completed; failed/rejected/cancelled/retry paths |
| Document     | requested → queued → rendering → generated → available → expired/revoked/archived; render failure → retry/failed                                                       |
| Notification | created → queued → sent → delivered → read; failed → retry/dead-letter                                                                                                 |
| Job          | queued → running → succeeded/failed/cancelled; retryable failure → queued; exhausted → dead-letter                                                                     |

Every transition validates actor permission, tenant/resource scope, predecessor state, reason/approval if required, revision, audit event, and external-job effect. State fields are not arbitrary UI-editable values.
