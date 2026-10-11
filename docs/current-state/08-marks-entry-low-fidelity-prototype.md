# SchoolOS — Marks Entry Low-Fidelity Prototype

**Status:** Design artifact for walkthroughs only. This is not a production UI, an approved school workflow, a released policy, or evidence of user validation. It uses only the fictional fixture in [the discovery plan](./06-user-centered-agile-discovery.md). All displayed names/IDs are synthetic.

## Design goals

- Make manual entry and marksheet upload equally visible entry choices.
- Keep school, academic, exam, and component context explicit throughout the task.
- Make zero and non-numeric mark statuses unambiguous.
- Show the difference between an AI suggestion, a human-verified draft, an approved commit, and a published result.
- Make unresolved issues and safe next actions clear; never imply a hidden save or approval.
- Support keyboard-first entry, responsive layouts, readable error text, and status labels that do not rely on color alone.

## Flow map

```text
M1 Marks tasks
  -> M2 Confirm academic context
    -> M3 Choose entry method
       -> M4A Manual grid ----------------------┐
       -> M4B Upload and processing -> M5 Review grid
                                                |
       -> M6 Submission summary <---------------┘
             -> M7 Independent approval
                  -> M8 Commit outcome
                  -> Return for correction -> M4A or M5
```

The context screen appears before either entry route. Upload-derived context is only a suggestion; a mismatch blocks progression until the user explicitly selects a valid context.

## M1 — Marks tasks

```text
SchoolOS / Teacher                                      [Help] [Profile]

Marks
Choose a task

[ SAMPLE-EXAM-01 · SAMPLE-CLASS-07 · SAMPLE-MATH ]
  Entry open · 6 fictional enrollments
  [Open task]

Recent drafts
  No saved draft                                      [Empty state]

[Open task]
```

**Behavior**

- Both actions have equal visual weight and are available without an AI feature being configured.
- The displayed task list is server-filtered to the user's authorized school and teaching assignment. Do not expose unauthorized task names in empty/error messages.
- Selecting a task opens M2. If none is available, explain the permission/assignment issue without leaking other schools' data.

## M2 — Confirm context

```text
Marks task                                                Step 1 of 3

Academic year       SAMPLE-YEAR
Class / section     SAMPLE-CLASS-07 / SAMPLE-SECTION-A
Exam                SAMPLE-EXAM-01
Subject             SAMPLE-MATH
Component           SAMPLE-WRITTEN · maximum 100 [fixture only]

Roster               6 eligible fictional enrollments

[Change task]                                  [Continue]
```

**Behavior**

- Show the server-resolved context and eligible roster count before either entry mode.
- Context is identity-bound to server records; roll references are display aids, not the official mark identity.
- If context is no longer open, enrollment changed, or the user lost permission, stop and provide a refresh/reselect action. Never continue using stale scope.

## M3 — Choose entry method

```text
How would you like to enter marks?

+----------------------------------+  +----------------------------------+
| Enter marks manually             |  | Upload a marksheet               |
| Type or paste values in a grid.  |  | Get suggested values to review.  |
| Works without AI or a file.      |  | Suggestions are not official.    |
| [Enter manually]                 |  | [Upload marksheet]               |
+----------------------------------+  +----------------------------------+

Both methods use the same roster, checks, and approval process.
```

Choosing upload does not imply that every file type or handwritten document is supported. Show the configured supported types and limits before file selection.

## M4A — Manual marks grid

```text
SAMPLE-EXAM-01 / SAMPLE-MATH / SAMPLE-WRITTEN             Draft · Not official

Student enrollment       Roll ref.      Mark / status       Validation
SAMPLE-ENROLLMENT-01     R-001          [87             ]   Valid
SAMPLE-ENROLLMENT-02     R-002          [0              ]   Valid
SAMPLE-ENROLLMENT-03     R-003          [ABSENT       v ]   Policy outcome
SAMPLE-ENROLLMENT-04     R-004          [MISSING      v ]   Incomplete by default
SAMPLE-ENROLLMENT-05     R-005          [EXEMPT       v ]   Check exemption rule
SAMPLE-ENROLLMENT-06     R-006          [NOT_SUBMITTED v]   Incomplete by default

0 is a numeric mark. Choose a status only when no numeric mark is being recorded.
The stored status is distinct from its result consequence. Consequences follow a released
school policy; this prototype does not configure one.

[Save draft]   [Validate all]   [Submit for approval] (availability follows approved workflow)
```

**Interaction details**

- Keyboard flow: focus enters the first editable cell; Tab/Shift+Tab move between cells; arrow keys do not unexpectedly leave an active editor; Enter follows the documented grid behavior. Every control remains reachable without a pointer.
- A cell offers numeric entry or an explicit status selector, never both simultaneously. Changing between numeric mark and status requires clear replacement behavior; no silent conversion to zero.
- Paste, if supported, previews affected cells and rejects malformed/out-of-roster rows before applying. It must not change an unshown range of values.
- Save Draft preserves a resumable draft and does not create official marks. Show saved time and draft owner.
- A submit attempt reports all blocking cells in an accessible summary and moves focus to the first issue. Non-blocking policy questions remain visibly flagged.
- Distinguish mark-input validation from result eligibility. For example, `NOT_SUBMITTED` is incomplete by default for result approval/publication; do not imply that the mark cell is an invalid numeric value or silently convert it. Whether a submission containing that status may be submitted/approved as a marks batch must follow the reconciled workflow contract.
- The fixture's maximum of 100 is illustrative only; real bounds come from the authorized assessment configuration.

## M4B — Upload and processing

```text
Upload marksheet                                             Step 2 of 3
Selected context: SAMPLE-YEAR / SAMPLE-CLASS-07 / SAMPLE-EXAM-01

Choose a file: [Browse files]
Supported for this workflow: [configured types and limits]

[Cancel]                                           [Upload privately]

After upload:
File received -> Safety checks -> Extracting suggestions -> Review required
```

**Behavior and failure states**

- Validate size, allowed type, file signature, access rights, and configured security scan before processing; show a safe actionable failure without exposing internal storage paths.
- Do not place files in public storage or include raw file contents in logs.
- Show progress and permit safe retry/resume only as defined by the job contract. An upload or extraction failure does not create or alter official marks.
- If the type is unsupported or processing fails, explain why when safe and offer **Enter manually** using the same confirmed context.
- If the file suggests a different class/exam/subject, pause and require a deliberate context correction; never silently switch the task.

## M5 — AI review grid

```text
Review extracted suggestions                         Suggestions · Not official
Context: SAMPLE-YEAR / SAMPLE-CLASS-07 / SAMPLE-EXAM-01
File: SAMPLE-MARKSHEET-01.pdf · page 1

Row / source       Proposed enrollment   Component value    Confidence   Check
row 1 / cell C2    SAMPLE-ENROLLMENT-01   87                 High         Review
row 2 / cell C3    SAMPLE-ENROLLMENT-02   0                  High         Review
row 3 / cell C4    SAMPLE-ENROLLMENT-03   ABSENT             Medium       Review
row 4 / cell C5    SAMPLE-ENROLLMENT-04   MISSING            Low          Review
row 5 / cell C6    SAMPLE-ENROLLMENT-05   EXEMPT             Medium       Review
row 6 / cell C7    No match               12                 Low          BLOCKED

Selected row evidence
Page 1 · Row 6 · Column C
Source excerpt: [cropped/positioned evidence, with privacy-safe rendering]
Suggested match: None
Choose enrollment: [Select from eligible roster]
Correct value/status: [Edit]

[Save review draft]   [Revalidate]   [Submit for approval] (workflow/policy gated)
```

**Interaction details**

- Each extracted row remains inspectable, including suggested match, value/status, validation result, confidence explanation where available, and source location.
- Low-confidence values, ambiguous identity matches, out-of-range values, conflicts, and missing required data are individually reviewable and block submission until resolved under the contract.
- Batch confirmation is available only for an explicit set of visible rows with their values and matches shown. It never includes hidden rows or blocking exceptions.
- User corrections retain the original suggestion and provenance and trigger revalidation. Do not overwrite the source extraction.
- The deliberately obscured `R-006` fixture row has no automatic match. The user must select an eligible enrollment or exclude/resolve the row according to an explicit workflow; name-only guessing is not permitted.
- The `MISSING`, `ABSENT`, `EXEMPT`, `NOT_SUBMITTED`, and numeric `0` values remain distinct. Policy-dependent issues are labeled as such and are not silently decided by the prototype.
- Submission eligibility is not inferred from OCR confidence or from an "all rows reviewed" label. Apply the same reconciled marks workflow and released policy as the manual path.

## M6 — Submission summary

```text
Ready to submit for approval?                         Draft · Not official

Context: SAMPLE-EXAM-01 / SAMPLE-MATH / SAMPLE-WRITTEN
Rows included: [count]
Blocking input/workflow issues: [count]
Result eligibility under released policy: [eligible / incomplete / review required]
Source: Manual entry / SAMPLE-MARKSHEET-01.pdf

Submitting sends this draft to an authorized approver.
It does not publish a result or marksheet.

[Back to review]                              [Submit for approval]
```

At command time the server rechecks actor, school, assignment, exam state, policy version, row eligibility, submission revision, and concurrent mark changes. A failed check returns a conflict with a safe reload/review action; it never overwrites newer official values.

After submission, show a receipt with a stable submission reference, timestamp, status, and next step. Avoid success wording that suggests official marks are already committed.

If no released policy/workflow version exists for the fictional context, stop the prototype walkthrough at a saved draft. Do not invent a runtime default or show an approval/commit outcome. A test fixture may be used to explore screens only when prominently labeled non-production and versioned as a fixture.

## M7 — Independent approval

```text
Pending approval · SAMPLE-EXAM-01 / SAMPLE-MATH
Submitted by: SAMPLE-TEACHER-01
Submitted: [fixture timestamp]

Summary: [row counts, changed values, exceptions, source provenance]
[Review all rows] [View audit history]

[Return for correction] [Approve and commit]
```

- If the current approver is the submitter, hide/disable the decision controls and explain that an independent authorized approver is required. The server must reject self-approval regardless of UI.
- Approval requires current permission and matching school/academic scope; the approver can inspect the full submission and exceptions.
- Return-for-correction requires a reason and identifies affected rows. The submitter receives a correction state; a returned revision is not official.
- Approval is a confirmation for a server-side marks-service commit. A distinct commit result is shown only after the transaction succeeds.

## M8 — Commit outcome

```text
Approved and committed
Submission: [reference] · Revision: [number]
Committed by: SAMPLE-APPROVER-01
Official marks updated: [count]
Result publication: Not performed

[View marks task] [View audit history]
```

If commit fails, show **Approval not completed** or **Review required** according to the actual server result, with a retry/reload path that does not duplicate the command. Never show a success state before commit confirmation.

## Scenario walkthrough and acceptance checks

Use this checklist in a paper/prototype walkthrough and later convert it into executable tests after implementation is authorized.

| ID    | Scenario                                                             | Expected prototype behavior                                                                                 |
| ----- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| PX-01 | Open a fictional assigned marks task.                                | Context is explicit; both entry methods are equally discoverable.                                           |
| PX-02 | Enter numeric `87` and numeric `0`.                                  | Both remain numeric values; zero is not styled or described as absence.                                     |
| PX-03 | Choose `ABSENT`, `MISSING`, `EXEMPT`, and `NOT_SUBMITTED`.           | Each remains a separate visible state; policy-dependent outcomes are not inferred or silently converted.    |
| PX-04 | Attempt submission with a required value or invalid mark unresolved. | Submission is blocked; an accessible summary and row-level explanations identify fixes.                     |
| PX-05 | Upload the fixture file with obscured `R-006`.                       | The row remains unmatched and blocked; source evidence is visible; there is no silent identity guess.       |
| PX-06 | Correct an AI-suggested value or match.                              | Original suggestion/provenance remains available; edited data is revalidated.                               |
| PX-07 | Choose manual entry after upload failure.                            | User can continue in the same valid context without AI or upload.                                           |
| PX-08 | Submit the draft.                                                    | Receipt says pending approval/not official; publication is not implied.                                     |
| PX-09 | Submitter attempts own approval.                                     | UI explains independent approval; server-side rejection is required in implementation tests.                |
| PX-10 | Different authorized approver approves.                              | Commit success is shown only after successful official-service commit; result publication remains separate. |
| PX-11 | Marks change after draft creation.                                   | Stale revision is identified and requires refresh/re-review; no silent overwrite.                           |
| PX-12 | User lacks assignment/school permission or task closes.              | No protected data is disclosed; command is blocked with a safe recovery path.                               |

## Synthetic walkthrough record — desk review only

**Method:** author walkthrough against the fictional fixture and the documented hybrid workflow. No users, school data, production service, or running UI were involved. This is a design inspection, not usability validation or implementation evidence.

| Check                                | Desk-review result                    | Design note                                                                                                                                                         |
| ------------------------------------ | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PX-01 manual and upload entry parity | Pass in the text flow                 | Both are shown with equal prominence after shared context selection.                                                                                                |
| PX-02 numeric zero vs. mark          | Pass in the text flow                 | `0` is explicitly numeric and distinct from `ABSENT`.                                                                                                               |
| PX-03 distinct statuses              | Partial                               | The statuses are displayed separately; their submission eligibility is intentionally not decided by this prototype.                                                 |
| PX-04 blocking validation            | Partial                               | Accessible error summary and row feedback are specified, but exact requiredness and submission behavior depend on the reconciled assessment/workflow policy.        |
| PX-05 unresolved match               | Pass as a design requirement          | The row is blocked from confirmation and requires explicit resolution; production matching behavior remains unverified.                                             |
| PX-06 correction provenance          | Pass as a design requirement          | Original suggestion is retained and edits trigger revalidation; persistence needs implementation tests.                                                             |
| PX-07 manual fallback                | Pass in the described flow            | Upload failure returns to the same confirmed context for manual entry.                                                                                              |
| PX-08 pending vs. official           | Pass in the described flow            | Submission receipt does not claim official commit or publication.                                                                                                   |
| PX-09 self-approval                  | Pass as a design requirement          | UI explanation is paired with mandatory server-side rejection; enforcement needs tests.                                                                             |
| PX-10 approval/commit separation     | Needs wording/contract reconciliation | The approver command may authorize a commit, but the UI must show commit success only after the official transaction succeeds. Result publication remains separate. |
| PX-11 concurrency                    | Pass as a design requirement          | Stale revisions require reload/re-review; implementation behavior is unverified.                                                                                    |
| PX-12 denied/stale access            | Pass as a design requirement          | Safe denial and recovery are described; endpoint/file/job enforcement needs security tests.                                                                         |

### Findings and required refinements

1. **Separate cell validity from result readiness.** A non-numeric status may be a valid mark record while making a result incomplete or policy-dependent. UI labels must not conflate these outcomes.
2. **Do not enable submission from a hard-coded row count or generic "zero errors" check.** The exact submission gates depend on the released marks/approval policy and must be reconciled across API, state, and business rules.
3. **Avoid claiming `MISSING` always needs a teacher correction.** CR-04 treats it as a data-problem status and an incomplete outcome by default; whether it can be submitted for approval, and what action clears it, remains a policy/workflow decision.
4. **Keep the obscured-roll row visibly unresolved.** A confidence score cannot authorize an identity match; unresolved match blocks that row from confirmation.
5. **Do not show approval success before commit confirmation.** Treat approval authorization, successful official marks commit, and result publication as distinct states/events.
6. **Stop at draft when no released policy fixture is selected.** The example statuses cannot be used to infer school defaults or demonstrate an official commit.

These findings are design questions/refinements from a fictional desk review only. They do not establish that representative users understand the screens or that the implementation meets the requirements.

## Open design questions (do not assume answers)

- Which school-approved mark statuses are allowed at each assessment component, and which require a reason?
- For each status, what is the distinction between a valid mark record, a submittable batch, an approvable mark submission, and a result eligible for approval/publication?
- Are drafts saved automatically, manually, or both, and what recovery guarantees are required?
- Which file types, size limits, and scan/processing states are supported in the first release?
- Does every marks submission require an independent approver, or is this selected by a released school policy? Self-approval remains prohibited where independent approval applies.
- Is approval a single atomic command that commits official marks, or a distinct approval followed by commit transition? The UI must reflect the reconciled state machine and actual transaction boundary.
- What language, Nepali/English labels, calendar display, and low-bandwidth behavior should the first target schools require?
- Which policy-dependent statuses block submission versus approval/publication? The approved, versioned school policy must decide; this prototype makes no default.

Resolve these questions through the approved requirement/policy process before they become implementation assumptions.
