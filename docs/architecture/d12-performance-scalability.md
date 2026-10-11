# D12 — Performance and Scalability

## Capacity and targets

Initial design target: 100 schools with up to 1,000 active students each; architecture must allow growth toward 1,000 schools. Provisional targets: p95 standard API read <500 ms, scoped student search <800 ms, interactive marks save <1 s excluding network, and imports/export/bulk render acknowledged promptly then completed asynchronously. Final targets need stakeholder sign-off before launch.

## Database, caching, and queues

Index tenant/state/filter/sort fields; use cursor or bounded-page pagination; aggregate in the database; avoid N+1 access. Cache only safe tenant-isolated read models with explicit invalidation. Redis/BullMQ handles imports, documents, exports, and notifications with concurrency limits, quotas, dead letters, backpressure, metrics, and per-tenant fairness.

## Evidence

Load tests cover student search, rosters, marks grids, calculation, import batch, export, documents, and queue backlog; performance findings create indexes/query changes rather than relying on larger machines alone.
