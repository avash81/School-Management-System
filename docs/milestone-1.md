# Milestone 1 - Project Foundation

This milestone establishes the monorepo, local infrastructure, and service entrypoints for SchoolOS.

## Included

- Turborepo and pnpm workspace
- Next.js web app
- NestJS API with `/health`
- BullMQ worker bootstrap
- FastAPI AI service with `/health`
- Prisma database package
- Redis, PostgreSQL, and MinIO local compose setup
- CI workflow

## Runbook

1. Copy `.env.example` to `.env`.
2. Start local infrastructure with Docker Compose.
3. Install dependencies with `pnpm install`.
4. Run `pnpm dev`.
