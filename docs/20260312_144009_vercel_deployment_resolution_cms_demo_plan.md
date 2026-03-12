# Vercel Deployment Resolution & CMS Demo Plan

## Objective
To document the resolution plan in the `docs/` folder, resolve the Vercel build failures caused by TypeScript errors and Node version mismatches, prepare the `master` branch, and execute a safe deployment process so you can demo the Admin CMS.

## Implementation Steps

### 1. Documentation
- Create a new file in the `docs/` folder named `YYYYMMDD_HHMMSS_vercel_deployment_resolution_cms_demo_plan.md` (using the current timestamp).
- Document the issues (Node version mismatch `EBADENGINE` and TS6133/TS2532 errors) and the exact fixes applied to resolve them based on Context7 and Vercel documentation.

### 2. Code Fixes (Frontend & Project Settings)
- **`apps/web/package.json` & root `package.json`**: Update the `engines` field to allow Node.js up to version 24 (e.g., `">=20 <25"`), aligning with Vercel's default to resolve `EBADENGINE`.
- **`apps/web/src/pages/EventDetailPage.tsx`**: 
  - Remove the unused `Download` import.
  - Fix line 42 by adding optional chaining (`?.`) or proper null checking.
- **`apps/web/src/pages/admin/AdminEventRegistrationPage.tsx`**:
  - Remove the unused imports: `Plus`, `Search`, `Users`.

### 3. Verification
- Run a local frontend build (`npm run build -w @koni/web`) to confirm that all TypeScript (`tsc -b`) and Vite build errors are cleanly resolved.

### 4. Git Workflow (Branch: master)
- **Stage**: Carefully stage the documentation file, `package.json` updates, and the two modified React components.
- **Commit**: Commit with a clear message: `fix(deploy): resolve TS build errors, update node engines for Vercel, and add resolution doc`.
- **Sync & Push**: Run `git pull origin master --rebase` followed by `git push origin master`.

### 5. Vercel Deployment Trigger
- Inform the user that the push is complete so they can switch Vercel to the `master` branch to trigger a clean deployment of the Admin CMS.
