# Project Memory

## Project
- Name: `KONI-WEB`
- Type: monorepo for KONI Kabupaten Malang public portal, SIM Internal, and Admin CMS
- Root path: `C:\Users\LENOVO\KONI-WEB`

## Current State
- Public web app and admin CMS both exist in `apps/web`.
- API exists in `apps/api`.
- Prisma has been stabilized on `6.2.1`.
- Gallery API/admin flow has been debugged and minimally fixed.
- Gallery thumbnails now load correctly across `localhost:3000` -> `localhost:5173` after static upload headers were corrected.
- Home page has been reduced away from dummy-first rendering and now uses live API calls with `Promise.allSettled`.
- Event and medal standings per event are now wired through Prisma, seed, admin API, public API, admin CMS, and homepage.
- SIM Internal Phase 2 can now be treated as done from a functional standpoint.
- Approved next initiative has been saved as: `Refactor Phase 2 on Security, Efisiensi, and PRD Approved`.

## Important Technical Facts
- API dev script from root: `npm run dev:api`
- Web dev script from root: `npm run dev:web`
- Root helper: `run.bat`
- `run.bat` now prefers local portable Node in `.tools/node-lts` when present
- API lint: `npm run lint -w @koni/api`
- Web lint: `npm run lint -w @koni/web`
- API verify script: `npm run test:api -w @koni/api`
- Browser automation in this repo is currently working with `agent-browser` via `cmd /c`, headed Brave, and session reuse.

## Database / Prisma Notes
- Prisma version is pinned to `6.2.1`.
- Schema now models medal standings per event, not global per cabor.
- Current relation target:
  - `Event` -> `medalStandings[]`
  - `MedalStanding` -> `eventId + caborId` unique
- Added migration file:
  - `apps/api/prisma/migrations/20260309113000_link_medal_standings_to_event/migration.sql`
- Seed now includes:
  - super admin
  - sample cabor admins, coach, athletes
  - one event: `PORKAB Kabupaten Malang 2026`
  - minimal medal standings for that event

## API Work Completed
- Auth source now covers:
  - `POST /api/v1/auth/login`
  - `POST /api/v1/auth/refresh`
  - `POST /api/v1/auth/logout`
  - `POST /api/v1/auth/forgot-password`
  - `POST /api/v1/auth/reset-password`
- Admin dashboard stats route now returns live data for:
  - athlete totals
  - coach totals
  - news totals/statuses
  - athlete status breakdown
- Admin CRUD source added for event:
  - `GET /api/v1/admin/events`
  - `GET /api/v1/admin/events/:id`
  - `POST /api/v1/admin/events`
  - `PATCH /api/v1/admin/events/:id`
  - `DELETE /api/v1/admin/events/:id`
- Admin medal standings source added:
  - `GET /api/v1/admin/events/:id/medal-standings`
  - `PUT /api/v1/admin/events/:id/medal-standings`
- Public source added:
  - `GET /api/v1/events`
  - `GET /api/v1/events/:id`
  - `GET /api/v1/events/:id/medal-standings`

## Frontend Work Completed
- Admin layout, login page, and protected routes are active.
- Admin dashboard is live and data-driven.
- Admin athlete page now supports list/create/edit/delete flow, with delete exposed only for `SUPER_ADMIN` to match backend RBAC.
- Admin coach CRUD pages exist.
- Admin news CMS list + editor pages exist.
- Frontend token refresh flow now stores rotated refresh tokens correctly.
- Admin gallery upload modal now shows local image preview before submit.
- Admin gallery cards now resolve uploaded image URLs against the API origin instead of the Vite origin.

## Known Constraints
- Global Node `25.x` is not suitable for this repo's Prisma `6.2.1`.
- Local portable Node `22.17.1` has been installed to `.tools/node-lts`.
- PowerShell also blocks `npx.ps1`; `cmd /c` is safer when needed.
- PowerShell execution policy also blocks some global CLI wrappers; `agent-browser` should be invoked through `cmd /c`.
- Prefer the local Node 22 runtime for Prisma and TS-strip commands inside this repo.
- In Codex sandbox, Node child-process spawning can surface `EPERM` for Prisma engines even though the same commands succeed outside the sandbox.

## Verified Recently
- `apps/api` lint passes with `tsc --noEmit`.
- `apps/web` lint passes with `tsc --noEmit`.
- `prisma generate` works when repo uses local Node `22.17.1` from `.tools/node-lts`.
- `prisma migrate deploy` succeeds outside the Codex sandbox with local Node `22.17.1`.
- `db:seed` works after removing `tsx` dependency from the seed script runner.
- Phase 2 verification script passes for:
  - admin login
  - athlete fetch
  - RBAC negative delete check for coach
  - refresh token flow
  - logout token revocation
  - health check
  - public cabor API
  - contact form
- Event homepage rendering and admin event flow were retested in browser.
- Migration deploy and seed succeeded locally.
- `apps/api/src/index.ts` static `/uploads` now returns `Cross-Origin-Resource-Policy: cross-origin`, which fixed broken gallery thumbnails in the browser.
- `apps/api` lint passed after the static upload header fix.
- `apps/web` lint passed after the gallery thumbnail and upload preview fix.
- `agent-browser` browser test succeeded for:
  - admin login with seeded super admin
  - gallery direct upload using `C:\Users\LENOVO\Downloads\0217728711070121f48ceb9aa55112abbdf6fec19339eb3ed083a_0.jpeg`
  - gallery item preview and grid thumbnail verification
  - deleting the media item that previously had no thumbnail
- Homepage behavior was manually verified after emptying all admin event items:
  - hero `Event Mendatang` card disappears
  - `Klasemen Medali` section disappears
  - stats bar shows `0 Event Mendatang`
  - portal `Event` card falls back to `Jadwal pertandingan & klasemen`

## Current Remaining Scope
- Continue Phase 3+ work without regressing completed Phase 2 auth/admin behavior
- Keep using local Node `22.x` for Prisma and verification commands
- Execute the approved Phase 2 refactor workstream for security, efficiency, and PRD alignment on a future session
- Re-seed or recreate event data before any next session that expects homepage event/medal content, because the last browser smoke test intentionally deleted all current admin event items.

## Files That Matter For Current Continuation
- `apps/api/src/routes/auth.ts`
- `apps/api/src/routes/admin.ts`
- `apps/api/src/index.ts`
- `apps/api/src/lib/zod-schemas.ts`
- `apps/api/scripts/verify-phase2.ts`
- `apps/web/src/pages/admin/AdminDashboardPage.tsx`
- `apps/web/src/pages/admin/AdminAthletesPage.tsx`
- `apps/web/src/pages/admin/AdminGalleryPage.tsx`
- `apps/web/src/pages/admin/AdminEventsPage.tsx`
- `apps/web/src/pages/HomePage.tsx`
- `apps/web/src/lib/axios.ts`
- `README.md`
- `PROJECT_MEMORY.md`
- `REMAINING_PLAN.md`
