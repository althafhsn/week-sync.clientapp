# WeekSync

Frontend for **WeekSync** — a weekly report generator and team dashboard built for the *Technical Assignment: Weekly Report Generator & Team Dashboard* (see [`Technical SE Assignment.pdf`](./Technical%20SE%20Assignment.pdf)). Team members submit structured weekly reports through a fixed, consistent format; managers review, request corrections, or approve them, and get a team-wide analytics dashboard.

Built with Next.js (App Router), React 19, and Tailwind CSS.

> Backend repo: [`week-sync.api`](../week-sync.api/README.md) — see that README for the API, database schema, and auth/RBAC design.

## Pages Implemented

The assignment required at least 7 of the listed page/view types, connected to real backend data. This app implements all of them, plus a few extras:

| Page | Route | Notes |
|---|---|---|
| Login | `/login` | |
| Register (signup) | `/signup` | |
| Personal weekly report — create/edit | `/reports/new`, `/reports/[id]/edit` | Fixed field set, task-level table, key blocker/achievement flags |
| Report history (per user) | `/reports` | List view with status, separate from create/edit |
| Report detail (read-only) | `/reports/[id]` | Shared view for both team members and managers |
| Team dashboard (manager view) | `/team` | Filters by member/project/date range, status tracking |
| Manager review | `/team/review/[id]` | Approve / Request Changes with a comment |
| Team member profile (manager view) | `/team/members/[id]` | Full report history and stats per member |
| Project/category management | `/projects` | Full CRUD list page, not a modal |
| User management (admin) | `/users` | Invite/manage team members, assign roles |
| Team management (admin) | `/teams` | Create/manage teams and rosters |
| Team-wide report browser | `/team/reports` | Cross-team report listing for managers |
| Account settings | `/settings`, `/change-password` | |

Report version history (previous versions of a report kept visible after a correction cycle, not overwritten) is rendered in `components/report-detail/VersionHistoryCard.tsx`, backed by the API's `/reports/:id/history` endpoints.

Dashboard summary metrics and charts (submission compliance, open blockers, workload/status breakdowns) are built with [Recharts](https://recharts.org/) in `components/TeamAnalytics.tsx` and `components/StatCard.tsx`, fed by `/api/dashboard/summary`.

## Architecture

The app never calls the NestJS API directly from the browser. Every backend call goes through a Next.js Route Handler under `src/app/api/**`, which attaches the server-side API key/credentials and proxies to the backend. This keeps backend credentials off the client and gives a single place to normalize errors and pagination for the UI.

```text
week-sync.clientapp/
├── src/
│   ├── app/
│   │   ├── (auth)/               # /login, /signup — public routes
│   │   ├── (dashboard)/           # Authenticated app shell
│   │   │   ├── dashboard/          # Manager summary dashboard
│   │   │   ├── reports/            # Personal report list, create, edit, detail
│   │   │   ├── team/               # Team dashboard, member profile, review, team-wide reports
│   │   │   ├── projects/           # Project/category CRUD
│   │   │   ├── teams/, users/      # Admin: team & user management
│   │   │   └── settings/           # Account settings
│   │   └── api/                   # Route handlers that proxy to the backend (auth, reports, projects, teams, users, lookups, dashboard)
│   ├── components/
│   │   ├── report-editor/          # Task rows, next-week task list, entry fields
│   │   ├── report-detail/          # Read-only report view, feedback/version-history cards
│   │   ├── admin/                  # Project/team/user editor cards
│   │   ├── app-shell/               # Header, sidebar navigation
│   │   └── ui/                     # Reusable primitives (button, dialog, table, select, ...)
│   └── lib/api/                    # Typed client wrappers + entity/DTO types shared with the API contracts
```

## Getting Started

```bash
npm install
```

Copy the env template and fill in the backend connection details:

```bash
cp .env.example .env.local
```

```env
# .env.local — server-only, never exposed to the browser
API_BASE_URL=http://localhost:3000
API_KEY=
```

Run the dev server (requires the [backend](../week-sync.api/README.md) running, migrated, and reachable at `API_BASE_URL`):

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — if the API also runs on 3000, set `PORT` for one of the two apps to avoid a clash.

## Running the Full Stack Locally

1. **Database** — start/point at a PostgreSQL instance.
2. **Backend** — see [`week-sync.api` README](../week-sync.api/README.md): `npm install`, configure `.env`, `npx prisma migrate deploy`, `npm run start:dev`.
3. **Frontend** — this repo: `npm install`, configure `.env.local` with `API_BASE_URL` pointing at the backend, `npm run dev`.

## Scripts

```bash
npm run dev     # start dev server
npm run build   # production build
npm run start   # run production build
npm run lint    # eslint
```

## Tech Stack

- **Framework:** Next.js 16 (App Router), React 19
- **Styling:** Tailwind CSS 4, `shadcn`-style components on top of Base UI primitives
- **Charts:** Recharts
- **Forms/dates:** `react-day-picker`, `date-fns`
