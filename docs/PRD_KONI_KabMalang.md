KOMITE OLAHRAGA NASIONAL INDONESIA --- KABUPATEN MALANG

**PRODUCT REQUIREMENTS DOCUMENT**

**(PRD)**

*Portal Resmi & Sistem Informasi Keolahragaan Terpadu*

  -------------------------- --------------------------------------------
  Versi Dokumen              1.0

  Status                     Draft untuk Review Internal

  Dibuat oleh                Tim Produk & Engineering KONI

  Tahun                      2025

  Klasifikasi                Konfidensial --- Pengurus KONI
  -------------------------- --------------------------------------------

**Daftar Isi**

**1. Ringkasan Eksekutif**

KONI Kabupaten Malang adalah Komite Olahraga Nasional Indonesia di
tingkat Kabupaten yang menaungi seluruh federasi olahraga kompetisi
(Cabang Olahraga / Cabor) di wilayah Kabupaten Malang. Dalam menjalankan
fungsinya, KONI mengelola data ribuan atlet, puluhan Cabor, serta
mengoordinasikan penyelenggaraan event keolahragaan daerah seperti
PORKAB dan Kejurkab.

Pengelolaan data saat ini masih bersifat manual dan tersebar,
menimbulkan inefisiensi operasional, sulitnya transparansi publik, dan
keterbatasan pengambilan keputusan berbasis data. Dokumen ini
mendefinisikan kebutuhan produk untuk membangun Portal Resmi KONI
Kabupaten Malang sebagai Sistem Informasi Keolahragaan Terpadu dalam
empat fase bertahap.

**1.1 Tujuan Strategis**

-   Mewujudkan transparansi dan akuntabilitas organisasi KONI kepada
    publik, pemerintah, dan media

-   Membangun database terpusat untuk manajemen atlet, pelatih, dan
    Cabor

-   Mengdigitalisasi proses pendaftaran, verifikasi, dan pengelolaan
    event keolahragaan

-   Menyediakan fondasi data untuk program pembinaan berbasis Sport
    Science

**1.2 Ringkasan Fase Pengembangan**

  ------------------------------------------------------------------------
  **Fase**    **Nama**            **Deskripsi Singkat**
  ----------- ------------------- ----------------------------------------
  Fase 1      Portal Publik       Wajah resmi KONI: beranda, profil,
                                  direktori Cabor, berita

  Fase 2      SIM Internal        Database atlet/pelatih PostgreSQL, RBAC,
                                  E-SK

  Fase 3      Manajemen Event     Pendaftaran online, live scoring,
                                  klasemen medali

  Fase 4      Sport Science       Rekam fisik atlet, grafik perkembangan,
                                  e-proposal
  ------------------------------------------------------------------------

**2. Latar Belakang & Konteks Bisnis**

**2.1 Kondisi Saat Ini (As-Is)**

MVP awal telah berhasil dibangun dengan fitur fondasi berikut:

-   Formulir Pendaftaran Anggota: data diri, upload foto/SK dengan
    drag-and-drop

-   Integrasi Google Workspace: Google Drive (storage) & Google Sheets
    (database sementara)

-   Dashboard Admin: tabel real-time, hapus data, akses dokumen Google
    Drive

-   Keamanan: Google OAuth 2.0 + proteksi admin via Custom Header

Keterbatasan yang perlu diatasi:

-   Google Sheets tidak mendukung relasi data kompleks (Atlet ↔ Cabor ↔
    Prestasi)

-   Tidak ada portal publik; sistem hanya bersifat internal

-   Tidak ada manajemen event atau jadwal pertandingan

-   Tidak ada role-based access untuk pengelolaan per-Cabor

**2.2 Analisis Pemangku Kepentingan**

  -----------------------------------------------------------------------
  **Pemangku         **Kebutuhan Utama**       **Pain Point Saat Ini**
  Kepentingan**                                
  ------------------ ------------------------- --------------------------
  Pengurus KONI      Dashboard data terpusat,  Data tersebar, sulit
                     laporan otomatis          direkap

  Admin Cabor        Kelola atlet cabor        Harus lapor manual ke KONI
                     sendiri secara mandiri    

  Atlet / Pelatih    Update data diri, lihat   Tidak ada akses digital
                     jadwal event              sama sekali

  Pemerintah Daerah  Transparansi prestasi &   Informasi tidak mudah
                     program kerja             diakses publik

  Masyarakat / Media Berita, profil atlet,     Tidak ada portal resmi
                     jadwal event              KONI
  -----------------------------------------------------------------------

**3. User Personas**

**3.1 Super Admin (Pengurus KONI)**

-   Akses penuh ke seluruh sistem

-   Mengelola data semua Cabor, atlet, dan pelatih

-   Mempublikasikan berita dan galeri foto/video

-   Mengatur event dan klasemen medali

-   Menyetujui e-proposal pembinaan dari Cabor

**3.2 Admin Cabor**

-   Akses terbatas hanya ke data Cabor yang dikelolanya

-   Mendaftarkan dan mengelola atlet & pelatih Cabor

-   Mendaftarkan atlet ke event/nomor pertandingan tertentu

-   Mengajukan e-proposal dana pembinaan atau peralatan

**3.3 Atlet / Pelatih**

-   Login untuk melihat dan memperbarui data diri

-   Upload sertifikat dan dokumen prestasi

-   Melihat jadwal pertandingan dan hasil

-   Melihat grafik perkembangan data fisik (Sport Science)

**3.4 Pengguna Publik (Guest)**

-   Mengakses portal tanpa memerlukan login

-   Membaca berita, melihat galeri foto dan video

-   Melihat profil Cabor dan kontak pengurus

-   Melihat jadwal dan klasemen medali event

**4. Spesifikasi Fitur per Fase**

**Fase 1 --- Portal Publik & Profil Organisasi**

Target pengguna: masyarakat umum, media, pemerintah daerah. Fokus pada
representasi resmi dan transparansi organisasi KONI.

**F1.1 --- Beranda (Homepage)**

-   Hero Banner dinamis: foto atlet berprestasi dengan overlay teks dan
    animasi

-   Highlight 3--5 berita terbaru dengan thumbnail dan kategori

-   Countdown timer menuju event terdekat (Porprov / Porkab)

-   Live Medal Tally: klasemen medali event yang sedang berlangsung

-   Shortcut navigasi cepat ke halaman-halaman utama

**F1.2 --- Profil Organisasi**

-   Sejarah berdirinya KONI Kabupaten Malang

-   Visi, Misi, dan Nilai Organisasi

-   Struktur Organisasi dalam bentuk bagan interaktif

-   Program Kerja tahunan

-   Dokumen publik yang dapat diunduh (laporan, SK kepengurusan)

**F1.3 --- Direktori Cabang Olahraga**

-   Daftar lengkap Cabor yang bernaung di KONI Kab. Malang (PSSI, PBSI,
    PASI, dll.)

-   Halaman detail per Cabor: logo, deskripsi, Ketua Pengkab, kontak,
    lokasi sekretariat

-   Filter berdasarkan kategori olahraga dan fungsi pencarian

**F1.4 --- Pusat Berita & Galeri**

-   Sistem manajemen artikel sederhana (CMS) untuk Admin KONI

-   Kategori berita: Prestasi, Event, Organisasi, Sport Science

-   Galeri foto & video resolusi tinggi

-   Fungsi berbagi ke media sosial

**F1.5 --- Halaman Kontak**

-   Formulir kontak yang terkirim ke email resmi KONI

-   Peta lokasi kantor sekretariat

-   Informasi kontak resmi

**Fase 2 --- Sistem Informasi Manajemen (SIM) Internal**

Mengembangkan MVP yang sudah ada menjadi sistem database relasional
solid dengan manajemen akses multi-peran.

**F2.1 --- Database Atlet Terpusat**

-   Profil lengkap atlet: nama, NIK, foto, tempat/tanggal lahir, alamat

-   Data olahraga: Cabor, nomor pertandingan, berat/tinggi badan (BMI),
    usia

-   Riwayat prestasi: medali, kejuaraan, tahun

-   Status atlet: Aktif, Non-Aktif, Cedera

-   Upload dan arsip dokumen (KTP, KK, akta lahir, sertifikat)

**F2.2 --- Database Pelatih**

-   Profil pelatih: data diri, lisensi kepelatihan, level sertifikasi

-   Relasi data: Pelatih ↔ Cabor ↔ Atlet binaan

-   Riwayat kepelatihan dan prestasi atlet binaan

**F2.3 --- Sistem Akun Multi-Role (RBAC)**

-   Super Admin: akses penuh ke seluruh sistem

-   Admin Cabor: akses terbatas ke Cabor masing-masing

-   Atlet/Pelatih: akses ke profil pribadi saja

-   Autentikasi aman: JWT + Refresh Token

-   Reset password via email

**F2.4 --- E-SK & Dokumen Organisasi**

-   Arsip digital Surat Keputusan (SK) kepengurusan Cabor

-   Monitoring masa aktif SK dengan notifikasi perpanjangan otomatis

-   Download SK dalam format PDF

**Fase 3 --- Manajemen Event & Kejuaraan**

Sistem pengelolaan event multisport seperti PORKAB, Kejurkab, dan
kualifikasi Porprov.

**F3.1 --- Manajemen Event**

-   Pembuatan event: nama, tanggal, venue, Cabor yang terlibat

-   Jadwal pertandingan per Cabor dan nomor tanding

-   Manajemen venue dan lokasi

**F3.2 --- Portal Pendaftaran Event Online**

-   Entry by Name: Admin Cabor mendaftarkan atlet ke nomor tanding
    tertentu

-   Entry by Number: mendaftarkan tim/kontingen

-   Batas waktu pendaftaran dengan status real-time

-   Konfirmasi dan notifikasi pendaftaran via email

**F3.3 --- Live Scoring & Hasil Pertandingan**

-   Input hasil pertandingan oleh operator/wasit yang ditunjuk

-   Bagan turnamen (bracket) untuk olahraga beregu

-   Tampilan real-time hasil pertandingan untuk publik

**F3.4 --- Klasemen Medali**

-   Klasemen medali per Kecamatan untuk PORKAB

-   Klasemen medali per Cabor

-   Export klasemen ke Excel/PDF

**Fase 4 --- Sport Science & E-Proposal (Advanced)**

**F4.1 --- Rekam Medis & Fisik**

-   Input hasil tes fisik atlet Puslatcab: VO2Max, kekuatan, daya tahan,
    fleksibilitas

-   Grafik tren perkembangan fisik atlet dari waktu ke waktu

-   Perbandingan data antar atlet dalam satu Cabor

-   Catatan program latihan dan rekomendasi berbasis data

**F4.2 --- E-Proposal Pembinaan**

-   Pengajuan proposal dana pembinaan / peralatan oleh Cabor secara
    digital

-   Workflow: Draft → Review → Disetujui / Ditolak

-   Tracking status proposal real-time

-   Notifikasi email setiap perubahan status

-   Arsip histori seluruh proposal

**5. Persyaratan Non-Fungsional**

  -----------------------------------------------------------------------
  **Kategori**     **Persyaratan**        **Target**
  ---------------- ---------------------- -------------------------------
  Performa         Page Load Time         \< 3 detik pada koneksi 4G

  Performa         API Response Time      \< 500ms untuk 95% request

  Ketersediaan     Uptime sistem          99,5% per bulan (SLA)

  Keamanan         Autentikasi            JWT + Refresh Token, HTTPS
                                          wajib

  Keamanan         Enkripsi data sensitif AES-256 untuk data atlet

  SEO              Portal publik          Core Web Vitals: Good score

  Responsif        Kompatibilitas         Mobile, Tablet, Desktop
                   perangkat              

  Skalabilitas     Kapasitas database     Minimal 10.000 atlet aktif

  Backup           Frekuensi backup data  Harian otomatis, retensi 30
                                          hari
  -----------------------------------------------------------------------

**6. Panduan Desain UI/UX**

**6.1 Brand Identity**

Visual identity portal KONI Kabupaten Malang didasarkan pada tiga nilai:
Kepercayaan (institutional), Semangat (keberanian & energi), dan
Prestasi (kejayaan & keunggulan).

**Palet Warna**

  ------------------------------------------------------------------------
  **Nama Warna**      **Kode Hex**    **Penggunaan**
  ------------------- --------------- ------------------------------------
  Putih (Primary BG)  #FFFFFF         Latar belakang utama, kesan bersih &
                                      modern

  KONI Gold           #D4AF37         Aksen prestisius, border, highlight
                                      medali

  KONI Red            #C8102E         CTA utama, heading section, elemen
                                      energik

  Dark Navy           #1A1A2E         Teks utama, header, footer

  Light Gray          #F5F5F5         Latar belakang card, zebra table
  ------------------------------------------------------------------------

**Tipografi**

-   Heading Utama (H1): Playfair Display --- kesan monumental,
    bersejarah, prestisius

-   Heading Section (H2-H3): Anton --- sporty, bold, dinamis

-   Body & Data: Inter --- mudah dibaca, sempurna untuk tabel dan daftar
    data

**Prinsip Desain**

-   Sudut sedikit tajam pada card dan button untuk kesan dinamis khas
    olahraga

-   Glassmorphism pada komponen overlay untuk kesan modern

-   Animasi micro-interaction halus (Framer Motion) pada perpindahan
    halaman

-   Mobile-first design --- mayoritas pengguna mengakses via smartphone

**6.2 Arsitektur Informasi (Sitemap)**

-   Beranda --- Hero, Highlight Berita, Countdown, Medal Tally

-   Profil --- Sejarah, Visi & Misi, Struktur Organisasi, Program Kerja

-   Cabang Olahraga --- Direktori Cabor, Detail per Cabor

-   Berita & Galeri --- Artikel, Foto, Video

-   Event --- Jadwal, Pendaftaran Online, Hasil, Klasemen

-   Anggota (Login) --- Dashboard Atlet/Pelatih, Profil, Dokumen

-   Admin (Login) --- SIM Dashboard, Manajemen Data, E-Proposal

-   Kontak --- Formulir, Peta Lokasi, Info Resmi

**7. Roadmap Pengembangan**

  -----------------------------------------------------------------------
  **Fase**   **Periode     **Status**    **Deliverable Utama**
             (Est.)**                    
  ---------- ------------- ------------- --------------------------------
  Fase 0     Selesai       ✅ Selesai    Form pendaftaran + Google
  (MVP)                                  Sheets + Admin Dashboard

  Fase 1     Bulan 1--3    🔄 In         Portal Publik, Beranda, Profil,
                           Progress      Direktori Cabor, Berita

  Fase 2     Bulan 3--6    📋 Planned    SIM Internal, PostgreSQL, RBAC,
                                         E-SK

  Fase 3     Bulan 6--9    📋 Planned    Manajemen Event, Pendaftaran
                                         Online, Live Scoring

  Fase 4     Bulan 9--12   📋 Planned    Sport Science Dashboard,
                                         E-Proposal Pembinaan
  -----------------------------------------------------------------------

**7.1 Prioritas Fitur (MoSCoW)**

  ------------------------------------------------------------------------
  **Prioritas**   **Fase**      **Fitur**
  --------------- ------------- ------------------------------------------
  Must Have       Fase 1        Homepage, Profil KONI, Direktori Cabor,
                                Form Pendaftaran

  Must Have       Fase 2        Database Atlet PostgreSQL, RBAC, Dashboard
                                Admin

  Should Have     Fase 1        Pusat Berita, Galeri Foto/Video, Halaman
                                Kontak

  Should Have     Fase 3        Manajemen Event, Pendaftaran Online,
                                Klasemen Medali

  Could Have      Fase 3        Live Scoring Real-time, Bagan Bracket
                                Turnamen

  Won\'t Have     Fase 4        AI Recommendation Engine, Mobile App
  (v1)                          Native
  ------------------------------------------------------------------------

**8. Kriteria Penerimaan (Acceptance Criteria)**

**8.1 Fase 1 --- Portal Publik**

-   Homepage tampil benar di Chrome, Firefox, Safari (mobile & desktop)

-   Halaman profil, direktori Cabor, dan berita dapat diakses tanpa
    login

-   Waktu muat halaman \< 3 detik pada koneksi 4G

-   Google PageSpeed Insights score \> 85 untuk mobile

-   Formulir kontak berhasil mengirim notifikasi email ke admin

**8.2 Fase 2 --- SIM Internal**

-   Pendaftaran atlet baru tersimpan ke PostgreSQL dengan relasi Cabor
    yang benar

-   Super Admin dapat lihat semua data; Admin Cabor hanya data cabornya
    sendiri

-   Login/logout berfungsi; token kedaluwarsa setelah 24 jam

-   Upload dokumen berhasil disimpan ke cloud storage dengan URL yang
    dapat diakses

**8.3 Fase 3 --- Event**

-   Admin dapat membuat event; Cabor dapat mendaftarkan atlet ke nomor
    tanding

-   Klasemen medali diperbarui real-time setelah input hasil
    pertandingan

-   Export klasemen ke Excel/PDF berfungsi dengan data yang akurat

**9. Asumsi & Manajemen Risiko**

**9.1 Asumsi**

1.  KONI Kabupaten Malang memiliki akun Google Workspace aktif untuk
    integrasi awal

2.  Terdapat minimal 1 Admin teknis yang bertanggung jawab mengelola
    sistem

3.  Data Cabor dan pengurus tersedia untuk diinput saat go-live Fase 1

4.  Koneksi internet tersedia di kantor sekretariat KONI

**9.2 Risiko & Mitigasi**

  -------------------------------------------------------------------------
  **Risiko**               **Dampak**   **Mitigasi**
  ------------------------ ------------ -----------------------------------
  Keterbatasan sumber daya Tinggi       Dokumentasi lengkap + pelatihan
  teknis internal                       admin; kontrak dukungan teknis

  Data atlet tidak lengkap Sedang       Fase input data sebelum go-live;
  saat onboarding                       validasi berlapis di form

  Resistensi pengguna      Sedang       Workshop sosialisasi + panduan
  terhadap sistem baru                  penggunaan (user manual)

  Skalabilitas Google      Tinggi       Migrasi ke PostgreSQL dijadwalkan
  Sheets di Fase 0                      di Fase 2 sebagai prioritas

  Keamanan data atlet      Tinggi       Enkripsi AES-256, HTTPS, audit log,
  (data pribadi sensitif)               kebijakan privasi resmi
  -------------------------------------------------------------------------

**10. Glosarium**

  -----------------------------------------------------------------------
  **Istilah**         **Definisi**
  ------------------- ---------------------------------------------------
  KONI                Komite Olahraga Nasional Indonesia

  Cabor               Cabang Olahraga --- federasi olahraga yang bernaung
                      di bawah KONI

  Pengkab             Pengurus Kabupaten --- pimpinan Cabor di tingkat
                      Kabupaten

  PORKAB              Pekan Olahraga Kabupaten --- multievent antar
                      kecamatan

  Porprov             Pekan Olahraga Provinsi --- multievent antar
                      kabupaten/kota

  Kejurkab            Kejuaraan Kabupaten --- kompetisi single-sport
                      tingkat Kabupaten

  Puslatcab           Pusat Latihan Cabang --- sentra latihan atlet
                      unggulan Cabor

  SK                  Surat Keputusan --- dokumen legalitas kepengurusan
                      organisasi

  RBAC                Role-Based Access Control --- sistem hak akses
                      berbasis peran pengguna

  MVP                 Minimum Viable Product --- produk fungsional dengan
                      fitur minimum

  SIM                 Sistem Informasi Manajemen

  VO2Max              Volume Oksigen Maksimum --- indikator kebugaran
                      aerobik atlet

  JWT                 JSON Web Token --- token autentikasi standar
                      industri

  CMS                 Content Management System --- sistem manajemen
                      konten artikel
  -----------------------------------------------------------------------
