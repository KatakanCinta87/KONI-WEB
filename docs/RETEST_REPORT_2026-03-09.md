# Retest Report - 2026-03-09

## Scope
- Runtime verification after event + medal standings integration
- Public homepage real-data rendering
- Admin CMS event management
- Admin CMS medal standings editor
- Public event and medal endpoints

## Environment
- Workspace: `C:\Users\LENOVO\KONI-WEB`
- Date: `2026-03-09`
- Browser automation: `agent-browser`
- Web URL: `http://localhost:5173`
- API URL: `http://localhost:3000`

## Preparation Performed
- Prisma migration applied successfully:
  - `20260309113000_link_medal_standings_to_event`
- Seed rerun successfully after seed patch
- Web server started and reachable on `5173`
- API server started and reachable on `3000`

## Browser Retest Results

### 1. Homepage
Status: `PASS`

Verified in browser:
- Homepage loaded successfully
- Hero section rendered
- Upcoming event rendered from real API data:
  - `PORKAB Kabupaten Malang 2026`
- Stats bar rendered with real counts
- Latest news rendered from API
- Medal standings section rendered from real API data
- Quick navigation event card reflected real event availability

Evidence:
- `artifacts/agent-browser-home.png`

Snapshot highlights:
- `1 Event Mendatang`
- `Klasemen Medali`
- standings rows for `PSSI`, `PBSI`, `PASI`

### 2. Admin Login
Status: `PASS`

Verified in browser:
- Login page loaded
- Super Admin login succeeded
- Sidebar displayed the new menu:
  - `Event & Medali`

Credential used:
- Email: `admin@koni-kabmalang.or.id`
- Password: `admin123`

### 3. Admin Event List
Status: `PASS`

Verified in browser:
- `/admin/events` loaded
- Existing seeded event appeared:
  - `PORKAB Kabupaten Malang 2026`
- Actions visible:
  - edit
  - manage standings
  - delete

### 4. Admin Event Edit Page
Status: `PASS`

Verified in browser:
- Existing event edit page loaded
- Event metadata form rendered
- Medal standings editor rendered
- Existing standings rows loaded with seeded data

Evidence:
- `artifacts/agent-browser-admin-event-edit.png`

### 5. Admin Create Event Flow
Status: `PASS`

Verified in browser:
- Opened `/admin/events/new`
- Filled form with test data
- Submitted successfully
- Browser redirected to edit page for created event

Created test event:
- Name: `Retest Event Browser 2026`
- Venue: `GOR Retest Kepanjen`
- Result URL:
  - `/admin/events/edit/cmmj4c3a80007t830unnl71f1`

### 6. Admin Save Medal Standings Flow
Status: `PASS`

Verified in browser:
- Added one standings row on the new event
- Selected cabor `PSSI`
- Saved standings successfully
- Snapshot after save showed persisted row:
  - rank `1`
  - gold `1`
  - silver `0`
  - bronze `2`

Evidence:
- `artifacts/agent-browser-admin-event-standing-saved.png`

## API Smoke Results

### Public Events Endpoint
Status: `PASS`

Endpoint:
- `GET /api/v1/events`

Observed:
- Returned seeded event and newly created retest event

### Public Medal Standings Endpoint
Status: `PASS`

Endpoint:
- `GET /api/v1/events/event-porkab-kab-malang-2026/medal-standings`

Observed:
- Returned event object and ordered standings
- Included cabor detail payload

## Issues Found

### 1. Dashboard stats still broken
Severity: `Medium`

Observed in browser console:
- `Failed to fetch dashboard stats: AxiosError: Request failed with status code 404`

Impact:
- Admin dashboard cards show `0`
- Existing dashboard page is still calling a missing or outdated endpoint

Likely cause:
- Frontend still requests `/admin/stats`
- Backend currently exposes `/api/v1/admin/dashboard-stats`

### 2. Chart sizing warnings on dashboard
Severity: `Low`

Observed in browser console:
- chart width/height warning from rendered dashboard chart container

Impact:
- Cosmetic/layout warning
- Does not block event CMS flow

### 3. Prisma generate still blocked
Severity: `Medium`

Observed in CLI:
- `EPERM: operation not permitted, rename ... query_engine-windows.dll.node`

Impact:
- Full Prisma client regeneration is still not stable in this environment
- Runtime works for current retest path, but environment remains fragile

### 4. Legacy phase-2 verification script blocked by environment
Severity: `Low`

Observed:
- `npm run test:api` failed with `spawn EPERM` from `tsx/esbuild`

Impact:
- Browser retest and API smoke were still possible
- Automated legacy verification script cannot currently be treated as green in this machine state

## Overall Assessment
- Homepage event and medal integration: `WORKING`
- Public event endpoints: `WORKING`
- Public medal standings endpoint: `WORKING`
- Admin event CMS list/create/edit: `WORKING`
- Admin medal standings editor/save: `WORKING`
- Admin dashboard stats: `NOT FULLY WORKING`
- Full local verification toolchain: `PARTIALLY BLOCKED BY ENVIRONMENT`

## Recommended Next Fix
1. Fix admin dashboard stats route mismatch
2. Resolve Windows file-lock issue affecting `prisma generate`
3. Re-run automated verification script after environment issue is cleared

## Artifacts
- `artifacts/agent-browser-home.png`
- `artifacts/agent-browser-admin-event-edit.png`
- `artifacts/agent-browser-admin-event-standing-saved.png`
