# AGENTS.md

## Repo Context
- Project: `KONI-WEB`
- Purpose: public KONI portal + SIM Internal + Admin CMS
- Monorepo apps:
  - `apps/web` = React/Vite frontend
  - `apps/api` = Express/Prisma backend

## Current Reality
- Prisma is intentionally pinned to `6.2.1`.
- SIM Internal fase 2 is complete.
- Phase 3 (Tournament & Event Management) is complete:
  - Tournament models, bracket generation, and ranking computation are implemented.
  - Phase 3B Sandbox flow (isolation for non-admin users) is implemented.
  - Phase 3 PRD Closure (Event Registration, Socket.IO Real-time updates, Excel/PDF Export) is implemented.
- Phase 4 (Official vs Sandbox Isolation & RBAC) is implemented and verified.
- Admin dashboard stats are live and use `/admin/dashboard-stats`.
- Homepage consumes real event and medal data, supports real-time updates via Socket.IO, and hides empty sections.

## High-Signal Constraints
- Do not reintroduce dummy-first homepage rendering.
- Public endpoints only expose `scope=OFFICIAL`.
- Sandbox data must never mutate official medal/homepage standings.
- Prefer minimal patches that preserve the existing project structure.
- Do not revert unrelated dirty worktree changes.

## Current Known Environment Issues
- `npx.ps1` may be blocked by PowerShell execution policy.
- Global Node `25.x` is incompatible with this repo's Prisma `6.2.1`.
- Local portable Node `22.x` in `.tools/node-lts` is the MANDATORY runtime for Prisma and verification.
- `db:seed` and `test:api` should prefer plain Node execution over `tsx`.
- Use `cmd /c` when PowerShell wrapper becomes the blocker.
- Prisma CLI failures (`spawn EPERM`) are sandbox-related; outside the sandbox with local Node `22.x`, it works.

## Priority Files
- `apps/api/src/routes/admin.ts`
- `apps/api/src/routes/public.ts`
- `apps/api/src/socket.ts`
- `apps/api/src/services/tournament-bracket.service.ts`
- `apps/api/src/controllers/event.controller.ts`
- `apps/web/src/hooks/useLiveEvent.ts`
- `apps/api/scripts/verify-phase4.ts`

## Immediate Remaining Work
1. Maintain stability across all phases (2, 3, 4).
2. Continue with any pending frontend UI refinements for Phase 3/4 features.
3. Ensure all verification scripts (`verify-full`) pass before any deployment.
