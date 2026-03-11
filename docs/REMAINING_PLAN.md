# Remaining Plan

Status date: `2026-03-10`

## Completed
- [x] Plan 1: audit schema, endpoint, and UI gaps for event + medal
- [x] Plan 2: finalize base Prisma model direction
- [x] Plan 3: revise schema, migration, and seed for medal standing per event
- [x] Plan 4: add admin CRUD/source endpoints for event and medal standings
- [x] Plan 5: add public read-only endpoints for event and medal standings
- [x] Plan 6: add admin CMS pages/forms for event and medal standings
- [x] Plan 7: integrate homepage with real event and medal data
- [x] Plan 8: close remaining SIM Internal Phase 2 gaps
  - [x] add auth refresh/logout backend flow
  - [x] align frontend refresh-token rotation with backend
  - [x] wire admin athlete delete action to backend with RBAC-aligned UI
  - [x] make admin dashboard data-driven
- [x] Plan 9: Stabilization
  - [x] Fix admin dashboard stats route mismatch so dashboard cards stop returning `404`
  - [x] Resolve Windows `EPERM` issue around Prisma by using local portable Node `22.x`
  - [x] Re-run automated verification with the current runtime mix (`local Node 22` + existing API/web dev setup)

## Current Status
- SIM Internal Phase 2 is now functionally complete.
- Event + medal scope remains complete.
- Latest automated verification passed after auth/dashboard/admin fixes.
- Next approved workstream has been saved as: `Refactor Phase 2 on Security, Efisiensi, and PRD Approved`.
- Browser smoke tests also confirmed homepage empty-state behavior for events/medals is correct when admin event data is removed.

## Approved Next Workstream
1. Hardening config dan auth boundary
2. Migrasi session/token ke flow yang memenuhi PRD
3. Proteksi data sensitif dan dokumen atlet
4. Refactor codepaths Phase 2 yang misleading/duplikatif
5. Tutup acceptance gap PRD Phase 2 dengan test dan observability

## Blockers / Notes
- Global Node `25.x` remains installed on the machine, but repo runner should keep preferring local `.tools/node-lts`.
- `prisma generate` and `prisma migrate deploy` succeed outside the Codex sandbox with local Node `22.17.1`.
- In the Codex sandbox itself, Prisma engine `spawn EPERM` is an environment restriction rather than a repo schema defect.
- `db:seed` and `test:api` run with `node --experimental-strip-types` and are currently green in local verification.
- `agent-browser` is usable in this repo, but should be run through `cmd /c` because PowerShell wrapper execution is blocked.
- Current runtime data note: the last manual browser test deleted all admin event items, so homepage event and medal sections are presently hidden by real empty data.

## Next Sensible Focus
1. Guard against regressions while continuing Phase 3/4 work
2. Keep verification flow on local Node `22.x`
3. Recreate seed/sample event data before any UX demo that expects visible event countdown or medal standings on homepage
4. Execute the approved Phase 2 security/efficiency/PRD refactor when resumed
