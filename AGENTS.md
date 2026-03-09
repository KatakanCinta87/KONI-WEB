# AGENTS.md

## Repo Context
- Project: `KONI-WEB`
- Purpose: public KONI portal + SIM Internal + Admin CMS
- Monorepo apps:
  - `apps/web` = React/Vite frontend
  - `apps/api` = Express/Prisma backend

## Current Reality
- Prisma is intentionally pinned to `6.2.1`.
- SIM Internal fase 2 is now functionally complete:
  - auth login + refresh + logout are implemented
  - admin dashboard stats are live and data-driven
  - admin athlete management supports list/create/edit/delete flow according to current RBAC
  - admin news CMS is implemented
- Event and medal standings are modeled per event.
- Admin API source for event and medal standings already exists.
- Public API and admin UI for event/medal are already implemented.
- Homepage now consumes real event and medal data and hides empty sections.

## High-Signal Constraints
- Do not reintroduce dummy-first homepage rendering.
- Hide event/medal sections on homepage if real API data is empty.
- Prefer minimal patches that preserve the existing project structure.
- Do not revert unrelated dirty worktree changes.

## Current Known Environment Issues
- `npx.ps1` may be blocked by PowerShell execution policy.
- Global Node `25.x` is incompatible with this repo's Prisma `6.2.1`.
- Local portable Node `22.x` may exist in `.tools/node-lts` and should be preferred.
- `db:seed` and `test:api` should prefer plain Node execution over `tsx`.
- Use `cmd /c` when PowerShell wrapper becomes the blocker.
- Prisma CLI failures that show `schema-engine-windows.exe spawn EPERM` inside Codex are sandbox-related; outside the sandbox with local Node `22.x`, migrate/generate work.

## Priority Files
- `apps/api/src/routes/auth.ts`
- `apps/api/src/routes/admin.ts`
- `apps/api/src/lib/zod-schemas.ts`
- `apps/api/scripts/verify-phase2.ts`
- `apps/web/src/pages/admin/AdminDashboardPage.tsx`
- `apps/web/src/pages/admin/AdminAthletesPage.tsx`
- `apps/web/src/lib/axios.ts`
- `PROJECT_MEMORY.md`
- `REMAINING_PLAN.md`

## Immediate Remaining Work
1. Preserve Phase 2 stability while continuing Phase 3+ work
2. Keep using local Node `22.x` for Prisma-related commands
3. Re-run automated verification after substantial backend/auth/admin changes
