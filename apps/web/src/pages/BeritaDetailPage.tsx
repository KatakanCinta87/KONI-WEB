import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Clock, User, Eye, ArrowLeft, Share2, Facebook, Twitter, MessageCircle } from 'lucide-react'
import { publicApi, type News } from '../services/public-api'

export default function BeritaDetailPage() {
    const { slug } = useParams<{ slug: string }>()
    const [news, setNews] = useState<News | null>(null)
    const [related, setRelated] = useState<News[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadData() {
            if (!slug) return
            setLoading(true)
            try {
                const res = await publicApi.getNewsDetail(slug)
                if (res.success) {
                    setNews(res.data)
                    
                    // Load related news
                    const relatedRes = await publicApi.getNews(4)
                    if (relatedRes.success) {
                        setRelated(relatedRes.data.filter(n => n.id !== res.data.id).slice(0, 3))
                    }
                }
            } catch (err) {
                console.error('Failed to fetch news detail', err)
            } finally {
                setLoading(false)
            }
        }
        loadData()
        window.scrollTo(0, 0)
    }, [slug])

    if (loading) {
        return (
            <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #C8102E', borderRadius: '50%' }}></div>
            </div>
        )
    }

    if (!news) {
        return (
            <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
                <h2>Berita tidak ditemukan</h2>
                <Link to="/berita" className="btn-primary" style={{ marginTop: '1rem' }}>Kembali ke Berita</Link>
            </div>
        )
    }

    const categoryColors: Record<string, string> = {
        PRESTASI: '#D4AF37',
        EVENT: '#C8102E',
        ORGANISASI: '#4A7CFF',
        'SPORT SCIENCE': '#22C55E',
    }

    return (
        <div style={{ background: '#F8FAFC', paddingBottom: '4rem' }}>
            {/* Header / Hero */}
            <section style={{ 
                position: 'relative', 
                height: '400px', 
                background: news.thumbnailUrl ? `url(${news.thumbnailUrl}) center/cover no-repeat` : 'linear-gradient(135deg, #1A1A2E 0%, #2D2D44 100%)',
                display: 'flex',
                alignItems: 'flex-end'
            }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 0%, rgba(15,23,42,0.8) 100%)' }} />
                <div className="container" style={{ position: 'relative', zIndex: 1, paddingBottom: '3rem' }}>
                    <Link to="/berita" style={{ 
                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem', 
                        color: 'rgba(255,255,255,0.7)', textDecoration: 'none', 
                        fontSize: '0.9rem', marginBottom: '1.5rem', transition: 'color 0.2s'
                    }} onMouseEnter={e => e.currentTarget.style.color = 'white'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}>
                        <ArrowLeft size={16} /> Kembali ke Berita
                    </Link>
                    <div style={{ 
                        display: 'inline-block', padding: '0.35rem 0.85rem', 
                        background: categoryColors[news.category] ?? '#666', 
                        color: 'white', fontSize: '0.75rem', fontWeight: 700, 
                        borderRadius: '4px', marginBottom: '1rem', textTransform: 'uppercase'
                    }}>
                        {news.category}
                    </div>
                    <h1 style={{ color: 'white', fontSize: 'clamp(1.8rem, 4vw, 3rem)', lineHeight: 1.2, maxWidth: '900px' }}>
                        {news.title}
                    </h1>
                </div>
            </section>

            <div className="container" style={{ marginTop: '-2rem', position: 'relative', zIndex: 10 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem' }}>
                    {/* Main Content */}
                    <div style={{ background: 'white', padding: '2.5rem', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                        {/* Meta */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', paddingBottom: '2rem', borderBottom: '1px solid #F1F5F9', marginBottom: '2.5rem' }}>
                            <div style={metaItemStyle}><User size={16} color="#94A3B8" /> {news.cabor?.name ? `KONI / ${news.cabor.name}` : 'Admin KONI'}</div>
                            <div style={metaItemStyle}><Clock size={16} color="#94A3B8" /> {new Date(news.publishedAt || news.createdAt || '').toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                            <div style={metaItemStyle}><Eye size={16} color="#94A3B8" /> {news.views ?? 0} Kali Dilihat</div>
                        </div>

                        {/* Article Content */}
                        <div 
                            className="rich-content"
                            style={{ 
                                fontSize: '1.1rem', 
                                lineHeight: 1.8, 
                                color: '#334155',
                                fontFamily: 'var(--font-body)'
                            }}
                            dangerouslySetInnerHTML={{ __html: news.content }}
                        />

                        {/* Share */}
                        <div style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid #F1F5F9' }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#64748B', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Share2 size={16} /> Bagikan Artikel
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <ShareButton color="#1877F2" icon={Facebook} />
                                <ShareButton color="#1DA1F2" icon={Twitter} />
                                <ShareButton color="#25D366" icon={MessageCircle} />
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <aside style={{ display: 'grid', gap: '2rem', alignContent: 'start' }}>
                        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '2px solid #C8102E' }}>
                                Berita Terkait
                            </h4>
                            <div style={{ display: 'grid', gap: '1.25rem' }}>
                                {related.map(item => (
                                    <Link key={item.id} to={`/berita/${item.slug}`} style={{ textDecoration: 'none', display: 'grid', gap: '0.5rem' }}>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: categoryColors[item.category] ?? '#666' }}>{item.category}</div>
                                        <h5 style={{ fontSize: '0.95rem', color: '#1E293B', lineHeight: 1.4, margin: 0, fontWeight: 700 }}>{item.title}</h5>
                                        <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{new Date(item.publishedAt || item.createdAt || '').toLocaleDateString('id-ID')}</div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div style={{ background: 'linear-gradient(135deg, #1A1A2E 0%, #2D2D44 100%)', padding: '1.5rem', borderRadius: '16px', color: 'white' }}>
                            <h4 style={{ color: '#D4AF37', fontSize: '1rem', marginBottom: '0.5rem' }}>Punya Info Olahraga?</h4>
                            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                                Hubungi sekretariat KONI Kabupaten Malang untuk peliputan kegiatan cabor Anda.
                            </p>
                            <Link to="/kontak" className="btn-primary" style={{ fontSize: '0.8rem', padding: '0.6rem 1rem', width: '100%', textAlign: 'center' }}>Hubungi Kami</Link>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    )
}

const metaItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.9rem',
    color: '#64748B',
    fontWeight: 500
}

function ShareButton({ color, icon: Icon }: { color: string, icon: any }) {
    return (
        <button style={{
            width: '40px', height: '40px', borderRadius: '50%', 
            border: 'none', background: '#F1F5F9', color: color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.2s'
        }} onMouseEnter={e => { e.currentTarget.style.background = color; e.currentTarget.style.color = 'white' }} onMouseLeave={e => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.color = color }}>
            <Icon size={20} />
        </button>
    )
}
