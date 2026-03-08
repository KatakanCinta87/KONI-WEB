// ===== Dummy Data for KONI Kab. Malang Portal (Fase 1) =====

export interface CaborItem {
    id: string
    name: string
    fullName: string
    category: 'Beregu' | 'Perorangan' | 'Campuran'
    chairmanName: string
    phone: string
    email: string
    athleteCount: number
    description: string
    logoEmoji: string
}

export interface NewsItem {
    id: string
    title: string
    excerpt: string
    category: 'Prestasi' | 'Event' | 'Organisasi' | 'Sport Science'
    date: string
    imageUrl: string
    slug: string
}

export interface EventItem {
    id: string
    name: string
    type: 'PORKAB' | 'PORPROV' | 'KEJURKAB'
    startDate: string
    endDate: string
    venue: string
    status: 'UPCOMING' | 'ONGOING' | 'COMPLETED'
}

export interface MedalTallyItem {
    rank: number
    entityName: string
    gold: number
    silver: number
    bronze: number
    total: number
}

export interface OrgMember {
    name: string
    position: string
}

// ===== CABOR DATA =====
export const caborData: CaborItem[] = [
    {
        id: '1',
        name: 'PSSI',
        fullName: 'Persatuan Sepakbola Seluruh Indonesia',
        category: 'Beregu',
        chairmanName: 'Ir. Suharto Widodo',
        phone: '0341-123456',
        email: 'pssi.kabmalang@email.com',
        athleteCount: 120,
        description: 'Federasi sepakbola yang menaungi seluruh kegiatan kompetisi sepakbola di Kabupaten Malang, termasuk liga daerah dan pembinaan usia muda.',
        logoEmoji: '⚽',
    },
    {
        id: '2',
        name: 'PBSI',
        fullName: 'Persatuan Bulutangkis Seluruh Indonesia',
        category: 'Campuran',
        chairmanName: 'Drs. Ahmad Fauzi, M.Pd.',
        phone: '0341-234567',
        email: 'pbsi.kabmalang@email.com',
        athleteCount: 85,
        description: 'Pusat pembinaan bulutangkis Kabupaten Malang dengan fokus pada pengembangan atlet muda berbakat untuk kompetisi regional dan nasional.',
        logoEmoji: '🏸',
    },
    {
        id: '3',
        name: 'PASI',
        fullName: 'Persatuan Atletik Seluruh Indonesia',
        category: 'Perorangan',
        chairmanName: 'Dr. Bambang Sutrisno',
        phone: '0341-345678',
        email: 'pasi.kabmalang@email.com',
        athleteCount: 65,
        description: 'Mengelola cabang olahraga atletik termasuk lari, lompat, dan lempar di tingkat Kabupaten Malang.',
        logoEmoji: '🏃',
    },
    {
        id: '4',
        name: 'PBVSI',
        fullName: 'Persatuan Bola Voli Seluruh Indonesia',
        category: 'Beregu',
        chairmanName: 'Hj. Sri Wahyuni, S.Sos.',
        phone: '0341-456789',
        email: 'pbvsi.kabmalang@email.com',
        athleteCount: 78,
        description: 'Pembinaan dan pengembangan olahraga bola voli indoor dan pantai di Kabupaten Malang.',
        logoEmoji: '🏐',
    },
    {
        id: '5',
        name: 'PTMSI',
        fullName: 'Persatuan Tenis Meja Seluruh Indonesia',
        category: 'Campuran',
        chairmanName: 'Agus Purnomo, S.E.',
        phone: '0341-567890',
        email: 'ptmsi.kabmalang@email.com',
        athleteCount: 42,
        description: 'Wadah pengembangan olahraga tenis meja di Kabupaten Malang dengan fasilitas latihan lengkap.',
        logoEmoji: '🏓',
    },
    {
        id: '6',
        name: 'PERBASI',
        fullName: 'Persatuan Basket Seluruh Indonesia',
        category: 'Beregu',
        chairmanName: 'Rudi Hartono, M.M.',
        phone: '0341-678901',
        email: 'perbasi.kabmalang@email.com',
        athleteCount: 56,
        description: 'Menaungi kegiatan bola basket putra dan putri di Kabupaten Malang, dari level pelajar hingga senior.',
        logoEmoji: '🏀',
    },
    {
        id: '7',
        name: 'TI',
        fullName: 'Taekwondo Indonesia',
        category: 'Perorangan',
        chairmanName: 'Sabeum Hendra Wijaya',
        phone: '0341-789012',
        email: 'ti.kabmalang@email.com',
        athleteCount: 48,
        description: 'Pusat pembinaan atlet taekwondo Kabupaten Malang dengan sejumlah dojang yang tersebar di berbagai kecamatan.',
        logoEmoji: '🥋',
    },
    {
        id: '8',
        name: 'PRSI',
        fullName: 'Persatuan Renang Seluruh Indonesia',
        category: 'Perorangan',
        chairmanName: 'Dewi Lestari, S.Pd.',
        phone: '0341-890123',
        email: 'prsi.kabmalang@email.com',
        athleteCount: 35,
        description: 'Pengembangan olahraga akuatik termasuk renang, polo air, dan loncat indah di Kabupaten Malang.',
        logoEmoji: '🏊',
    },
    {
        id: '9',
        name: 'PERCASI',
        fullName: 'Persatuan Catur Seluruh Indonesia',
        category: 'Perorangan',
        chairmanName: 'M. Iqbal Syahreza, M.T.',
        phone: '0341-901234',
        email: 'percasi.kabmalang@email.com',
        athleteCount: 30,
        description: 'Pusat kegiatan dan turnamen catur Kabupaten Malang, aktif membina atlet pelajar dan senior.',
        logoEmoji: '♟️',
    },
    {
        id: '10',
        name: 'IPSI',
        fullName: 'Ikatan Pencak Silat Indonesia',
        category: 'Perorangan',
        chairmanName: 'Pendekar Surya Adi',
        phone: '0341-012345',
        email: 'ipsi.kabmalang@email.com',
        athleteCount: 72,
        description: 'Melestarikan dan mengembangkan pencak silat sebagai olahraga beladiri nasional di Kabupaten Malang.',
        logoEmoji: '🥊',
    },
    {
        id: '11',
        name: 'PELTI',
        fullName: 'Persatuan Lawn Tennis Indonesia',
        category: 'Campuran',
        chairmanName: 'Dr. Farhan Maulana',
        phone: '0341-112233',
        email: 'pelti.kabmalang@email.com',
        athleteCount: 28,
        description: 'Pengembangan tenis lapangan di Kabupaten Malang dengan program pembinaan atlet usia dini hingga senior.',
        logoEmoji: '🎾',
    },
    {
        id: '12',
        name: 'PGSI',
        fullName: 'Persatuan Gulat Seluruh Indonesia',
        category: 'Perorangan',
        chairmanName: 'Slamet Riyadi, S.Or.',
        phone: '0341-223344',
        email: 'pgsi.kabmalang@email.com',
        athleteCount: 22,
        description: 'Pembinaan olahraga gulat gaya bebas dan greco-roman di Kabupaten Malang.',
        logoEmoji: '🤼',
    },
]

// ===== NEWS DATA =====
export const newsData: NewsItem[] = [
    {
        id: '1',
        title: 'Atlet Kabupaten Malang Raih 15 Emas di Porprov Jatim 2025',
        excerpt: 'Kontingen Kabupaten Malang berhasil meraih 15 medali emas, 12 perak, dan 20 perunggu di ajang Pekan Olahraga Provinsi Jawa Timur 2025 yang berlangsung di Surabaya.',
        category: 'Prestasi',
        date: '2025-11-15',
        imageUrl: '',
        slug: 'atlet-malang-15-emas-porprov-2025',
    },
    {
        id: '2',
        title: 'PORKAB 2025 Akan Digelar di 5 Venue Serentak',
        excerpt: 'Pekan Olahraga Kabupaten 2025 akan mempertandingkan 28 cabang olahraga di 5 venue utama yang tersebar di wilayah Kabupaten Malang mulai Desember 2025.',
        category: 'Event',
        date: '2025-10-28',
        imageUrl: '',
        slug: 'porkab-2025-5-venue',
    },
    {
        id: '3',
        title: 'Pelantikan Pengurus KONI Kabupaten Malang Periode 2025-2029',
        excerpt: 'Pengurus baru KONI Kabupaten Malang resmi dilantik untuk periode 2025-2029, dipimpin oleh Ketua Umum terpilih dalam Musyawarah Kabupaten.',
        category: 'Organisasi',
        date: '2025-09-20',
        imageUrl: '',
        slug: 'pelantikan-pengurus-koni-2025-2029',
    },
    {
        id: '4',
        title: 'Program Sport Science: Tes Fisik Puslatcab Dimulai',
        excerpt: 'KONI Kabupaten Malang memulai program Sport Science dengan melakukan tes fisik komprehensif terhadap seluruh atlet Pusat Latihan Kabupaten (Puslatcab).',
        category: 'Sport Science',
        date: '2025-08-05',
        imageUrl: '',
        slug: 'program-sport-science-tes-fisik',
    },
    {
        id: '5',
        title: 'Kejurkab Bulutangkis 2025: Peserta Membludak',
        excerpt: 'Kejuaraan Kabupaten Bulutangkis 2025 mencatat rekor peserta terbanyak dengan 340 atlet dari 33 kecamatan di Kabupaten Malang.',
        category: 'Event',
        date: '2025-07-12',
        imageUrl: '',
        slug: 'kejurkab-bulutangkis-2025',
    },
]

// ===== EVENT DATA =====
export const eventData: EventItem[] = [
    {
        id: '1',
        name: 'PORKAB Kabupaten Malang 2025',
        type: 'PORKAB',
        startDate: '2025-12-15',
        endDate: '2025-12-22',
        venue: 'GOR Ken Arok & Stadion Kanjuruhan',
        status: 'UPCOMING',
    },
    {
        id: '2',
        name: 'Kejurkab Atletik 2026',
        type: 'KEJURKAB',
        startDate: '2026-03-20',
        endDate: '2026-03-22',
        venue: 'Stadion Kanjuruhan',
        status: 'UPCOMING',
    },
    {
        id: '3',
        name: 'Porprov Jawa Timur 2025',
        type: 'PORPROV',
        startDate: '2025-11-10',
        endDate: '2025-11-18',
        venue: 'Surabaya - Multi Venue',
        status: 'COMPLETED',
    },
]

// ===== MEDAL TALLY DATA =====
export const medalTallyData: MedalTallyItem[] = [
    { rank: 1, entityName: 'Kec. Kepanjen', gold: 12, silver: 8, bronze: 5, total: 25 },
    { rank: 2, entityName: 'Kec. Singosari', gold: 10, silver: 11, bronze: 7, total: 28 },
    { rank: 3, entityName: 'Kec. Lawang', gold: 8, silver: 6, bronze: 10, total: 24 },
    { rank: 4, entityName: 'Kec. Dampit', gold: 7, silver: 9, bronze: 4, total: 20 },
    { rank: 5, entityName: 'Kec. Turen', gold: 6, silver: 5, bronze: 8, total: 19 },
    { rank: 6, entityName: 'Kec. Bululawang', gold: 5, silver: 7, bronze: 6, total: 18 },
    { rank: 7, entityName: 'Kec. Pakis', gold: 4, silver: 4, bronze: 9, total: 17 },
    { rank: 8, entityName: 'Kec. Gondanglegi', gold: 3, silver: 6, bronze: 5, total: 14 },
]

// ===== ORGANIZATION DATA =====
export const orgStructure: OrgMember[] = [
    { name: 'H. Sanusi, S.H., M.Hum.', position: 'Ketua Umum' },
    { name: 'Dr. Ahmad Basuki, M.Si.', position: 'Wakil Ketua I' },
    { name: 'Ir. Retno Wulandari', position: 'Wakil Ketua II' },
    { name: 'Drs. Muhammad Ridwan', position: 'Sekretaris Umum' },
    { name: 'Siti Aminah, S.E., M.M.', position: 'Bendahara Umum' },
    { name: 'Agus Hermanto, S.Or.', position: 'Bidang Pembinaan Prestasi' },
    { name: 'Dra. Lilis Suryani', position: 'Bidang Organisasi' },
    { name: 'Hadi Purnomo, M.Pd.', position: 'Bidang Sport Science' },
]

export const programKerja = [
    'Penyelenggaraan PORKAB 2025 dengan target 33 kecamatan',
    'Pembinaan atlet Puslatcab untuk Porprov 2025',
    'Digitalisasi database atlet dan Cabor',
    'Program Sport Science dan tes fisik berkala',
    'Pelatihan pelatih berlisensi nasional',
    'Sosialisasi anti-doping kepada seluruh atlet',
    'Pengadaan fasilitas latihan dan peralatan olahraga',
    'Kerja sama dengan Dispora dan KONI Provinsi Jawa Timur',
]

export const sejarahKoni = `KONI Kabupaten Malang didirikan sebagai wadah koordinasi seluruh federasi olahraga kompetisi di wilayah Kabupaten Malang, Jawa Timur. Sejak berdiri, KONI Kabupaten Malang telah berperan aktif dalam pembinaan olahraga prestasi dan penyelenggaraan berbagai event keolahragaan tingkat daerah.

Dengan wilayah yang mencakup 33 kecamatan dan populasi lebih dari 2,5 juta jiwa, Kabupaten Malang memiliki potensi besar dalam pengembangan olahraga. KONI Kabupaten Malang saat ini menaungi lebih dari 30 cabang olahraga dengan total ribuan atlet aktif yang tersebar di berbagai pusat latihan.

Pencapaian atlet Kabupaten Malang di berbagai kejuaraan regional dan nasional terus meningkat, menjadikan Kabupaten Malang sebagai salah satu kontributor medali terbesar di Jawa Timur.`

export const visiMisi = {
    visi: 'Menjadikan Kabupaten Malang sebagai pusat pembinaan olahraga prestasi terdepan di Jawa Timur yang berlandaskan sport science dan good governance.',
    misi: [
        'Meningkatkan prestasi olahraga Kabupaten Malang di tingkat provinsi dan nasional',
        'Membangun sistem pembinaan atlet yang terstruktur dan berbasis data',
        'Menyelenggarakan event keolahragaan daerah yang profesional dan transparan',
        'Mengembangkan program sport science untuk optimalisasi performa atlet',
        'Meningkatkan kapasitas pelatih melalui pelatihan dan sertifikasi',
        'Membangun infrastruktur digital untuk manajemen keolahragaan terpadu',
    ],
}
