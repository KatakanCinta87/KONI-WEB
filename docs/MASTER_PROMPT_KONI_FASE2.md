# MASTER PROMPT — KONI KAB. MALANG: SIM INTERNAL & ADMIN CMS (FASE 2)
# Untuk: Gemini CLI / Agentic Coding Session
# Versi: 1.0 | Sifat: Instruksi Eksekusi Penuh

---

## ⚠️ ATURAN WAJIB SEBELUM MULAI (BACA DAN PATUHI SEPENUHNYA)

1. **JANGAN BERASUMSI.** Jika ada ambiguitas, gunakan nilai default yang sudah didefinisikan di dokumen ini. JANGAN mengarang nilai, nama field, warna, atau struktur yang tidak ada di sini.
2. **JANGAN SKIP LANGKAH.** Kerjakan setiap task secara berurutan. Jangan lompat ke task berikutnya sebelum task saat ini selesai dan diverifikasi.
3. **SELALU VERIFIKASI.** Setelah setiap task selesai, jalankan perintah verifikasi yang sudah ditentukan dan tunjukkan hasilnya.
4. **JANGAN GENERATE PLACEHOLDER.** Semua UI harus fungsional — tidak ada `// TODO`, `lorem ipsum`, atau `dummy handler`. Jika sebuah fitur belum bisa disambungkan ke API, buat mock data yang realistis sesuai skema yang didefinisikan.
5. **IKUTI NAMING CONVENTION.** Semua nama file, variabel, komponen, dan endpoint harus mengikuti konvensi yang ditetapkan di bagian "Konvensi Kode".
6. **SATU FILE PER TASK.** Setiap task menghasilkan file atau set file yang spesifik. Tunjukkan path lengkap setiap file yang dibuat/dimodifikasi.
7. **JANGAN MODIFIKASI FILE DI LUAR SCOPE TASK.** Kecuali ada instruksi eksplisit di task tersebut.

---

## 📁 KONTEKS PROYEK

### Identitas Proyek
- **Nama**: Portal Resmi KONI Kabupaten Malang
- **Fase saat ini**: Fase 2 — SIM Internal & Admin CMS
- **Tipe**: Full-Stack Web Application (Monorepo)

### Status MVP (Fase 0–1 yang sudah selesai)
Hal-hal berikut SUDAH ADA dan JANGAN disentuh kecuali instruksi task menyatakan sebaliknya:
- ✅ Formulir pendaftaran anggota (frontend + backend)
- ✅ Integrasi Google Drive & Google Sheets API
- ✅ Dashboard admin dasar (tabel data anggota, hapus data)
- ✅ Google OAuth 2.0 + Custom Header auth
- ✅ Prisma schema dasar: `User`, `Athlete`, `Coach`, `CabangOlahraga`, `Achievement`, `Document`, `SKDocument`, `News`, `Gallery`
- ✅ `prisma migrate dev` sudah dijalankan
- ✅ Seed script dengan 12 Cabor + sample atlet/pelatih
- ✅ JWT auth: access token 15 menit + refresh token 7 hari
- ✅ Endpoint: `POST /auth/login`, `POST /auth/logout`, `POST /auth/refresh`
- ✅ Middleware `requireAuth(minRole)` berfungsi
- ✅ 4 role: `SUPER_ADMIN`, `CABOR_ADMIN`, `COACH`, `ATHLETE`
- ✅ bcrypt password hashing (cost factor 12)
- ✅ Refresh token disimpan di DB
- ✅ CRUD API atlet: `GET/POST/PATCH/DELETE /api/v1/athletes`
- ✅ Filter & search atlet: by cabor, status, nama
- ✅ Soft delete atlet
- ✅ CRUD API pelatih: `GET /api/v1/coaches` (Read saja)
- ✅ CRUD API berita: `GET/POST/PATCH/DELETE /api/v1/news`
- ✅ Kategori berita: Prestasi, Event, Organisasi, Sport Science
- ✅ Halaman login `/admin/login` sudah ada
- ✅ Routing untuk semua halaman admin sudah didefinisikan (tapi UI belum)
- ✅ Semua Prisma migrations berjalan tanpa error
- ✅ RBAC: Super Admin akses semua, Cabor Admin hanya cabornya (verified)

### Yang BELUM ADA (scope Fase 2 ini):
- ❌ `POST /auth/forgot-password` + email reset
- ❌ API riwayat prestasi atlet (`/athletes/:id/achievements`)
- ❌ API upload dokumen atlet (`/athletes/:id/documents`)
- ❌ API SK Dokumen (`/cabor/:id/sk`) — full CRUD
- ❌ API upload galeri (`/gallery`)
- ❌ Semua UI CRUD admin (daftar, form tambah/edit, detail)
- ❌ Dashboard statistik (chart, cards, alert)
- ❌ User Management UI
- ❌ Audit Log (tabel DB + UI)
- ❌ Export laporan (Excel, PDF)
- ❌ Notifikasi SK/lisensi expired
- ❌ Settings & konfigurasi sistem

---

## 🛠️ TECH STACK (JANGAN GANTI TANPA INSTRUKSI EKSPLISIT)

### Frontend
```
Framework  : React 19 + Vite
Language   : TypeScript 5.x
Styling    : Tailwind CSS v4 (konfigurasi custom sudah ada)
Animation  : Framer Motion 11.x
Icons      : Lucide React
HTTP Client: Axios (gunakan instance yang sudah ada di `src/lib/axios.ts`)
Form       : React Hook Form 7.x + Zod resolver
State      : React Query (TanStack Query) v5 untuk server state
Charts     : Recharts
Tables     : TanStack Table v8
Rich Text  : Tiptap 2.x
```

### Backend
```
Runtime    : Node.js 22.x LTS
Framework  : Express.js 4.x
Language   : TypeScript 5.x
ORM        : Prisma 5.x (schema sudah ada)
Auth       : JWT (jsonwebtoken) + bcrypt
Upload     : Multer (sudah ada)
Email      : Nodemailer
Validation : Zod
```

### Database & Storage
```
Database   : PostgreSQL 16 (via Prisma)
Storage    : Google Drive API v3 (Fase 0-1, tetap digunakan untuk sekarang)
```

---

## 🎨 DESIGN SYSTEM (WAJIB DIIKUTI — JANGAN DEVIASI)

### Warna (CSS Variables — sudah dikonfigurasi di Tailwind)
```css
--color-koni-gold    : #D4AF37   /* Aksen prestisius, border aktif, badge medali */
--color-koni-red     : #C8102E   /* CTA utama, danger, badge penting */
--color-dark-navy    : #1A1A2E   /* Sidebar bg, header, teks utama */
--color-white        : #FFFFFF   /* Background utama konten */
--color-gray-50      : #F9FAFB   /* Background halaman (body) */
--color-gray-100     : #F3F4F6   /* Card background, tabel zebra */
--color-gray-200     : #E5E7EB   /* Border, divider */
--color-gray-500     : #6B7280   /* Teks placeholder, label sekunder */
--color-gray-900     : #111827   /* Teks utama body */
--color-green-500    : #22C55E   /* Status: Aktif */
--color-yellow-500   : #EAB308   /* Status: Warning, Cedera, Akan Expired */
--color-red-500      : #EF4444   /* Status: Non-Aktif, Expired, Error */
--color-blue-600     : #2563EB   /* Link, info badge */
```

### Tipografi
```
Font Heading (H1-H3) : "Playfair Display", serif — digunakan untuk judul halaman besar
Font UI (H4+, label) : "Anton", sans-serif — digunakan untuk section title, sidebar nav
Font Body & Data     : "Inter", sans-serif — semua teks paragraf, tabel, form
```
> Semua font sudah di-import via Google Fonts di `index.html`. Jangan tambahkan font lain.

### Layout Admin (struktur yang HARUS diikuti)
```
┌─────────────────────────────────────────────────┐
│ TOPBAR: Logo KONI | breadcrumb | user menu      │  h-16, bg-dark-navy
├──────────────┬──────────────────────────────────┤
│              │                                  │
│  SIDEBAR     │   MAIN CONTENT AREA              │
│  w-64        │   flex-1, overflow-auto           │
│  bg-dark-navy│   bg-gray-50, p-6                │
│  fixed       │                                  │
│              │                                  │
└──────────────┴──────────────────────────────────┘
```

### Komponen UI Standar (gunakan class Tailwind berikut secara konsisten)

**Primary Button:**
```jsx
<button className="bg-koni-red hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-md transition-colors duration-200 flex items-center gap-2">
```

**Secondary Button:**
```jsx
<button className="bg-white hover:bg-gray-50 text-gray-700 font-semibold px-4 py-2 rounded-md border border-gray-200 transition-colors duration-200 flex items-center gap-2">
```

**Input Field:**
```jsx
<input className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-koni-gold focus:border-transparent bg-white placeholder:text-gray-400" />
```

**Card:**
```jsx
<div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
```

**Badge Status:**
```jsx
// Aktif
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Aktif</span>
// Non-Aktif
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Non-Aktif</span>
// Cedera
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Cedera</span>
// Expired
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Expired</span>
```

---

## 📐 KONVENSI KODE (WAJIB DIIKUTI)

### Naming
```
React Components  : PascalCase         → AthleteForm.tsx
Hooks custom      : camelCase, prefix use → useAthletes.ts
API functions     : camelCase           → getAthletes, createAthlete
API endpoints     : kebab-case          → /api/v1/cabor-admins
Prisma models     : PascalCase          → Athlete, CabangOlahraga
Database columns  : camelCase           → fullName, birthDate
Tailwind classes  : selalu class string, tidak ada inline style kecuali dynamic value
Env variables     : SCREAMING_SNAKE     → DATABASE_URL, JWT_SECRET
```

### Struktur File Frontend
```
src/
  components/
    ui/               ← Komponen atom (Button, Input, Badge, Modal, dll)
    layout/           ← AdminLayout, Sidebar, Topbar
    athletes/         ← AthleteTable, AthleteForm, AthleteCard
    coaches/          ← CoachTable, CoachForm
    cabor/            ← CaborTable, CaborForm, SKTable
    news/             ← NewsTable, NewsEditor
    gallery/          ← GalleryGrid, GalleryUpload
    dashboard/        ← StatCard, ActivityFeed, AlertPanel
    users/            ← UserTable, UserForm
    audit/            ← AuditTable
  hooks/
    useAthletes.ts
    useCoaches.ts
    useCabor.ts
    useNews.ts
    useGallery.ts
    useUsers.ts
    useAuditLog.ts
    useAuth.ts        ← sudah ada, jangan diubah
  pages/
    admin/
      DashboardPage.tsx
      AthletesPage.tsx
      AthleteDetailPage.tsx
      CoachesPage.tsx
      CaborPage.tsx
      CaborDetailPage.tsx
      NewsPage.tsx
      NewsEditorPage.tsx
      GalleryPage.tsx
      UsersPage.tsx
      AuditLogPage.tsx
      SettingsPage.tsx
  lib/
    axios.ts          ← sudah ada, jangan diubah
    queryClient.ts    ← React Query client
    zod-schemas.ts    ← semua Zod schema dikumpulkan di sini
  types/
    index.ts          ← semua TypeScript interface/type dikumpulkan di sini
```

### Struktur File Backend
```
src/
  routes/
    auth.routes.ts      ← sudah ada
    athlete.routes.ts   ← sudah ada, akan ditambah
    coach.routes.ts     ← sudah ada, akan ditambah
    cabor.routes.ts     ← baru
    news.routes.ts      ← sudah ada
    gallery.routes.ts   ← baru
    user.routes.ts      ← baru
    audit.routes.ts     ← baru
    settings.routes.ts  ← baru
  controllers/
    athlete.controller.ts
    coach.controller.ts
    cabor.controller.ts
    news.controller.ts
    gallery.controller.ts
    user.controller.ts
    audit.controller.ts
  middleware/
    auth.middleware.ts    ← sudah ada (requireAuth)
    upload.middleware.ts  ← sudah ada (multer)
    audit.middleware.ts   ← baru (log setiap mutasi)
    validate.middleware.ts ← baru (Zod request validation)
  services/
    storage.service.ts   ← abstraksi upload (Google Drive sekarang, S3 nanti)
    email.service.ts     ← Nodemailer wrapper
    audit.service.ts     ← createAuditLog helper
  lib/
    prisma.ts            ← sudah ada, Prisma client singleton
```

### Pattern API Response (WAJIB konsisten)
```typescript
// Success dengan data
{ "success": true, "data": T, "meta": { "page": 1, "limit": 20, "total": 100 } }

// Success tanpa data (delete, dll)
{ "success": true, "message": "string pesan" }

// Error
{ "success": false, "error": "string pesan user-friendly", "code": "ERROR_CODE" }
```

### Error Codes yang sudah didefinisikan
```
UNAUTHORIZED        → 401, token tidak ada/invalid
FORBIDDEN           → 403, role tidak cukup
NOT_FOUND           → 404, resource tidak ditemukan
VALIDATION_ERROR    → 422, input tidak valid (sertakan field errors)
DUPLICATE_ENTRY     → 409, data sudah ada (misal NIK duplikat)
INTERNAL_ERROR      → 500, error server
```

---

## 🗄️ PRISMA SCHEMA LENGKAP (REFERENSI — JANGAN MODIFIKASI KECUALI TASK MEMERINTAHKAN)

```prisma
// Ini adalah schema SAAT INI yang sudah ada.
// Tambahan field atau model hanya boleh dilakukan di task yang secara eksplisit menyebutkannya.

enum UserRole {
  SUPER_ADMIN
  CABOR_ADMIN
  COACH
  ATHLETE
}

enum AthleteStatus {
  ACTIVE
  INACTIVE
  INJURED
}

enum Gender {
  MALE
  FEMALE
}

enum EventType {
  PORKAB
  PORPROV
  KEJURKAB
  OTHER
}

enum EventStatus {
  UPCOMING
  ONGOING
  COMPLETED
  CANCELLED
}

enum MedalType {
  GOLD
  SILVER
  BRONZE
  FOURTH
}

enum AchievementLevel {
  KABUPATEN
  PROVINSI
  NASIONAL
  INTERNASIONAL
}

enum SKStatus {
  ACTIVE
  EXPIRING_SOON   // < 30 hari
  EXPIRED
}

model User {
  id                String          @id @default(cuid())
  email             String          @unique
  password          String
  fullName          String
  role              UserRole
  isActive          Boolean         @default(true)
  mustChangePassword Boolean        @default(false)
  lastLogin         DateTime?
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt
  refreshTokens     RefreshToken[]
  athlete           Athlete?
  coach             Coach?
  managedCabor      CabangOlahraga? @relation("CaborAdmin")
  auditLogs         AuditLog[]
}

model RefreshToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  createdAt DateTime @default(now())
}

model CabangOlahraga {
  id            String       @id @default(cuid())
  name          String       @unique  // Singkatan: PSSI, PBSI, dll
  fullName      String                // Nama lengkap federasi
  category      String                // Beregu | Perorangan | Campuran
  logoUrl       String?
  description   String?
  chairmanName  String?
  chairmanPhone String?
  email         String?
  address       String?
  isActive      Boolean      @default(true)
  adminId       String?      @unique
  admin         User?        @relation("CaborAdmin", fields: [adminId], references: [id])
  athletes      Athlete[]
  coaches       Coach[]
  skDocuments   SKDocument[]
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
}

model Athlete {
  id            String          @id @default(cuid())
  userId        String?         @unique
  user          User?           @relation(fields: [userId], references: [id])
  nik           String          @unique
  fullName      String
  birthPlace    String
  birthDate     DateTime
  gender        Gender
  religion      String?
  bloodType     String?
  address       String
  phone         String?
  email         String?
  photoUrl      String?
  weight        Float?
  height        Float?
  status        AthleteStatus   @default(ACTIVE)
  joinDate      DateTime        @default(now())
  caborId       String
  cabor         CabangOlahraga  @relation(fields: [caborId], references: [id])
  coachId       String?
  coach         Coach?          @relation(fields: [coachId], references: [id])
  achievements  Achievement[]
  documents     Document[]
  physicalTests PhysicalTest[]
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
  deletedAt     DateTime?       // soft delete
}

model Coach {
  id              String          @id @default(cuid())
  userId          String?         @unique
  user            User?           @relation(fields: [userId], references: [id])
  nik             String          @unique
  fullName        String
  birthPlace      String
  birthDate       DateTime
  gender          Gender
  address         String
  phone           String?
  email           String?
  photoUrl        String?
  licenseNumber   String?
  licenseLevel    String?         // D | C | B | A | Nasional
  licenseIssuer   String?
  licenseIssuedAt DateTime?
  licenseExpiresAt DateTime?
  isActive        Boolean         @default(true)
  caborId         String
  cabor           CabangOlahraga  @relation(fields: [caborId], references: [id])
  athletes        Athlete[]
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
}

model Achievement {
  id            String           @id @default(cuid())
  athleteId     String
  athlete       Athlete          @relation(fields: [athleteId], references: [id], onDelete: Cascade)
  eventName     String
  level         AchievementLevel
  medal         MedalType
  year          Int
  eventNumber   String?          // Nomor pertandingan
  notes         String?
  createdAt     DateTime         @default(now())
}

model Document {
  id          String   @id @default(cuid())
  athleteId   String
  athlete     Athlete  @relation(fields: [athleteId], references: [id], onDelete: Cascade)
  type        String   // KTP | KK | AKTA | SERTIFIKAT | OTHER
  name        String   // Nama file asli
  url         String   // URL storage
  fileSize    Int?     // bytes
  mimeType    String?
  uploadedAt  DateTime @default(now())
}

model SKDocument {
  id          String   @id @default(cuid())
  caborId     String
  cabor       CabangOlahraga @relation(fields: [caborId], references: [id])
  skNumber    String          // Nomor SK
  issuedAt    DateTime
  validFrom   DateTime
  validUntil  DateTime
  status      SKStatus        // auto-computed, tapi juga disimpan untuk query cepat
  fileUrl     String?
  notes       String?
  uploadedAt  DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model News {
  id            String   @id @default(cuid())
  title         String
  slug          String   @unique
  content       String   // HTML dari rich text editor
  excerpt       String?
  thumbnailUrl  String?
  category      String   // Prestasi | Event | Organisasi | Sport Science
  tags          String[] // array of strings
  status        String   @default("DRAFT")  // DRAFT | PUBLISHED | ARCHIVED
  author        String
  publishedAt   DateTime?
  views         Int      @default(0)
  metaDesc      String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Gallery {
  id          String   @id @default(cuid())
  title       String
  description String?
  type        String   // PHOTO | VIDEO
  url         String   // S3/Drive URL untuk foto, YouTube/Vimeo URL untuk video
  thumbnailUrl String?
  album       String?
  fileSize    Int?
  mimeType    String?
  uploadedAt  DateTime @default(now())
  albumId     String?
  galleryAlbum GalleryAlbum? @relation(fields: [albumId], references: [id])
}

model GalleryAlbum {
  id          String    @id @default(cuid())
  name        String
  description String?
  coverUrl    String?
  items       Gallery[]
  createdAt   DateTime  @default(now())
}

model PhysicalTest {
  id          String   @id @default(cuid())
  athleteId   String
  athlete     Athlete  @relation(fields: [athleteId], references: [id], onDelete: Cascade)
  testDate    DateTime
  vo2Max      Float?
  strength    Float?
  endurance   Float?
  flexibility Float?
  speed       Float?
  notes       String?
  recordedBy  String
  createdAt   DateTime @default(now())
}

model AuditLog {
  id         String   @id @default(cuid())
  userId     String?
  user       User?    @relation(fields: [userId], references: [id])
  action     String   // CREATE_ATHLETE | UPDATE_ATHLETE | DELETE_ATHLETE | dll
  resource   String   // athlete | coach | cabor | news | user | sk | gallery
  resourceId String?
  before     Json?    // snapshot sebelum perubahan
  after      Json?    // snapshot setelah perubahan
  ipAddress  String?
  userAgent  String?
  createdAt  DateTime @default(now())
}

model SystemSetting {
  id        String   @id @default(cuid())
  key       String   @unique
  value     String
  updatedAt DateTime @updatedAt
}
```

---

## 🗺️ ROUTING FRONTEND (REFERENSI — sudah terdaftar di React Router)

```
/admin/login                    → LoginPage (sudah ada)
/admin/dashboard                → DashboardPage
/admin/athletes                 → AthletesPage (daftar)
/admin/athletes/new             → AthleteFormPage (tambah)
/admin/athletes/:id             → AthleteDetailPage
/admin/athletes/:id/edit        → AthleteFormPage (edit)
/admin/coaches                  → CoachesPage
/admin/coaches/new              → CoachFormPage
/admin/coaches/:id              → CoachDetailPage
/admin/coaches/:id/edit         → CoachFormPage
/admin/cabor                    → CaborPage
/admin/cabor/new                → CaborFormPage
/admin/cabor/:id                → CaborDetailPage
/admin/cabor/:id/edit           → CaborFormPage
/admin/cabor/:id/sk             → SKManagementPage
/admin/news                     → NewsPage
/admin/news/new                 → NewsEditorPage
/admin/news/:id/edit            → NewsEditorPage
/admin/gallery                  → GalleryPage
/admin/users                    → UsersPage (SUPER_ADMIN only)
/admin/users/new                → UserFormPage
/admin/users/:id/edit           → UserFormPage
/admin/audit-log                → AuditLogPage (SUPER_ADMIN only)
/admin/settings                 → SettingsPage (SUPER_ADMIN only)
/403                            → ForbiddenPage
/404                            → NotFoundPage
```

---

## 📋 TASK LIST EKSEKUSI (KERJAKAN BERURUTAN — JANGAN LOMPAT)

---

### ═══════════════════════════════════════
### TASK GROUP A — BACKEND: API YANG BELUM ADA
### ═══════════════════════════════════════

---

#### TASK A-1: Prisma Migration — Tambah Model Baru
**File yang dimodifikasi:** `prisma/schema.prisma`
**File baru:** `prisma/migrations/[timestamp]_add_missing_models/`

**Yang harus dikerjakan:**
1. Tambahkan model `GalleryAlbum` (sudah ada di schema referensi di atas — pastikan relasi ke `Gallery` sudah benar)
2. Tambahkan model `AuditLog` (persis seperti di schema referensi)
3. Tambahkan model `SystemSetting` (persis seperti di schema referensi)
4. Tambahkan field `mustChangePassword Boolean @default(false)` ke model `User` jika belum ada
5. Tambahkan field `deletedAt DateTime?` ke model `Athlete` jika belum ada
6. Jalankan: `npx prisma migrate dev --name add_audit_gallery_album_settings`
7. Jalankan: `npx prisma generate`

**Verifikasi:**
```bash
npx prisma migrate status
# Expected: All migrations applied
npx prisma db pull && echo "Schema OK"
```

---

#### TASK A-2: Audit Middleware & Service
**File baru:**
- `src/middleware/audit.middleware.ts`
- `src/services/audit.service.ts`

**`src/services/audit.service.ts`** — implement fungsi ini:
```typescript
export async function createAuditLog(params: {
  userId?: string
  action: string        // format: "CREATE_ATHLETE", "UPDATE_NEWS", dll
  resource: string      // "athlete", "coach", "cabor", "news", "gallery", "user", "sk"
  resourceId?: string
  before?: object       // snapshot sebelum (untuk UPDATE dan DELETE)
  after?: object        // snapshot sesudah (untuk CREATE dan UPDATE)
  ipAddress?: string
  userAgent?: string
}): Promise<void>
```
- Fungsi ini memanggil `prisma.auditLog.create()`
- Fungsi ini TIDAK boleh throw error ke caller — jika gagal, cukup `console.error` dan lanjut
- Jangan include field password di `before`/`after`

**`src/middleware/audit.middleware.ts`** — implement middleware:
```typescript
// Digunakan SETELAH response dikirim (non-blocking)
// Hanya log jika method adalah POST, PATCH, PUT, DELETE
// Ambil userId dari req.user?.id (jika ada)
// Ambil IP dari req.ip atau X-Forwarded-For header
export function auditMiddleware(action: string, resource: string) {
  return (req: Request, res: Response, next: NextFunction) => { ... }
}
```

**Verifikasi:**
```bash
# Compile TypeScript tanpa error
npx tsc --noEmit
```

---

#### TASK A-3: Zod Validation Middleware
**File baru:** `src/middleware/validate.middleware.ts`

```typescript
// Menerima Zod schema, validasi req.body
// Jika gagal: return 422 dengan format error yang sudah didefinisikan
// Contoh penggunaan: router.post('/', validate(createAthleteSchema), controller)
import { AnyZodObject } from 'zod'

export function validate(schema: AnyZodObject) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body)
      next()
    } catch (error) {
      // format ZodError ke { success: false, error: "Validation failed", code: "VALIDATION_ERROR", fields: {...} }
    }
  }
}
```

**File baru:** `src/lib/zod-schemas.ts` — definisikan SEMUA schema Zod untuk request body:
```typescript
// Athlete schemas
export const createAthleteSchema = z.object({ ... })  // semua field dari Prisma Athlete model
export const updateAthleteSchema = createAthleteSchema.partial()
export const createAchievementSchema = z.object({ ... })

// Coach schemas
export const createCoachSchema = z.object({ ... })
export const updateCoachSchema = createCoachSchema.partial()

// Cabor schemas
export const createCaborSchema = z.object({ ... })
export const updateCaborSchema = createCaborSchema.partial()
export const createSKSchema = z.object({ ... })

// News schemas
export const createNewsSchema = z.object({ ... })
export const updateNewsSchema = createNewsSchema.partial()

// Gallery schemas
export const createGalleryAlbumSchema = z.object({ ... })
export const createGalleryItemSchema = z.object({ ... })

// User schemas
export const createUserSchema = z.object({ ... })
export const updateUserSchema = createUserSchema.partial()

// Auth schemas
export const forgotPasswordSchema = z.object({ email: z.string().email() })
export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
})
```

**Verifikasi:**
```bash
npx tsc --noEmit
```

---

#### TASK A-4: API Riwayat Prestasi Atlet
**File dimodifikasi:** `src/routes/athlete.routes.ts`
**File dimodifikasi:** `src/controllers/athlete.controller.ts`

**Endpoint yang harus ditambahkan:**
```
GET    /api/v1/athletes/:id/achievements
  - Query: tidak ada parameter tambahan
  - Response: { success: true, data: Achievement[] }
  - Auth: requireAuth('COACH') — COACH ke atas bisa lihat

POST   /api/v1/athletes/:id/achievements
  - Body: { eventName, level, medal, year, eventNumber?, notes? }
  - Validasi dengan createAchievementSchema
  - Response: { success: true, data: Achievement }
  - Auth: requireAuth('CABOR_ADMIN')
  - Ownership check: CABOR_ADMIN hanya bisa tambah prestasi atlet di cabornya
  - Audit: action="CREATE_ACHIEVEMENT", resource="achievement"

PATCH  /api/v1/athletes/:id/achievements/:achievementId
  - Body: partial dari createAchievementSchema
  - Auth: requireAuth('CABOR_ADMIN')
  - Ownership check
  - Audit: action="UPDATE_ACHIEVEMENT"

DELETE /api/v1/athletes/:id/achievements/:achievementId
  - Auth: requireAuth('CABOR_ADMIN')
  - Ownership check
  - Hard delete (achievement bukan data kritis)
  - Audit: action="DELETE_ACHIEVEMENT"
```

**Verifikasi:**
```bash
# Test dengan curl atau httpie
curl -X GET http://localhost:3000/api/v1/athletes/[valid-id]/achievements \
  -H "Authorization: Bearer [super-admin-token]"
# Expected: 200 dengan array (boleh kosong)

curl -X POST http://localhost:3000/api/v1/athletes/[valid-id]/achievements \
  -H "Authorization: Bearer [super-admin-token]" \
  -H "Content-Type: application/json" \
  -d '{"eventName":"Porkab 2024","level":"KABUPATEN","medal":"GOLD","year":2024}'
# Expected: 201 dengan data achievement baru
```

---

#### TASK A-5: API Upload Dokumen Atlet
**File dimodifikasi:** `src/routes/athlete.routes.ts`
**File dimodifikasi:** `src/controllers/athlete.controller.ts`
**File baru:** `src/services/storage.service.ts`

**Storage Service** — buat abstraksi layer:
```typescript
// src/services/storage.service.ts
// Gunakan Google Drive API (yang sudah ada di MVP) sebagai implementasi
// Ekspor interface ini agar mudah diganti ke S3 nanti:

export interface StorageService {
  uploadFile(params: {
    buffer: Buffer
    filename: string
    mimeType: string
    folder: string    // path folder di Drive/S3
  }): Promise<{ url: string; fileId: string }>

  deleteFile(fileId: string): Promise<void>
}

// Implementasi Google Drive (pakai kode yang sudah ada dari MVP, refactor ke sini)
export const googleDriveStorage: StorageService = { ... }

// Export default
export const storage = googleDriveStorage
```

**Endpoint yang harus ditambahkan:**
```
GET    /api/v1/athletes/:id/documents
  - Response: { success: true, data: Document[] }
  - Auth: requireAuth('COACH')
  - Ownership check untuk CABOR_ADMIN dan COACH

POST   /api/v1/athletes/:id/documents
  - Content-Type: multipart/form-data
  - Fields: type (KTP|KK|AKTA|SERTIFIKAT|OTHER), file (binary)
  - Validasi file: max 10MB, hanya PDF/JPG/PNG
  - Upload ke Google Drive folder: /koni/athletes/{athleteId}/documents/
  - Simpan URL + metadata ke tabel Document
  - Auth: requireAuth('CABOR_ADMIN')
  - Ownership check
  - Audit: action="UPLOAD_DOCUMENT", resource="document"

DELETE /api/v1/athletes/:id/documents/:documentId
  - Hapus dari storage DAN hapus record dari DB
  - Auth: requireAuth('CABOR_ADMIN')
  - Ownership check
  - Audit: action="DELETE_DOCUMENT"
```

**Verifikasi:**
```bash
# Upload dokumen test
curl -X POST http://localhost:3000/api/v1/athletes/[valid-id]/documents \
  -H "Authorization: Bearer [super-admin-token]" \
  -F "type=KTP" \
  -F "file=@/path/to/test.pdf"
# Expected: 201 dengan { url: "https://drive.google.com/...", ... }
```

---

#### TASK A-6: API Full CRUD Pelatih (yang belum lengkap)
**File dimodifikasi:** `src/routes/coach.routes.ts`
**File dimodifikasi/baru:** `src/controllers/coach.controller.ts`

**Endpoint yang harus ada (GET sudah ada, tambahkan yang belum):**
```
GET    /api/v1/coaches
  - Query: caborId?, isActive?, search?
  - Pagination: page, limit
  - Auth: requireAuth('SUPER_ADMIN') — CABOR_ADMIN hanya bisa lihat coaches di cabornya

POST   /api/v1/coaches
  - Body: sesuai createCoachSchema
  - Auth: requireAuth('CABOR_ADMIN')
  - Ownership check untuk CABOR_ADMIN: caborId harus == req.user.caborId
  - Audit: action="CREATE_COACH"

GET    /api/v1/coaches/:id
  - Sertakan relasi: cabor, athletes (list nama saja)
  - Auth: requireAuth('COACH')

PATCH  /api/v1/coaches/:id
  - Body: partial dari createCoachSchema
  - Auth: requireAuth('CABOR_ADMIN')
  - Ownership check
  - Audit: action="UPDATE_COACH"

DELETE /api/v1/coaches/:id
  - Soft delete: set isActive = false
  - Auth: requireAuth('SUPER_ADMIN')
  - Audit: action="DEACTIVATE_COACH"
```

**Verifikasi:**
```bash
curl -X POST http://localhost:3000/api/v1/coaches \
  -H "Authorization: Bearer [super-admin-token]" \
  -H "Content-Type: application/json" \
  -d '{"nik":"3507012345678901","fullName":"Ahmad Santoso","birthPlace":"Malang","birthDate":"1980-05-15","gender":"MALE","address":"Jl. Merdeka No. 1","caborId":"[valid-cabor-id]","licenseLevel":"B"}'
# Expected: 201
```

---

#### TASK A-7: API Cabor & SK Dokumen (baru)
**File baru:** `src/routes/cabor.routes.ts`
**File baru:** `src/controllers/cabor.controller.ts`

**Endpoint Cabor:**
```
GET    /api/v1/cabor
  - Query: isActive?, category?, search?
  - Tidak perlu auth (publik)
  - Include: _count.athletes, _count.coaches, skDocuments (status SK terbaru)

GET    /api/v1/cabor/:id
  - Include: athletes (id, fullName, status), coaches (id, fullName), skDocuments
  - Tidak perlu auth (publik)

POST   /api/v1/cabor
  - Auth: requireAuth('SUPER_ADMIN')
  - Body: sesuai createCaborSchema
  - Audit: action="CREATE_CABOR"

PATCH  /api/v1/cabor/:id
  - Auth: requireAuth('SUPER_ADMIN')
  - Audit: action="UPDATE_CABOR"

DELETE /api/v1/cabor/:id
  - Soft delete: set isActive = false
  - Cek: jangan hapus jika masih ada atlet aktif (return 409 dengan pesan)
  - Auth: requireAuth('SUPER_ADMIN')
  - Audit: action="DEACTIVATE_CABOR"
```

**Endpoint SK Dokumen:**
```
GET    /api/v1/cabor/:id/sk
  - Return semua SK dari Cabor ini, sort by uploadedAt DESC
  - Auth: requireAuth('CABOR_ADMIN')
  - Ownership check untuk CABOR_ADMIN

POST   /api/v1/cabor/:id/sk
  - Content-Type: multipart/form-data
  - Fields: skNumber, issuedAt, validFrom, validUntil, notes?, file (PDF)
  - Upload PDF ke Google Drive: /koni/cabor/{caborId}/sk/
  - Hitung status otomatis: jika validUntil < hari ini → EXPIRED, jika < 30 hari → EXPIRING_SOON, else ACTIVE
  - Auth: requireAuth('CABOR_ADMIN'), ownership check
  - Audit: action="UPLOAD_SK"

DELETE /api/v1/cabor/:id/sk/:skId
  - Hapus dari storage dan DB
  - Auth: requireAuth('SUPER_ADMIN')
  - Audit: action="DELETE_SK"
```

**Tambahkan juga endpoint cron-like ini (dipanggil manual atau via cron):**
```
POST   /api/v1/cabor/update-sk-status
  - Auth: requireAuth('SUPER_ADMIN')
  - Update field status semua SKDocument berdasarkan validUntil vs hari ini
  - Return: { updated: number }
```

**Verifikasi:**
```bash
curl http://localhost:3000/api/v1/cabor | jq '.data | length'
# Expected: 12 (sesuai seed)

curl -X POST http://localhost:3000/api/v1/cabor/[id]/sk \
  -H "Authorization: Bearer [super-admin-token]" \
  -F "skNumber=SK/KONI/2024/001" \
  -F "issuedAt=2024-01-01" \
  -F "validFrom=2024-01-01" \
  -F "validUntil=2025-12-31" \
  -F "file=@/path/to/sk.pdf"
# Expected: 201
```

---

#### TASK A-8: API Galeri (baru)
**File baru:** `src/routes/gallery.routes.ts`
**File baru:** `src/controllers/gallery.controller.ts`

**Endpoint Album:**
```
GET    /api/v1/gallery/albums
  - Include: _count.items, coverUrl
  - Tidak perlu auth (publik)

POST   /api/v1/gallery/albums
  - Body: { name, description? }
  - Auth: requireAuth('SUPER_ADMIN')

PATCH  /api/v1/gallery/albums/:id
  - Auth: requireAuth('SUPER_ADMIN')

DELETE /api/v1/gallery/albums/:id
  - Cek: jangan hapus jika album masih berisi foto (return 409)
  - Auth: requireAuth('SUPER_ADMIN')
```

**Endpoint Gallery Item:**
```
GET    /api/v1/gallery
  - Query: albumId?, type?, search?
  - Pagination
  - Tidak perlu auth (publik)

POST   /api/v1/gallery
  - Content-Type: multipart/form-data
  - Fields: title, description?, albumId?, type (PHOTO|VIDEO)
  - Jika type=PHOTO: wajib ada file (JPG/PNG/WEBP, max 10MB)
  - Jika type=VIDEO: wajib ada field url (YouTube/Vimeo embed URL)
  - Upload foto ke Google Drive: /koni/gallery/{albumId}/
  - Auth: requireAuth('SUPER_ADMIN')
  - Audit: action="UPLOAD_GALLERY"

DELETE /api/v1/gallery/:id
  - Hapus dari storage dan DB
  - Auth: requireAuth('SUPER_ADMIN')
  - Audit: action="DELETE_GALLERY"
```

---

#### TASK A-9: API User Management (baru)
**File baru:** `src/routes/user.routes.ts`
**File baru:** `src/controllers/user.controller.ts`

```
GET    /api/v1/users
  - Query: role?, isActive?, search?
  - Auth: requireAuth('SUPER_ADMIN')

GET    /api/v1/users/:id
  - Sertakan: auditLogs terbaru (10 entri)
  - Auth: requireAuth('SUPER_ADMIN')

POST   /api/v1/users
  - Body: { email, fullName, role, caborId? (wajib jika CABOR_ADMIN) }
  - Generate password acak 12 karakter
  - Set mustChangePassword = true
  - [TODO Fase 2]: Kirim email ke user dengan password sementara (jika email service sudah ada)
  - Auth: requireAuth('SUPER_ADMIN')
  - Audit: action="CREATE_USER"

PATCH  /api/v1/users/:id
  - Body: { fullName?, role?, isActive?, caborId? }
  - TIDAK boleh update password via endpoint ini (ada endpoint tersendiri)
  - Auth: requireAuth('SUPER_ADMIN')
  - Audit: action="UPDATE_USER"

POST   /api/v1/users/:id/reset-password
  - Generate password baru acak
  - Set mustChangePassword = true
  - Auth: requireAuth('SUPER_ADMIN')
  - Audit: action="RESET_USER_PASSWORD"

DELETE /api/v1/users/:id
  - Soft delete: set isActive = false
  - Jangan hapus akun diri sendiri (return 400)
  - Jangan hapus SUPER_ADMIN terakhir (cek dulu ada berapa SUPER_ADMIN aktif)
  - Auth: requireAuth('SUPER_ADMIN')
  - Audit: action="DEACTIVATE_USER"
```

---

#### TASK A-10: API Forgot Password & Reset Password
**File dimodifikasi:** `src/routes/auth.routes.ts`
**File dimodifikasi:** `src/controllers/auth.controller.ts` (atau yang sudah ada)
**File baru:** `src/services/email.service.ts`

**Email Service:**
```typescript
// src/services/email.service.ts
// Gunakan Nodemailer dengan konfigurasi dari env vars:
// SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM

export async function sendPasswordResetEmail(params: {
  to: string
  resetLink: string
  userName: string
}): Promise<void>

export async function sendWelcomeEmail(params: {
  to: string
  userName: string
  temporaryPassword: string
}): Promise<void>

export async function sendSKExpiryWarning(params: {
  to: string
  caborName: string
  skNumber: string
  expiryDate: string
}): Promise<void>
```

**Endpoint:**
```
POST   /auth/forgot-password
  - Body: { email }
  - Jika email tidak ditemukan: tetap return 200 (jangan expose "email tidak ada")
  - Generate reset token (crypto.randomBytes(32).toString('hex'))
  - Simpan hash token + expiry (1 jam) ke DB (tambah model PasswordResetToken)
  - Kirim email dengan link: {FRONTEND_URL}/reset-password?token={token}
  - Rate limit: 3 request per jam per email

POST   /auth/reset-password
  - Body: { token, newPassword }
  - Validasi token: ada di DB, belum expired, belum digunakan
  - Update password user, set mustChangePassword = false
  - Invalidasi semua refresh token user
  - Hapus reset token dari DB
  - Audit: action="RESET_PASSWORD"

POST   /auth/change-password (untuk user yang sudah login)
  - Body: { currentPassword, newPassword }
  - Auth: requireAuth('ATHLETE') (semua role bisa)
  - Verifikasi currentPassword dengan bcrypt
  - Update password, set mustChangePassword = false
  - Audit: action="CHANGE_PASSWORD"
```

**Tambahkan model ke Prisma schema:**
```prisma
model PasswordResetToken {
  id        String   @id @default(cuid())
  userId    String
  tokenHash String   @unique  // simpan hash, bukan token asli
  expiresAt DateTime
  usedAt    DateTime?
  createdAt DateTime @default(now())
}
```

**Verifikasi:**
```bash
# Test forgot password (pastikan SMTP sudah dikonfigurasi di .env)
curl -X POST http://localhost:3000/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@koni-kabmalang.or.id"}'
# Expected: 200 { success: true, message: "..." }
```

---

#### TASK A-11: API Audit Log & Dashboard Stats
**File baru:** `src/routes/audit.routes.ts`
**File baru:** `src/controllers/audit.controller.ts`
**File baru:** `src/controllers/dashboard.controller.ts`
**File dimodifikasi:** `src/routes/index.ts` (tambahkan route baru)

**Audit Log Endpoint:**
```
GET    /api/v1/audit-log
  - Query: userId?, action?, resource?, startDate?, endDate?, page, limit
  - Sort: createdAt DESC
  - Include: user (fullName, email)
  - Auth: requireAuth('SUPER_ADMIN')
```

**Dashboard Stats Endpoint:**
```
GET    /api/v1/dashboard/stats
  - Auth: requireAuth('CABOR_ADMIN')
  - Response:
    {
      "athletes": { "total": N, "active": N, "inactive": N, "injured": N, "newThisMonth": N },
      "coaches": { "total": N, "active": N, "licenseExpiringSoon": N },
      "cabor": { "total": N, "skExpired": N, "skExpiringSoon": N },
      "news": { "total": N, "published": N, "draft": N }
    }
  - Untuk CABOR_ADMIN: filter data hanya untuk cabornya
  - Untuk SUPER_ADMIN: data semua

GET    /api/v1/dashboard/charts
  - Auth: requireAuth('CABOR_ADMIN')
  - Response:
    {
      "athletesByCabor": [{ "caborName": "PSSI", "count": 45 }, ...],
      "athletesByGender": { "male": 120, "female": 80 },
      "athletesGrowth": [{ "month": "2024-01", "count": 5 }, ...],  // 12 bulan
      "athletesByAge": [{ "range": "12-15", "count": 30 }, ...]
    }

GET    /api/v1/dashboard/alerts
  - Auth: requireAuth('CABOR_ADMIN')
  - Response:
    {
      "skExpired": [{ "caborName", "skNumber", "validUntil" }],
      "skExpiringSoon": [...],  // < 30 hari
      "licenseExpired": [{ "coachName", "caborName", "licenseExpiresAt" }],
      "injuredAthletes": [{ "fullName", "caborName", "updatedAt" }]
    }
```

---

#### TASK A-12: API Settings Sistem
**File baru:** `src/routes/settings.routes.ts`
**File baru:** `src/controllers/settings.controller.ts`

```
GET    /api/v1/settings
  - Return semua settings sebagai key-value object
  - Auth: requireAuth('SUPER_ADMIN')

PATCH  /api/v1/settings
  - Body: object key-value yang akan diupdate
  - Upsert ke tabel SystemSetting
  - Auth: requireAuth('SUPER_ADMIN')
  - Audit: action="UPDATE_SETTINGS"
```

**Keys yang harus ada (dengan default value):**
```
org_name             = "KONI Kabupaten Malang"
org_tagline          = "Bersatu, Berprestasi, Berkarakter"
org_email            = "info@koni-kabmalang.or.id"
org_phone            = ""
org_address          = ""
notif_sk_days_before = "30"    // kirim notif X hari sebelum SK expired
notif_email_recipients = ""    // comma-separated emails
```

**Verifikasi (akhir semua task group A):**
```bash
npx tsc --noEmit && echo "TypeScript OK"
# Jalankan semua route dan pastikan tidak ada 404 yang tidak terduga:
curl http://localhost:3000/api/v1/dashboard/stats -H "Authorization: Bearer [super-admin-token]"
# Expected: 200 dengan data stats
```

---

### ═══════════════════════════════════════
### TASK GROUP B — FRONTEND: LAYOUT & KOMPONEN DASAR
### ═══════════════════════════════════════

---

#### TASK B-1: Admin Layout & Navigasi
**File baru:** `src/components/layout/AdminLayout.tsx`
**File baru:** `src/components/layout/Sidebar.tsx`
**File baru:** `src/components/layout/Topbar.tsx`

**`Sidebar.tsx`** — spesifikasi:
- Background: `bg-dark-navy` (#1A1A2E)
- Lebar: `w-64`, fixed di kiri, full height
- Logo KONI di atas (gunakan teks "KONI" dengan font Playfair Display, warna KONI Gold, dan subtitle "Kab. Malang" dengan font Inter kecil)
- Garis pemisah emas tipis di bawah logo
- Navigation items dengan icon Lucide + label teks:
  ```
  Dashboard        → LayoutDashboard icon → /admin/dashboard
  ── DATA MASTER ──  (label grup, teks abu kecil)
  Atlet            → Users icon            → /admin/athletes
  Pelatih          → UserCheck icon        → /admin/coaches
  Cabang Olahraga  → Building2 icon        → /admin/cabor
  ── KONTEN ──
  Berita & Artikel → Newspaper icon        → /admin/news
  Galeri           → Images icon           → /admin/gallery
  ── SISTEM ──  (hanya tampil untuk SUPER_ADMIN)
  Pengguna         → UserCog icon          → /admin/users
  Audit Log        → ClipboardList icon    → /admin/audit-log
  Pengaturan       → Settings icon         → /admin/settings
  ```
- Active state: background `koni-red` dengan kiri border gold 3px, teks putih
- Hover state: background putih opacity 10%, transisi smooth 200ms
- Di bagian bawah sidebar: info user yang login (foto/avatar, nama, role badge)
- Tombol Logout dengan icon `LogOut`

**`Topbar.tsx`** — spesifikasi:
- Background: `bg-dark-navy`, border-bottom gold tipis
- Kiri: Breadcrumb otomatis berdasarkan URL saat ini
- Kanan: Notification bell icon + Avatar user + dropdown menu (Profil, Ganti Password, Logout)
- Breadcrumb separator: chevron icon, teks abu

**`AdminLayout.tsx`**:
- Wrapper komponen yang menggabungkan Sidebar + Topbar + main content area
- Redirect ke `/admin/login` jika tidak terautentikasi
- Cek `mustChangePassword`: jika true, redirect ke `/admin/change-password`

**Verifikasi:**
```bash
# Jalankan dev server dan buka browser, pastikan:
# 1. Sidebar tampil dengan benar di /admin/dashboard
# 2. Active state berpindah saat navigasi
# 3. Item menu SUPER_ADMIN hanya muncul untuk role yang benar
```

---

#### TASK B-2: Komponen UI Atom (Reusable)
**File baru di `src/components/ui/`:**

Buat file-file komponen berikut. Masing-masing HARUS mengikuti design system yang sudah ditetapkan:

1. **`Button.tsx`** — variant: `primary` (koni-red), `secondary` (white+border), `danger` (red-600), `ghost` (transparent). Size: `sm`, `md`, `lg`. Props: `isLoading` (spinner), `leftIcon`, `rightIcon`.

2. **`Input.tsx`** — text input dengan label, error message, helper text. Mendukung prefix icon dan suffix icon.

3. **`Select.tsx`** — dropdown select dengan label, error message. Mendukung placeholder.

4. **`Textarea.tsx`** — textarea dengan label, error message, character counter opsional.

5. **`Badge.tsx`** — variant: `success` (hijau), `warning` (kuning), `danger` (merah), `info` (biru), `neutral` (abu). Size: `sm`, `md`.

6. **`Modal.tsx`** — dialog modal dengan overlay. Props: `isOpen`, `onClose`, `title`, `children`, `size` (sm/md/lg/xl). Animasi: fade + scale dengan Framer Motion.

7. **`ConfirmDialog.tsx`** — modal konfirmasi khusus untuk aksi destruktif. Props: `isOpen`, `onClose`, `onConfirm`, `title`, `description`, `confirmLabel` (default: "Hapus"), `isLoading`.

8. **`DataTable.tsx`** — wrapper TanStack Table dengan: pagination bawaan, loading skeleton, empty state (ilustrasi + teks), search input, column sorting. Props: `columns`, `data`, `isLoading`, `pagination`, `onPageChange`.

9. **`StatCard.tsx`** — card statistik untuk dashboard. Props: `title`, `value`, `delta?` (angka + arah), `icon`, `color` (`gold`|`red`|`green`|`blue`).

10. **`PageHeader.tsx`** — header konsisten setiap halaman. Props: `title`, `subtitle?`, `actions?` (ReactNode untuk tombol di kanan).

11. **`Skeleton.tsx`** — loading skeleton animasi pulse. Variant: `text`, `card`, `table`, `avatar`.

12. **`FileUpload.tsx`** — area drag-and-drop upload. Props: `accept`, `maxSize` (bytes), `multiple`, `onFilesChange`. Tampilkan preview untuk gambar, nama file untuk PDF.

13. **`Pagination.tsx`** — komponen pagination standalone. Props: `page`, `totalPages`, `onPageChange`.

14. **`AlertBanner.tsx`** — banner notifikasi. Variant: `info`, `success`, `warning`, `error`. Props: `title`, `message`, `onDismiss?`, `action?`.

**Verifikasi:**
```bash
# Tidak perlu server test — cukup pastikan TypeScript tidak ada error
npx tsc --noEmit
```

---

#### TASK B-3: Custom Hooks untuk API
**File baru di `src/hooks/`:**

Buat hooks menggunakan React Query (TanStack Query). Setiap hook harus:
- Menggunakan `useQuery` untuk GET dan `useMutation` untuk POST/PATCH/DELETE
- Invalidate query yang relevan setelah mutasi berhasil
- Tampilkan toast notifikasi sukses/gagal (gunakan library `react-hot-toast`)

```typescript
// useAthletes.ts
export function useAthletes(filters: AthleteFilters)   // GET /api/v1/athletes
export function useAthlete(id: string)                  // GET /api/v1/athletes/:id
export function useCreateAthlete()                       // POST
export function useUpdateAthlete(id: string)             // PATCH
export function useDeleteAthlete()                       // DELETE

export function useAthleteAchievements(athleteId: string)
export function useCreateAchievement(athleteId: string)
export function useUpdateAchievement(athleteId: string)
export function useDeleteAchievement(athleteId: string)

export function useAthleteDocuments(athleteId: string)
export function useUploadDocument(athleteId: string)
export function useDeleteDocument(athleteId: string)

// useCoaches.ts — sama polanya
// useCabor.ts — sama polanya + useSKDocuments, useUploadSK
// useNews.ts — sama polanya
// useGallery.ts — useGalleryAlbums, useGalleryItems, useUploadGallery
// useUsers.ts — sama polanya + useResetUserPassword
// useDashboard.ts — useDashboardStats, useDashboardCharts, useDashboardAlerts
// useAuditLog.ts — useAuditLogs(filters)
// useSettings.ts — useSettings, useUpdateSettings
```

**Verifikasi:**
```bash
npx tsc --noEmit
```

---

### ═══════════════════════════════════════
### TASK GROUP C — FRONTEND: HALAMAN-HALAMAN ADMIN
### ═══════════════════════════════════════

#### Instruksi umum untuk semua halaman:
- Semua halaman harus dibungkus dengan `<AdminLayout>`
- Semua halaman harus menggunakan komponen dari Task B-2
- Semua state loading harus ditampilkan dengan `<Skeleton>`
- Semua error state harus ditampilkan dengan pesan yang jelas
- Semua form harus menggunakan React Hook Form + Zod validation
- Semua aksi destruktif harus menggunakan `<ConfirmDialog>`
- Gunakan Framer Motion `AnimatePresence` untuk transisi masuk halaman

---

#### TASK C-1: Dashboard Utama (`/admin/dashboard`)
**File baru:** `src/pages/admin/DashboardPage.tsx`
**File baru:** `src/components/dashboard/StatCard.tsx` (jika belum di B-2)
**File baru:** `src/components/dashboard/AlertPanel.tsx`
**File baru:** `src/components/dashboard/ActivityFeed.tsx`
**File baru:** `src/components/dashboard/ChartSection.tsx`

**Layout halaman:**
```
Row 1: 4 StatCard (Atlet Aktif, Pelatih, Cabor, SK Bermasalah)
Row 2: Alert Panel (SK Expired/Akan Expired, Lisensi Expired, Atlet Cedera)
Row 3: 2 kolom
  Kiri (60%): Bar Chart "Distribusi Atlet per Cabor" (top 10, Recharts)
  Kanan (40%): Donut Chart "Distribusi Jenis Kelamin"
Row 4: 2 kolom
  Kiri (60%): Line Chart "Pertumbuhan Atlet 12 Bulan" (Recharts)
  Kanan (40%): Activity Feed terbaru (10 entri audit log)
```

**StatCard spesifikasi:**
- Atlet Aktif: icon `Users`, warna biru, tampilkan delta "↑ +X bulan ini"
- Pelatih: icon `UserCheck`, warna hijau
- Total Cabor: icon `Building2`, warna emas
- SK Bermasalah: icon `AlertTriangle`, warna merah jika > 0, abu jika 0

**Alert Panel:**
- Tab: "SK Kadaluarsa" | "Lisensi Pelatih" | "Atlet Cedera"
- Setiap item: nama Cabor/Pelatih/Atlet + tanggal + tombol aksi cepat
- Jika tidak ada alert: tampilkan "✓ Semua berjalan baik"

---

#### TASK C-2: Halaman Daftar Atlet (`/admin/athletes`)
**File baru:** `src/pages/admin/AthletesPage.tsx`
**File baru:** `src/components/athletes/AthleteTable.tsx`
**File baru:** `src/components/athletes/AthleteFilters.tsx`

**Spesifikasi:**
- `<PageHeader>` dengan judul "Manajemen Atlet", subtitle jumlah total, tombol "Tambah Atlet"
- Filter bar (horizontal, collapsible di mobile):
  - Search input (debounce 300ms)
  - Dropdown Cabor (semua Cabor dari API, CABOR_ADMIN hanya lihat cabornya)
  - Dropdown Status (Semua | Aktif | Non-Aktif | Cedera)
  - Dropdown Jenis Kelamin (Semua | Pria | Wanita)
  - Tombol "Reset Filter"
- `<DataTable>` dengan kolom:
  1. Foto (avatar 40x40, jika tidak ada gunakan inisial nama)
  2. Nama Lengkap (bold) + NIK (teks abu kecil di bawah)
  3. Cabor (badge)
  4. Jenis Kelamin
  5. Usia (hitung dari birthDate)
  6. BMI (hitung dari weight/height, dengan warna: hijau=normal, kuning=kurus/gemuk, merah=obesitas)
  7. Status (badge warna)
  8. Aksi: tombol icon "Lihat Detail", "Edit", "Nonaktifkan"
- Baris dapat diklik untuk pergi ke halaman detail
- Konfirmasi sebelum nonaktifkan (ConfirmDialog)
- Export button: "Export Excel" — panggil API, download file

---

#### TASK C-3: Form Atlet — Tambah & Edit
**File baru:** `src/pages/admin/AthleteFormPage.tsx`
**File baru:** `src/components/athletes/AthleteForm.tsx`

**Spesifikasi form dengan 3 tab:**

**Tab 1 — Data Diri:**
- NIK (16 digit, validasi angka, cek duplikasi on-blur)
- Nama Lengkap
- Jenis Kelamin (radio button bergaya, Pria/Wanita)
- Tempat Lahir
- Tanggal Lahir (date picker, tampilkan usia yang terhitung otomatis di sebelahnya)
- Agama (select: Islam, Kristen, Katolik, Hindu, Buddha, Konghucu)
- Golongan Darah (select: A+, A-, B+, B-, AB+, AB-, O+, O-)
- Alamat Jalan
- RT / RW (2 input dalam 1 baris)
- Kelurahan | Kecamatan | Kabupaten/Kota | Kode Pos
- No. Telepon
- Email

**Tab 2 — Data Olahraga:**
- Cabang Olahraga (select dari API /cabor, CABOR_ADMIN tidak bisa ubah ini)
- Nomor/Spesialisasi Pertandingan (text input dengan tag-style, bisa tambah multiple)
- Berat Badan (kg) — auto-hitung BMI
- Tinggi Badan (cm) — auto-hitung BMI
- BMI result display: angka + kategori + warna
- Status Atlet (radio: Aktif / Non-Aktif / Cedera)
- Tanggal Bergabung (date picker)
- Pelatih (select dari daftar Coach di Cabor yang dipilih)

**Tab 3 — Foto & Dokumen:**
- Upload Foto Profil:
  - Drag-and-drop area
  - Preview gambar setelah dipilih
  - Tombol hapus preview
  - Keterangan: "Max 2MB, format JPG/PNG"
- Dokumen (hanya di mode edit, bukan saat tambah baru):
  - List dokumen yang sudah diupload (nama, tipe, tanggal upload, tombol hapus, tombol download)
  - Upload dokumen baru: pilih tipe (KTP/KK/AKTA/SERTIFIKAT/OTHER) + file picker

**Navigasi tab:**
- Tab dengan progress indicator (1/3, 2/3, 3/3)
- Tombol "Sebelumnya" dan "Selanjutnya" di antara tab
- Di tab terakhir: tombol "Simpan" (primary) dan "Batal" (secondary)
- Jika form sudah diubah dan user klik "Batal" atau navigasi pergi: tampilkan konfirmasi "Perubahan belum disimpan, yakin ingin keluar?"

**Mode Edit:**
- Isi semua field dengan data yang sudah ada dari API
- Label halaman berubah menjadi "Edit Atlet: {nama}"

---

#### TASK C-4: Halaman Detail Atlet (`/admin/athletes/:id`)
**File baru:** `src/pages/admin/AthleteDetailPage.tsx`
**File baru:** `src/components/athletes/AthleteDetailCard.tsx`
**File baru:** `src/components/athletes/AchievementTab.tsx`
**File baru:** `src/components/athletes/DocumentTab.tsx`

**Layout:**
- Header: foto besar (100x100, rounded), nama, badge status, badge Cabor, tombol Edit + Nonaktifkan
- Info card grid (2 kolom): semua data diri (NIK, TTL, gender, alamat, kontak)
- Info card: data olahraga (berat, tinggi, BMI gauge visual, status, pelatih)
- Tabs: "Riwayat Prestasi" | "Dokumen" | "Data Fisik (Coming Soon)"

**Tab Riwayat Prestasi:**
- Timeline visual (kiri ke kanan, sort by year DESC)
- Setiap item: nama kejuaraan, badge level, icon medali (🥇🥈🥉), tahun, nomor tanding
- Tombol "Tambah Prestasi" → modal form dengan field: nama kejuaraan, level, medali, tahun, nomor, catatan
- Tombol Edit dan Hapus per item (CABOR_ADMIN+)

**Tab Dokumen:**
- Grid card dokumen: icon tipe file, nama file, tanggal upload, ukuran file
- Tombol "Preview" (buka di tab baru) dan "Hapus"
- Upload area untuk tambah dokumen baru (pilih tipe dahulu)

---

#### TASK C-5: Halaman Pelatih (Daftar, Form, Detail)
**File baru:** `src/pages/admin/CoachesPage.tsx`
**File baru:** `src/pages/admin/CoachFormPage.tsx`
**File baru:** `src/pages/admin/CoachDetailPage.tsx`
**File baru:** `src/components/coaches/CoachTable.tsx`
**File baru:** `src/components/coaches/CoachForm.tsx`

**CoachesPage:**
- Sama polanya dengan AthletesPage
- Kolom tabel: Foto, Nama, Cabor, Lisensi (nomor + level), Expiry Date (dengan badge warning jika < 30 hari), Jml Atlet Binaan, Status, Aksi

**CoachFormPage:**
- Tab 1 — Data Diri: (sama dengan AthleteForm Tab 1)
- Tab 2 — Data Kepelatihan: Cabor, No. Lisensi, Level (D/C/B/A/Nasional), Lembaga, Tanggal Terbit, Tanggal Expired, Atlet Binaan (multi-select)
- Tab 3 — Foto & Dokumen: foto profil, upload scan lisensi

**CoachDetailPage:**
- Header + info cards
- Daftar atlet binaan (grid card kecil dengan foto + nama + status)
- Riwayat prestasi atlet binaan (dikelompokkan per tahun)

---

#### TASK C-6: Halaman Cabang Olahraga
**File baru:** `src/pages/admin/CaborPage.tsx`
**File baru:** `src/pages/admin/CaborFormPage.tsx`
**File baru:** `src/pages/admin/CaborDetailPage.tsx`
**File baru:** `src/pages/admin/SKManagementPage.tsx`
**File baru:** `src/components/cabor/CaborTable.tsx`
**File baru:** `src/components/cabor/CaborForm.tsx`
**File baru:** `src/components/cabor/SKTable.tsx`
**File baru:** `src/components/cabor/SKUploadForm.tsx`

**CaborPage:**
- Toggle view: Grid (card dengan logo, nama, stats) | Table
- Di table: logo, nama, kategori, ketua, jumlah atlet, jumlah pelatih, status SK (badge), aksi
- Aksi per baris: Lihat Detail, Edit, Kelola SK, Nonaktifkan

**CaborDetailPage:**
- Header: logo Cabor besar, nama, badge kategori, kontak info
- Tabs: "Profil" | "Atlet" | "Pelatih" | "SK Dokumen"
- Tab Profil: semua info Cabor
- Tab Atlet: tabel atlet Cabor (mini, tanpa filter)
- Tab Pelatih: tabel pelatih Cabor (mini)
- Tab SK Dokumen: langsung embed SKManagementPage content

**SKManagementPage (bisa juga diakses via /admin/cabor/:id/sk):**
- Judul: "Dokumen SK — {Nama Cabor}"
- Banner warning merah jika ada SK expired, kuning jika akan expired
- Tabel SK: Nomor SK, Tanggal Terbit, Berlaku Dari, Berlaku Sampai, Status (badge), File, Aksi (Preview, Download, Hapus)
- Tombol "Upload SK Baru" → modal form: nomor SK, tanggal terbit, berlaku dari, berlaku sampai, catatan, upload PDF

---

#### TASK C-7: Halaman Berita & Editor
**File baru:** `src/pages/admin/NewsPage.tsx`
**File baru:** `src/pages/admin/NewsEditorPage.tsx`
**File baru:** `src/components/news/NewsTable.tsx`
**File baru:** `src/components/news/NewsEditor.tsx`
**File baru:** `src/components/news/NewsPreview.tsx`

**NewsPage:**
- Tabel: thumbnail (50x50), judul (bold) + slug (abu kecil), kategori badge, status badge (Draft=abu/Published=hijau/Archived=merah), penulis, tanggal publish, views, aksi
- Filter: kategori, status, search judul
- Bulk action: Publish terpilih, Archive terpilih

**NewsEditorPage:**
- Layout 2 kolom: Editor (lebar) | Panel Pengaturan (kanan, sticky)
- Editor area:
  - Input judul besar (placeholder "Judul Artikel...")
  - Auto-generate slug dari judul (editable, di bawah judul)
  - Tiptap rich text editor dengan toolbar lengkap (heading, bold, italic, underline, list, blockquote, link, gambar inline)
  - Autosave indicator: "Disimpan otomatis 2 menit yang lalu" atau "Menyimpan..."
- Panel Pengaturan (kanan):
  - Status (dropdown: Draft/Published/Archived)
  - Kategori (checkbox multi-select)
  - Tags (input tag, tekan Enter untuk tambah)
  - Thumbnail/Cover (upload + preview)
  - Meta Description (textarea, counter karakter 0/160)
  - Penulis (text input, default nama user login)
  - Scheduled Publish (date-time picker, hanya aktif jika status = Published)
  - Tombol "Simpan Draft" dan "Publish" (atau "Update")
  - Tombol "Preview" (buka tab baru)

---

#### TASK C-8: Halaman Galeri
**File baru:** `src/pages/admin/GalleryPage.tsx`
**File baru:** `src/components/gallery/GalleryGrid.tsx`
**File baru:** `src/components/gallery/GalleryUploadModal.tsx`
**File baru:** `src/components/gallery/AlbumManager.tsx`

**GalleryPage:**
- Tabs: "Semua Foto & Video" | "Kelola Album"
- Tab Semua:
  - Filter: album, tipe (Foto/Video), search
  - Grid responsive: 3 kolom desktop, 2 tablet, 1 mobile
  - Setiap card: thumbnail/preview, overlay pada hover (judul, tanggal, tombol hapus)
  - Klik card → lightbox preview
  - Tombol "Upload Media" → GalleryUploadModal
- Tab Album:
  - Grid album: cover image, nama album, jumlah item
  - Tombol buat album baru, edit nama, hapus (jika kosong)

**GalleryUploadModal:**
- Toggle: "Upload Foto" | "Tambah Video (YouTube/Vimeo)"
- Jika Foto: multi-file drag-and-drop, preview grid, progress upload per file
- Jika Video: input URL, auto-generate thumbnail dari URL, input judul + deskripsi
- Pilih album (dropdown, opsional)
- Input judul dan deskripsi (bisa bulk edit setelah upload)

---

#### TASK C-9: Halaman User Management (`/admin/users`) — SUPER_ADMIN only
**File baru:** `src/pages/admin/UsersPage.tsx`
**File baru:** `src/pages/admin/UserFormPage.tsx`
**File baru:** `src/components/users/UserTable.tsx`
**File baru:** `src/components/users/UserForm.tsx`

**UsersPage:**
- Akses guard: redirect ke /403 jika bukan SUPER_ADMIN
- Tabel: Avatar, Nama, Email, Role badge (warna berbeda per role), Cabor (jika CABOR_ADMIN), Last Login, Status, Aksi
- Aksi: Edit, Reset Password (ConfirmDialog), Nonaktifkan (ConfirmDialog)

**UserFormPage (mode Tambah):**
- Field: Nama Lengkap, Email, Role (select), Cabor (muncul jika role = CABOR_ADMIN)
- Note: "Password akan digenerate otomatis dan dikirim ke email pengguna"
- Tombol Simpan

**UserFormPage (mode Edit):**
- Semua field dari Tambah
- Tambah: Status (toggle Aktif/Non-Aktif)
- TIDAK ada field password (gunakan "Reset Password" terpisah)

---

#### TASK C-10: Halaman Audit Log (`/admin/audit-log`) — SUPER_ADMIN only
**File baru:** `src/pages/admin/AuditLogPage.tsx`
**File baru:** `src/components/audit/AuditTable.tsx`

**Spesifikasi:**
- Filter: User (dropdown), Resource (dropdown: athlete/coach/cabor/news/dll), Aksi (dropdown), Tanggal Dari, Tanggal Sampai
- Tabel: Timestamp, User (avatar + nama), Aksi (badge), Resource, Resource ID (bisa diklik ke detail), Perubahan (expand row untuk lihat before/after JSON)
- Expand row: tampilkan diff sebelum dan sesudah perubahan dalam format yang mudah dibaca (key: before value → after value)
- Export: tombol "Export CSV" (download file CSV dari hasil filter saat ini)
- Pagination server-side

---

#### TASK C-11: Halaman Settings (`/admin/settings`) — SUPER_ADMIN only
**File baru:** `src/pages/admin/SettingsPage.tsx`

**Tabs:**
1. **Umum**: Form: nama organisasi, tagline, email, telepon, alamat. Tombol simpan.
2. **Notifikasi**: Toggle notifikasi SK expired (dengan input "X hari sebelumnya"), input email penerima (multi-input), toggle notifikasi lisensi pelatih expired.
3. **Keamanan**: Tampilkan info: session aktif, last login. Tombol "Logout dari Semua Perangkat". Aturan password (informasi saja).

---

#### TASK C-12: Halaman Forbidden & Not Found
**File baru:** `src/pages/ForbiddenPage.tsx`
**File baru:** `src/pages/NotFoundPage.tsx`

- ForbiddenPage (/403): Ilustrasi simple, teks "Akses Ditolak", subjudul, tombol kembali ke dashboard
- NotFoundPage (/404): Ilustrasi, teks "Halaman Tidak Ditemukan", tombol kembali

---

### ═══════════════════════════════════════
### TASK GROUP D — INTEGRASI & POLISH
### ═══════════════════════════════════════

---

#### TASK D-1: React Query Setup & Global Error Handling
**File baru/dimodifikasi:** `src/lib/queryClient.ts`

- Konfigurasi QueryClient: retry 1x untuk semua query, staleTime 30 detik
- Global error handler: jika API return 401 → clear auth state + redirect ke `/admin/login`
- Pasang `<Toaster>` dari react-hot-toast di root App
- Toast config: posisi bottom-right, durasi 4 detik, style sesuai design system

---

#### TASK D-2: Export Laporan (Excel)
**File baru:** `src/services/export.service.ts` (frontend)

```typescript
// Gunakan library SheetJS (xlsx) yang sudah tersedia
// Fungsi yang harus ada:

export function exportAthletesToExcel(athletes: Athlete[]): void
// Buat file: "Daftar Atlet KONI Kab Malang - {tanggal}.xlsx"
// Sheet 1: semua data atlet (semua kolom yang relevan)

export function exportSKStatusToExcel(data: SKStatusReport[]): void
// Buat file: "Status SK Cabor - {tanggal}.xlsx"
// Sheet 1: semua SK semua Cabor dengan status
```

Tombol Export di halaman AthletesList dan sebuah laporan SK di halaman Cabor sudah disiapkan di task sebelumnya — hubungkan ke fungsi ini.

---

#### TASK D-3: Notifikasi SK Expired (Cron Simulation)
**File baru:** `src/services/notification.service.ts` (backend)

```typescript
// Fungsi yang dipanggil saat server start dan setiap hari
export async function checkAndNotifyExpiringSK(): Promise<void>
// 1. Query semua SKDocument yang validUntil < now + 30 hari DAN status != EXPIRED
// 2. Update status ke EXPIRING_SOON atau EXPIRED sesuai kondisi
// 3. Untuk yang baru berubah status: kirim email ke notif_email_recipients dari SystemSetting
// 4. Log ke console hasil eksekusi

// Panggil di server startup:
// server.ts atau app.ts: checkAndNotifyExpiringSK()
// Untuk production: gunakan node-cron atau cron job OS
```

---

#### TASK D-4: Verifikasi End-to-End Final
**Ini bukan task coding — ini adalah checklist verifikasi menyeluruh.**

Setelah semua task selesai, lakukan verifikasi berikut satu per satu dan tandai ✅ atau ❌:

```
BACKEND:
[ ] npx tsc --noEmit — no errors
[ ] npx prisma migrate status — all applied
[ ] POST /auth/login — return JWT
[ ] GET /api/v1/athletes — 20 hasil (dengan pagination)
[ ] POST /api/v1/athletes — buat atlet baru, return 201
[ ] GET /api/v1/athletes/:id/achievements — return array
[ ] POST /api/v1/athletes/:id/achievements — buat prestasi, return 201
[ ] POST /api/v1/athletes/:id/documents — upload file, return URL valid
[ ] GET /api/v1/cabor — return 12 Cabor dari seed
[ ] POST /api/v1/cabor/:id/sk — upload SK PDF, return 201
[ ] GET /api/v1/gallery — return array
[ ] POST /api/v1/gallery — upload foto, return 201
[ ] GET /api/v1/users — return daftar user (SUPER_ADMIN token)
[ ] GET /api/v1/dashboard/stats — return objek stats
[ ] GET /api/v1/dashboard/alerts — return objek alerts
[ ] GET /api/v1/audit-log — return array log
[ ] RBAC: CABOR_ADMIN tidak bisa akses /api/v1/users — return 403
[ ] RBAC: CABOR_ADMIN hanya lihat atlet cabornya sendiri

FRONTEND:
[ ] /admin/login — form tampil, login berhasil redirect ke dashboard
[ ] /admin/dashboard — 4 stat card tampil dengan data riil
[ ] /admin/dashboard — chart Distribusi Atlet tampil
[ ] /admin/dashboard — alert panel tampil (SK/lisensi bermasalah)
[ ] /admin/athletes — tabel tampil dengan data
[ ] /admin/athletes — filter Cabor berfungsi
[ ] /admin/athletes/new — form 3 tab berfungsi, submit berhasil
[ ] /admin/athletes/:id — detail tampil, tab Prestasi berfungsi
[ ] /admin/athletes/:id — upload dokumen berfungsi
[ ] /admin/coaches — tabel tampil
[ ] /admin/cabor — tampil 12 Cabor dari seed
[ ] /admin/cabor/:id/sk — upload SK berfungsi
[ ] /admin/news — tabel berita tampil
[ ] /admin/news/new — editor Tiptap berfungsi, simpan draft OK, publish OK
[ ] /admin/gallery — grid foto tampil, upload foto berfungsi
[ ] /admin/users — hanya muncul untuk SUPER_ADMIN, tabel tampil
[ ] /admin/audit-log — tabel log tampil dengan filter berfungsi
[ ] /admin/settings — form settings bisa disimpan
[ ] Role guard: login sebagai CABOR_ADMIN, akses /admin/users — redirect ke /403
```

---

## 🚫 PANTANGAN MUTLAK (JANGAN PERNAH DILAKUKAN)

1. **JANGAN** ubah schema Prisma yang sudah ada tanpa instruksi eksplisit di task
2. **JANGAN** ubah endpoint yang sudah verified di MVP (routes auth yang sudah ada)
3. **JANGAN** gunakan `any` type di TypeScript — selalu definisikan type yang proper
4. **JANGAN** hardcode nilai seperti URL, password, atau API key — selalu gunakan env variable
5. **JANGAN** hapus data secara permanen (hard delete) untuk: Athlete, Coach, User, News — gunakan soft delete
6. **JANGAN** generate konten lorem ipsum di komponen — gunakan data riil dari seed atau API
7. **JANGAN** buat komponen baru jika komponen yang sama sudah ada di `src/components/ui/` — reuse
8. **JANGAN** install library baru tanpa verifikasi dahwa library tersebut tidak sudah ada di package.json
9. **JANGAN** skip task verifikasi — verifikasi adalah bagian dari task
10. **JANGAN** lanjut ke Task Group berikutnya jika task sebelumnya masih ada error TypeScript

---

## 📦 DEPENDENCIES YANG HARUS DIINSTALL (jika belum ada)

**Frontend:**
```bash
npm install @tanstack/react-query @tanstack/react-table
npm install react-hook-form @hookform/resolvers zod
npm install framer-motion
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-link @tiptap/extension-placeholder
npm install recharts
npm install react-hot-toast
npm install xlsx          # SheetJS untuk export Excel
npm install date-fns      # utilitas tanggal
```

**Backend:**
```bash
npm install nodemailer @types/nodemailer
npm install node-cron @types/node-cron
```

**Verifikasi setelah install:**
```bash
npm ls --depth=0 2>/dev/null | grep -E "react-query|react-hook-form|zod|tiptap|recharts|hot-toast|xlsx"
```

---

## 🏁 PERINTAH AWAL SESI

Saat memulai sesi baru, jalankan perintah-perintah ini terlebih dahulu untuk memahami kondisi proyek:

```bash
# 1. Lihat struktur direktori saat ini
find src -type f -name "*.ts" -o -name "*.tsx" | sort

# 2. Cek status migrasi database
npx prisma migrate status

# 3. Cek dependencies yang sudah terinstall
cat package.json | grep -A 100 '"dependencies"'

# 4. Compile TypeScript dan lihat error yang ada
npx tsc --noEmit 2>&1 | head -50

# 5. Cek environment variables yang sudah ada
cat .env.example 2>/dev/null || cat .env 2>/dev/null | grep -v "=" | head -20
```

**Setelah menjalankan perintah di atas, laporkan:**
1. Task mana saja yang sudah selesai berdasarkan file yang ada
2. Error TypeScript yang ditemukan (jika ada)
3. Migration status
4. Dependency mana yang perlu diinstall

**Kemudian mulai dari task pertama yang BELUM selesai.**

---

*End of Master Prompt — KONI Kab. Malang Fase 2 SIM Internal & Admin CMS*
*Versi: 1.0 | Total Tasks: 3 Group (A: 12 tasks, B: 3 tasks, C: 12 tasks, D: 4 tasks) = 31 tasks*
