# D0.4 — Full Use Case Model, Part 1: Authentication & User Management

## Scope

Authentication establishes identity; authorization resolves the user’s role, permissions, and resource scope before access. The governing model is:

```text
user → authentication → identity → role → permission → scope → allow/deny
```

No use case may authorize solely because a user has a job-title role.

## Actors

Primary actors: system administrator, school administrator, principal, teacher, examination staff, school staff, student, and parent/guardian. Secondary systems: notification provider and authentication/security services.

## Use cases

| ID              | Use case                | Primary actor                      | Outcome                                                            |
| --------------- | ----------------------- | ---------------------------------- | ------------------------------------------------------------------ |
| UC-AUTH-001     | Login                   | Any authorized user                | Authenticated session and scoped system access.                    |
| UC-AUTH-002     | Logout                  | Authenticated user                 | Current session invalidated and client state cleared.              |
| UC-AUTH-003     | Refresh/manage session  | Authenticated user/system          | Valid session continues; expired/revoked session requires sign-in. |
| UC-AUTH-004     | Forgot password         | Any user                           | Non-enumerating recovery request is created.                       |
| UC-AUTH-005     | Reset password          | Recovery-token holder              | Password changed; token and existing sessions revoked.             |
| UC-AUTH-006     | Change password         | Authenticated user                 | Own password changed after current-password validation.            |
| UC-AUTH-007     | Verify account          | New account holder                 | Account becomes active after approved verification.                |
| UC-AUTH-008     | Manage profile          | Authenticated user                 | Permitted personal fields updated.                                 |
| UC-AUTH-009     | Manage users            | Authorized administrator           | Scoped user administration workspace.                              |
| UC-AUTH-010     | Create user             | School/system administrator        | Tenant-scoped account, role, and scope created.                    |
| UC-AUTH-011     | Update user             | Authorized administrator           | Permitted identity/access fields revised and audited.              |
| UC-AUTH-012/013 | Disable/enable user     | Authorized administrator           | Account status changed while history remains intact.               |
| UC-AUTH-014     | Assign role             | Authorized administrator           | One or more policy-allowed roles linked to a user.                 |
| UC-AUTH-015     | Assign permission/scope | Authorized administrator           | Permission grant constrained to approved context.                  |
| UC-AUTH-016     | Manage roles            | Authorized administrator           | Standard/custom role definitions managed by policy.                |
| UC-AUTH-017     | View login history      | Authorized security administrator  | Scoped security-event history.                                     |
| UC-AUTH-018     | View audit activity     | Authorized administrator/principal | Scoped, redacted operational audit history.                        |

## Critical flows

### UC-AUTH-001 — Login

Preconditions: account exists, is active, linked to a permitted school/platform scope, and is not locked. Flow: user opens login → submits identifier and password → system validates credentials without account enumeration → resolves account/tenant → loads roles, permissions, and scopes → creates session → writes login event → redirects to role-appropriate dashboard. Invalid credentials remain on login with a generic error; throttled/locked accounts receive a safe recovery path. Passwords are never stored or logged in plaintext.

### Password and session use cases

Forgot password always returns the same safe response whether or not the account exists. A reset token is random, hashed at rest, single-use, short-lived, and invalidated on success. Password change requires the current password; reset/change revokes existing sessions according to policy. Logout revokes the current server session so a retained cookie/token cannot continue access.

### User/access administration

`Manage users` includes create, update, disable/enable, assign role, assign permission/scope, and access-history review. Create flow: select tenant/user type → validate details → assign allowed role(s) → assign scope → create/invite account → audit. Disabling preserves historical actions; it never silently deletes the user. Assignment changes such as teacher class/subject scope are sensitive and audited.

### Profile and verification

Users may change only allowed personal fields. Student identity/legal academic fields require school-administration policy; no profile self-service may alter official academic facts. New accounts enter pending verification until the configured approved mechanism succeeds.

## Relationships

```text
(Login) <<include>> (Validate credentials) (Resolve user/tenant)
        <<include>> (Load role) (Load permissions) (Load scope) (Create session)
(Forgot password) <<include>> (Create recovery token) (Notify user)
(Reset password) <<include>> (Validate token) (Hash password) (Revoke sessions)
(Manage users) <<include>> (Create user) (Update user) (Disable/enable user)
               <<include>> (Assign role) (Assign permission/scope) (Audit access change)
(View audit activity) <<include>> (Authorize history scope) (Redact sensitive metadata)
```

## Permissions, rules, and data

Permissions include `auth.self.*`, `users.read/manage`, `roles.manage`, `permissions.assign`, `security.loginHistory.read`, and `audit.read`, all scoped to platform or school as appropriate. Governing rules: role never bypasses scope; disabled/locked/archived accounts cannot act; administrator access changes are auditable; a teacher’s `MARKS_EDIT` right applies only to the exact assigned year/class/section/subject/exam context.

Data: User, Session, PasswordResetToken, UserRole, Role, Permission, PermissionGrant/Scope, School, TeacherAssignment, LoginEvent, AuditLog, and notification-delivery records.

## Completion criteria

This module is complete when its later activity, sequence, state, API, data, permission, UI, and security artifacts preserve these use cases and rules. The next D0.4 module is School & Organization Management.
