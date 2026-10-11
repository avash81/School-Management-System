# SchoolOS UI and Brand Direction

## Status

**Locked planning decision.** Image 2 is the primary visual reference for the SchoolOS interface. It is a design-language reference, not an asset or layout to copy.

## Product direction

SchoolOS should feel like a calm, professional school-management workspace built for frequent administrative use:

- clean and minimal
- teal as the primary brand color
- white page background
- very light gray surfaces
- simple line icons
- compact sidebar navigation
- rounded cards used selectively
- generous whitespace
- simple, readable typography
- restrained visual effects

The interface should prioritize scanning, data entry, comparison, and repeated operational workflows over decoration.

## Color policy

The initial official palette is locked as follows:

| Token                | HEX       | Primary use                                                                 |
| -------------------- | --------- | --------------------------------------------------------------------------- |
| `brand.primary`      | `#046F70` | Brand, sidebar, primary actions, active navigation, links, progress, charts |
| `brand.primaryDark`  | `#03595A` | Hover, pressed, and dark brand states                                       |
| `brand.primaryLight` | `#E6F4F4` | Selected rows, icon backgrounds, AI processing, light badges                |
| `brand.primarySoft`  | `#D8EEEE` | Chart fills and subtle highlights                                           |
| `surface.page`       | `#F6F7F9` | Application background                                                      |
| `surface.panel`      | `#FFFFFF` | Cards, tables, forms, modals, panels                                        |
| `surface.alt`        | `#F9FAFB` | Table headers and subtle areas                                              |
| `text.primary`       | `#1F2937` | Headings, names, values, main content                                       |
| `text.secondary`     | `#6B7280` | Supporting text, metadata, timestamps                                       |
| `text.muted`         | `#9CA3AF` | Placeholders, disabled, low-priority text                                   |
| `border.default`     | `#E5E7EB` | Subtle borders, dividers, inputs                                            |
| `state.success`      | `#2E7D32` | Passed, completed, valid, approved                                          |
| `state.warning`      | `#F59E0B` | Review, pending, low confidence, warnings                                   |
| `state.error`        | `#DC2626` | Invalid, failed, danger, critical errors                                    |
| `text.onPrimary`     | `#FFFFFF` | Text and icons on primary surfaces                                          |

Use the teal strategically, not as the color of every element. White and light gray should dominate the interface; teal should provide brand and interaction hierarchy; green, amber, and red should remain limited to semantic states.

The implementation token set is:

```text
brand.primary
brand.primaryDark
brand.primaryLight
brand.primarySoft
surface.page
surface.panel
surface.alt
text.primary
text.secondary
text.muted
border.default
state.success
state.warning
state.error
text.onPrimary
```

Status colors must remain distinguishable from the teal brand color. The product should not become a single-hue interface.

### Component usage

- Primary button: `brand.primary` with `text.onPrimary`; hover/pressed: `brand.primaryDark`.
- Secondary button: `surface.panel` with `brand.primary` border and text.
- Inputs: `surface.panel`, `border.default`, `text.primary`; focus border: `brand.primary`.
- Tables: `surface.alt` headers, `surface.panel` rows, `surface.page` hover, `brand.primaryLight` selected rows.
- Sidebar: `brand.primary` background, `text.onPrimary` text, `#D7EEEE` inactive icons, `#178485` active state.
- Status badges: pale semantic backgrounds with `state.success`, `state.warning`, `state.error`, or `brand.primary` text.
- AI confidence: green for 95%+, teal for 75-94%, amber for 50-74%, red below 50%; thresholds remain policy-configurable.

## Navigation model

The primary application structure must support:

```text
Dashboard
Students
Teachers
Classes
Subjects
Examinations
Marksheets
Attendance
Reports
AI Import
Settings
```

Role-based visibility may hide modules a user cannot access, but the information architecture remains coherent across admin, teacher, and future student/parent experiences.

## Interaction principles

- Use compact, predictable navigation for repeated workflows.
- Use cards only for genuinely framed tools or repeated summaries.
- Keep forms and tables dense enough for work while preserving readable spacing.
- Use familiar line icons for actions and provide accessible labels/tooltips where needed.
- Make loading, empty, error, review, and permission-denied states explicit.
- Keep destructive or official-data actions visually distinct and confirmation-based.
- Prefer server-side filtering, pagination, and progressive disclosure for large school datasets.
- Keep document review interfaces optimized for desktop and keyboard use.

## Responsive behavior

Desktop is the primary workspace for administrative and marks-review workflows. Tablet and mobile layouts should remain usable for quick status checks, approvals, notices, and lightweight edits without forcing the full desktop density onto narrow screens.

## Boundaries

This decision does not define:

- final font family
- exact logo or icon set
- final component library
- pixel-level layout measurements
- copied imagery, branding, or screens from Image 2

Those decisions belong in the implementation design system while preserving this palette.

## Acceptance criteria for implementation

- The palette above is used as the initial production design-token baseline.
- New screens follow this visual direction unless a documented accessibility or workflow reason requires an exception.
- The admin shell remains compact, calm, and data-focused.
- Brand styling is centralized in design tokens rather than scattered per component.
- UI review checks desktop and mobile states, accessibility, empty/error/loading states, and long-data behavior.
