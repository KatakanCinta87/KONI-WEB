# Current State Map

Status date: `2026-03-10`

## Confirmed Sources
- `PROJECT_MEMORY.md`
- `REMAINING_PLAN.md`
- `README.md`
- workspace `package.json`
- `apps/api/package.json`
- `apps/web/package.json`
- `apps/api/prisma/schema.prisma`
- `apps/api/src/index.ts`
- `apps/api/scripts/verify-phase2.ts`
- `apps/web/src/App.tsx`

## Executive Summary
- `KONI-WEB` is a monorepo for the public KONI portal, SIM Internal, and Admin CMS.
- `apps/web` is the React + Vite frontend that serves both the public site and admin interface.
- `apps/api` is the Express + Prisma backend.
- SIM Internal Phase 2 is functionally complete and should now be treated as a stabilization baseline, not an open feature area.
- Event management and medal standings are already implemented end-to-end using a `per event` model.
- Homepage event and medal sections already consume real API data and intentionally hide when the underlying data is empty.

## Workspace Shape

```text
KONI-WEB/
|-- apps/
|   |-- api/        # Express + Prisma backend
|   `-- web/        # React + Vite frontend
|-- packages/
|-- PROJECT_MEMORY.md
|-- REMAINING_PLAN.md
|-- README.md
`-- AGENTS.md
```

## Backend State (`apps/api`)

### Runtime and scripts
- Uses `Express` with `type: module`.
- Prisma is pinned to `6.2.1`.
- Dev entry is `src/index.ts`.
- Verification script is `scripts/verify-phase2.ts`.
- Seed script runs with plain Node via `node --experimental-strip-types prisma/seed.ts`.

### Registered route areas
- `auth`
- `athletes`
- `coaches`
- `news/admin`
- `cabor`
- `admin`
- `gallery`
- `events`
- `health`
- public `news`
- public `contact`

### Confirmed backend capabilities
- Auth lifecycle is present: login, refresh, logout, forgot password, reset password.
- Dashboard stats are live and returned from admin endpoints.
- Athlete CRUD exists, with delete flow protected by RBAC.
- Coach CRUD exists.
- News CMS exists.
- Event CRUD exists for admin.
- Medal standings can be managed per event from admin endpoints.
- Public read endpoints exist for events and medal standings.
- Gallery upload/display flow exists.
- Static uploads are served from `/uploads` with `Cross-Origin-Resource-Policy: cross-origin`.

## Database and domain model state
- Core roles: `SUPER_ADMIN`, `CABOR_ADMIN`, `COACH`, `ATHLETE`.
- Core domains modeled in Prisma:
  - users and refresh/reset tokens
  - cabang olahraga
  - athletes
  - coaches
  - achievements
  - athlete documents
  - SK documents
  - news
  - events
  - medal standings
  - gallery and albums
  - physical tests
  - audit logs
  - system settings
- Medal standings are no longer global-by-cabor.
- The active relation is `Event -> medalStandings[]` with uniqueness on `eventId + caborId`.

## Frontend State (`apps/web`)

### Routing and surface area
- Public pages confirmed in router:
  - `/`
  - `/profil`
  - `/cabor`
  - `/berita`
  - `/kontak`
- Admin pages confirmed in router:
  - `/admin/login`
  - `/admin/dashboard`
  - `/admin/athletes`
  - `/admin/coaches`
  - `/admin/news`
  - `/admin/events`
  - `/admin/cabors`
  - `/admin/users`
  - `/admin/sk`
  - `/admin/gallery`
  - `/admin/audit-logs`
  - `/admin/settings`

### Confirmed frontend capabilities
- Auth context and protected routes are active.
- Role-gated admin navigation is active from the router layer.
- Dashboard uses live data.
- Admin athlete list/create/edit/delete flow exists.
- Admin coach list/create/edit flow exists.
- Admin news list/editor flow exists.
- Admin event list/editor flow exists.
- Admin gallery page exists.
- Homepage is wired to real event and medal data.

## Verification State
- Existing automated verification is centered in `apps/api/scripts/verify-phase2.ts`.
- The scripted checks confirm:
  - admin login
  - protected athlete fetch
  - RBAC denial for coach delete
  - refresh token flow
  - logout token revocation
  - health endpoint
  - public cabor endpoint
  - contact form
- Stored project memory also records successful recent browser smoke tests for homepage empty states and admin/gallery flows.

## Environment Constraints
- Use Node `>=20 <23`; local portable Node `22.x` is the preferred runtime for this repo.
- Do not rely on global Node `25.x` for Prisma commands.
- PowerShell may block `npx.ps1`; prefer `cmd /c` when wrappers get in the way.
- Prisma engine `spawn EPERM` inside Codex is treated as a sandbox issue, not a schema defect.
- `run.bat` is part of the supported local workflow and prefers local Node in `.tools/node-lts` when available.

## Current Runtime Reality
- Phase 2 is complete from a functional perspective, but still needs preservation against regressions.
- Event and medal scope is complete and should not be reimplemented.
- Homepage event and medal sections are expected to disappear when real admin data is empty.
- Based on stored notes, the last manual browser test deleted current admin event items, so empty homepage event state may be the present live dataset condition.

## Recommended Working Baseline
1. Treat current auth/admin/event behavior as the baseline to protect.
2. Keep Prisma-related work on local Node `22.x`.
3. Re-run automated verification after substantial backend/auth/admin changes.
4. Recreate sample event data before any demo that expects visible homepage event or medal content.
5. Focus next implementation work on the approved Phase 2 hardening/refactor track, not on reopening already-closed Phase 2 scope.
