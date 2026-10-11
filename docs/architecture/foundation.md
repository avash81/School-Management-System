# Foundation Architecture

- Next.js frontend talks only to the NestJS API.
- NestJS is the backend entry point for all clients.
- PostgreSQL stores business data.
- Redis stores queues, cache, and ephemeral workflow state.
- MinIO stores documents and media.
- BullMQ worker processes asynchronous jobs.
- FastAPI handles AI/OCR workloads.
- The UI follows the locked Image 2 design language documented in [ui-brand-direction.md](ui-brand-direction.md).
