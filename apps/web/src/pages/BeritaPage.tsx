import { useState } from 'react'
import { motion } from 'framer-motion'
import { Newspaper, Clock, Tag, Image, Video, ChevronRight, ArrowRight } from 'lucide-react'
import { newsData } from '../data/dummy'

const newsCategories = ['Semua', 'Prestasi', 'Event', 'Organisasi', 'Sport Science']

const categoryColors: Record<string, string> = {
    Prestasi: '#D4AF37',
    Event: '#C8102E',
    Organisasi: '#4A7CFF',
    'Sport Science': '#22C55E',
}

const galleryItems = [
    { type: 'photo', label: 'Upacara Pembukaan PORKAB 2024' },
    { type: 'photo', label: 'Podium Atletik 100m Putra' },
    { type: 'photo', label: 'Latihan Puslatcab Bulutangkis' },
    { type: 'video', label: 'Highlights Final Sepakbola PORKAB' },
    { type: 'photo', label: 'Penyerahan Medali Emas Taekwondo' },
    { type: 'photo', label: 'Tim Voli Putri Kab. Malang' },
]

export default function BeritaPage() {
    const [activeCategory, setActiveCategory] = useState('Semua')

    const filtered = activeCategory === 'Semua'
        ? newsData
        : newsData.filter((n) => n.category === activeCategory)

    return (
        <div>
            {/* Hero */}
            <section style={{
                position: 'relative',
                padding: 'clamp(4rem, 8vw, 7rem) 0 clamp(3rem, 6vw, 5rem)',
                background: 'linear-gradient(135deg, #1A1A2E 0%, #2D2D44 50%, #3A1520 100%)',
            }}>
                <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.35rem 0.85rem', background: 'rgba(74,124,255,0.15)',
                            border: '1px solid rgba(74,124,255,0.3)', borderRadius: '24px',
                            color: '#4A7CFF', fontSize: '0.75rem', fontWeight: 600, marginBottom: '1rem',
                        }}>
                            <Newspaper size={14} /> Pusat Berita & Galeri
                        </div>
                        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: 'white', marginBottom: '1rem' }}>
                            Berita & <span style={{ color: '#D4AF37' }}>Galeri</span>
                        </h1>
                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.05rem', maxWidth: '600px', lineHeight: 1.7 }}>
                            Berita terkini, galeri foto, dan video kegiatan keolahragaan KONI Kabupaten Malang.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Category Filter */}
            <section style={{ background: 'white', borderBottom: '1px solid var(--color-koni-gray-medium)', padding: '1rem 0', position: 'sticky', top: '72px', zIndex: 50 }}>
                <div className="container" style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
                    {newsCategories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            style={{
                                padding: '0.45rem 1rem',
                                borderRadius: '24px',
                                border: 'none',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                fontFamily: 'var(--font-body)',
                                whiteSpace: 'nowrap',
                                background: activeCategory === cat ? 'var(--color-koni-navy)' : 'var(--color-koni-gray)',
                                color: activeCategory === cat ? 'white' : 'var(--color-koni-navy)',
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </section>

            {/* News Grid */}
            <section className="section" style={{ background: 'var(--color-koni-gray)' }}>
                <div className="container">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
                        {filtered.map((news, i) => (
                            <motion.article
                                key={news.id}
                                className="card"
                                initial={{ opacity: 0, y: 25 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.08, duration: 0.5 }}
                                viewport={{ once: true }}
                            >
                                {/* Image */}
                                <div style={{
                                    height: '220px',
                                    background: `linear-gradient(135deg, var(--color-koni-navy) 0%, var(--color-koni-navy-light) 100%)`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    position: 'relative',
                                }}>
                                    <Newspaper size={48} color="rgba(212,175,55,0.2)" />
                                    <span style={{
                                        position: 'absolute', top: '1rem', left: '1rem',
                                        padding: '0.3rem 0.8rem', borderRadius: '4px',
                                        fontSize: '0.7rem', fontWeight: 700, color: 'white',
                                        background: categoryColors[news.category] ?? '#666',
                                        textTransform: 'uppercase', letterSpacing: '0.05em',
                                    }}>
                                        {news.category}
                                    </span>
                                </div>

                                {/* Content */}
                                <div style={{ padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                        <Clock size={13} color="var(--color-koni-gray-dark)" />
                                        <span style={{ fontSize: '0.8rem', color: 'var(--color-koni-gray-dark)' }}>
                                            {new Date(news.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </span>
                                    </div>
                                    <h3 style={{
                                        fontFamily: 'var(--font-body)', fontWeight: 700,
                                        fontSize: '1.05rem', lineHeight: 1.45,
                                        color: 'var(--color-koni-navy)', marginBottom: '0.75rem',
                                        textTransform: 'none', letterSpacing: 0,
                                    }}>
                                        {news.title}
                                    </h3>
                                    <p style={{ fontSize: '0.88rem', color: '#777', lineHeight: 1.6 }}>
                                        {news.excerpt}
                                    </p>
                                    <a href="#" style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                                        marginTop: '1.25rem', color: 'var(--color-koni-red)',
                                        textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem',
                                    }}>
                                        Baca Selengkapnya <ArrowRight size={14} />
                                    </a>
                                </div>
                            </motion.article>
                        ))}
                    </div>

                    {filtered.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '4rem 0', color: '#999' }}>
                            <Newspaper size={48} strokeWidth={1} />
                            <p style={{ marginTop: '1rem' }}>Belum ada berita untuk kategori ini</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Gallery Section */}
            <section className="section">
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                        <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: 'var(--color-koni-navy)' }}>
                            Galeri <span style={{ color: 'var(--color-koni-gold)' }}>Foto & Video</span>
                        </h2>
                        <p style={{ color: 'var(--color-koni-gray-dark)', marginTop: '0.5rem' }}>
                            Dokumentasi kegiatan keolahragaan KONI Kabupaten Malang
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                        {galleryItems.map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.06, duration: 0.4 }}
                                viewport={{ once: true }}
                                style={{
                                    height: '200px',
                                    borderRadius: '8px',
                                    background: 'linear-gradient(135deg, var(--color-koni-navy) 0%, var(--color-koni-navy-light) 100%)',
                                    display: 'flex', flexDirection: 'column',
                                    alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    transition: 'transform 0.3s ease',
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.03)' }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
                            >
                                {item.type === 'photo' ? (
                                    <Image size={36} color="rgba(212,175,55,0.3)" />
                                ) : (
                                    <Video size={36} color="rgba(200,16,46,0.3)" />
                                )}
                                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', marginTop: '0.75rem', padding: '0 1rem', textAlign: 'center' }}>
                                    {item.label}
                                </p>
                                {item.type === 'video' && (
                                    <span style={{
                                        position: 'absolute', top: '0.75rem', right: '0.75rem',
                                        padding: '0.2rem 0.5rem', borderRadius: '4px',
                                        background: 'var(--color-koni-red)', color: 'white',
                                        fontSize: '0.65rem', fontWeight: 700,
                                    }}>
                                        VIDEO
                                    </span>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}
