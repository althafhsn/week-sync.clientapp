# WeekSync Frontend — Project Documentation

Companion doc to the [README](../README.md). The README covers setup/run; this file covers the deeper "how it's built and how to extend it" reference, including the manual-enhancement guide.

> Backend counterpart: [`week-sync.api/docs/PROJECT_DOCUMENTATION.md`](../../week-sync.api/docs/PROJECT_DOCUMENTATION.md)

## 1. Project Overview

WeekSync is a weekly-report and team-dashboard tool. This repo is the UI: team members log in, fill out a structured weekly report (tasks, hours, blockers/achievements, next week's plan), and track its status through a review cycle; managers see a team-wide dashboard, review/approve/reject reports, and administer users, teams, and projects. See the README's "Pages Implemented" table for the full page list.

**Target users:** Team Member and Manager — the same two roles the backend enforces. The UI hides manager-only actions from members, but the backend is the actual authority (`RolesGuard`); the frontend never trusts the client alone for access control.

## 2. Technology Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router), React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS 4, `shadcn`-style components over Base UI primitives (`src/components/ui/`) |
| Charts | Recharts (`TeamAnalytics.tsx`, `StatCard.tsx`) |
| Dates | `react-day-picker`, `date-fns` |
| State | Local component state + React hooks; a small global store (`src/lib/store.tsx`) for auth/session; no external state library (Redux/Zustand) |
| API access | Server-side Next.js Route Handlers (`src/app/api/**`) proxy to the NestJS backend; the browser never talks to the backend directly |

## 3. Architecture

**Two-hop API calls, by design:** a page/component calls a typed function in `src/lib/api/*-client.ts`, which `fetch`es a Next.js Route Handler under `src/app/api/**`, which attaches server-side credentials and forwards to the NestJS API, then relays the response back. This keeps API keys off the browser and gives one place (`backend-fetch.ts`, `relay.ts`) to handle auth-refresh-on-401 and error normalization consistently.

```text
Browser component → src/lib/api/*-client.ts → src/app/api/**/route.ts → NestJS backend
```

**Route groups:** `src/app/(auth)/` holds public pages (login, signup); `src/app/(dashboard)/` holds everything behind auth, sharing a layout (`AppShell.tsx`) with header/sidebar navigation.

**Component layering:**
- `src/components/ui/` — generic primitives (button, dialog, table, select...), no business logic.
- `src/components/admin/`, `report-editor/`, `report-detail/`, `app-shell/`, `auth/` — feature-specific composite components.
- Top-level `src/components/*.tsx` (e.g. `ReportTable.tsx`, `FilterBar.tsx`, `StatCard.tsx`) — shared across more than one feature area.

**Shared logic lives in `src/lib/`:** `types.ts` (entity shapes, the source of truth for `Report`/`User`/`Project`/etc. — never redefine these locally in a component), `utils.ts` (small helpers like `getErrorMessage`, `randomId`), `date.ts` (date parsing/formatting), the two shared data hooks (`use-report-list-query.ts`, `use-paginated-crud.ts`), `store.tsx` (session/auth state), `demo-data.ts` (seed/demo content), and `api/` (all backend-facing client code).

## 4. Code Quality — Current State & Improvements Made

The codebase already followed consistent conventions (route groups, `lib/api` client-per-resource pattern, shared UI primitives) before this pass. What changed:

- **Removed duplication**, not functionality — every change below is behavior-neutral; the pages look and act the same. See the README's "Code Quality Improvements" section for the itemized list.
- **New reusable pieces:** `getErrorMessage`, `randomId`, `parseLocalDate`/`toIsoDate`/`formatDateLabel`, `makeLookupClient<T>`, `proxyGet`, `<EntityPickerField>`, `<AuthLayout>`, `useReportListQuery`, `usePaginatedCrud`. Use these instead of re-deriving the same logic when building new features (see §8).
- **Net line count:** -159 lines despite adding two new hooks and two new components, because the duplication removed (5 error-handler copies, 3 date-helper copies, 8 near-identical lookup clients, 8 near-identical proxy routes, a 3x-duplicated picker dialog, a 3x-duplicated auth shell, and two ~90%-identical page pairs) outweighed the small amount of new shared code.
- `npm run build` and `npm run lint` both pass clean after the refactor.

## 5. API Documentation (frontend's view)

The frontend only ever calls its own `/api/**` proxy routes, never the backend directly. See the backend's `docs/PROJECT_DOCUMENTATION.md` §5 for the full endpoint table with "consumed by" mapping. Frontend-side, the relevant files per resource are:

| Resource | Client file(s) | Proxy route(s) |
|---|---|---|
| Auth | `auth-client.ts`, `signup-client.ts` | `app/api/auth/**` |
| Users | `users-client.ts` | `app/api/users/**` |
| Projects | `projects-client.ts` | `app/api/projects/**` |
| Teams | `teams-client.ts` | `app/api/teams/**` |
| Team members | `team-members-client.ts` | `app/api/team-members/**` |
| Reports | `reports-client.ts` | `app/api/reports/**` (incl. `/search`, `/[id]/history`) |
| Dashboard | `dashboard-client.ts` | `app/api/dashboard/summary/route.ts` |
| Lookups (priority/status/role/etc., 8 total) | `*-client.ts` via `makeLookupClient<T>` | `app/api/*/route.ts` via `proxyGet` |

## 6. Frontend Documentation

**Main pages** (see README for the full route table): dashboard, report create/edit, report list, report detail, team dashboard, manager review, project/team/user admin, settings. Auth pages (`login`, `signup`, `change-password`) share `<AuthLayout>`.

**Shared/reusable components:**
- `ReportTable.tsx`, `FilterBar.tsx`, `StatCard.tsx`, `AnimatedNumber.tsx`, `StatusBadge.tsx`, `PageActions.tsx`, `DateField.tsx`, `DateRangeField.tsx` — cross-feature building blocks.
- `admin/EntityPickerField.tsx` — searchable multi-select-with-chips dialog, used by project/team editor cards.
- `auth/AuthLayout.tsx` — shared shell for the three auth pages.
- `ui/*` — low-level primitives (Base UI-backed).

**Data flow / state:**
- Auth/session state: `src/lib/store.tsx`, read via a hook consumed by `AppShell.tsx` and gated pages.
- List pages with pagination/filtering (`reports`, `team/reports`): `useReportListQuery` owns search text, AI-mode toggle, status/project/date filters, and pagination; the page only supplies `userId`/`extraFilters` and renders page-specific JSX (e.g. the manager page's member filter column).
- Admin CRUD pages (`users`, `teams`, `projects`): `usePaginatedCrud` owns page/pageSize/total/loading and the "step back a page after deleting the last row" edge case; the page supplies `loadPage`/`loadAll`/`deleteFn` and renders entity-specific cards/editors.
- Everything else is local `useState`/`useEffect` — there's no global client-side cache or state library; each page fetches what it needs through the `lib/api` clients.

**Important UI functionality:** the report edit form enforces the fixed weekly-report structure (tasks, hours-by-type, blockers/achievements with a "key" flag, next-week plan) client-side before submit, mirroring backend validation as a UX nicety — the backend's `ValidationPipe` is still the actual enforcement point.

## 7. Backend Documentation

See [`week-sync.api/docs/PROJECT_DOCUMENTATION.md`](../../week-sync.api/docs/PROJECT_DOCUMENTATION.md) for controllers, services, DTOs, and database interaction — that's owned by the other repo.

## 8. Changes and Improvements

See §4 above and the README's "Code Quality Improvements" section for the full itemized before/after list (9 duplication fixes, net -159 lines, build/lint clean).

## 9. Manual Enhancement Guide

**Adding a new page/feature:**
1. Add a route under `src/app/(dashboard)/<feature>/page.tsx` (or `(auth)/` if it's public).
2. If it's a paginated list, reach for `useReportListQuery` (report-shaped) or `usePaginatedCrud` (generic CRUD) before writing new pagination logic — check if either fits before adding a third variant.
3. Reuse `src/lib/utils.ts` (`getErrorMessage`, `randomId`) and `src/lib/date.ts` for anything date/error/id related instead of re-implementing.
4. Add any new shared types to `src/lib/types.ts` rather than defining them locally in the component.

**Adding a new API call:**
1. Add the backend endpoint first (see the backend doc's §8).
2. Add a Next.js proxy route under `src/app/api/<resource>/route.ts` — for a simple read-only list endpoint, use `proxyGet("/backend-path")` (see `src/lib/api/relay.ts`) instead of writing a new handler by hand.
3. Add a typed client function in `src/lib/api/<resource>-client.ts` — for a simple lookup/reference-data GET, use `makeLookupClient<T>("/api/<resource>")` (see `src/lib/api/lookup-client-factory.ts`); for full CRUD, follow the pattern in `projects-client.ts`/`teams-client.ts`/`users-client.ts`.

**Connecting a new API to the frontend:** call the client function from `src/lib/api/` inside a page or component's `useEffect`/event handler; don't `fetch()` a proxy route directly from a component — always go through the typed client so error handling and typing stay consistent.

**Where business logic should be placed:** validation/transformation that's purely about presenting data belongs in the component or a `lib/` helper; anything about *what's allowed* (can this user edit this report, is this transition valid) belongs on the backend — the frontend should reflect that logic for UX, not be the source of truth for it.

## 10. Known Limitations / Future Improvements

- No client-side data cache/library (React Query, SWR, etc.) — each page re-fetches on mount; acceptable at current scale but worth reconsidering if list pages grow expensive.
- `usePaginatedCrud` and `useReportListQuery` were extracted for the specific 2-3 call sites each currently has; if a fourth similar page appears, revisit whether the hooks' options need to grow or whether that page has different-enough needs to stay separate.
- No end-to-end/UI test suite currently exists in this repo — `npm run lint` and `npm run build` are the current safety net for frontend changes.
- Demo/seed data (`src/lib/demo-data.ts`) exists for local development convenience; it isn't wired to any "reset demo data" feature — worth adding if demos become a regular need.
