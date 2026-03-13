# KONI Kabupaten Malang - Portal Web

Portal web resmi **Komite Olahraga Nasional Indonesia (KONI) Kabupaten Malang**.
Repo ini berisi portal publik, SIM Internal, dan Admin CMS dalam satu monorepo.

## Struktur

```text
KONI-WEB/
|-- apps/
|   |-- web/      # React + Vite frontend
|   `-- api/      # Express + Prisma backend
|-- packages/
|-- PROJECT_MEMORY.md
|-- REMAINING_PLAN.md
|-- AGENTS.md
`-- gemini.md
```

## Status Saat Ini

### Sudah berjalan
- Portal publik React/Vite dengan fitur Live Scoring (Socket.IO)
- SIM Internal Phase 2, 3, dan 4 selesai secara fungsional
- Manajemen Event & Tournament (Bracket generation, Ranking computation)
- Fitur Sandbox untuk tournament non-official
- Registrasi atlet ke event oleh `CABOR_ADMIN`
- Export Klasemen Medali ke Excel dan PDF
- Dashboard admin dengan statistik live (`/admin/dashboard-stats`)
- Homepage event dan klasemen memakai data riil (OFFICIAL) dan real-time update
- Seed, lint, dan verifikasi penuh (`run.bat verify-full`) lulus dengan local Node `22.x`
- API production (`koni-api.vercel.app`) sudah recovery setelah incident routing/runtime tanggal `2026-03-13`

### Catatan environment
- Prisma `6.2.1` tetap dipin dan aman dipakai di repo ini
- Global Node `25.x` jangan dipakai untuk command Prisma di repo ini
- Local Node `22.x` portable di `.tools/node-lts` adalah runtime yang disarankan
- Error Prisma `schema-engine-windows.exe spawn EPERM` yang muncul di Codex sandbox adalah batasan environment sandbox; di luar sandbox dengan Node `22.x`, `prisma generate` dan `prisma migrate deploy` berjalan normal

## Jalankan Lokal

### Prasyarat
- Node.js `20` atau `22` LTS
- npm 9+
- PostgreSQL untuk mode database

### Perintah umum

```bash
npm install
npm run dev:web
npm run dev:api
npm run db:seed
npm run test:api -w @koni/api
```

Windows helper:

```bat
run.bat
```

`run.bat` sekarang memakai flow yang sesuai konteks repo terbaru:
- `1` bootstrap dari nol: `npm install` -> `prisma generate` -> `prisma migrate deploy` -> `db seed` -> `lint`
- `2` bootstrap lalu start API + Web
- `3-5` start harian API/Web
- `6` buka public site + admin CMS + API health
- `7-8` command Prisma via binary lokal workspace, bukan `npx` global
- `10` verifikasi API Phase 2, dengan cek dulu bahwa API aktif di `:3000`
- `13` kill service dev pada port `3000` / `5173`
- `14` tampilkan kredensial admin seed lokal

Jika tersedia, `run.bat` otomatis memakai Node lokal kompatibel di `.tools/node-lts` agar tidak bergantung pada Node global yang terlalu baru.

## Script Penting

```bash
npm run dev:web
npm run dev:api
npm run lint -w @koni/web
npm run lint -w @koni/api
npm run db:seed
npm run test:api -w @koni/api
```

## Catatan Teknis

- Prisma saat ini dipin ke `6.2.1`.
- Model medal standings memakai pendekatan `per event`.
- Frontend auth sekarang menyimpan refresh token hasil rotasi dari endpoint refresh.
- Untuk command Prisma di Windows, prioritaskan local Node `22.x` dari `.tools/node-lts`.
- Jika PowerShell memblokir `npx.ps1`, gunakan `run.bat` atau `cmd /c`.
- Deploy API Vercel memakai catch-all function `api/[...route].ts` dengan rewrite dari `/api/*` di `apps/api/vercel.json`.

## Deploy Vercel + Prisma Postgres

Gunakan pola ini agar koneksi database aman untuk serverless:
- `DATABASE_URL`: pooled connection untuk runtime API serverless
- `DIRECT_URL`: direct connection untuk Prisma CLI (`migrate deploy`, `generate`)

Khusus Prisma Postgres (`db.prisma.io`):
- `DATABASE_URL` -> host `pooled.db.prisma.io`
- `DIRECT_URL` -> host `db.prisma.io`

Contoh flow:

```bash
# API project
cd apps/api
vercel link --project koni-api
vercel env pull .env.vercel

# Jalankan migrate production dengan env dari Vercel
vercel env run -e production -- npm run db:migrate:deploy

# Deploy API
vercel --prod
```

Jika ada indikasi cache/build lama, pakai clear cache:
```bash
vercel --prod --force
```

```bash
# Web project
cd apps/web
vercel link --project koni-web
vercel env pull .env.vercel
vercel --prod
```

Minimal env yang harus ada di project `koni-api`:
- `DATABASE_URL`
- `DIRECT_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `FRONTEND_URL` (isi `https://koni-web.vercel.app`)

Minimal env yang harus ada di project `koni-web`:
- `VITE_API_URL` (isi `https://koni-api.vercel.app/api/v1`)

Verifikasi cepat production API:
- `GET https://koni-api.vercel.app/api/health` -> `200`
- `GET https://koni-api.vercel.app/api/v1/events` -> `200`
- `POST https://koni-api.vercel.app/api/v1/auth/login` -> `401/422` validasi/kredensial (bukan `500`)

## Dokumen Utama

- `AGENTS.md`
- `gemini.md`
- `docs/OPERATIONAL_RUNBOOK_PHASE3B.md`

## Fokus Berikutnya

1. Jaga stabilitas Phase 2 saat melanjutkan Phase 3/4
2. Tetap gunakan local Node `22.x` untuk Prisma dan verifikasi
3. Tambah smoke test browser saat ada surface admin/public baru
