# Gemini Handoff

## Current Summary
- Phase 2 core auth/RBAC/admin/gallery is stabilized.
- Phase 3 (Tournament Management) is fully implemented (Bracket, Ranking, Registration, Real-time Socket.IO, Data Export).
- Phase 3B Sandbox flow is implemented and isolated from official data.
- Phase 4 (Isolation & RBAC) is implemented and verified via automated tests.
- Medal standings are per-event and correctly reflect "OFFICIAL" vs "SANDBOX" scopes.

## Implemented So Far
- Prisma schema for Phase 2, 3, and 4.
- Admin dashboard stats use `/admin/dashboard-stats` (resolved mismatch).
- Event registration portal (Backend API).
- Socket.IO integration for real-time score and medal updates.
- Medal standings export to Excel and PDF.
- Sandbox tournament creation and management for non-SUPER_ADMIN roles.

## Remaining
- Maintain all verification suites (`run.bat verify-full`).
- Re-run verification whenever dependencies change.

## Important Caveat
- Prisma client regeneration is blocked in this environment by `spawn EPERM`.
- MUST use `.tools/node-lts` for Prisma and verification commands.
- Global Node `25.x` is NOT supported.

## Recommended Next Action
- Ensure `run.bat verify-full` / `npm run test:full` passes after any code changes.
- Continue to any Phase 5 or maintenance tasks as requested.
