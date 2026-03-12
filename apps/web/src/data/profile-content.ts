export interface OrgMember {
  name: string
  position: string
}

export interface VisiMisi {
  visi: string
  misi: string[]
}

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

export const programKerja: string[] = [
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

export const visiMisi: VisiMisi = {
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
