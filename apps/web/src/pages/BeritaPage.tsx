import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Newspaper, Clock, ArrowRight, User } from 'lucide-react'
import { publicApi, type News } from '../services/public-api'

const newsCategories = ['Semua', 'Prestasi', 'Event', 'Organisasi', 'Sport Science']

const categoryColors: Record<string, string> = {
    PRESTASI: '#D4AF37',
    EVENT: '#C8102E',
    ORGANISASI: '#4A7CFF',
    'SPORT SCIENCE': '#22C55E',
}

export default function BeritaPage() {
    const [activeCategory, setActiveCategory] = useState('Semua')
    const [news, setNews] = useState<News[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadNews() {
            setLoading(true)
            try {
                const res = await publicApi.getNews(20)
                if (res.success) {
                    setNews(res.data)
                }
            } catch (err) {
                console.error('Failed to fetch news', err)
            } finally {
                setLoading(false)
            }
        }
        loadNews()
    }, [])

    const filtered = activeCategory === 'Semua'
        ? news
        : news.filter((n) => n.category === activeCategory.toUpperCase().replace(/\s/g, ' '))

    const featuredNews = activeCategory === 'Semua' ? filtered[0] : null
    const regularNews = activeCategory === 'Semua' ? filtered.slice(1) : filtered

    return (
        <div style={{ background: '#F8FAFC', minHeight: '100vh' }}>
            {/* Hero Section */}
            <section style={{
                position: 'relative',
                padding: 'clamp(4rem, 8vw, 6rem) 0 clamp(2rem, 4vw, 3rem)',
                background: 'linear-gradient(135deg, #1A1A2E 0%, #2D2D44 100%)',
                color: 'white'
            }}>
                <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.35rem 0.85rem', background: 'rgba(212,175,55,0.15)',
                            border: '1px solid rgba(212,175,55,0.3)', borderRadius: '24px',
                            color: '#D4AF37', fontSize: '0.75rem', fontWeight: 600, marginBottom: '1rem',
                        }}>
                            <Newspaper size={14} /> Pusat Media & Informasi
                        </div>
                        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: '1rem' }}>
                            Berita <span style={{ color: '#D4AF37' }}>Olahraga</span>
                        </h1>
                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.05rem', maxWidth: '600px', lineHeight: 1.7 }}>
                            Update terkini seputar prestasi, event, dan perkembangan olahraga di Kabupaten Malang.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Category Navigation */}
            <section style={{ background: 'white', borderBottom: '1px solid #E2E8F0', padding: '0.75rem 0', position: 'sticky', top: '72px', zIndex: 50 }}>
                <div className="container" style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', scrollbarWidth: 'none' }}>
                    {newsCategories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            style={{
                                padding: '0.5rem 1.25rem',
                                borderRadius: '30px',
                                border: 'none',
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                whiteSpace: 'nowrap',
                                background: activeCategory === cat ? '#C8102E' : 'transparent',
                                color: activeCategory === cat ? 'white' : '#64748B',
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </section>

            <section className="section">
                <div className="container">
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                            <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #C8102E', borderRadius: '50%', margin: '0 auto' }}></div>
                        </div>
                    ) : (
                        <>
                            {/* Featured Article */}
                            {featuredNews && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{ marginBottom: '3rem' }}
                                >
                                    <Link to={`/berita/${featuredNews.slug}`} style={{ textDecoration: 'none', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', background: 'white', borderRadius: '24px', overflow: 'hidden', border: '1px solid #E2E8F0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}>
                                        <div style={{ height: '400px', background: featuredNews.thumbnailUrl ? `url(${featuredNews.thumbnailUrl}) center/cover no-repeat` : 'linear-gradient(135deg, var(--color-koni-navy) 0%, var(--color-koni-navy-light) 100%)', position: 'relative' }}>
                                            {!featuredNews.thumbnailUrl && <Newspaper size={64} color="rgba(212,175,55,0.2)" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />}
                                            <span style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', padding: '0.4rem 1rem', background: categoryColors[featuredNews.category] ?? '#666', color: 'white', fontSize: '0.8rem', fontWeight: 800, borderRadius: '4px', textTransform: 'uppercase' }}>
                                                Unggulan: {featuredNews.category}
                                            </span>
                                        </div>
                                        <div style={{ padding: '3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                            <div style={{ display: 'flex', gap: '1rem', color: '#64748B', fontSize: '0.9rem', marginBottom: '1rem' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Clock size={16} /> {new Date(featuredNews.publishedAt || '').toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><User size={16} /> Admin KONI</span>
                                            </div>
                                            <h2 style={{ fontSize: '2rem', color: '#0F172A', marginBottom: '1.25rem', lineHeight: 1.2, fontWeight: 800 }}>{featuredNews.title}</h2>
                                            <p style={{ color: '#475569', fontSize: '1.1rem', lineHeight: 1.7, marginBottom: '2rem' }}>{featuredNews.excerpt}</p>
                                            <div style={{ color: '#C8102E', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                Baca Selengkapnya <ArrowRight size={18} />
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            )}

                            {/* News Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
                                {regularNews.map((item, i) => (
                                    <motion.article
                                        key={item.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05, duration: 0.4 }}
                                        viewport={{ once: true }}
                                        style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid #E2E8F0', transition: 'transform 0.3s ease, box-shadow 0.3s ease' }}
                                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
                                    >
                                        <Link to={`/berita/${item.slug}`} style={{ textDecoration: 'none' }}>
                                            <div style={{ height: '200px', background: item.thumbnailUrl ? `url(${item.thumbnailUrl}) center/cover no-repeat` : 'linear-gradient(135deg, #1E293B 0%, #334155 100%)', position: 'relative' }}>
                                                {!item.thumbnailUrl && <Newspaper size={32} color="rgba(212,175,55,0.2)" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />}
                                                <span style={{ position: 'absolute', top: '1rem', left: '1rem', padding: '0.25rem 0.75rem', background: categoryColors[item.category] ?? '#666', color: 'white', fontSize: '0.7rem', fontWeight: 700, borderRadius: '4px', textTransform: 'uppercase' }}>
                                                    {item.category}
                                                </span>
                                            </div>
                                            <div style={{ padding: '1.5rem' }}>
                                                <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                    <Clock size={14} /> {new Date(item.publishedAt || '').toLocaleDateString('id-ID')}
                                                </div>
                                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.75rem', lineHeight: 1.4, height: '3.1rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                                    {item.title}
                                                </h3>
                                                <p style={{ fontSize: '0.9rem', color: '#64748B', lineHeight: 1.6, marginBottom: '1.25rem', height: '4.3rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                                                    {item.excerpt}
                                                </p>
                                                <div style={{ color: '#C8102E', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                                    Baca Selengkapnya <ArrowRight size={14} />
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.article>
                                ))}
                            </div>

                            {filtered.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '5rem 0', color: '#94A3B8' }}>
                                    <Newspaper size={64} strokeWidth={1} style={{ marginBottom: '1.5rem', opacity: 0.5 }} />
                                    <h3>Belum ada berita</h3>
                                    <p>Silakan pilih kategori lain atau kembali lagi nanti.</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>
        </div>
    )
}
