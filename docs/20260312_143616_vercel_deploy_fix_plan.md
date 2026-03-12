# Fix Plan: Vercel Deploy Failure (Master `d1f4681`) dengan Context7

## Ringkasan
Target: deployment `apps/web` di Vercel harus lolos build tanpa menurunkan kualitas TypeScript.  
Berdasarkan log dan verifikasi file lokal, failure utama ada di error TypeScript (`TS6133`, `TS2532`), bukan di warning Node engine.  
Keputusan:
- Node strategy: pin ke **22.x** di Vercel
- TS policy: **tetap strict**, perbaiki kode

## Akar Masalah (terkonfirmasi)
1. `apps/web/src/pages/EventDetailPage.tsx`
   - `Download` di-import tapi tidak dipakai -> `TS6133`
   - akses `rows[0].id` berpotensi undefined (dengan `noUncheckedIndexedAccess`) -> `TS2532`
2. `apps/web/src/pages/admin/AdminEventRegistrationPage.tsx`
   - import `Plus`, `Search`, `Users` tidak dipakai -> `TS6133`
3. Warning Node Vercel:
   - Vercel default `24.x`, repo `engines` mengharuskan `>=20 <23`
   - ini warning, bukan error build saat ini, tapi tetap harus diselaraskan agar stabil

## Referensi Context7 yang dipakai
- Vercel docs (`/websites/vercel`): Node.js version bisa diatur per project; versi yang tersedia termasuk `22.x`.
- Vercel monorepo docs (`/websites/vercel_monorepos`): Vercel mengelola root/build settings monorepo, perlu memastikan root directory & build command benar.
- TypeScript docs (`/microsoft/typescript`): TS6133 untuk unused locals/import, TS2532 untuk kemungkinan undefined pada strict null checks.

## Perubahan Implementasi (decision-complete)

### A) Code fixes (strict-safe, minimal patch)
1. **EventDetailPage**
   - Hapus `Download` dari import `lucide-react`.
   - Ubah blok pemilihan tournament default:
     - dari pola `if (rows.length > 0) setSelectedTournamentId(rows[0].id)`
     - menjadi pattern aman:
       - `const firstRow = rows[0]`
       - `if (!selectedTournamentId && firstRow) setSelectedTournamentId(firstRow.id)`
2. **AdminEventRegistrationPage**
   - Hapus import `Plus`, `Search`, `Users` karena tidak digunakan.

### B) Vercel runtime alignment
1. Di project Vercel (`koni-web`) set **Node.js Version = 22.x**.
2. Verifikasi setting build:
   - Root Directory: `apps/web`
   - Install Command: `npm install`
   - Build Command: `npm run build`
   - Output Directory: `dist`

## Perubahan API/interface publik
- Tidak ada perubahan API eksternal.
- Tidak ada perubahan schema/contract.
- Perubahan hanya pada compile-time safety dan deploy runtime config.

## Test Cases & Skenario Verifikasi

### Lokal
1. `npm run build -w @koni/web` harus sukses tanpa TS error.
2. Pastikan tidak ada error TS6133/TS2532 untuk dua file tersebut.

### CI/Vercel
1. Trigger deployment dari `master`.
2. Build log harus:
   - tidak lagi mengandung error TS6133/TS2532,
   - selesai `Ready`.
3. Smoke-check runtime:
   - `/event/:id` render normal.
   - `/admin/events/:id/registrations` render normal.

## Acceptance Criteria
1. Deployment Vercel untuk commit baru dari `master` berstatus **Ready**.
2. `@koni/web` build lulus `tsc -b && vite build`.
3. Strict TS rules tetap aktif (`noUnusedLocals`, `noUncheckedIndexedAccess`) tanpa dilonggarkan.

## Asumsi & Default yang dikunci
1. Project deploy target adalah `koni-web` (root `apps/web`).
2. Branch deploy target tetap `master`.
3. Tidak mengubah strict compiler policy.
4. Node runtime yang dipakai untuk Vercel adalah `22.x` agar konsisten dengan engines repo dan Prisma pinning.
