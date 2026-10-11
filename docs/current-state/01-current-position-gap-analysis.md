# SchoolOS — Current Position & Gap Analysis

- **Baseline generated:** 2026-08-28
- **Current review update:** 2026-10-09
- **Status:** Implementation scaffolding and partial domain code exist; architecture remains Phase 13 NO-GO. Feature coding is not authorized before remediation, owner sign-off, and the final audit/freeze decision.
- **Source of truth for architecture:** [design-freeze/30-authoritative-database-specification-v1.md](../design-freeze/30-authoritative-database-specification-v1.md), [design-freeze/29-phase-13-final-consistency-audit-report.md](../design-freeze/29-phase-13-final-consistency-audit-report.md), [master-development-plan.md](../roadmap/master-development-plan.md)
- **Current remediation plan:** [Way Forward Execution Plan](./03-way-forward-execution-plan.md) and [Remediation Execution Checklist](./04-remediation-execution-checklist.md)

> This document preserves the 2026-08-28 code/gap baseline below. The update in Section 10 is the current product and governance assessment; older code-gap counts and readiness claims must be re-verified before being used as today's implementation status.

---

## 1. Executive Summary

SchoolOS is a monorepo AI-first school ERP. The repository has **two parallel realities**:

### 1A. Architecture Reality (from `docs/design-freeze/`)

| Item                                  | Status                                                                                      |
| ------------------------------------- | ------------------------------------------------------------------------------------------- |
| Design-freeze documentation           | Documents 01–24 exist, cross-referenced                                                     |
| Phase 13 design review                | **NO-GO** (58/100). 4 CRITICAL findings (CR-01 to CR-04) + 5 HIGH findings (HI-01 to HI-05) |
| Architecture Freeze v1.0              | **NOT APPROVED** — cannot activate until Phase 13 passes                                    |
| Technology stack finalization         | PLANNED — activates only after freeze approval                                              |
| Feature status register               | All features **PLANNED** except docs itself                                                 |
| Official permission: "feature coding" | **NOT AUTHORIZED** per Document 29 decision                                                 |

### 1B. Code Reality (from `apps/`, `packages/`)

Despite the architecture NO-GO, the codebase contains **pre-freeze scaffolding** for all feature modules:

- NestJS 11 API with 11 modules (Auth, School, Academic, Student, Teacher, Exam, Document, Dashboard, Notice, Reports)
- Prisma 5 schema with 25+ tables across 11 domain files
- Next.js 15 admin console (port 3002) + web portal (port 3000)
- BullMQ worker (stub) + FastAPI AI service (stub)

The code is **useful as a reference scaffold but must be reconciled** to the authoritative frozen spec (CR-01/02/03/04). This document captures the exact reconciliation gaps.

---

## 2. Architecture Diagram (from D3 + CR-03)

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  BROWSER / CLIENT                                                                 │
│  ┌──────────────────────┐    ┌──────────────────────┐                              │
│  │  apps/admin (p3002)  │    │   apps/web (p3000)   │  Next.js 15 / React 19       │
│  │  Staff/Admin Console │    │ Student/Parent Portal│                              │
│  └─────────┬────────────┘    └──────────┬───────────┘                              │
│            │ Session Cookie (HttpOnly)  │                                          │
│            └────────────────┬───────────┘                                          │
│                             │ :4000 /api/v1                                         │
└─────────────────────────────┼──────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────▼──────────────────────────────────────────────────────┐
│  apps/api — NestJS 11 Transactional Modular Monolith                               │
│  Global Prefix /api/v1                                                              │
│  ┌────────────────────────────────────────────────────────────────────────────┐    │
│  │  PIPELINE (per D5 API Design):                                             │    │
│  │  CORS → Headers → RequestId → Authn (Cookie/Session)                       │    │
│  │    → Authz (Tenant + Permission + Scope)                                   │    │
│  │    → DTO Validation (Zod) → Business Rules → Idempotency/Revision          │    │
│  │    → DB Transaction → Audit + Outbox → Response                            │    │
│  └────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                     │
│  MODULES: Auth · School · Academic · Student · Teacher · Exam                     │
│           Document · Dashboard · Notice · Reports · (Attendance deferred)         │
│                                                                                     │
│  ┌───────────────────────────────┐     ┌───────────────────────────────┐           │
│  │  Persistence Layer            │     │  Asynchronous Layer           │           │
│  │  Prisma 5 → PostgreSQL 16    │────▶│  Redis 7 → BullMQ queues      │           │
│  │  (25 tables; needs relations) │     │  → Worker (background jobs)  │           │
│  └───────────────────────────────┘     └───────────────────────────────┘           │
│                                    │                                                │
│                                    │ calls                                          │
│                                    ▼                                                │
│                          ┌─────────────────────┐                                    │
│                          │  apps/ai-service     │  Python 3.11 / FastAPI           │
│                          │  Port 8000           │  Provider-neutral OCR adapter    │
│                          └─────────────────────┘                                    │
└─────────────────────────────────────────────────────────────────────────────────────┘

STORAGES (Docker Compose local):
  ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐ ┌──────────────┐
  │ PostgreSQL 16│ │  Redis 7     │ │  MinIO (S3)      │ │  Mailpit     │
  │  port 5432   │ │  port 6379   │ │  port 9000/9001  │ │  SMTP 1025   │
  └──────────────┘ └──────────────┘ └──────────────────┘ └──────────────┘
```

### Architectural Rules (D3 + CR-01, non-negotiable)

1. **Modular monolith for API** — module cannot directly write another module's tables; use commands/events
2. **Persist job/import/document BEFORE enqueueing** (outbox pattern)
3. **Tenant composite FKs** — `(school_id, parent_id)` references, backed by `(school_id, id)` unique constraints
4. **Append-only truth** — Approved marks, published results, config releases, official documents are versioned/immutable
5. **AI/OCR only proposes** — chain: extract → match → confidence → validate → human review → official marks
6. **Optimistic concurrency** — `row_version bigint` on aggregate roots, `If-Match` header on updates
7. **Soft delete default** — `deleted_at timestamptz` for mutable masters; academic records retained
8. **ON DELETE RESTRICT everywhere** — no CASCADE on historical data (only role grants, session tokens etc.)

---

## 3. What Is COMPLETED (Code Scaffolding)

### 3.1. Monorepo & Tooling

| Component                                           | Completion | Location                                                                         | Notes                                                                                  |
| --------------------------------------------------- | ---------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| pnpm + Turborepo workspace                          | ✅ 100%    | [pnpm-workspace.yaml](../../pnpm-workspace.yaml), [turbo.json](../../turbo.json) | Build/cache pipeline configured                                                        |
| Root scripts (dev/build/lint/test/typecheck/format) | ✅ 100%    | [package.json](../../package.json)                                               |                                                                                        |
| TypeScript 5.6 strict base config                   | ✅ 100%    | [tsconfig.base.json](../../tsconfig.base.json)                                   | Strict + `noUncheckedIndexedAccess`                                                    |
| ESLint 9 (flat) + Prettier + import sort            | ✅ 100%    | [eslint.config.mjs](../../eslint.config.mjs)                                     |                                                                                        |
| Husky 9 + lint-staged + commitlint                  | ✅ 100%    | `.husky/`, [commitlint.config.cjs](../../commitlint.config.cjs)                  | Conventional commits                                                                   |
| GitHub Actions CI (lint→typecheck→test→build)       | ✅ 100%    | [.github/workflows/ci.yml](../../.github/workflows/ci.yml)                       |                                                                                        |
| Docker Compose local infra                          | ⚠️ 90%     | [docker-compose.yml](../../docker-compose.yml)                                   | Missing `.env.development` for ai-service; MinIO bucket init exists; no DB wait script |
| Environment example                                 | ⚠️ 80%     | [.env.example](../../.env.example)                                               | API_PORT mismatch (3001 vs 4000 default)                                               |
| Dev powershell script                               | Exists     | `infrastructure/scripts/dev.ps1`                                                 | Not yet reviewed                                                                       |

### 3.2. Shared Packages (14 packages)

| Package                   | Purpose                                       | Completion | Gap                                                                                                                                               |
| ------------------------- | --------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@schoolos/database`      | Prisma schema + client                        | ⚠️ 60%     | **No `@relation()` directives**, no `row_version`, no composite FKs, 14+ entity types missing (§ CR-01). 11 schema files → build-schema.mjs works |
| `@schoolos/validation`    | Zod schemas                                   | ⚠️ 25%     | Only envSchema, pagination, login schemas. **No feature-DTO zod schemas.**                                                                        |
| `@schoolos/types`         | Shared TS types                               | ⚠️ 15%     | Only Brand<>, Id, Timestamped, HealthResponse. No domain types.                                                                                   |
| `@schoolos/config`        | Env loader                                    | ⚠️ 50%     | `loadEnvironment()` exists; **never called during bootstrap**                                                                                     |
| `@schoolos/auth`          | JWT helpers (jose)                            | ⚠️ 40%     | Sign/verify functions exist; **never imported or used** (API uses sessions not JWT)                                                               |
| `@schoolos/logger`        | Pino structured logger                        | ⚠️ 50%     | Factory exists; **not used in API** (API has no structured request logs)                                                                          |
| `@schoolos/storage`       | S3/MinIO client (aws-sdk v3)                  | ⚠️ 50%     | Client factory exists; **not used in any service**                                                                                                |
| `@schoolos/shared`        | Generic utils (assertNever, range, isDefined) | ✅ 100%    |                                                                                                                                                   |
| `@schoolos/utils`         | String helpers (toTitleCase) + test stub      | ✅ 90%     | Has 1 test; expand utilities                                                                                                                      |
| `@schoolos/constants`     | Exports file                                  | ❌ 0%      | Empty index                                                                                                                                       |
| `@schoolos/ui`            | Design system                                 | ❌ 0%      | Empty index. Tokens/components not built                                                                                                          |
| `@schoolos/eslint-config` | Shared ESLint config                          | ⚠️ 50%     | Package exists; content minimal                                                                                                                   |
| `@schoolos/tsconfig`      | Shared TS config                              | ⚠️ 50%     | Package exists; content minimal                                                                                                                   |

### 3.3. Backend Apps

| App                                                 | Status                 | Completion                                                                     |
| --------------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------ |
| `apps/api` (NestJS 11, Express, port 4000 default)  | Scaffolded, 11 modules | ⚠️ 45% — see §4 module-by-module                                               |
| `apps/worker` (BullMQ 5, tsx)                       | Stub only              | ❌ 10% — heartbeat job, no real handlers (document gen, OCR, exports)          |
| `apps/ai-service` (Python 3.11, FastAPI, port 8000) | Stub only              | ❌ 10% — only `/health` endpoint; no OCR providers, no extraction, no matching |

### 3.4. Frontend Apps

| App                               | Status                        | Completion                                                                                                                      |
| --------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `apps/admin` (Next 15, port 3002) | Pages + dashboard scaffolding | ⚠️ 25% — pages: home, students, [id], marksheets, notices, setup, login. **No UI system, no auth flow, no forms, no API layer** |
| `apps/web` (Next 15, port 3000)   | Landing page only             | ❌ 5% — hero + 3 feature cards, no routes/features                                                                              |

### 3.5. API Module-by-Module Scaffold Status

_(Source code review 2026-08-28)_

| Module         | Controllers | Services  | Endpoint Count                                                                                                                                                    | Auth Guard                 | Permissions             | Input Validation                                    | Business Logic                                                                                                                                                      | Audit                   |
| -------------- | ----------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- | ----------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| **Auth**       | ✅          | ✅        | login, logout, logout-all, me, sessions, revoke, forgot-pw, reset-pw (8)                                                                                          | ✅ (`AuthenticationGuard`) | ❌ (no PermissionGuard) | ✅ Zod schemas in-controller                        | ✅ login flow, Argon2 verify/hash, session create/revoke, reset tokens, **in-memory rate limit**                                                                    | ✅ `audit()` method     |
| **School**     | ✅          | ✅        | getMySchool, updateMySchool, setup-status (3)                                                                                                                     | ✅                         | ❌                      | ❌ `Record<string, unknown>` + allowed-list filter  | ✅ Basic CRUD + setup status counts                                                                                                                                 | ✅ Manual               |
| **Academic**   | ✅          | ✅        | 12 endpoints (academic-years/classes/sections/subjects CRUD + offerings + dashboard)                                                                              | ✅                         | ❌                      | ❌ `Record<string, unknown>`                        | ✅ Basic CRUD + active-year unsetting                                                                                                                               | ✅ Most actions         |
| **Student**    | ✅          | ✅        | 12 endpoints (CRUD, search, enrollments CRUD, guardians CRUD, import preview/status/confirm)                                                                      | ✅                         | ❌                      | ❌ `Record<string, unknown>` + manual requireFields | ✅ Create/list w/ filters, enrollment w/ validation, **3-step import preview → status → confirm** w/ transactions                                                   | ✅ Manual               |
| **Teacher**    | ✅          | ✅        | 9 endpoints (CRUD, photo, signature, docs, assignments, workload)                                                                                                 | ✅                         | ❌                      | ❌ `Record<string, unknown>`                        | ✅ Basic CRUD + assignments + workload count; **photo/signature/docs = stubs** (return findOne)                                                                     | ✅ Manual               |
| **Exam**       | ✅          | ✅        | 15 endpoints (exams CRUD + add subject; marks CRUD + submit/verify/approve; mark import 3-step; results: calculate→verify→approve→publish→reopen + studentResult) | ✅                         | ❌                      | ❌ `Record<string, unknown>`                        | ✅ Exams CRUD, marks enter/transition, full import pipeline, **result calc w/ grading bands, state transitions, snapshot on publish, correction/approval tracking** | ✅ Manual               |
| **Document**   | ✅          | ✅        | 6 endpoints (create template, preview, generate, bulk, verify, get)                                                                                               | ✅                         | ❌                      | ❌ `Record<string, unknown>`                        | ✅ Template CRUD, preview extracts template vars, generate queues w/ verification code, bulk iterates, **NO actual PDF/HTML rendering** (storage stub)              | ✅ Manual + doc history |
| **Dashboard**  | ✅          | ✅        | summary, examination-progress, pending-actions, recent-activity (4)                                                                                               | ✅                         | ❌                      | N/A (read)                                          | ⚠️ Works but **81 N+1 queries in examination-progress**                                                                                                             | ❌                      |
| **Notice**     | ✅          | ✅        | list, create, get, update, publish, archive (6)                                                                                                                   | ✅                         | ❌                      | ❌ `Record<string, unknown>`                        | ✅ Full CRUD + publish/archive state with history + search/status filter/pagination                                                                                 | ✅ History table        |
| **Reports**    | ✅          | ✅        | students, results, examinations (3)                                                                                                                               | ✅                         | ❌                      | ❌ (filters via Record)                             | ✅ Basic aggregations: students list pagination, results groupBy pass/grade, exams list                                                                             | ❌                      |
| **App (root)** | ✅          | N/A       | health, readiness (2)                                                                                                                                             | ❌                         | N/A                     | N/A                                                 | ✅ readiness checks `SELECT 1` via prisma                                                                                                                           | ❌                      |
| **TOTAL**      | **11/11**   | **11/11** | **81 endpoints scaffolded**                                                                                                                                       | **11/12 modules guarded**  | **0 modules**           | **Auth only uses Zod**                              | **Core engines (Exam/Student) advanced; others basic**                                                                                                              | **7/12 modules audit**  |

---

## 4. CRITICAL Gap Analysis (P0 — Must Fix Before Any Feature Expansion)

### GAP-001: **Permission System Not Enforced** (Cross-reference: PHASE-1 of master plan, step 1)

- **Spec says:** `permission.decorator` + `PermissionGuard` wired globally to every mutation/sensitive-read endpoint, with defined role matrices (Document 19 — Formal Permission Matrix)
- **Code has:** `PermissionGuard` class + decorator exists in `auth.module.ts` (global). **Zero controllers or handlers apply them.**
- **Net effect:** Any authenticated user (even a student-portal account if one logs in) can call `POST /students` to create students, `POST /results/publish`, `PATCH /schools/me` — complete horizontal privilege escalation.
- **Fix required:** For all 81 endpoints, define permission codes (e.g. `students:create`, `results:publish`), apply `@RequirePermissions()` + `PermissionGuard`, add role-scope filters in services (e.g. a teacher only sees their assigned class marks).

### GAP-002: **Prisma Schema Has ZERO `@relation()` Definitions** (CR-01 / Document 30 section 3)

- **Spec says:** Full ERD with named relations, composite tenant-scoped FKs, `ON DELETE RESTRICT`, `(school_id,id)` unique parent indexes.
- **Code has:** All FKs as bare `String` columns. No `@@relation()`, no actual foreign key constraints likely created in DB, no nested `include`, no cascade rules. 14 entity types missing entirely (Document 30 §4 list: user_scopes, configuration_releases, result_policies, mark_revisions, correction_requests, approval_policies, result_subjects, attendance_sessions, notifications, file_objects, import_mappings, match_candidates, job_runs, feature_flags, etc.)
- **Fix required:** Full schema reconciliation pass against Document 30 + 30a data dictionary. Add all missing entities, all relations, composite tenant FKs + unique indexes, `row_version`, append-only policy triggers.

### GAP-003: **All Input DTOs = `Record<string, unknown>` — Zero Typed Validation** (CR-03 / Document 33)

- **Spec says (CR-03):** Authoritative OpenAPI 3.1 schemas for every endpoint, generated from the same Zod DTOs that validate at runtime. Unknown fields rejected (already set in ValidationPipe, but it uses class-validator).
- **Code has:** 9 of 10 service files use `Record<string, unknown>` as input type with manual `String(payload.x)` casts and spotty `if (!field) throw`. No DTO classes, no Zod schemas in features, no Swagger `@ApiProperty()`.
- **Net effect:** Type casts fail silently (e.g. `Number(payload.capacity)` on `null` → 0), unknown fields silently dropped, no Swagger schema display.
- **Fix required:** Migrate to Zod DTO pipeline: create `z.object()` schemas for every endpoint request, use `nestjs-zod` or custom ZodValidationPipe, generate OpenAPI from same schemas.

### GAP-004: **In-Memory Rate Limiting Not Distributed** (D4 §Authentication, HI-03)

- **Spec says:** Distributed rate limit budgets backed by Redis with IP+account keys, lockout durations, support break-glass.
- **Code has:** `AuthService.attempts = new Map<string, {count, resetAt}>` — local, process-bound, reset on each restart. No Redis throttler, no sliding window, no lockout persistence.
- **Fix required:** Add `@nestjs/throttler` + `@nestlab/throttler` Redis storage, or BullMQ rate limiter. Define budgets per endpoint class (auth-public, mutations, reads, AI-heavy).

### GAP-005: **Environment Never Validated at Bootstrap** (P0 safety)

- **Spec says:** `loadEnvironment()` called early in main.ts; missing/invalid env vars cause immediate crash before server listen.
- **Code has:** Function exported from `@schoolos/config/index.ts`; **never called** anywhere. App will start with `DATABASE_URL=undefined` and crash at first query.
- **Fix required:** One line in API `main.ts` line 11-12: `loadEnvironment()` before NestFactory.create. Same for worker and any app that uses database/env.

### GAP-006: **No `row_version` / Optimistic Concurrency** (CR-01 §1, D4)

- **Spec says (CR-01 §1):** All mutable aggregates carry `row_version bigint NOT NULL DEFAULT 1`; updates must pass `If-Match: <rowVersion>` header or return `409 CONFLICT`.
- **Code has:** Zero tables have `row_version`; no service checks ETag/version. Two users editing same student in parallel = last write wins with no conflict detection.
- **Fix required:** Add `rowVersion Int` to all mutable master models, implement `@Version decorator` or middleware pattern, wire into all PATCH/PUT controllers.

### GAP-007: **No Cookie-Parser Middleware** (DX + security)

- **Code has:** Duplicated manual cookie parsing via `req.headers.cookie?.split(';')...` in TWO places (auth.controller.ts L75, authentication.guard.ts L12).
- **Fix required:** `app.use(cookieParser())` in main.ts, reference `req.cookies[name]` always.

### GAP-008: **Duplicate + Unused Zod Schema** (Code quality)

- Login/forgot/reset Zod schemas defined in both `packages/validation/src/index.ts` (shared) AND `apps/api/src/modules/auth/auth.controller.ts` locally (redefined). Shared ones ignored. `@schoolos/auth` JWT package exports never used anywhere.

---

## 5. HIGH Gaps (P1 — Must Fix Before QA/Pilot)

| ID      | Gap                                                                                                                                                                                                                    | Severity                                       | Reference                                                    |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------ |
| GAP-101 | Dashboard examination-progress N+1 query (81 queries / call)                                                                                                                                                           | Performance                                    | dashboard.service.ts:42-53                                   |
| GAP-102 | API_PORT mismatch (3001 env vs 4000 default)                                                                                                                                                                           | Dev-ex                                         | .env.example:L14 vs main.ts:L34 vs admin UI hardcoded 4000   |
| GAP-103 | Result calc: for-loop enrollments findUnique (N+1)                                                                                                                                                                     | Performance                                    | exam.service.ts:130                                          |
| GAP-104 | Result calc maximum marks fallback `                                                                                                                                                                                   |                                                | 100` — silent wrong % when components missing                | Data integrity | exam.service.ts:126 |
| GAP-105 | ExamController uses `@Controller('')` (no prefix) — inconsistent REST vs others using `@Controller('students')`                                                                                                        | API consistency                                | exam.controller.ts:L7                                        |
| GAP-106 | AcademicController uses `@Controller('')` — same, plus duplicate `@Post('promotions')` + `@Get('academic/dashboard')` stacked decorator (L71-72)                                                                       | Bug: promotions endpoint merged with dashboard | academic.controller.ts:L71-75                                |
| GAP-107 | `Student.search` endpoint identical to `Student.list` — dead endpoint                                                                                                                                                  | API surface bloat                              | student.controller.ts:L22-25                                 |
| GAP-108 | Photo/Signature/Document uploads for Teacher are stubs returning `findOne` — no real file pipeline. Same for all document storage references (using `logo_url` strings vs file_object_id)                              | File management                                | teacher.controller.ts:L32-45 + CR-01 §5.3                    |
| GAP-109 | Document engine queues doc to `status:'queued'` — **no worker picks it up**. BullMQ worker only has echo job. No actual PDF/HTML rendering adapter. No MinIO storage.                                                  | Feature broken                                 | document.service.ts:L26 vs worker/src/index.ts               |
| GAP-110 | `docker-compose.yml` `ai-service` references `./.env.development` file that doesn't exist                                                                                                                              | Dev setup broken                               | docker-compose.yml:L99-100                                   |
| GAP-111 | Audit logs in Prisma schema have mutable `updatedAt`/`deletedAt` + string `oldValue/newValue`. Spec requires append-only immutable, JSONB values, correlation/idempotency IDs.                                         | Audit integrity                                | Document 30 §4 §13 vs schema.prisma AuditLog                 |
| GAP-112 | Soft delete + unique constraint bug: `@@unique([schoolId, admissionNo])` doesn't exclude deleted rows — can't reissue admissionNo after archive                                                                        | Data model                                     | schema.prisma student L429                                   |
| GAP-113 | No DB wait-for / health retry in API main — dev startup race with postgres                                                                                                                                             | Dev-ex                                         | main.ts + compose healthchecks present but code doesn't wait |
| GAP-114 | `@schoolos/logger` (Pino) not wired into NestJS app — Nest uses default console logger, no structured JSON in prod, no request log middleware                                                                          | Observability                                  | main.ts + logger package                                     |
| GAP-115 | No session auto-expiry cleanup — expired sessions accumulate in DB indefinitely                                                                                                                                        | Maintenance                                    | Auth revoke/expiry logic exists but no cron/janitor          |
| GAP-116 | Frontends: No API abstraction layer (direct fetch to localhost), no auth state (no login-redirect on 401), no query cache (React Query/SWR), no design system (`@schoolos/ui` empty), admin pages are placeholder only | Frontend 0-1 work                              | apps/admin + apps/web entire                                 |
| GAP-117 | `userContext()` in AuthService makes 5 separate Prisma queries (user → userRoles → roles → rolePermissions → permissions). Use 1 nested include.                                                                       | Performance + N+1                              | auth.service.ts:63-90                                        |

---

## 6. MEDIUM & LOW Gaps (P2/P3 — Backlog)

- Swagger/OpenAPI UI is empty (no DTO schemas since inputs = Records) — fix when GAP-003 done
- Duplicated Zod login schema between auth.controller and validation package (GAP-008 partial)
- `@node-rs/argon2` declared in database package dependencies but used only in auth service
- Inconsistent package main/type entry points: database points to dist, logger/storage/auth point to raw TS
- No seed.mjs implementation: schema references seed script, content TBD
- Admin dashboard summary shape mismatch: API returns `{data:{students,teachers,classes,upcomingExams,publishedResults,academicYear,queuedDocuments},meta:{generatedAt}}` while UI typed as `{students,teachers,classes,academicYear,queuedDocuments}` (missing `upcomingExams` and `publishedResults` in UI type)
- School service response envelope: returns `{success,message,data,meta}` while all other modules return plain `data`/Prisma object. Inconsistent response shape per CR-03 global contract `{data,meta}` vs `{error,meta}`
- `generateBulk()` loops sequentially, no queuing. Should create a BullMQ job per document or batch.
- No pagination cursor; all list endpoints use `page/limit offset` (slower for deep pages, no stable ordering guarantee)
- Mark state transition `approve` uses `allowedStatuses=['approved']` — typo? Should be transition TO approved FROM approved? Actually in transitionMarks L64 it reads: `allowedStatuses = status === 'approved' ? ['verified']` — CORRECT. But the pattern is confusing; extract to a state machine map.

---

## 7. Module-by-Module Plan Completion vs Master Development Plan Gates

Master plan phases from [master-development-plan.md](../roadmap/master-development-plan.md):

| Phase                                  | Description                                                                                                                                                     | Status in Code                                                                                                                                                                                                             |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Phase 0: Release baseline**          | Test runner, grading unit tests, tenant fixtures, migrations applied, format CI                                                                                 | ❌ Not started: `vitest` declared in root devDeps, only `@schoolos/utils` has 1 test file. No API test utils, no grading tests. Migrations: 5 migration folders exist but no tenant fixtures. Format CI is present.        |
| **Phase 1: Identity & authorization**  | PermissionGuard wired, permission matrices, authn+authz tests, session lifecycle tests                                                                          | ⚠️ scaffolded only (GAP-001): guard exists not wired; no matrices; no session tests; rate limit in memory not distributed                                                                                                  |
| **Phase 2: School & people ops**       | Setup UI, student + enrollment transitions, **real CSV/Excel parsing + mapping + duplicate review + batch jobs**, teacher assignments, teacher access filtering | ⚠️ scaffolded: CSV import is fake (passes rows directly no CSV parser); student transitions = no endpoint (only create/update/enrollment create); no teacher access filter (teacher sees all students in school currently) |
| **Phase 3: Exam & result engine**      | Pure calculation service + tests, full mark lifecycle/correction audit, result calc, immutable snapshots, enrollment→published integration test                 | ⚠️ scaffolded: result calc exists NOT pure (direct prisma queries in same function); snapshots created on publish GOOD; correction_requests entity missing (Document 30 §4); no integration test                           |
| **Phase 4: Document engine**           | Generic templates, variable/conditional rendering, HTML/PDF renderer abstraction, **BullMQ bulk generation**, permissions + verification + tests                | ⚠️ scaffolded: templates can be created; preview extracts a few fixed vars; NO actual rendering; queued but worker empty (GAP-109); no zip packaging                                                                       |
| **Phase 5: Dashboard/reports/notices** | Role projections, DB aggregations, export job contracts, notice scheduling expiry processing, attachments auth, integration tests                               | ⚠️ scaffolded: dashboard summary works; notice CRUD/publish works; report exports = NO endpoints (only list endpoints no CSV/XLSX/PDF jobs); no notice expiry processing (cron missing)                                    |
| **Phase 6: Operational hardening**     | File MIME+magic+malware scan, distributed rate limit, request metrics/alerts, encrypted backup + restore verified, load tests run, staging deploy smoke         | ❌ Not started                                                                                                                                                                                                             |
| **Phase 7: M1 release**                | Migrations staging, full suites run, deployment checklist + rollback verified, pilot school 1, accept findings recorded                                         | ❌ Not started                                                                                                                                                                                                             |
| **M2 AI/OCR boundary**                 | Upload → classify → extract → match → validate → human review → marks engine. 9 sub-modules M2.1–M2.9 documented                                                | ❌ Only DB scaffolding (Upload, OCRJob, ImportSession, ImportRecord tables exist; AI service = /health stub only)                                                                                                          |

---

## 8. Database: CR-01 Entity Gap Register (Document 30 §4)

**Currently in Prisma schema:** identity (User, Role, Permission, UserRole, RolePermission, Session, PasswordResetToken), school (School, SchoolSetting, AcademicYear, GradingSystem), academic (Class, Section, Subject, SubjectGroup, TeacherAssignment, CurriculumVersion, AssessmentBlueprint, AssessmentComponent, SubjectOffering, PromotionRule), student (Student, Guardian, StudentGuardian, Enrollment), teacher (Department, Teacher, TeacherQualification, TeacherDocument, HomeroomAssignment), exam (Exam, ExamSubject, MarkEntry, Result, ResultSnapshot, ResultApproval, GradingBand), document (DocumentTemplate, GeneratedDocument, DocumentHistory), notice (Notice, NoticeHistory), file (File), ai (Upload, OCRJob, ImportSession, ImportRecord), system (AuditLog).

**MISSING entities (per Document 30 §4):**

1. `user_scopes` — separate permission vs data scope (school/academicYear/class/section/subject)
2. `configuration_releases` + `configuration_release_items` — versioned grading, curriculum, approval configs. Current `school_settings`, `curriculum_versions`, `grading_systems` aren't enough.
3. `result_policies` + `result_policy_rules` + grade_bands release linkage — exact versioned calculation contract. Current grading bands aren't versioned.
4. `mark_revisions` — tracked mark correction history (important for audit integrity)
5. `mark_correction_requests` — formal request workflow for corrections
6. `approval_policies` + `approval_steps` + `approval_actions` — configurable approval chains/separation of duties; current ResultApproval is too generic.
7. `result_subjects` — per-subject calculation detail/reproducibility persisted
8. `attendance_sessions` + `attendance_records` — Attendance module DEFERRED but entities reserved
9. `notifications` + `notification_deliveries` + `notification_preferences` — not just notices; delivery state & retries
10. `file_objects` — central private file metadata, quarantine, scanning, retention, provenance. Current Files + Uploads + raw URL columns must converge here.
11. `import_mappings` — CSV/excel column to domain mapping
12. `identity_match_candidates` — ambiguous match proposals with confidence/evidence
13. `review_tasks` — human review queue abstraction
14. `job_runs` — idempotent BullMQ background work tracking/retry/DLQ state
15. `document_template_versions` (separate table) + content hash — Document 30 says: existing template version is a string in mutable row; needs separate immutable version rows.
16. `feature_flags`, `maintenance_windows`, `support_access_grants`, `data_retention_holds` — operational/controls.

Also: Add `row_version` to every mutable aggregate root per CR-01 §1. Add composite tenant unique index `(school_id, id)` to every tenant table. Rename `Student.academicId` → `external_academic_id` or split into `student_identifiers` table per CR-01 §5.2.

---

## 9. Remediation Sequence (Priority)

The list below preserves the original audit order. Current item status and owner decisions are tracked in the remediation checklist and the updated plan in Sections 10 and 0; do not infer current closure from this historical sequence.

Per Document 29 (Phase 13 audit report) §84 **Required correction sequence**:

1. **CR-01 → data dictionary / ERD complete** (Document 30/30a) → GAP-002 + row_version + missing entities
2. **CR-02 → atomic requirement / UC / BR / test registries complete, no dangling refs** (Document 31)
3. **CR-04 → policy/formula/approval configuration + calculation spec executable** (Document 32)
4. **CR-03 → publish endpoint-by-endpoint contracts** (Document 33 already remediation draft → finalize)
5. **HI-01 through HI-05 → complete use cases, sequences, threat model, screen specs, test cases**
6. **Rerun Phase 13 audit → GO decision**

_Then_ code-level P0: GAP-001 permissions, GAP-003 Zod DTOs, GAP-004 rate limit, GAP-005 env validate, GAP-006 row_version, GAP-007 cookie parser.

---

## 10. Current Product and Competitor Findings (2026-10-09)

### 10.1 Confirmed product direction

SchoolOS's proposed product is a student- and teacher-friendly school platform with two equally supported marks-entry paths:

1. **Manual entry:** authorized users enter and manage marks without depending on AI or file upload.
2. **AI-assisted entry:** a user uploads an explicitly supported marksheet; the system extracts and matches draft values for human verification and approval.

Both paths must use the same tenant and academic context, student/enrollment identities, assessment configuration, validation, permissions, official marks/result service, lifecycle, and audit history. AI suggestions are not official data. Human approval and the configured result-publication process remain mandatory. This direction is consistent with `REQ-MRK-001`, `REQ-MRK-002`, `REQ-AI-001`, the [Master Project Specification](../requirements/master-project-specification.md), and the [hybrid marks-entry workflow](../architecture/hybrid-marks-entry-workflow.md).

### 10.2 Competitor evidence and implications

The [competitor research report](../../SchoolOS_Competitor_Research_and_AI_Instructions_Report.docx) is desk research based on public product material, not hands-on verification. Its claims are vendor-advertised/documented only to the extent stated in that report. It does not establish product quality, live behavior, or the absence of undocumented capabilities.

| Finding                                                                                                                                                                                                         | Evidence status                                                                                   | Product implication                                                                                           |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Traditional school ERP functions, manual marks/results, and report generation are already common product claims in the reviewed market.                                                                         | Advertised/documented in competitor public materials; exact workflows not independently tested.   | Do not position common ERP breadth or marksheet generation alone as SchoolOS's unique advantage.              |
| Veda advertises result entry through web/mobile and Excel upload.                                                                                                                                               | Advertised; import schema and detailed review/validation behavior remain unverified.              | Spreadsheet import alone is not a differentiator.                                                             |
| OpenEduCat documents OMR image processing and teacher-reviewed AI assessment for rubrics; these are not the same as reading variable teacher-awarded marksheets.                                                | Documented in the cited product documentation; arbitrary marks-register extraction is unverified. | Distinguish OMR, assessment assistance, and document-to-marks extraction precisely.                           |
| The exact end-to-end workflow for arbitrary photos/scans/PDFs of awarded marks, row-level matching, review, approval, and safe commit has not been verified for these competitors by the current desk research. | Not verified, not evidence of absence.                                                            | Treat this as a research question and product opportunity, not an exclusive-market claim.                     |
| Competitor breadth includes parent access, academic/administrative tools, and local or international positioning.                                                                                               | Public product descriptions; scope varies by vendor and plan.                                     | Product friendliness, school onboarding, trustworthy results, and useful daily workflows matter alongside AI. |

### 10.3 SchoolOS gaps and open findings

| Gap / finding                       | Current status                                                                                                                                                                                                                                                                                                                                                          | Required closure                                                                                                                                                                  |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Product readiness versus ambition   | The repository contains a scaffold and partial implementations; design and presence of code are not evidence of an accepted, tested product.                                                                                                                                                                                                                            | Preserve the planned/designed/implemented/tested/pilot/production distinctions in the feature-status register.                                                                    |
| Manual marks workflow               | Required by the master spec and described as a path in the hybrid workflow; do not infer production completeness from the existing exam module.                                                                                                                                                                                                                         | Reconcile manual entry, corrections, statuses, teacher scope, review, approval, and publication to requirements, APIs, screens, data, and tests.                                  |
| AI marks workflow                   | M2.1–M2.9 and the hybrid workflow describe staged extraction/review/import; AI service and worker remain scaffolding per existing current-state records.                                                                                                                                                                                                                | Keep support for each format conditional on implementation and representative accuracy/safety testing; never claim handwriting support before evidence.                           |
| Shared authority and parity         | Architecture requires both paths to converge on the central marks/result service; parity needs end-to-end evidence.                                                                                                                                                                                                                                                     | Specify and test same rules, scopes, audit/provenance, conflict checks, status semantics, result calculation, and publication gates for both paths.                               |
| Marks/result policy                 | CR-04 Document 32 is a remediation draft. Its candidate policies are fixtures, not released school defaults. Owner directions include explicit versioned choices for status outcomes, calculation modes, grace/component-minimum repair, rounding, and optional subjects; school policy configuration must be permission-gated and unavailable to student/parent users. | Product and school-domain owners must resolve remaining policy decisions, roles/scopes, exact semantics, and approve a deterministic policy contract.                             |
| Approval / separation of duties     | Project-owner direction recorded 2026-10-09: marks submitter, correction requester, and result calculator/submitter cannot approve their own submission/request/snapshot; a different authorized person must approve, and result creator cannot publish own snapshot. Product/school-domain sign-off remains open.                                                      | Reconcile role/scope, correction, result, and publication approval policies. Do not assume approvers must always be management or conflate mark approval with result publication. |
| Format, locale, and operational fit | Images/PDF/spreadsheet targets are described, but release formats, file limits, handwritten scope, Nepal-specific output needs, and performance targets are not yet evidence-backed.                                                                                                                                                                                    | Define staged supported formats, gather representative consented/de-identified samples, measure performance, then set explicit targets.                                           |
| Competitive differentiation         | The proposed document-to-marks workflow is promising but not proven unique and is not yet validated against live competitor products or real-school task outcomes.                                                                                                                                                                                                      | Verify competitors using demos where feasible; pilot with teachers/schools; measure time saved, corrections, false matches, and task completion.                                  |
| Student/teacher experience          | The differentiator must reduce repetitive workload without making review cumbersome or displacing the manual path.                                                                                                                                                                                                                                                      | Include teacher/student usability, accessibility, keyboard workflows, clear errors, and parent/student publication boundaries in UI and test artifacts.                           |

### 10.4 Current gate and next work

The controlling status remains Phase 13 **NO-GO**. The immediate work is design remediation and governance, not feature expansion:

1. Close CR-04 with explicit owner decisions; reconcile its policy contract and examples with the requirements, marks/result engine, business rules, database, API, and tests.
2. Verify the CR-01/CR-02/CR-03 remediation artifacts against one another and against the current requirements and hybrid workflow; record any remaining conflicts or approvals.
3. Complete and evidence the remaining HI-01 through HI-05 items listed in the [remediation checklist](./04-remediation-execution-checklist.md). Do not rely on historical wave estimates as current status.
4. Capture competitor claims with direct official sources, access date, and evidence labels; keep unknown capability explicitly “not verified.”
5. Rerun Phase 13, resolve findings, obtain named-owner approval, and only then seek Architecture Freeze v1.0.
6. After GO, reconcile existing scaffold to the frozen contracts and use the approved post-freeze delivery roadmap. Do not treat the AI differentiator as permission to bypass the foundation or release gates.

**Next document:** [02-code-reference-classes-functions-components.md](./02-code-reference-classes-functions-components.md) — exhaustive code map. Its historical gap counts need verification before being presented as current.
