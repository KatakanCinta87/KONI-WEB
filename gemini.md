# Gemini Handoff

## Current Summary
- Fase 2 core auth/RBAC/admin/gallery work has already been debugged.
- Event and medal standings per event are implemented across schema, seed, API, admin CMS, and homepage.
- Medal standings must be treated as `per event`, not global.

## Implemented So Far
- Prisma schema updated for:
  - `Event`
  - `MedalStanding` with `eventId + caborId` uniqueness
- Migration added:
  - `apps/api/prisma/migrations/20260309113000_link_medal_standings_to_event/migration.sql`
- Seed updated to include one event and minimal standings
- Admin API source added for event CRUD and replacing medal standings

## Remaining
- Fix admin dashboard stats route mismatch
- Re-run automated verification with local portable Node `22.x`
- Keep Prisma-related commands off global Node `25.x`

## Important Caveat
- Source compiles with TypeScript, but Prisma client regeneration is currently blocked in this local environment by `spawn EPERM`.
- Before runtime validation, run:
  - migration
  - `prisma generate`
  - seed

## Recommended Next Action
- Use `.tools/node-lts` / `run.bat` for Prisma and verification commands, then continue with remaining admin/dashboard cleanup.
