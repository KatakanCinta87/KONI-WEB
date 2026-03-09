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
- Portal publik React/Vite
- SIM Internal Phase 2 selesai secara fungsional
- Login admin, proteksi route, RBAC dasar `SUPER_ADMIN`, `CABOR_ADMIN`, `COACH`, `ATHLETE`
- Auth lifecycle admin: `login`, `refresh`, `logout`
- CRUD admin untuk atlet, pelatih, berita, event, dan klasemen medali per event
- Dashboard admin sudah memakai data live
- Homepage event dan klasemen memakai data riil dan hide jika data kosong
- Seed, lint, dan verifikasi API otomatis terbaru sudah lulus dengan local Node `22.x`

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

## Dokumen Konteks

- `PROJECT_MEMORY.md`
- `REMAINING_PLAN.md`
- `AGENTS.md`
- `gemini.md`
- `MASTER_PROMPT_KONI_FASE2.md`
- `Fase_2_SIM_Internal.md.resolved`
- `Fase_3_Event_Management.md.resolved`

## Fokus Berikutnya

1. Jaga stabilitas Phase 2 saat melanjutkan Phase 3/4
2. Tetap gunakan local Node `22.x` untuk Prisma dan verifikasi
3. Tambah smoke test browser saat ada surface admin/public baru
