# D9 — UI/UX Architecture

## Design system

Use the approved teal direction in `ui-brand-direction.md`. Define semantic tokens for primary, surface, text, border, success, warning, error, and focus; avoid hard-coded component colors. Specify typography, 4/8px-based spacing, radii, elevation, icon use, data-table states, forms, modals, and loading/empty/error states.

## Navigation and screens

Role-aware desktop navigation: Dashboard, Students, Teachers, Academics, Examinations, Marks, Attendance, Results, Documents, Reports, Notices, Settings. Screens must include scoped student search/profile, teacher workspaces, marks grid and lifecycle controls, import-review queue, result review/publish, document history, and audit-aware configuration.

## Accessibility and responsiveness

Keyboard navigation, visible focus, semantic labels, contrast-compliant status, screen-reader error summary, accessible tables, non-colour-only status, mobile/tablet layouts, and clear destructive-action confirmation are mandatory. Frontend validation improves clarity but never decides authorization/business truth.
