# SchoolOS Workspace Guidance

- Prefer production-ready defaults and keep the sprint-0 bootstrap minimal but complete.
- Use the existing Turborepo / pnpm / TypeScript stack and shared packages before introducing new abstractions.
- Keep service boundaries clear between web, admin, api, worker, and ai-service.
- Favor small, composable modules and explicit health endpoints for each runtime service.
