# SchoolOS

SchoolOS is an AI-first school ERP monorepo built with Turborepo, pnpm, TypeScript, Next.js, NestJS, BullMQ, FastAPI, and Prisma.

## Workspace

- `apps/web` - student and parent portal
- `apps/admin` - staff/admin console
- `apps/api` - NestJS API with health endpoint
- `apps/worker` - BullMQ worker for background jobs
- `apps/ai-service` - Python FastAPI service for AI workflows
- `packages/database` - Prisma schema and client
- `packages/types` - shared TypeScript types
- `packages/validation` - shared Zod schemas
- `packages/config` - environment helpers
- `packages/auth` - auth utilities
- `packages/logger` - structured logging helpers
- `packages/storage` - object storage helpers
- `packages/shared` - generic shared utilities
- `infrastructure/docker` - local container definitions
- `infrastructure/nginx` - reverse proxy configuration
- `infrastructure/monitoring` - Prometheus config

## Release status

M1 architecture review is documented in [docs/release/m1-13-final-review.md](docs/release/m1-13-final-review.md). The repository is implementation-ready but not production-release-ready: automated test suites, permission enforcement, worker processing, PDF/storage generation, and operational automation remain before the MVP gate can pass.

The implementation order is tracked in [docs/roadmap/master-development-plan.md](docs/roadmap/master-development-plan.md).

The locked UI and brand direction is documented in [docs/architecture/ui-brand-direction.md](docs/architecture/ui-brand-direction.md). Image 2 is the visual reference and the initial teal/light-gray token palette is approved.

The dedicated system-design phase begins with [D0.1 System Scope and Boundary](docs/architecture/d0-1-system-scope-boundary.md). The governing [Master Project Specification](docs/requirements/master-project-specification.md) keeps the project in planning mode: D0.4 is in progress and application development is deferred until the full architecture freeze.

The complete D0 artifact map and plan-lock checklist are in [d0-system-design-index.md](docs/architecture/d0-system-design-index.md). Cross-cutting design packages include business rules, traceability, lifecycle/versioning, localization, accessibility, observability, AI evaluation, privacy, performance, capacity, and recovery.

D0.2 System Context is documented in [d0-2-system-context.md](docs/architecture/d0-2-system-context.md). It defines the system boundary, actors, stores, workers, AI/OCR, notifications, monitoring, backup, trust boundaries, and synchronous/asynchronous paths.

M2 architecture begins with [docs/architecture/m2-1-ai-ocr-processing.md](docs/architecture/m2-1-ai-ocr-processing.md). It defines extraction, matching, validation, human review, and the boundary into the existing marks engine; it does not enable automatic marks mutation.

M2.2 is specified in [docs/architecture/m2-2-file-upload-processing.md](docs/architecture/m2-2-file-upload-processing.md). It defines secure upload, quarantine, job lifecycle, queue processing, resumability, and the approval handoff; implementation is still pending.

M2.3 is specified in [docs/architecture/m2-3-ocr-table-detection.md](docs/architecture/m2-3-ocr-table-detection.md). It defines coordinate-aware OCR, preprocessing, table reconstruction, multi-page handling, and the intermediate boundary before extraction.

M2.4 is specified in [docs/architecture/m2-4-student-marks-extraction.md](docs/architecture/m2-4-student-marks-extraction.md). It defines normalized student/marks records, component mapping, status handling, totals, confidence, and provenance before matching.

M2.5 is specified in [docs/architecture/m2-5-student-matching.md](docs/architecture/m2-5-student-matching.md). It defines tenant-scoped candidate generation, deterministic identifiers, historical enrollment matching, explainable evidence, conflict handling, and manual overrides.

M2.6 is specified in [docs/architecture/m2-6-confidence-validation.md](docs/architecture/m2-6-confidence-validation.md). It defines versioned validation rules, severity, field confidence, mathematical checks, correction history, and `AUTO_IMPORT`/`REVIEW_REQUIRED`/`REJECTED` decisions before official marks.

M2.7 is specified in [docs/architecture/m2-7-human-review-interface.md](docs/architecture/m2-7-human-review-interface.md). It defines exception-first review, source highlighting, corrections, revalidation, matching overrides, approval summaries, and server-enforced review permissions.

M2.8 is specified in [docs/architecture/m2-8-automatic-marks-import.md](docs/architecture/m2-8-automatic-marks-import.md). It defines the staged-to-official marks handoff, create/update/conflict planning, transactionality, idempotency, concurrency, provenance, and version-aware rollback.

M2.9 is specified in [docs/architecture/m2-9-bulk-processing-queues.md](docs/architecture/m2-9-bulk-processing-queues.md). It defines bounded jobs, stage queues, progress, retries, dead-letter handling, cancellation, reconciliation, fairness, and idempotent worker behavior. Implementation remains deferred during planning mode.

The integrated [hybrid marks-entry workflow](docs/architecture/hybrid-marks-entry-workflow.md) defines the parallel manual and AI-assisted paths, their shared validation and approval controls, and the rule that AI suggestions require human verification before official marks change.

## Prerequisites

- Node.js 20.11+
- pnpm 9+
- Python 3.11+
- Docker and Docker Compose

## Quick Start

1. Install dependencies:

```bash
pnpm install
```

2. Copy environment variables:

```bash
cp .env.example .env
```

3. Start the local dependencies (Postgres, Redis, MinIO):

```bash
docker compose -f infrastructure/docker/docker-compose.yml up -d postgres redis minio
```

4. Generate Prisma client:

```bash
pnpm db:generate
```

5. Run the whole local stack in one command:

```bash
pnpm dev:local
```

This starts the API, web app, admin app, and worker together.

Stop the local test stack when you are done:

```bash
pnpm local:stop
```

Manual startup if you want full control:

```bash
pnpm --dir apps/api dev
pnpm --dir apps/web dev
pnpm --dir apps/admin dev
pnpm --dir apps/worker dev
```

Run them in separate terminals, or use your IDE terminal split view.

If a standard localhost port is already in use on your machine, override the defaults before startup:

```bash
API_PORT=4100 WEB_PORT=3100 ADMIN_PORT=3102 pnpm dev:local
```

The app scripts now respect those values so the stack can boot cleanly on a shared machine without hard-coded localhost collisions.

## Testing URLs

- Web portal: http://localhost:3000
- Admin console: http://localhost:3002
- API docs: http://localhost:4000/docs
- API health: http://localhost:4000/api/v1/health
- Worker: logs startup and queues jobs in Redis

These are the default local entry points for user testing.

## Common Commands

- `pnpm lint` - lint all TypeScript workspaces
- `pnpm build` - build the full repo
- `pnpm test` - run workspace tests
- `pnpm typecheck` - run TypeScript checks
- `pnpm format:check` - validate formatting

## Services

- API health: `GET /api/v1/health`
- API readiness: `GET /api/v1/readiness`
- Admin dashboard summary: `GET /api/v1/dashboard/summary` (authenticated)
- Dashboard progress: `GET /api/v1/dashboard/examination-progress`, `/pending-actions`, `/recent-activity`
- Reports: `GET /api/v1/reports/students`, `/results`, `/examinations` (authenticated)
- Notices: `GET|POST /api/v1/notices`, `PATCH /api/v1/notices/:id`, publish and archive actions
- API documentation: `http://localhost:4000/docs`
- Worker heartbeat: logs startup and waits on BullMQ
- AI service health: `GET /health`

## Infrastructure

- PostgreSQL, Redis, and MinIO are defined in `infrastructure/docker/docker-compose.yml`
- Nginx reverse proxy config lives in `infrastructure/nginx/default.conf`
- Prometheus config lives in `infrastructure/monitoring/prometheus.yml`

## Notes

The project uses a modular monolith foundation. Domain modules can expand without changing the workspace shape, and future AI imports must feed the existing marks engine rather than create a parallel result path.
