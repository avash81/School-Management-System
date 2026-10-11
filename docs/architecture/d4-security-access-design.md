# D4 — Security and Access Design

## Authentication

Use Argon2id password hashes, short-lived single-use hashed reset tokens, secure sessions, logout/revocation, account status checks, and rate limiting. Cookies are HttpOnly and Secure in production; CSRF is required whenever cross-site credential use is possible.

## Authorization

Every request is authorized before a resource is loaded: tenant → permission → resource/assignment scope → lifecycle rule. Queries carry `schoolId` and applicable year/class/section/subject/exam/relationship filters. Platform emergency access is approved, time-bound, minimally scoped, and prominently audited.

## Data/file protection

Validate size, MIME, magic bytes, checksums, and malware status before files are processable. Private files use authorized time-limited download access. Secrets use a secret manager; logs exclude passwords, tokens, and unnecessary student data.

## Audit and privacy

Append-only audit records include actor, school, action, entity/version, reason, correlation ID, outcome, and permitted metadata. Define collection purpose, access, retention, export, deletion, and school-offboarding procedures before production.

## HI-03 — Control Mapping Cross-Reference (2026-08-29)

This section maps the STRIDE/DREAD threat register in Document 09 §HI-03 onto concrete implemented controls, policies, and engineering conventions. The mapping is traceable: Control IDs match the `Control ID(s)` column of the threat register.

### CTL-01 Tenant Isolation (THR-01, THR-02)

- **01.1 — Authentication-context schoolId:** Every request receives `AuthenticatedUser.schoolId` only from `userContext()`; this value is authoritative and never overwritten by client params. All services receive `schoolId` as the **first** positional parameter and must use it as the top-level filter on every query.
- **01.2 — Composite find patterns:** All specific-row lookups use `findFirst({ where: { id, schoolId, deletedAt: null } })` or equivalent composite checks. `findUnique({ where: { id } })` with only `id` is FORBIDDEN for tenant-scoped data.
- **01.3 — Permission checks before data load:** `PermissionGuard` is `@UseGuards`-applied on all 11 controllers; `@RequirePermissions(PERMISSIONS.X)` decorates every endpoint.
- **01.4 — Cross-channel tests:** Penetration test suite covers 8 channels: UI, API, ID-manipulation, search, reports, doc-URLs, downloads, background jobs, imports, notifications. (Test file: `Document 22` HI-05 expansion sections)
- **01.5 — Search safety:** `StudentService.list()` and `.fts()` both inject `schoolId` filter before any OR/union/sub-queries. Empty search (`q=''`) returns no rows in FTS to avoid enumeration.

### CTL-02 Sessions & CSRF (THR-03, THR-04)

- **02.1 — Session revocation server-side:** `revoke()`, `revokeAll()`, `revokeSession()` update `revokedAt = NOW()`. `authenticate()` rejects rows where `revokedAt != null` or `expiresAt <= now()`.
- **02.2 — Cookie flags:** `HttpOnly: true`, `Secure: NODE_ENV===production`, `SameSite: lax|strict|none` via env `SESSION_SAME_SITE`. Cookie `path='/'`. Max age from `SESSION_TTL_DAYS*86400000`.
- **02.3 — Session value entropy:** Each login issues a new 32-byte `base64url` random value via `node:crypto.randomBytes`. Never reused across logins.
- **02.4 — Logout cookie clear:** `res.clearCookie(name, { path: '/' })`.
- **02.5 — CORS allowlist:** `CORS_ORIGINS` env (default 2 dev origins only). `credentials: true` only for those origins.
- **02.6 — CSRF defense-in-depth:** SameSite lax blocks cross-site POST form submissions; `require csrf: true` env flag for production rollout will add double-submit token pattern.

### CTL-03 Uploads & Files (THR-05)

- Controls 03.1–03.12 implement exactly the pre-write / post-write / access 3-phase pipeline from Master Plan §2048–2065:
  - 03.1 Type allowlist + extension/MIME/magic 3-way match
  - 03.2 Per-category size caps (csv≤25MB, photo≤5MB, pdf≤30MB)
  - 03.3 Page count cap (PDF ≤300 pages)
  - 03.4 Filename sanitization — path traversal chars rejected, slug-only basename
  - 03.5 Quarantine bucket, 14-day TTL
  - 03.6 SHA-256 hash dedupe
  - 03.7 Malware scan (ClamAV-compatible engine) before promotion
  - 03.8 CSV formula neutralization (`'=` prefix)
  - 03.9 PII leak review for OCR outputs
  - 03.10 Signed URL expiry ≤15min; never expose raw object store URLs
  - 03.11 Result download gate: published status + permission/owner check
  - 03.12 Retention: 7 years legal default, overridable per-school

### CTL-04 Password & Auth (THR-06)

- **04.1 Argon2id:** `@node-rs/argon2` with OWASP-aspirational params (documented in CR-02 as future `NFR-SEC-001`).
- **04.2 Generic error messages:** All auth branches return `"Invalid email or password."`
- **04.3 Reset tokens:** 32-byte random, single-use via `usedAt`, 30-min expiry, delete-all-prior-unused on each request.
- **04.4 Reset invalidates sessions:** `resetPassword()` resets password + marks token used + `updateMany({ revokedAt: NOW() })` on sessions.
- **04.5 Throttling + in-memory:** 4-tier Redis throttler + `AUTH_RATE_LIMIT_MAX` in-process per ip:email cooldown.

### CTL-05 Secrets & Key Management (THR-07)

- **05.1 Log redaction:** [redact.ts](file:///e:/Pro%20School/apps/api/src/common/utils/redact.ts) — 22 secret keys (password/Token/hash/Secret/…) + 15 PII keys (email/phone/address/Aadhaar/…). Recursive walk, depth 8. Matches lowercase variants and underscore/dash-insensitive.
- **05.2 LoggingInterceptor global:** [logging.interceptor.ts](file:///e:/Pro%20School/apps/api/src/common/interceptors/logging.interceptor.ts) — applied via `APP_INTERCEPTOR`; request/response/error levels; requestId correlation; redacted body/headers/query/params.
- **05.3 Source hygiene:** `.env.example` only has placeholders; `.env` is gitignored; husky pre-commit framework set up for future secret scanner integration.
- **05.4 Frontend no-hardcoding:** Admin UI `api-client.ts` uses `NEXT_PUBLIC_API_BASE` env only.
- **05.5 Production secrets manager:** Required for GO-live; compose secrets passed through `environment:` not baked into Dockerfile layers.

### CTL-06 Result Integrity & Approval (THR-08)

- **06.1 State machine (Document 32 §7):** Marks and Results use strictly-ordered state transitions with allowed status list whitelist in `transitionMarks` / `transitionResults`.
- **06.2 Self-approval gating:** `approval_policies.allow_self_approval = false` by default; explicit policy row required per school.
- **06.3 Snapshot immutability:** `transitionResults(status=published)` creates new `result_snapshot` with version++, JSONB snapshot, createdById.
- **06.4 Published-marks backdoor lock:** `enterMarks()` — when existing.status === `published`, throws BadRequestException requiring the correction workflow.
- **06.5 Grace policy math (POL-WGT-200-1):** Document 32 defines it as a parameterized policy; engine refuses to cross a failing component threshold even with grace.

### CTL-07 Injection & XSS (THR-09)

- **07.1 Prisma parameterized.** Raw string concatenation into SQL is forbidden by code review standard. All raw queries use `$queryRaw` with tagged parameters.
- **07.2 Validation stack:** Class-validator `ValidationPipe({ transform, whitelist, forbidUnknownValues})` global + `ZodValidationPipe` for auth endpoints. Length/type constraints on every free-text field.
- **07.3 Frontend sanitize:** UI must use safe rendering; DOMPurify or framework-equivalent before any `dangerouslySetInnerHTML`-equivalent operation.
- **07.4 Secure headers:** main.ts emits X-Content-Type-Options, X-Frame-Options DENY, Referrer-Policy strict-origin-when-cross-origin, Permissions-Policy disables cam/mic/geo.
- **07.5 Dependency/secret scan:** Husky hooks present; CI to enable `npm audit`, `trivy fs`, secret detection.

### CTL-08 Rate Limits & Availability (THR-10)

- **08.1 Global Throttler via APP_GUARD** in [app.module.ts](file:///e:/Pro%20School/apps/api/src/app.module.ts). 4 named tiers: default, auth-public, mutations, reads. Redis-backed for cluster consistency.
- **08.2 Login 15-min cooldown:** AuthService Map-based `attempts` keyed `ip:email` with 15-min reset-at.
- **08.3 Search caps:** FTS: limit ≤50, default=10, no-query returns empty. List: limit ≤100, default=20.
- **08.4 Background job queues:** Document 33 mandates that large result calculations (above threshold) queue through BullMQ worker with capped concurrency.
- **08.5 DB resiliency:** `waitForDatabase()` retries for 10s max with binary exponential backoff (100, 200, 400, 800, 1500, 1500, …ms). Exits non-zero on failure.

### CTL-09 Audit Integrity & Break-glass (THR-11)

- **09.1 Audit schema constraints (future M0-M5):** `audit_logs` table schema will remove `updatedAt`, `deletedAt` columns; UPDATE/DELETE grants revoked from `schoolos_app` DB role.
- **09.2 Separate audit DB role** for readers; application identity insert-only.
- **09.3 Break-glass grant row:** `support_access_grants` entity (Document 30a Domain E): grantedById, grantedToUserId, reason, expiresAt, revokedAt. Expiry ≤ 2 hours default.
- **09.4 Support-access audit tier:** Every action during session records module=SUPPORT_ACCESS + extra fields.
- **09.5 Import review task gating:** only users with IMPORTS_APPROVE can mutate `import_session.status='imported'`.

### CTL-10 Notifications & External Messaging (THR-12)

- **10.1 Authorized sender check:** notification create API requires the caller to have `targetUserId` target visibility permissions (scope check).
- **10.2 Content classification:** Notifications never carry raw marks, reset tokens, password links, or secrets. Payloads are summaries + auth-gated deeplinks.
- **10.3 Delivery idempotency:** `notification_deliveries` unique `(schoolId, channel, externalRef)`.
- **10.4 User preferences:** Check `notification_preferences` channel opt-out before dispatch.
- **10.5 Provider webhook signing:** Provider delivery receipts require signature verification before updating delivery status.
