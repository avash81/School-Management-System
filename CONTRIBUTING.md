# Contributing to SchoolOS

## Before opening a pull request

1. Work from a short-lived branch created from `main`.
2. Keep changes scoped to one requirement/use case where possible.
3. Update architecture, API, migration, permission, audit, and test evidence when a change affects them.
4. Run `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, and `pnpm test`.
5. Never commit real secrets, school data, uploaded documents, or production exports.
6. Keep `.env` files local-only and never commit environment values, keys, tokens, or generated storage bundles.

## Review rules

Require at least one reviewer after a remote repository and protected branch are configured. Database, authorization, AI/OCR, infrastructure, and architecture changes require their named code owner. Use conventional commit messages and record breaking changes/migrations in the pull request description.

When a change touches access control, tenant boundaries, exam/results logic, AI/OCR extraction, or job processing, include the affected requirement IDs, migration notes, and the verification evidence used to confirm the behavior.

## Branch and release policy

Use `main` for protected, releasable work; use `feature/`, `fix/`, `docs/`, or `chore/` branches for changes. Tag approved releases semantically. Hotfixes require an incident/reference, regression test, and post-release review.

## Dependency and security policy

- Keep dependencies up to date through the repository's configured automated update flow and review all dependency bump PRs before merging.
- Treat security advisories as release-blocking. If a vulnerability is discovered in an application dependency, a framework, a container image, a database driver, or a GitHub Action, open or link the issue immediately, document the affected version and remediation, and ship the patch in the shortest safe release window.
- For dependency or security fixes, include the impacted package(s), the reason for the update, and the validation command(s) used to confirm the fix.
- Do not disable or weaken security checks, branch protection, secret scanning, or dependency scanning without explicit approval from the repo owners.
- Prefer the smallest safe upgrade path. When a dependency cannot be upgraded immediately, record the risk, the temporary mitigation, and the planned remediation date.

## Secrets, data, and operational safety

- Never commit `.env`, credentials, private keys, school data exports, uploaded documents, media files, or production database dumps.
- Use local-only development data and synthetic test fixtures. Any fixture that resembles real student or guardian data must be anonymized and approved for test use.
- Review infrastructure and operational changes with the platform owners before modifying CI, staging, production automation, or deployment configuration.

## Commit and pull request standards

- Use conventional commit messages such as `feat:`, `fix:`, `docs:`, `chore:`, and `refactor:`.
- Include a short summary, the business impact, and testing evidence in the pull request description.
- When a change introduces a migration, a breaking API contract, or a permission or audit model change, call it out explicitly in the description and link the relevant architecture or requirements document.
- Add or update tests for logic, permissions, edge cases, or migration impacts whenever those are part of the change.
