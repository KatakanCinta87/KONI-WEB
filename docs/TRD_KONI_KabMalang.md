KOMITE OLAHRAGA NASIONAL INDONESIA --- KABUPATEN MALANG

**TECHNICAL REQUIREMENTS**

**DOCUMENT (TRD)**

*Arsitektur Sistem, Tech Stack, Skema Database & Spesifikasi API*

  -------------------------- --------------------------------------------
  Versi Dokumen              1.0

  Referensi                  PRD Portal KONI Kab. Malang v1.0

  Tim                        Engineering & Backend Development

  Tahun                      2025

  Klasifikasi                Internal --- Tim Engineering
  -------------------------- --------------------------------------------

**Daftar Isi**

**1. Arsitektur Sistem**

**1.1 Gambaran Umum Arsitektur**

Portal KONI Kabupaten Malang dibangun menggunakan arsitektur Monorepo
Full-Stack yang akan berevolusi secara bertahap seiring perkembangan
kebutuhan. Arsitektur dirancang untuk dapat diskalakan dari prototipe
menuju sistem enterprise.

**Arsitektur Fase 0--1 (Current: React SPA + Express)**

-   Frontend: React 19 + Vite SPA, di-serve oleh Express sebagai static
    files

-   Backend: Node.js + Express.js REST API

-   Database: Google Sheets (via Sheets API v4)

-   Storage: Google Drive (via Drive API v3)

-   Auth: Google OAuth 2.0 + Custom Header (x-admin-password)

**Arsitektur Target Fase 2+ (Next.js + PostgreSQL)**

-   Frontend: Next.js 14+ (App Router) untuk SSR/SSG, SEO optimal

-   Backend: Next.js API Routes + tRPC untuk type-safe API

-   Database: PostgreSQL (managed, misal Supabase atau Railway)

-   ORM: Prisma --- type-safe schema dan migration

-   Storage: AWS S3 atau Google Cloud Storage untuk file atlet/dokumen

-   Auth: NextAuth.js dengan adapter Prisma, mendukung RBAC

-   Cache: Redis untuk session dan rate-limiting

**1.2 Diagram Alir Data (Data Flow)**

Berikut adalah alur data utama untuk setiap aktor dalam sistem:

  ------------------------------------------------------------------------
  **Aktor**       **Aksi**            **Alur Data**
  --------------- ------------------- ------------------------------------
  Pengguna Publik Akses portal        Browser → CDN/Edge → Next.js SSR →
                                      PostgreSQL (read-only)

  Atlet/Pelatih   Login & update      Browser → NextAuth → PostgreSQL → S3
                  profil              (dokumen)

  Admin Cabor     Input data atlet    Browser → API (JWT) → Prisma →
                                      PostgreSQL + S3

  Super Admin     Manajemen sistem    Browser → API (JWT Admin) → Semua
                                      resource

  Operator Event  Input hasil tanding Browser → WebSocket → PostgreSQL →
                                      Broadcast ke publik
  ------------------------------------------------------------------------

**2. Tech Stack & Justifikasi**

**2.1 Frontend**

  ----------------------------------------------------------------------------
  **Teknologi**   **Versi**   **Fase**   **Justifikasi**
  --------------- ----------- ---------- -------------------------------------
  React           19.x        Fase 0-1   Library UI utama, ekosistem luas,
                                         sudah diimplementasikan di MVP

  Vite            6.x         Fase 0-1   Build tool cepat untuk SPA, HMR
                                         optimal, ringan di development

  Next.js         14.x+       Fase 2+    SSR/SSG untuk SEO optimal, App
                                         Router, image optimization built-in

  TypeScript      5.x         Semua fase Type safety di seluruh codebase,
                                         mengurangi bug runtime

  Tailwind CSS    v4          Semua fase Utility-first, konfigurasi custom
                                         color (KONI Gold & Red) sudah ada

  Framer Motion   11.x        Semua fase Animasi micro-interaction halus, page
                                         transition

  Lucide React    Latest      Semua fase Ikon SVG bersih dan konsisten

  React Query     5.x         Fase 2+    Server state management, caching,
                                         background refresh

  React Hook Form 7.x         Fase 2+    Form management berperforma tinggi
                                         dengan validasi Zod
  ----------------------------------------------------------------------------

**2.2 Backend**

  ----------------------------------------------------------------------------
  **Teknologi**   **Versi**   **Fase**   **Justifikasi**
  --------------- ----------- ---------- -------------------------------------
  Node.js         22.x LTS    Semua fase Runtime JavaScript server, ekosistem
                                         npm terlengkap

  Express.js      4.x         Fase 0-1   Web framework ringan, sudah
                                         diimplementasikan di MVP

  Next.js API     14.x+       Fase 2+    Fullstack dalam satu framework,
  Routes                                 eliminasi CORS overhead

  Prisma ORM      5.x         Fase 2+    Type-safe DB access, auto-generated
                                         types, migration CLI

  Zod             3.x         Fase 2+    Schema validation runtime,
                                         terintegrasi dengan tRPC & React Hook
                                         Form

  Multer          1.x         Fase 0-1   Multipart form-data handler untuk
                                         upload file ke Google Drive

  Socket.IO       4.x         Fase 3     Real-time WebSocket untuk live
                                         scoring event

  Nodemailer      6.x         Fase 2+    Email notifikasi untuk konfirmasi
                                         pendaftaran & proposal
  ----------------------------------------------------------------------------

**2.3 Database & Storage**

  ----------------------------------------------------------------------------
  **Teknologi**   **Tipe**      **Fase**   **Penggunaan**
  --------------- ------------- ---------- -----------------------------------
  Google Sheets   Spreadsheet   Fase 0-1   Database sementara; mudah diakses
                  DB                       tim non-teknis

  Google Drive    File Storage  Fase 0-1   Penyimpanan foto atlet dan dokumen
                                           SK

  PostgreSQL      Relational DB Fase 2+    Database utama; mendukung relasi
                                           kompleks dan query lanjutan

  Redis           In-Memory     Fase 2+    Session management, rate limiting,
                  Cache                    cache query sering diakses

  AWS S3 / GCS    Object        Fase 2+    Penyimpanan ribuan foto atlet,
                  Storage                  dokumen PDF, galeri media
  ----------------------------------------------------------------------------

**2.4 DevOps & Infrastruktur**

  ---------------------------------------------------------------------------
  **Teknologi**       **Kategori**       **Penggunaan**
  ------------------- ------------------ ------------------------------------
  Vercel / Railway    Hosting            Deploy frontend Next.js dan backend
                                         API

  Supabase / Neon     Managed PostgreSQL Database hosting dengan free tier,
                                         auto-backup

  GitHub Actions      CI/CD              Automated testing, linting, dan
                                         deploy on push

  Docker              Containerization   Konsistensi environment
                                         dev/staging/production

  Cloudflare          CDN & DNS          Accelerasi aset statis dan
                                         perlindungan DDoS

  Sentry              Error Monitoring   Tracking bug dan error di production
                                         secara real-time
  ---------------------------------------------------------------------------

**3. Skema Database (PostgreSQL --- Fase 2+)**

**3.1 Entity Relationship Overview**

Berikut adalah entitas utama dan relasi antar tabel dalam sistem
database PostgreSQL:

-   User (1) → (N) Athlete / Coach: satu user memiliki satu profil atlet
    atau pelatih

-   CabangOlahraga (1) → (N) Athlete: satu Cabor memiliki banyak atlet

-   CabangOlahraga (1) → (N) Coach: satu Cabor memiliki banyak pelatih

-   Event (1) → (N) EventRegistration: satu event memiliki banyak
    pendaftar

-   Athlete (1) → (N) Achievement: satu atlet memiliki banyak prestasi

-   Athlete (1) → (N) PhysicalTest: satu atlet memiliki banyak data tes
    fisik

**3.2 Definisi Tabel Utama (Prisma Schema)**

**Tabel: User**

> model User {
>
> id String \@id \@default(cuid())
>
> email String \@unique
>
> password String // bcrypt hash
>
> role UserRole // SUPER_ADMIN \| CABOR_ADMIN \| ATHLETE \| COACH
>
> isActive Boolean \@default(true)
>
> lastLogin DateTime?
>
> createdAt DateTime \@default(now())
>
> updatedAt DateTime \@updatedAt
>
> athlete Athlete?
>
> coach Coach?
>
> caborAdmin CabangOlahraga? \@relation(\"AdminCabor\")
>
> }

**Tabel: Athlete (Atlet)**

> model Athlete {
>
> id String \@id \@default(cuid())
>
> userId String \@unique
>
> user User \@relation(fields: \[userId\], references: \[id\])
>
> nik String \@unique
>
> fullName String
>
> birthPlace String
>
> birthDate DateTime
>
> gender Gender // MALE \| FEMALE
>
> address String
>
> phone String?
>
> photoUrl String? // S3 / GCS URL
>
> weight Float? // kg
>
> height Float? // cm
>
> status AthleteStatus // ACTIVE \| INACTIVE \| INJURED
>
> caborId String
>
> cabor CabangOlahraga \@relation(fields: \[caborId\], references:
> \[id\])
>
> achievements Achievement\[\]
>
> physicalTests PhysicalTest\[\]
>
> registrations EventRegistration\[\]
>
> documents Document\[\]
>
> createdAt DateTime \@default(now())
>
> updatedAt DateTime \@updatedAt
>
> }

**Tabel: CabangOlahraga**

> model CabangOlahraga {
>
> id String \@id \@default(cuid())
>
> name String // Contoh: PSSI, PBSI, PASI
>
> fullName String // Nama lengkap federasi
>
> category String // Beregu \| Perorangan \| Campuran
>
> logoUrl String?
>
> description String?
>
> chairmanName String? // Ketua Pengkab
>
> phone String?
>
> email String?
>
> address String?
>
> isActive Boolean \@default(true)
>
> adminId String? \@unique
>
> admin User? \@relation(\"AdminCabor\", fields: \[adminId\],
> references: \[id\])
>
> athletes Athlete\[\]
>
> coaches Coach\[\]
>
> skDocuments SKDocument\[\]
>
> createdAt DateTime \@default(now())
>
> updatedAt DateTime \@updatedAt
>
> }

**Tabel: Event**

> model Event {
>
> id String \@id \@default(cuid())
>
> name String // Contoh: PORKAB 2025
>
> type EventType // PORKAB \| PORPROV \| KEJURKAB \| OTHER
>
> description String?
>
> startDate DateTime
>
> endDate DateTime
>
> venue String
>
> status EventStatus // UPCOMING \| ONGOING \| COMPLETED \| CANCELLED
>
> registDeadline DateTime
>
> registrations EventRegistration\[\]
>
> results MatchResult\[\]
>
> medalTallies MedalTally\[\]
>
> createdAt DateTime \@default(now())
>
> updatedAt DateTime \@updatedAt
>
> }

**Tabel: MedalTally (Klasemen Medali)**

> model MedalTally {
>
> id String \@id \@default(cuid())
>
> eventId String
>
> event Event \@relation(fields: \[eventId\], references: \[id\])
>
> entityType String // KECAMATAN \| CABOR
>
> entityName String // Nama kecamatan atau Cabor
>
> gold Int \@default(0)
>
> silver Int \@default(0)
>
> bronze Int \@default(0)
>
> updatedAt DateTime \@updatedAt
>
> }

**Tabel: PhysicalTest (Sport Science)**

> model PhysicalTest {
>
> id String \@id \@default(cuid())
>
> athleteId String
>
> athlete Athlete \@relation(fields: \[athleteId\], references: \[id\])
>
> testDate DateTime
>
> vo2Max Float? // ml/kg/min
>
> strength Float? // kg (bench press / leg press)
>
> endurance Float? // detik (Cooper test)
>
> flexibility Float? // cm (sit and reach)
>
> speed Float? // detik (sprint 30m)
>
> notes String?
>
> recordedBy String // ID pelatih yang merekam
>
> createdAt DateTime \@default(now())
>
> }

**4. Spesifikasi API**

**4.1 Konvensi API**

-   Base URL: /api/v1/

-   Format: RESTful JSON (Content-Type: application/json)

-   Autentikasi: Bearer Token (JWT) di header Authorization

-   Error Response: { \"error\": string, \"code\": string,
    \"statusCode\": number }

-   Pagination: ?page=1&limit=20 (default limit 20)

**4.2 Endpoint Autentikasi**

  ------------------------------------------------------------------------------------
  **Method**   **Endpoint**                   **Deskripsi**              **Auth
                                                                         Required**
  ------------ ------------------------------ -------------------------- -------------
  POST         /api/v1/auth/login             Login user, return JWT +   Tidak
                                              refresh token              

  POST         /api/v1/auth/logout            Invalidasi refresh token   Ya

  POST         /api/v1/auth/refresh           Perbarui access token      Tidak
                                              dengan refresh token       

  POST         /api/v1/auth/forgot-password   Kirim email reset password Tidak
  ------------------------------------------------------------------------------------

**4.3 Endpoint Atlet**

  ------------------------------------------------------------------------------------------
  **Method**   **Endpoint**                          **Deskripsi**          **Role**
  ------------ ------------------------------------- ---------------------- ----------------
  GET          /api/v1/athletes                      Daftar atlet (filter:  ADMIN+
                                                     caborId, status)       

  POST         /api/v1/athletes                      Daftarkan atlet baru   CABOR_ADMIN+

  GET          /api/v1/athletes/:id                  Detail profil atlet    ATHLETE+

  PATCH        /api/v1/athletes/:id                  Update data atlet      CABOR_ADMIN+

  DELETE       /api/v1/athletes/:id                  Nonaktifkan atlet      SUPER_ADMIN
                                                     (soft delete)          

  GET          /api/v1/athletes/:id/achievements     Riwayat prestasi atlet ATHLETE+

  POST         /api/v1/athletes/:id/physical-tests   Input data tes fisik   COACH+
  ------------------------------------------------------------------------------------------

**4.4 Endpoint Cabang Olahraga**

  ---------------------------------------------------------------------------
  **Method**   **Endpoint**           **Deskripsi**          **Role**
  ------------ ---------------------- ---------------------- ----------------
  GET          /api/v1/cabor          Daftar semua Cabor     Semua
                                      (publik)               

  GET          /api/v1/cabor/:id      Detail Cabor + daftar  Semua
                                      atlet (publik)         

  POST         /api/v1/cabor          Tambah Cabor baru      SUPER_ADMIN

  PATCH        /api/v1/cabor/:id      Update data Cabor      SUPER_ADMIN

  GET          /api/v1/cabor/:id/sk   Daftar SK kepengurusan CABOR_ADMIN+
                                      Cabor                  
  ---------------------------------------------------------------------------

**4.5 Endpoint Event**

  ------------------------------------------------------------------------------------
  **Method**   **Endpoint**                     **Deskripsi**         **Role**
  ------------ -------------------------------- --------------------- ----------------
  GET          /api/v1/events                   Daftar event (filter: Semua
                                                status, type)         

  POST         /api/v1/events                   Buat event baru       SUPER_ADMIN

  GET          /api/v1/events/:id               Detail event + jadwal Semua

  POST         /api/v1/events/:id/register      Daftarkan atlet ke    CABOR_ADMIN+
                                                event                 

  GET          /api/v1/events/:id/medal-tally   Klasemen medali event Semua
                                                (publik)              

  POST         /api/v1/events/:id/results       Input hasil           SUPER_ADMIN
                                                pertandingan          

  PATCH        /api/v1/events/:id/medal-tally   Update klasemen       SUPER_ADMIN
                                                medali                
  ------------------------------------------------------------------------------------

**4.6 Endpoint Berita & Galeri (CMS)**

  ---------------------------------------------------------------------------
  **Method**   **Endpoint**           **Deskripsi**          **Role**
  ------------ ---------------------- ---------------------- ----------------
  GET          /api/v1/news           Daftar berita (publik, Semua
                                      dengan pagination)     

  GET          /api/v1/news/:slug     Detail artikel berita  Semua
                                      (publik)               

  POST         /api/v1/news           Buat artikel baru      SUPER_ADMIN

  PATCH        /api/v1/news/:id       Edit artikel           SUPER_ADMIN

  DELETE       /api/v1/news/:id       Hapus artikel (soft    SUPER_ADMIN
                                      delete)                

  POST         /api/v1/gallery        Upload foto/video ke   SUPER_ADMIN
                                      galeri                 
  ---------------------------------------------------------------------------

**5. Sistem Autentikasi & Otorisasi**

**5.1 Alur Autentikasi (JWT Flow)**

1.  User mengirim kredensial (email + password) ke POST /auth/login

2.  Server memverifikasi password dengan bcrypt.compare()

3.  Server menerbitkan Access Token (JWT, exp: 15 menit) dan Refresh
    Token (exp: 7 hari)

4.  Refresh Token disimpan di database (tabel RefreshToken) dan dikirim
    via HttpOnly Cookie

5.  Access Token disimpan di memory browser (bukan localStorage)

6.  Setiap request API yang memerlukan auth menyertakan Access Token di
    header: Authorization: Bearer \<token\>

7.  Saat Access Token kedaluwarsa, frontend otomatis memanggil POST
    /auth/refresh dengan Refresh Token

8.  Logout menghapus Refresh Token dari database dan menghapus cookie

**5.2 Role-Based Access Control (RBAC)**

  --------------------------------------------------------------------------
  **Role**        **Level**     **Hak Akses**
  --------------- ------------- --------------------------------------------
  SUPER_ADMIN     4 (Tertinggi) Akses penuh: semua data, semua Cabor,
                                publish berita, kelola event, approve
                                proposal

  CABOR_ADMIN     3             Kelola atlet/pelatih cabornya, daftarkan ke
                                event, ajukan e-proposal

  COACH           2             Input tes fisik atlet binaan, lihat data
                                atlet di Cabor yang sama

  ATHLETE         1             Lihat & update profil sendiri, lihat jadwal
                                & hasil event

  PUBLIC          0 (Terbuka)   Akses portal publik tanpa login: berita,
                                profil Cabor, klasemen
  --------------------------------------------------------------------------

**5.3 Middleware Autentikasi**

> // Contoh middleware Express/Next.js
>
> function requireAuth(minRole: UserRole) {
>
> return async (req, res, next) =\> {
>
> const token = req.headers.authorization?.split(\' \')\[1\]
>
> if (!token) return res.status(401).json({ error: \'Unauthorized\' })
>
> const payload = verifyJWT(token)
>
> if (getRoleLevel(payload.role) \< getRoleLevel(minRole)) {
>
> return res.status(403).json({ error: \'Forbidden\' })
>
> }
>
> req.user = payload
>
> next()
>
> }
>
> }

**6. Strategi Migrasi Data**

**6.1 Migrasi dari Google Sheets ke PostgreSQL**

Proses migrasi data dari Google Sheets ke PostgreSQL akan dilakukan
secara terstruktur menggunakan skrip migrasi:

9.  Ekspor data Google Sheets ke format CSV/JSON

10. Validasi dan pembersihan data (normalisasi nama, format tanggal,
    duplikasi)

11. Jalankan skrip seed Prisma untuk import data ke PostgreSQL

12. Verifikasi jumlah record dan integritas data

13. Jalankan sistem paralel selama 2 minggu (sheets + pg) sebelum
    cutover

14. Cutover resmi: matikan akses write ke Google Sheets

**6.2 Migrasi Storage dari Google Drive ke S3/GCS**

15. Inventarisasi semua file di Google Drive folder KONI

16. Download file secara batch menggunakan Drive API

17. Re-upload ke S3/GCS dengan struktur folder:
    /athletes/{id}/{type}/{filename}

18. Update URL referensi di database PostgreSQL

19. Verifikasi aksesibilitas URL baru

20. Pertahankan Google Drive sebagai backup selama 3 bulan

**7. Spesifikasi Keamanan**

**7.1 Keamanan Data**

-   Semua komunikasi wajib menggunakan HTTPS/TLS 1.3

-   Password di-hash dengan bcrypt (cost factor 12)

-   Data sensitif atlet (NIK, tanggal lahir) dienkripsi di database
    menggunakan AES-256

-   File upload: validasi ekstensi, ukuran (max 5MB foto, 10MB dokumen),
    scan MIME type

-   SQL Injection: Prisma ORM menggunakan parameterized queries secara
    default

-   XSS Protection: sanitasi input di frontend (DOMPurify) dan backend

-   CSRF Protection: CSRF token untuk semua form mutation

**7.2 Rate Limiting**

  ------------------------------------------------------------------------
  **Endpoint**               **Limit**       **Window**
  -------------------------- --------------- -----------------------------
  POST /auth/login           10 request      Per 15 menit per IP

  POST /auth/forgot-password 3 request       Per 1 jam per email

  POST /api/v1/\* (write)    100 request     Per 1 menit per user

  GET /api/v1/\* (read       300 request     Per 1 menit per IP
  publik)                                    

  POST /api/v1/gallery       20 request      Per 1 jam per user
  (upload)                                   
  ------------------------------------------------------------------------

**7.3 Audit Log**

Semua aksi sensitif berikut harus tercatat di tabel AuditLog:

-   Login berhasil / gagal (dengan IP address)

-   Perubahan data atlet (siapa yang mengubah, data apa yang berubah,
    timestamp)

-   Penghapusan data (soft delete dengan alasan)

-   Perubahan status proposal

-   Pengiriman SK dan dokumen resmi

**8. Implementasi Real-Time (Fase 3)**

**8.1 Arsitektur WebSocket (Socket.IO)**

Fitur live scoring dan update klasemen medali menggunakan Socket.IO
untuk komunikasi real-time antara server dan klien:

-   Server: Socket.IO diintegrasikan dengan Next.js API Routes via
    custom server

-   Namespace: /events/:eventId untuk isolasi per event

-   Room: /events/:eventId/cabor/:caborId untuk update per Cabor

**Event WebSocket yang Diterbitkan Server**

  -----------------------------------------------------------------------
  **Event Name**         **Payload**            **Deskripsi**
  ---------------------- ---------------------- -------------------------
  score:updated          { matchId, score,      Skor pertandingan
                         timestamp }            diperbarui

  medal:updated          { eventId, tally\[\] } Klasemen medali
                                                diperbarui

  schedule:changed       { matchId, newTime,    Jadwal pertandingan
                         venue }                berubah

  event:status           { eventId, status }    Status event berubah
                                                (started/ended)
  -----------------------------------------------------------------------

**9. Optimasi Performa & SEO**

**9.1 Strategi Rendering (Next.js Fase 2+)**

  -----------------------------------------------------------------------
  **Halaman**            **Strategi**    **Justifikasi**
  ---------------------- --------------- --------------------------------
  Beranda                ISR             Konten sering berubah tapi tidak
                         (revalidate: 60 real-time
                         detik)          

  Profil KONI            SSG (Static)    Konten jarang berubah, SEO
                                         kritis

  Direktori Cabor        SSG + ISR       Konten relatif stabil, perlu SEO

  Halaman Berita         SSR / ISR       Konten dinamis, perlu SEO per
                                         artikel

  Dashboard Admin        CSR             Tidak perlu SEO, sangat dinamis
                         (Client-Side)   

  Live Scoring           CSR + WebSocket Real-time, tidak perlu SEO
  -----------------------------------------------------------------------

**9.2 Optimasi Aset**

-   Gambar: Next.js Image component dengan lazy loading, WebP
    auto-conversion, responsive srcSet

-   Font: Google Fonts dengan display:swap, preload untuk Playfair
    Display dan Inter

-   Bundle: Code splitting otomatis Next.js, dynamic import untuk
    komponen berat

-   Caching: Cache-Control header untuk aset statis (max-age=31536000
    untuk images/fonts)

**9.3 SEO Configuration**

-   Metadata: Open Graph, Twitter Card, dan JSON-LD structured data
    untuk setiap halaman

-   Sitemap: Auto-generated XML sitemap via next-sitemap

-   Robots.txt: Konfigurasi proper untuk mesin pencari

-   Canonical URL: Pencegahan konten duplikat

**10. Monitoring & Logging**

**10.1 Error Monitoring (Sentry)**

-   Integrasi Sentry di frontend (React) dan backend (Next.js API)

-   Capture uncaught exceptions, unhandled promise rejections, dan API
    errors

-   Alert via email ke tim engineering untuk error P0/P1

-   Performance monitoring: transaction tracking dan slow query
    detection

**10.2 Application Metrics**

  -----------------------------------------------------------------------
  **Metrik**             **Tool**        **Target / Alert**
  ---------------------- --------------- --------------------------------
  Uptime                 UptimeRobot /   Alert jika downtime \> 1 menit
                         BetterStack     

  API Latency (P95)      Sentry          Alert jika P95 \> 1000ms
                         Performance     

  Database Query Time    Prisma + custom Alert jika query \> 500ms
                         logging         

  Error Rate             Sentry          Alert jika error rate \> 1%
                                         dalam 5 menit

  Storage Usage          AWS CloudWatch  Alert jika penggunaan \> 80%
                         / GCS           quota
  -----------------------------------------------------------------------

**10.3 Backup Strategy**

-   Database PostgreSQL: pg_dump otomatis setiap hari pukul 02.00 WIB

-   Retensi backup: harian (30 hari), mingguan (12 minggu), bulanan (12
    bulan)

-   File Storage S3/GCS: versioning diaktifkan, cross-region replication

-   Test restore: simulasi restore dari backup setiap bulan

**11. Setup Lingkungan Pengembangan**

**11.1 Prerequisites**

-   Node.js 22.x LTS

-   npm 10.x atau pnpm 9.x

-   Docker & Docker Compose (untuk PostgreSQL dan Redis lokal)

-   Git dengan konfigurasi SSH key

**11.2 Struktur Direktori Proyek**

> koni-kabmalang/
>
> ├── apps/
>
> │ ├── web/ \# Next.js frontend (Fase 2+)
>
> │ └── api/ \# Express API saat ini (Fase 0-1)
>
> ├── packages/
>
> │ ├── database/ \# Prisma schema & migrations
>
> │ ├── ui/ \# Shared UI components
>
> │ └── types/ \# Shared TypeScript types
>
> ├── .env.example
>
> ├── docker-compose.yml
>
> └── package.json \# Monorepo root (Turborepo)

**11.3 Environment Variables**

  ---------------------------------------------------------------------------------------------
  **Variable**           **Deskripsi**          **Contoh Nilai**
  ---------------------- ---------------------- -----------------------------------------------
  DATABASE_URL           Koneksi string         postgresql://user:pass@localhost:5432/koni_db
                         PostgreSQL             

  JWT_SECRET             Secret untuk signing   random 256-bit hex string
                         JWT                    

  GOOGLE_CLIENT_ID       OAuth 2.0 Client ID    xxxx.apps.googleusercontent.com

  GOOGLE_CLIENT_SECRET   OAuth 2.0 Client       GOCSPX-xxxx
                         Secret                 

  AWS_S3_BUCKET          Nama bucket S3         koni-kabmalang-assets

  SMTP_HOST              SMTP server untuk      smtp.gmail.com
                         email                  

  REDIS_URL              Koneksi Redis          redis://localhost:6379

  ADMIN_PASSWORD         Password admin (Fase   Environment variable rahasia
                         0-1)                   

  NEXT_PUBLIC_API_URL    Base URL API untuk     https://api.koni-kabmalang.or.id
                         frontend               

  SENTRY_DSN             Sentry project DSN     https://xxx@oyyy.ingest.sentry.io/zzz
  ---------------------------------------------------------------------------------------------
