# SchoolOS — Code Reference: Classes, Functions, Components v0.1

**Generated:** 2026-08-28  
**Scope:** All files in `apps/` and `packages/` with code ownership, signature, behavior, current bugs, and links to source.

---

## 1. Repository Layout

```
e:\Pro School\
├── apps/                          ← Deployable runnable apps
│   ├── admin/                     ← Next.js 15, Staff/Admin Console (port 3002)
│   ├── ai-service/                ← Python 3.11, FastAPI OCR/AI service (port 8000)
│   ├── api/                       ← NestJS 11, REST Transactional Monolith (port 4000)
│   ├── web/                       ← Next.js 15, Student/Parent Portal (port 3000)
│   └── worker/                    ← BullMQ 5, Background Job Worker
├── packages/                      ← Reusable/shared libraries (14 packages)
│   ├── auth/  config/  constants/  database/  eslint-config/
│   ├── logger/  shared/  storage/  tsconfig/  types/  ui/
│   ├── utils/  validation/
├── infrastructure/                ← Docker, nginx, monitoring, scripts
├── docs/                          ← All architecture + design freeze + new current-state/
└── (root config files: package.json, turbo.json, pnpm-workspace.yaml, tsconfig.base.json, docker-compose.yml)
```

---

## 2. ROOT CONFIGURATION

### 2.1 `pnpm-workspace.yaml`

**File:** [pnpm-workspace.yaml](file:///e:/Pro%20School/pnpm-workspace.yaml)

```yaml
packages: ['apps/*', 'packages/*', 'infrastructure/*']
```

**Behavior:** Makes all three directories pnpm workspace members. Dependencies hoist correctly; uses workspace: protocol.

### 2.2 `turbo.json`

**File:** [turbo.json](file:///e:/Pro%20School/turbo.json)

| Task          | DependsOn    | Outputs                     | Cache         |
| ------------- | ------------ | --------------------------- | ------------- |
| `build`       | `^build`     | dist/**, .next/**, build/** | ✅            |
| `dev`         | —            | —                           | ❌ persistent |
| `lint`        | `^lint`      | —                           | ✅            |
| `test`        | `^build`     | —                           | ✅            |
| `typecheck`   | `^typecheck` | —                           | ✅            |
| `db:generate` | —            | —                           | ❌            |

**Behavior:** Enforces topological order (packages before apps that depend on them). Caching enabled except persistent dev and schema generation.

### 2.3 Root `package.json`

**File:** [package.json](file:///e:/Pro%20School/package.json)

| Script                                       | Behavior                                                                                    |
| -------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `pnpm dev`                                   | `turbo run dev --parallel` → starts ALL 5 dev servers at once (api, web, admin, worker, ai) |
| `pnpm build`                                 | `turbo run build` → topologically builds everything                                         |
| `pnpm lint` / `pnpm typecheck` / `pnpm test` | Run quality gates across workspaces                                                         |
| `pnpm format:check` / `pnpm format`          | Prettier                                                                                    |
| `pnpm db:generate`                           | Filter database package, run schema build + Prisma generate                                 |
| `pnpm db:push`                               | Filter database package, Prisma db push (schema push, no migration)                         |
| `pnpm prepare`                               | Husky install on `pnpm install`                                                             |
| `pnpm commitlint`                            | Validate last commit message per conventional                                               |

**Constraints:** engines `node >=20.11`, `pnpm >=9.0`. Package manager exact: `pnpm@9.15.0`.

### 2.4 `tsconfig.base.json`

**File:** [tsconfig.base.json](file:///e:/Pro%20School/tsconfig.base.json)

- Target ES2022, Module ESNext, ModuleResolution Bundler
- **`strict: true`** + **`noUncheckedIndexedAccess: true`** (important! Array indices are `T|undefined` at type-level)
- Path aliases for all 14 packages: `@schoolos/<pkg>` → `packages/<pkg>/src[/...]`

### 2.5 `.env.example`

**File:** [.env.example](file:///e:/Pro%20School/.env.example)
18 variables. **Bug:** `API_PORT="3001"` at L14 but code defaults to 4000. Admin UI always hits 4000 hardcoded.

### 2.6 `docker-compose.yml`

**File:** [docker-compose.yml](file:///e:/Pro%20School/docker-compose.yml)
6 services:

- **postgres:16-alpine** → healthcheck via `pg_isready` ✓
- **redis:7-alpine** → appendonly aof persistence ✓
- **minio/minio:latest** → console 9001, server 9000
- **minio/mc init job** → creates 7 buckets: student-photos, school-logos, report-cards, admit-cards, certificates, uploads, temp ✅
- **axllent/mailpit:latest** → SMTP 1025, web 8025 (email testing)
- **schoolos-ai-service** (build from apps/ai-service/Dockerfile) → ❌ bug: references `.env.development` (file DNE)

---

## 3. SHARED PACKAGES (14)

| Package                   | main/ts entry   | Exports / Key Functions                                                                                                                                                                                                                                                                                                 |
| ------------------------- | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@schoolos/database`      | `dist/index.js` | `prisma: PrismaClient` singleton with globalThis cache; exports type `Prisma`. Dev-only: schema build script at `scripts/build-schema.mjs` concatenates 11 domain `.prisma` files. Migrations: 5 folders in `prisma/migrations/0001*` to `0005*`. Seed script at `scripts/seed.mjs` (referenced, content not examined). |
| `@schoolos/validation`    | `src/index.ts`  | **`environmentSchema`** (NODE_ENV, DB, Redis, MinIO, JWT 32+ char), `userRoleSchema` (5 roles enum), `paginationSchema`, `loginSchema`, `forgotPasswordSchema`, `resetPasswordSchema`. Bug: not used in auth controller (redefined locally).                                                                            |
| `@schoolos/types`         | `src/index.ts`  | **`Brand<T,TBrand>`**, **`Id`**, **`Timestamped`** interface, **`ApiStatus`** (ok/degraded/error), **`HealthResponse`**. No domain types yet.                                                                                                                                                                           |
| `@schoolos/config`        | `src/index.ts`  | **`loadEnvironment(source=process.env)`** — parses via `environmentSchema`. **`getRequiredEnv(source,key)`** — throws `Missing required env var`. Never called in bootstrap (GAP-005).                                                                                                                                  |
| `@schoolos/auth`          | `src/index.ts`  | **`AuthTokenPayload {sub,role}`**. **`signAccessToken(payload, secret=process.env.JWT_SECRET)`** — HS256 jose, 15m expiry. **`verifyAccessToken(token,secret)`** — verifies + returns payload. **Never used** (API uses sessions). Potentially useful for service-to-service or future JWT bearer.                      |
| `@schoolos/logger`        | `src/index.ts`  | **`createLogger(serviceName)`** → Pino instance. LOG_LEVEL default info. Prod: raw JSON. Dev: pino-pretty colorized single-line=false. **Never wired into API.**                                                                                                                                                        |
| `@schoolos/storage`       | `src/index.ts`  | **`createStorageClient(source=process.env)`** → `S3Client` @aws-sdk/client-s3 v3. Endpoint=`http://MINIO_ENDPOINT:MINIO_PORT`; forcePathStyle=true; credentials env ACCESS/SECRET. Region hardcoded `us-east-1` (ok for MinIO). **Never used in services.**                                                             |
| `@schoolos/shared`        | `src/index.ts`  | 3 pure functions: **`assertNever(value: never)`** (exhaustive switch helper), **`range(size):number[]`**, **`isDefined<T>`** type guard. No issues.                                                                                                                                                                     |
| `@schoolos/utils`         | `src/index.ts`  | 1 function **`toTitleCase(string):string`**. Has 1 test in `index.test.ts` (vitest).                                                                                                                                                                                                                                    |
| `@schoolos/constants`     | `src/index.ts`  | Empty exports. Placeholder.                                                                                                                                                                                                                                                                                             |
| `@schoolos/ui`            | `src/index.ts`  | Empty exports. Placeholder. Tokens/components TBD per `ui-brand-direction.md` (approved teal/light-gray).                                                                                                                                                                                                               |
| `@schoolos/eslint-config` | —               | Shared ESLint package.                                                                                                                                                                                                                                                                                                  |
| `@schoolos/tsconfig`      | —               | Shared TS base.                                                                                                                                                                                                                                                                                                         |

---

## 4. BACKEND: `apps/api` (NestJS 11, Core Transactional Monolith)

### 4.1 Entry: `main.ts`

**File:** [main.ts](file:///e:/Pro%20School/apps/api/src/main.ts) — Line-by-line behavior:

```ts
L1:  import 'reflect-metadata'          // NestJS decorator polyfill
L12: CORS_ORIGINS env split by comma, default http://localhost:3000, 3002
L13: NestFactory.create with cors: { credentials: true }
L14: Global prefix 'api/v1'            // All endpoints under /api/v1/...
L15: GlobalPipes + ValidationPipe: transform:true, whitelist:true, forbidUnknownValues:true
       // Note: forbidUnknownValues has no effect without class-validator DTOs. Our code uses Records.
L16-L22: Middleware sets 4 security headers: X-Content-Type-Options nosniff, X-Frame-Options DENY,
         Referrer-Policy strict-origin-when-cross-origin, Permissions-Policy (camera/mic/geo off)
L23: Global Interceptor: RequestIdInterceptor (next file)
L24: Global Filter: ApiExceptionFilter (next file)
L26-L32: Swagger (DocumentBuilder) — Title 'SchoolOS API' v1.0, Bearer auth. Docs at '/docs'.
L34: PORT from API_PORT env, default 4000
L36: app.listen(port)
```

**Bugs:**

- Does not call `loadEnvironment()` at start → app starts with invalid env, crashes on first DB call.
- No `cookie-parser` middleware. Relies on header string splitting.
- No wait-for-postgres; race in dev with compose.
- No structured Pino logger wiring (uses default Nest console).

### 4.2 Interceptors & Filters (Global)

#### `RequestIdInterceptor`

**File:** [request-id.interceptor.ts](file:///e:/Pro%20School/apps/api/src/common/interceptors/request-id.interceptor.ts)

```ts
REQUEST_ID_HEADER = 'x-request-id'
intercept(ctx, next):
  requestId = incoming header OR randomUUID()
  set RESPONSE header x-request-id
  mutate request.headers[x-request-id] = requestId  (so downstream filters/services see it)
```

Used in `ApiExceptionFilter` to attach requestId to error payloads. ✅ Correct.

#### `ApiExceptionFilter`

**File:** [api-exception.filter.ts](file:///e:/Pro%20School/apps/api/src/common/filters/api-exception.filter.ts)

```
catch(exception, host):
  - If HttpException: status = exception.getStatus(); message = extract string or {message} property
  - Else: status 500, message "An unexpected error occurred" (no stack leak ✅)
  - Response body: { error: { code: `HTTP_${status}`, message, requestId } }
```

Note: Per CR-03 global contract, error codes should be domain-specific like `MARK_RANGE`, not generic `HTTP_422`. Backlog item.

### 4.3 `AppModule` & `AppController`

**File:** [app.module.ts](file:///e:/Pro%20School/apps/api/src/app.module.ts)
Imports 11 feature modules (no order enforced by DI). Note: `AuthModule` is marked `@Global()` so its providers are available everywhere without re-importing.

**File:** [app.controller.ts](file:///e:/Pro%20School/apps/api/src/app.controller.ts)

- `GET /api/v1/health` → `{data:{service:'api',status:'ok',uptime},meta:{}}` — unauthenticated ✅
- `GET /api/v1/readiness` → runs `prisma.$queryRaw` SELECT 1. Returns status ready/not_ready + database ready/unavailable. Unauthenticated ✅

---

## 5. AUTH MODULE (Global)

**Files:** [auth.module.ts](file:///e:/Pro%20School/apps/api/src/modules/auth/auth.module.ts), [auth.controller.ts](file:///e:/Pro%20School/apps/api/src/modules/auth/auth.controller.ts), [auth.service.ts](file:///e:/Pro%20School/apps/api/src/modules/auth/auth.service.ts), [auth.types.ts](file:///e:/Pro%20School/apps/api/src/modules/auth/auth.types.ts), [authentication.guard.ts](file:///e:/Pro%20School/apps/api/src/modules/auth/authentication.guard.ts), [permission.decorator.ts](file:///e:/Pro%20School/apps/api/src/modules/auth/permission.decorator.ts), [permission.guard.ts](file:///e:/Pro%20School/apps/api/src/modules/auth/permission.guard.ts)

### 5.1 `AuthService` (Largest, most critical)

**Session Constants:**

```
SESSION_COOKIE = process.env.SESSION_COOKIE_NAME ?? 'schoolos_session'
SESSION_TTL_DAYS = env ?? 30 → ms
```

**Exported helpers:**

- **`hashSecret(secret)`** — `sha256(secret).digest(hex)` — used to hash the opaque session/reset tokens. DB stores hashes only; raw secret only transmitted once to user via cookie/email ✅
- **`getSessionCookieName()`**
- **`sessionCookieOptions()`** — HttpOnly, Secure=prod only, SameSite (env default lax), Path /, MaxAge ms.

**Core methods:**

| Method                                                  | Signature                      | Behavior                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ------------------------------------------------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `login(email,password,{ip?,userAgent?})`                | → `{sessionId,secret,user}`    | 1. lowercase email. 2. `enforceRateLimit(ip,email)` check local Map. 3. Find user by normalized email, deletedAt null, status active. 4. `@node-rs/argon2.verify(passwordHash,password)`. 5. If fail: `recordFailure()`, audit LOGIN_FAILED, throw 401. 6. Else: clear attempt from map. 7. `randomBytes(32).base64url` = raw secret. 8. Create session row: refreshTokenHash=`hashSecret(raw)`, device/browser/ip, expiresAt. 9. Update user.lastLoginAt. 10. Audit LOGIN_SUCCESS. 11. Return sessionId + raw secret + userContext. **Bugs:** rate limit in-memory only; device split user-agent[0] is flaky. |
| `userContext(userId, sessionId)`                        | → `Promise<AuthenticatedUser>` | 5 sequential queries (user → userRoles → roles → rolePermissions → permissions). Maps to `{id,email,firstName,lastName,schoolId,roles:roleCode[],permissions:permCode[],sessionId}`. N+1; should use include().                                                                                                                                                                                                                                                                                                                                                                                                |
| `authenticate(secret)`                                  | → user context                 | findFirst session where refreshTokenHash === hashSecret(secret) AND revokedAt null; check expiresAt <= now → throw. Return `userContext(session.userId, id)`. Called by AuthenticationGuard.                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `revoke(secret, userId?)`                               | → void                         | Find session via secret hash. If matches userId check or null userId, set revokedAt=now. Audit LOGOUT.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `revokeAll(userId, exceptSessionId?)`                   | → void                         | updateMany sessions for user + revokedAt null + optional id!=except → set revokedAt. Audit SESSION_REVOKED.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `sessions(userId)`                                      | → Session[]                    | FindMany non-revoked non-expired, select safe fields, ordered desc createdAt.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `revokeSession(userId, sessionId)`                      | → void                         | updateMany matching id+userId+not revoked. Audit.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `requestPasswordReset(email)`                           | → void                         | lowercase email find user. Ignore if not found (constant-time exposure ✅). If found: delete all existing unused reset tokens. `randomBytes(32)` → create PasswordResetToken with hash + expiresAt 30min. Audit PASSWORD_RESET_REQUESTED. **Note:** The raw token is never returned/logged here (needs email sending step which is TBD — no email adapter yet).                                                                                                                                                                                                                                                |
| `resetPassword(token,password)`                         | → void                         | Find PasswordResetToken.unique by tokenHash. Check usedAt null, expiresAt valid. Tx: 1) hash password with argon2 → update user. 2) Mark reset usedAt=now. 3) Revoke ALL sessions for user (so attacker loses access if they had it). Audit PASSWORD_RESET. Correct and strong. ✅                                                                                                                                                                                                                                                                                                                             |
| `enforceRateLimit(ip,email)`                            | → void or throw                | `key=ip:email`. If Map entry exists AND count >= AUTH_RATE_LIMIT_MAX (default 10) AND resetAt > now → throw 401 Too many.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `recordFailure(ip,email)`                               | → void                         | Upsert count++ and resetAt = existing or Date.now()+15min.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `audit(userId?, schoolId?, action, message, metadata?)` | → void                         | Create audit_logs row.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |

### 5.2 `AuthController` (8 endpoints)

| Method + Route                 | Auth               | Logic                                                                                                                                                                 |
| ------------------------------ | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **POST /auth/login**           | public             | Body zod-parse loginSchema. Call `login()`. Set cookie of raw session secret. Return user public shape: `{id, name=first+last, email, schoolId, roles, permissions}`. |
| **POST /auth/logout**          | AuthenticatedGuard | Get raw cookie from header string split. `revoke(raw,req.user?.id)`. ClearCookie with path '/'.                                                                       |
| **POST /auth/logout-all**      | AuthGuard          | RevokeAll except current sessionId.                                                                                                                                   |
| **GET /auth/me**               | AuthGuard          | Return publicUser(req.user)                                                                                                                                           |
| **GET /auth/sessions**         | AuthGuard          | `auth.sessions(userId)`                                                                                                                                               |
| **DELETE /auth/sessions/:id**  | AuthGuard          | `auth.revokeSession(userId, id)`                                                                                                                                      |
| **POST /auth/forgot-password** | public             | zod parse email → `requestPasswordReset(email)` — return same message regardless ("If an account exists...") ✅ no user enumeration                                   |
| **POST /auth/reset-password**  | public             | zod parse token+password → `resetPassword(token,password)` → success:true                                                                                             |

### 5.3 Guards

| Guard                                     | Behavior                                                                                                                                                                                                                            |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AuthenticationGuard`                     | Implement CanActivate. Grab cookie from headers.cookie string split → find session cookie value. If missing: throw 401 Auth required. Call `auth.authenticate(cookie)` → if ok set `request.user = AuthenticatedUser`. Return true. |
| `PermissionGuard`                         | Implement CanActivate. Use Reflector to get `REQUIRED_PERMISSIONS` string[] from handler or class decorator. If user has all: pass. Else: throw 403 Forbidden. **Never applied to any controller currently.**                       |
| `@RequirePermissions(...codes)` decorator | Sets metadata via Reflector `SetMetadata(REQUIRED_PERMISSIONS, codes)`.                                                                                                                                                             |

---

## 6. SCHOOL MODULE

| File                                                                                             | Content                                                                                                                                                                                                                                                                                                                     |
| ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [school.controller.ts](file:///e:/Pro%20School/apps/api/src/modules/school/school.controller.ts) | `@Controller('')` (empty, no prefix — bug). Endpoints: GET /schools/me, PATCH /schools/me, GET /setup/status. All AuthGuard only. No permission check.                                                                                                                                                                      |
| [school.service.ts](file:///e:/Pro%20School/apps/api/src/modules/school/school.service.ts)       | `getCurrentSchool(id)` — findFirst school + bug: wraps response in `{success,message,data,meta}` (inconsistent with other modules which return plain objects). `updateCurrentSchool` — allowed-list only ['name'...'logoUrl'] fields, manual filter. `getSetupStatus` — 6 parallel counts returns boolean flags "has data". |

---

## 7. ACADEMIC MODULE (12 Endpoints)

**Files:** [academic.controller.ts](file:///e:/Pro%20School/apps/api/src/modules/academic/academic.controller.ts), [academic.service.ts](file:///e:/Pro%20School/apps/api/src/modules/academic/academic.service.ts)

| Endpoint                                                                                                                                                                                                                            | Behavior                                                                                                                                                 |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GET/POST/PATCH /academic-years[:id]                                                                                                                                                                                                 | Create year with TRANSACTION: if isActive=true, first updateMany set all inactive. ✅ Atomic. Update supports partial and active swap. Audit.            |
| GET/POST/PATCH /classes[:id]                                                                                                                                                                                                        | CRUD. Unique(schoolId,name) enforced by Prisma constraint. Audit.                                                                                        |
| GET/POST/PATCH /sections[:id]                                                                                                                                                                                                       | CRUD. Requires valid `classId` belongs to same school. Unique(classId,name). Audit.                                                                      |
| GET/POST/PATCH /subjects[:id]                                                                                                                                                                                                       | CRUD. Unique(schoolId,name), Unique(schoolId,code). Audit.                                                                                               |
| POST /subject-offerings                                                                                                                                                                                                             | Create offering (link year/class/section/subject/teacher/blueprint). Validation not thorough (no existence check of foreign IDs beyond DB error). Audit. |
| BUG at lines 71-72: stacked decorators `@Post('promotions')` + `@Get('academic/dashboard')` → method `dashboard` handles **both** POST promotions AND GET dashboard. Promotions endpoint not implemented as own logic. Routing bug. |
| GET (POST?) .../dashboard                                                                                                                                                                                                           | 5 counts: activeYear, classes, sections, subjects, assignments. Simple aggregate. No pagination, no role filtering.                                      |

---

## 8. STUDENT MODULE (12 Endpoints, 3-Step Import Pipeline)

**Files:** [student.controller.ts](file:///e:/Pro%20School/apps/api/src/modules/student/student.controller.ts), [student.service.ts](file:///e:/Pro%20School/apps/api/src/modules/student/student.service.ts)

### Service Deep Dive

| Method                                                   | Behavior                                                                                                                                                                                                                                                                                                              |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `create(schoolId, userId, payload)`                      | `requireStudentFields` — throws if academicId/admissionNo/firstName/lastName empty/falsy. `prisma.student.create(studentData(...))`. Audit STUDENT_CREATED.                                                                                                                                                           |
| `list(schoolId, query)`                                  | Pagination (page/limit 1-100). Filters: status, text search across 5 fields (insensitive contains). Enrollment filter via separate query then WHERE id IN. ✅ Flexible. 2 parallel queries (findMany + count). Meta: totalPages, etc.                                                                                 |
| `findOne(schoolId,id)`                                   | findFirst, not findUnique (explicit tenant gating). 404 if not found. ✅ Good tenant isolation practice.                                                                                                                                                                                                              |
| `update(schoolId, userId, id, payload)`                  | findOne → studentData(update mode) → prisma.student.update. Audit.                                                                                                                                                                                                                                                    |
| `enrollments(studentId)`                                 | findMany enrollments for student, desc enrolledAt                                                                                                                                                                                                                                                                     |
| `createEnrollment(schoolId, userId, studentId, payload)` | Validates year/class/section existence + all same school + classId valid for section → cross-checks. **Checks:** existing enrollment in same academic year (throw BadRequest conflict). Creates Enrollment. Audit ENROLLMENT_CREATED. ✅ Robust                                                                       |
| `guardians(studentId)`                                   | Find relations, then guardians separately, then manually zip. Should use include. N+1.                                                                                                                                                                                                                                |
| `createGuardian(schoolId,userId,studentId,payload)`      | Create Guardian + StudentGuardian relation in 2 awaits, NO transaction. Orphan guardian risk if second insert fails. ❌ GAP-1xx. Audit GUARDIAN_ADDED.                                                                                                                                                                |
| `importPreview(schoolId,userId,rows[])`                  | 3-step import step 1: Map rows, run validation errors, flag NEW/EXISTING/DUPLICATE. Create `Upload` dummy (sizeBytes=0, fake csv) → `ImportSession` status='review' → `ImportRecord` createMany. Return `{jobId, total, valid, errors, records[]}`. ⚠️ Creates rows in Upload table with fake contentType/size (GAP). |
| `importStatus(schoolId,id)`                              | Fetch session + all records asc rowNumber.                                                                                                                                                                                                                                                                            |
| `confirmImport(schoolId,userId,id)`                      | 3-step import step 3: Filter valid records. **TRANSACTION:** For each valid record, upsert student by schoolId_admissionNo unique (create or update). Tx also sets importSession to 'imported' + approvedAt/ById. Returns counts + audit. ✅ All-or-nothing semantics good.                                           |

**`studentData(schoolId, payload, create=true)` overload:** Large object spread with null coercion `value? String(value): null`. In create mode: forces firstName/lastName/admissionNo/academicId as required strings. Correct.

---

## 9. TEACHER MODULE (9 Endpoints, Stubs)

**Files:** [teacher.controller.ts](file:///e:/Pro%20School/apps/api/src/modules/teacher/teacher.controller.ts), [teacher.service.ts](file:///e:/Pro%20School/apps/api/src/modules/teacher/teacher.service.ts)

| Endpoint                         | Status                                                                              |
| -------------------------------- | ----------------------------------------------------------------------------------- |
| POST /teachers                   | ✅ Create teacher with fields + employeeId unique per school enforced by DB. Audit. |
| GET /teachers, GET /teachers/:id | ✅ List asc lastName, findOne (tenant gating).                                      |
| PATCH /teachers/:id              | ✅ Partial update, filtered fields.                                                 |
| POST /teachers/:id/photo         | ❌ STUB. Returns `findOne()` — no file upload pipeline.                             |
| POST /teachers/:id/signature     | ❌ STUB. Same.                                                                      |
| POST /teachers/:id/documents     | ❌ STUB. Same. Ignores body parameter.                                              |
| POST /teachers/assignments       | ✅ Check 5 required ids. Create TeacherAssignment. Audit.                           |
| GET /teachers/:id/workload       | ✅ Count assignments. Return total.                                                 |

**Current bug:** Teachers (any authenticated user) can read/write ALL teachers in school (no scope filter like "assigned class teacher" vs "admin").

---

## 10. EXAM MODULE (15 Endpoints, Most Mature Feature: Marks/Result Engine)

**Files:** [exam.controller.ts](file:///e:/Pro%20School/apps/api/src/modules/exam/exam.controller.ts), [exam.service.ts](file:///e:/Pro%20School/apps/api/src/modules/exam/exam.service.ts)

### Exams

- `listExams(schoolId)` — simple findMany, desc startDate.
- `findExam` — tenant-gated.
- `createExam(schoolId,userId,payload)` — year existence check. Create Exam. Audit EXAM_CREATED.
- `updateExam` — partial update. Audit.
- `addSubject(examId,payload)` — create ExamSubject. Checks SubjectOffering valid tenant. Uses blueprintId from payload or default offering.blueprintId.

### Marks Entry & Lifecycle

- `enterMarks(schoolId,userId,payload)` — validates: 4 foreign keys cross-check, cross-check consistency (examSubject.examId === exam.id; enrollment.year/class/section match offering.class/section). Attendance non-present → mark null. Range validation 0 ≤ value ≤ component.maxMarks. Status 'published' → throw correction workflow required. Upsert by unique composite (examSubject, enrollment, component): if new status draft, or edit draft. Creates or updates markValue Decimal, enteredBy id. Audit MARK_CHANGED with old→new values. ✅ Robust.
- `transitionMarks(schoolId,userId,payload, targetStatus)` — allowedStatuses map: `pending←draft/rejected; verified←pending; approved←verified; published←approved`. Bulk updateMany optionally filtered by examId or examSubjectId. Verified status also sets verifiedById. Audit MARKS_SUBMITTED/VERIFIED/APPROVED/PUBLISHED/REJECTED.

### Mark Import 3-Step (Same Student pattern)

`importPreview` → `importStatus` → `confirmImport`. Confirms by revalidating every row's FKs/marks inside a **transaction**, then bulk upsert marks with source='bulk_import' + status='draft'. All-or-nothing. ✅ Solid.

### Result Engine

- `calculateResults(schoolId,userId,examId)` — load ALL `status in [approved,published]` marks + their components + grading bands (desc minPercent). Group by enrollmentId. Compute total, maximum per component, percentage, absent check per entry, grading band match. Per enrollment: find enrollment (N+1 in for-loop). **Prisma Upsert Result:** create or update {total, percentage Decimal, grade, gpa, passStatus, status='calculated'}. Audit RESULTS_CALCULATED.
- `transitionResults(examId,targetStatus,reason?)` — Rules: verified←calculated/reopened; approved←verified; published←approved; reopened←published. Reopening requires reason. Publish: all results must be approved first (can't publish partial). For each result: update status + approvedAt (if approve) + publishedAt + create ResultApproval row. On publish: create **`ResultSnapshot` version increment with snapshot=result as JSON** ✅ immutable versioning. Audit.
- `studentResult(studentId)` — findMany results desc createdAt.

**Known gaps in engine:**

- No configuration_release / result_policy linkage (Document 30 §4 missing entities).
- No per-subject result detail persisted (result_subjects missing).
- No mark_revisions entity; overwrites MarkEntry directly.
- No self-approval separation check (verifiedById same as enteredById? No enforcement yet).
- calculateResults N+1: enrollment findUnique in loop.
- Mark entry enterMarks: no check that assigned-scope teacher is entering only their assigned subject section.
- `maximum = ... || 100` — silent fallback if components missing. Data integrity hazard.

---

## 11. DOCUMENT MODULE (Marksheets)

**Files:** [document.controller.ts](file:///e:/Pro%20School/apps/api/src/modules/document/document.controller.ts) (prefix: `/marksheets`), [document.service.ts](file:///e:/Pro%20School/apps/api/src/modules/document/document.service.ts)

| Endpoint                       | Behavior                                                                                                                                                                                                                                                   |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| POST /marksheets/templates     | Create DocumentTemplate. Type hardcoded: `'marksheet'`. If isActive=true, updateMany set all other active=true to false (single active template per type). ✅                                                                                              |
| POST /marksheets/preview       | Requires: exam result approved/published. Returns: {exam,student,result,templateVariables:{name,admission,exam name,%,grade,pass/fail}}. Variables are fixed string map, not configurable.                                                                 |
| POST /marksheets/generate      | 1. Find active template. 2. Preview to pull data. 3. Create `GeneratedDocument` status='queued', random verification code. 4. Create DocumentHistory action QUEUED. 5. Return doc + preview. **NO ACTUAL PDF/HTML RENDERING. Worker does not pick it up.** |
| POST /marksheets/generate-bulk | For-loop every result in exam, sequentially call generate per student. No BullMQ queue. No batch.                                                                                                                                                          |
| GET /marksheets/verify/:code   | Public (no AuthGuard! 👍). Return {verified:bool, document:...}. Verification code lookup. Correct approach — public endpoint only reveals validity status + type/title/status/generatedAt. No PII. ✅                                                     |
| GET /marksheets/:id            | Tenant-gated findOne. Returns row.                                                                                                                                                                                                                         |

No MinIO storage integration. No @schoolos/storage usage. No PDF adapter (Puppeteer, wkhtmltopdf, PrinceXML — none selected). All queued docs stay status=queued forever currently.

---

## 12. DASHBOARD MODULE (4 Endpoints, N+1 Performance Issues)

**Files:** [dashboard.controller.ts](file:///e:/Pro%20School/apps/api/src/modules/dashboard/dashboard.controller.ts), [dashboard.service.ts](file:///e:/Pro%20School/apps/api/src/modules/dashboard/dashboard.service.ts)

| Endpoint                  | Behavior                                                                                                                                                                                                              |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GET /summary              | 10 parallel Prisma counts: students, activeStudents, teachers, classes, sections, subjects, upcoming exams (startDate>=now), publishedResults, activeAcademicYear.name, queuedDocuments. Returns structured. ✅ Good. |
| GET /examination-progress | **BAD N+1.** 1 query list 20 exams → per exam, 4 COUNT queries (totalMarks, submitted, verified, approved) = 81 queries total. Should use GROUP BY + CASE aggregation.                                                |
| GET /pending-actions      | 4 counts parallel: queuedDocuments, importReviews, incompleteContacts (student active/enrolled, phone OR email null), pendingMarks. Simple. OK.                                                                       |
| GET /recent-activity      | 20 auditLogs ordered desc createdAt. Select id/module/action/message/entityId/createdAt/userId. No pagination cursor.                                                                                                 |

No role-specific projections (admin vs teacher vs student dashboard). Teacher sees all-school data.

---

## 13. NOTICE MODULE (6 Endpoints, History + Status Machine)

**Files:** [notice.controller.ts](file:///e:/Pro%20School/apps/api/src/modules/notice/notice.controller.ts), [notice.service.ts](file:///e:/Pro%20School/apps/api/src/modules/notice/notice.service.ts)

| Endpoint                  | Behavior                                                                                                                                     |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| GET /notices              | Paginated list (page/limit), filters: status, title-search (insensitive contains). OrderBy: priority desc, publishedAt desc, createdAt desc. |
| POST /notices             | Require title, content. Create draft default. Priority default normal. History CREATED.                                                      |
| GET /notices/:id          | Tenant gating. 404.                                                                                                                          |
| PATCH /notices/:id        | If status published or archived → throw BadRequest "cannot edit". ✅ Immutability after publish. Partial fields update. History UPDATED.     |
| POST /notices/:id/publish | Set published + publishedAt + publishedById. History PUBLISHED.                                                                              |
| POST /notices/:id/archive | Set archived. History ARCHIVED.                                                                                                              |

Gaps: no scheduled publish (scheduled_at job), no expiry processing cron job when expiresAt passes, no audience filtering (audience column exists but not applied at read), no attachment authorization endpoint.

---

## 14. REPORTS MODULE (3 Basic Endpoints)

**Files:** [reports.controller.ts](file:///e:/Pro%20School/apps/api/src/modules/reports/reports.controller.ts), [reports.service.ts](file:///e:/Pro%20School/apps/api/src/modules/reports/reports.service.ts)

| Endpoint                  | Behavior                                                                             |
| ------------------------- | ------------------------------------------------------------------------------------ |
| GET /reports/students     | Paginated students summary; status filter.                                           |
| GET /reports/results      | Prisma `groupBy` passStatus + grade: counts, avg percentage. ExamId filter optional. |
| GET /reports/examinations | Last 100 exams id/name/status/startDate/endDate desc.                                |

No export (CSV/XLSX/PDF). No role-scoped filters. No ad-hoc filter builder.

---

## 15. BULLMQ WORKER APP

**File:** [worker/src/index.ts](file:///e:/Pro%20School/apps/worker/src/index.ts)

```
- Parse REDIS_URL → host/port/password/db
- Create Queue name: 'schoolos-jobs'
- Create Worker with processor: async (job) => return {processed:true, jobName: job.name}  — echo handler
- Bootstrap: queue.add 'startup-heartbeat' job; log ready
```

**100% stub.** No real job handlers. Should handle documents.generate (PDF/HTML), notifications.send, exports.csv, imports.ocr, AI processing. All of this is deferred.

BullMQ connection config correct. Queue/Worker pair should expand with processors organized by feature module.

---

## 16. AI-SERVICE APP (Python/FastAPI)

**Files:** [pyproject.toml](file:///e:/Pro%20School/apps/ai-service/pyproject.toml), [app/main.py](file:///e:/Pro%20School/apps/ai-service/app/main.py), [app/config.py](file:///e:/Pro%20School/apps/ai-service/app/config.py), [app/**init**.py](file:///e:/Pro%20School/apps/ai-service/app/__init__.py)

- FastAPI title="SchoolOS AI Service" v0.1.0.
- Dependencies: fastapi, uvicorn[standard], pydantic-settings.
- Only endpoint: `GET /health` → `{success:true,message,data:{service,status,ok},meta:{}}`.
- **No OCR providers (Tesseract/AWS Textract/Google Vision/Unofficial).** No extraction. No table detection. No matching logic. No provider adapter pattern.
- No AI models, no LLM wiring.

---

## 17. FRONTEND: ADMIN CONSOLE (Next.js 15)

### Entry: layout.tsx + page.tsx

**Files:** [layout.tsx](file:///e:/Pro%20School/apps/admin/app/layout.tsx), [page.tsx](file:///e:/Pro%20School/apps/admin/app/page.tsx)

| Feature                 | Behavior                                                                                                                                                                                                                                                               |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Layout                  | Basic html/en + body. No provider setup (no QueryClient, no AuthProvider, no Theme).                                                                                                                                                                                   |
| Navigation items        | 9 links: Dashboard, Students → `/students`, Teachers, Academics, Examinations, Marksheets → `/marksheets`, Documents, AI Imports, Settings. All others → `#`.                                                                                                          |
| Sidebar + Content shell | Uses `className` BEM-style (`admin-shell`, `admin-sidebar`, `admin-brand`). All styles in globals.css.                                                                                                                                                                 |
| Dashboard API calls     | On mount useEffect: 3 parallel fetch calls to **hardcoded `http://localhost:4000/api/v1/dashboard/{summary,pending-actions,recent-activity}`**. Credentials:'include' (sends cookie). Any non-ok → display "Sign in to load live dashboard data" error message inline. |
| Dashboard cards         | 3 Stat cards: Students count, Teachers, Classes → each label/value/detail. Status block shows active academic year. Pending actions list. Recent activity list with human date.                                                                                        |

**Pages in apps/admin/app/:**

| Route                    | Status                                          |
| ------------------------ | ----------------------------------------------- |
| `login/page.tsx`         | Exists. Not reviewed for this doc.              |
| `setup/page.tsx`         | Exists. Calls setup/status endpoint presumably. |
| `students/page.tsx`      | Exists. List view.                              |
| `students/[id]/page.tsx` | Exists. Detail view.                            |
| `marksheets/page.tsx`    | Exists. Ties to document endpoint presumably.   |
| `notices/page.tsx`       | Exists. Lists/creates notices UI.               |

No shared UI components. All inline JSX. No reusable form inputs. No `@schoolos/ui` package integration. **No auth flow:** pages don't redirect to `/login` if no session; just show error on data fetch fail.

### FRONTEND: WEB PORTAL (Next.js 15)

**Files:** [web/app/layout.tsx](file:///e:/Pro%20School/apps/web/app/layout.tsx), [web/app/page.tsx](file:///e:/Pro%20School/apps/web/app/page.tsx), [web/app/health/route.ts](file:///e:/Pro%20School/apps/web/app/health/route.ts)

- Landing page only. Hero title "AI-first school operations...", 3 static capability cards, 2 action buttons (Explore dashboard href /, API health href `localhost:4000/api/v1/health`).
- Metadata: title SchoolOS, description approved copy.
- Route `GET /health` in Next.js — returns Response JSON (health check for hosting platform).

---

## 18. Prisma Schema: Table-by-Table Notes

See main doc: [01-current-position-gap-analysis.md](./01-current-position-gap-analysis.md) Section 4 and §8 for gap register. 25 tables scaffolded. 16+ entities missing per CR-01 Document 30.

---

## 19. GitHub CI + Husky

### `.github/workflows/ci.yml`

**File:** [ci.yml](file:///e:/Pro%20School/.github/workflows/ci.yml)
Triggers: push main, pull_request.
Ubuntu latest → checkout → pnpm@9 setup → node@20 with pnpm cache → install frozen → db:generate → lint → typecheck → test → build. ✅ Standard solid pipeline. Test step runs but there are ~0 tests besides utils.

### Husky Hooks

- `.husky/pre-commit`: runs lint-staged (`lint-staged.config.cjs` at root)
- `.husky/commit-msg`: commitlint conventional commit check

### CODEOWNERS + Dependabot

`.github/CODEOWNERS`: present. `.github/dependabot.yml`: configured for automated dependency updates. ✅ Good.

---

## 20. Summary: Architectural Strengths Observed in Code

- ✅ **Tenant-first pattern:** All reads `findFirst({where:{schoolId, id}})` not `findUnique` — prevents accidental cross-tenant leak via URL id.
- ✅ **Session cookie hashed:** raw secret never stored. DB stores hash. Secure.
- ✅ **Password reset revocation strategy:** All sessions revoked after successful password reset. Correct.
- ✅ **Import 3-step:** preview validates → status review → confirm transaction. Good provenance.
- ✅ **Result versioning snapshots on publish:** Immutable JSON snapshots for published results. Aligns with audit/history requirements.
- ✅ **Notice immutability post-publish:** rejects PATCH on published/archived. Correct.
- ✅ **Mark correction chain protected:** published marks require authorized correction workflow; upsert throws if published.
- ✅ **Public verification endpoint design:** Only non-PII data disclosed at /marksheets/verify/:code. Correct pattern.
- ✅ **Academic year active flag swap in transaction:** Prevent two active years. Atomic.

---

**Next Document:** [03-way-forward-execution-plan.md](./03-way-forward-execution-plan.md) — Priority matrix, architecture diagrams, 13-phase execution plan.
