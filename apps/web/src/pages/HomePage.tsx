import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    Trophy, Calendar, ArrowRight, Newspaper, Users,
    ChevronRight, Medal, MapPin, Clock, Flame, Star, Target
} from 'lucide-react'
import { newsData, eventData, medalTallyData, caborData } from '../data/dummy'

// ===== Countdown Timer Component =====
function CountdownTimer({ targetDate }: { targetDate: string }) {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date().getTime()
            const target = new Date(targetDate).getTime()
            const diff = target - now

            if (diff > 0) {
                setTimeLeft({
                    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((diff % (1000 * 60)) / 1000),
                })
            }
        }, 1000)
        return () => clearInterval(timer)
    }, [targetDate])

    const units = [
        { label: 'Hari', value: timeLeft.days },
        { label: 'Jam', value: timeLeft.hours },
        { label: 'Menit', value: timeLeft.minutes },
        { label: 'Detik', value: timeLeft.seconds },
    ]

    return (
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            {units.map((unit) => (
                <div key={unit.label} style={{ textAlign: 'center' }}>
                    <div style={{
                        background: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '8px',
                        padding: '0.75rem 1rem',
                        minWidth: '64px',
                        border: '1px solid rgba(212,175,55,0.2)',
                    }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, color: '#D4AF37' }}>
                            {String(unit.value).padStart(2, '0')}
                        </div>
                    </div>
                    <div style={{ fontSize: '0.7rem', marginTop: '0.4rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        {unit.label}
                    </div>
                </div>
            ))}
        </div>
    )
}

// ===== Stats Component =====
function StatsBar() {
    const stats = [
        { icon: Users, value: '750+', label: 'Atlet Aktif' },
        { icon: Trophy, value: `${caborData.length}`, label: 'Cabang Olahraga' },
        { icon: Medal, value: '150+', label: 'Medali Diraih' },
        { icon: Target, value: '33', label: 'Kecamatan' },
    ]

    return (
        <div style={{
            background: 'var(--color-koni-navy)',
            padding: '2.5rem 0',
            marginTop: '-1px',
        }}>
            <div className="container">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1.5rem', textAlign: 'center' }}>
                    {stats.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1, duration: 0.5 }}
                            viewport={{ once: true }}
                        >
                            <stat.icon size={28} color="#D4AF37" style={{ margin: '0 auto 0.5rem' }} />
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, color: 'white' }}>
                                {stat.value}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#9E9E9E', marginTop: '0.25rem' }}>
                                {stat.label}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    )
}

// ===== Main Component =====
export default function HomePage() {
    const upcomingEvent = eventData.find(e => e.status === 'UPCOMING')
    const latestNews = newsData.slice(0, 3)

    const categoryColors: Record<string, string> = {
        Prestasi: '#D4AF37',
        Event: '#C8102E',
        Organisasi: '#4A7CFF',
        'Sport Science': '#22C55E',
    }

    return (
        <div>
            {/* ===== HERO SECTION ===== */}
            <section style={{
                position: 'relative',
                minHeight: '92vh',
                display: 'flex',
                alignItems: 'center',
                overflow: 'hidden',
            }}>
                {/* Background */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(135deg, #1A1A2E 0%, #2D2D44 35%, #3A1520 70%, #1A1A2E 100%)',
                }} />
                {/* Decorative elements */}
                <div style={{
                    position: 'absolute',
                    top: '-30%',
                    right: '-10%',
                    width: '600px',
                    height: '600px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)',
                }} />
                <div style={{
                    position: 'absolute',
                    bottom: '-20%',
                    left: '-5%',
                    width: '400px',
                    height: '400px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(200,16,46,0.06) 0%, transparent 70%)',
                }} />
                {/* Gold line accent */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)',
                }} />

                <div className="container" style={{ position: 'relative', zIndex: 1, paddingTop: '2rem', paddingBottom: '3rem' }}>
                    <div style={{ maxWidth: '720px' }}>
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7 }}
                        >
                            <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.4rem 1rem',
                                background: 'rgba(212, 175, 55, 0.15)',
                                border: '1px solid rgba(212, 175, 55, 0.3)',
                                borderRadius: '24px',
                                color: '#D4AF37',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                marginBottom: '1.5rem',
                            }}>
                                <Flame size={14} />
                                Portal Resmi KONI Kabupaten Malang
                            </div>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.15 }}
                            style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', color: 'white', marginBottom: '1.5rem' }}
                        >
                            Membangun{' '}
                            <span style={{ color: '#D4AF37' }}>Prestasi Olahraga</span>{' '}
                            Kabupaten Malang
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.3 }}
                            style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, marginBottom: '2rem', maxWidth: '560px' }}
                        >
                            Sistem Informasi Keolahragaan Terpadu — menaungi {caborData.length} cabang olahraga
                            dengan ratusan atlet berprestasi di 33 kecamatan Kabupaten Malang.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.45 }}
                            style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}
                        >
                            <Link to="/cabor" className="btn-primary" style={{ gap: '0.5rem' }}>
                                Jelajahi Cabor <ArrowRight size={16} />
                            </Link>
                            <Link to="/profil" className="btn-secondary">
                                Tentang KONI
                            </Link>
                        </motion.div>
                    </div>

                    {/* Countdown Widget */}
                    {upcomingEvent && (
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.6 }}
                            style={{
                                marginTop: '3.5rem',
                                padding: '1.75rem 2rem',
                                background: 'rgba(255,255,255,0.05)',
                                backdropFilter: 'blur(12px)',
                                border: '1px solid rgba(212,175,55,0.15)',
                                borderRadius: '12px',
                                maxWidth: '520px',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                <Calendar size={16} color="#D4AF37" />
                                <span style={{ color: '#D4AF37', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                    Event Mendatang
                                </span>
                            </div>
                            <h3 style={{ color: 'white', fontSize: '1.15rem', marginBottom: '0.4rem', textTransform: 'none', letterSpacing: 0, fontFamily: 'var(--font-body)', fontWeight: 700 }}>
                                {upcomingEvent.name}
                            </h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                                <MapPin size={13} color="#9E9E9E" />
                                <span style={{ color: '#9E9E9E', fontSize: '0.85rem' }}>{upcomingEvent.venue}</span>
                            </div>
                            <CountdownTimer targetDate={upcomingEvent.startDate} />
                        </motion.div>
                    )}
                </div>
            </section>

            {/* ===== STATS BAR ===== */}
            <StatsBar />

            {/* ===== LATEST NEWS ===== */}
            <section className="section" style={{ background: 'var(--color-koni-gray)' }}>
                <div className="container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: 'var(--color-koni-navy)' }}>
                                <span style={{ color: 'var(--color-koni-red)' }}>Berita</span> Terkini
                            </h2>
                            <p style={{ color: 'var(--color-koni-gray-dark)', marginTop: '0.5rem', fontSize: '0.95rem' }}>
                                Update terbaru dari dunia keolahragaan Kabupaten Malang
                            </p>
                        </div>
                        <Link to="/berita" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-koni-red)', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
                            Semua Berita <ChevronRight size={16} />
                        </Link>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                        {latestNews.map((news, i) => (
                            <motion.article
                                key={news.id}
                                className="card"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1, duration: 0.5 }}
                                viewport={{ once: true }}
                                style={{ display: 'flex', flexDirection: 'column' }}
                            >
                                {/* Image placeholder */}
                                <div style={{
                                    height: '200px',
                                    background: `linear-gradient(135deg, var(--color-koni-navy) 0%, var(--color-koni-navy-light) 100%)`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative',
                                }}>
                                    <Newspaper size={40} color="rgba(212,175,55,0.3)" />
                                    {/* Category badge */}
                                    <span style={{
                                        position: 'absolute',
                                        top: '1rem',
                                        left: '1rem',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '4px',
                                        fontSize: '0.7rem',
                                        fontWeight: 700,
                                        color: 'white',
                                        background: categoryColors[news.category] ?? '#666',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                    }}>
                                        {news.category}
                                    </span>
                                </div>
                                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                        <Clock size={13} color="var(--color-koni-gray-dark)" />
                                        <span style={{ fontSize: '0.8rem', color: 'var(--color-koni-gray-dark)' }}>
                                            {new Date(news.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </span>
                                    </div>
                                    <h3 style={{
                                        fontFamily: 'var(--font-body)',
                                        fontWeight: 700,
                                        fontSize: '1.05rem',
                                        lineHeight: 1.4,
                                        marginBottom: '0.65rem',
                                        textTransform: 'none',
                                        letterSpacing: 0,
                                        color: 'var(--color-koni-navy)',
                                    }}>
                                        {news.title}
                                    </h3>
                                    <p style={{ fontSize: '0.88rem', color: 'var(--color-koni-gray-dark)', lineHeight: 1.6, flex: 1 }}>
                                        {news.excerpt.substring(0, 120)}...
                                    </p>
                                    <Link
                                        to={`/berita/${news.slug}`}
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.35rem',
                                            marginTop: '1rem',
                                            color: 'var(--color-koni-red)',
                                            textDecoration: 'none',
                                            fontWeight: 600,
                                            fontSize: '0.85rem',
                                        }}
                                    >
                                        Baca Selengkapnya <ArrowRight size={14} />
                                    </Link>
                                </div>
                            </motion.article>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== MEDAL TALLY ===== */}
            <section className="section">
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                        <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: 'var(--color-koni-navy)' }}>
                            Klasemen <span style={{ color: 'var(--color-koni-gold)' }}>Medali</span>
                        </h2>
                        <p style={{ color: 'var(--color-koni-gray-dark)', marginTop: '0.5rem', fontSize: '0.95rem' }}>
                            PORKAB Kabupaten Malang 2024 — per Kecamatan
                        </p>
                    </div>

                    <div style={{ maxWidth: '800px', margin: '0 auto', overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                            <thead>
                                <tr style={{ background: 'var(--color-koni-navy)', color: 'white' }}>
                                    <th style={{ padding: '0.85rem 1rem', textAlign: 'left', fontFamily: 'var(--font-body)', fontWeight: 600 }}>#</th>
                                    <th style={{ padding: '0.85rem 1rem', textAlign: 'left', fontFamily: 'var(--font-body)', fontWeight: 600 }}>Kecamatan</th>
                                    <th style={{ padding: '0.85rem 1rem', textAlign: 'center', fontFamily: 'var(--font-body)', fontWeight: 600 }}>🥇</th>
                                    <th style={{ padding: '0.85rem 1rem', textAlign: 'center', fontFamily: 'var(--font-body)', fontWeight: 600 }}>🥈</th>
                                    <th style={{ padding: '0.85rem 1rem', textAlign: 'center', fontFamily: 'var(--font-body)', fontWeight: 600 }}>🥉</th>
                                    <th style={{ padding: '0.85rem 1rem', textAlign: 'center', fontFamily: 'var(--font-body)', fontWeight: 600 }}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {medalTallyData.map((row, i) => (
                                    <motion.tr
                                        key={row.entityName}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05, duration: 0.3 }}
                                        viewport={{ once: true }}
                                        style={{
                                            background: i % 2 === 0 ? 'var(--color-koni-gray)' : 'white',
                                            borderBottom: row.rank <= 3 ? '2px solid var(--color-koni-gold)' : '1px solid var(--color-koni-gray-medium)',
                                        }}
                                    >
                                        <td style={{ padding: '0.75rem 1rem', fontWeight: row.rank <= 3 ? 700 : 400 }}>
                                            {row.rank <= 3 ? (
                                                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '50%', background: row.rank === 1 ? '#FFD700' : row.rank === 2 ? '#C0C0C0' : '#CD7F32', color: 'white', fontWeight: 700, fontSize: '0.8rem' }}>
                                                    {row.rank}
                                                </span>
                                            ) : row.rank}
                                        </td>
                                        <td style={{ padding: '0.75rem 1rem', fontWeight: row.rank <= 3 ? 600 : 400 }}>{row.entityName}</td>
                                        <td style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 700, color: '#B8941E' }}>{row.gold}</td>
                                        <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#808080' }}>{row.silver}</td>
                                        <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#CD7F32' }}>{row.bronze}</td>
                                        <td style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 700 }}>{row.total}</td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* ===== QUICK NAVIGATION ===== */}
            <section className="section" style={{ background: 'var(--color-koni-navy)' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                        <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: 'white' }}>
                            Jelajahi <span style={{ color: '#D4AF37' }}>Portal</span>
                        </h2>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                        {[
                            { icon: Star, label: 'Profil KONI', desc: 'Sejarah, visi misi & struktur organisasi', path: '/profil', color: '#D4AF37' },
                            { icon: Users, label: 'Cabang Olahraga', desc: `${caborData.length} Cabor terdaftar di Kab. Malang`, path: '/cabor', color: '#C8102E' },
                            { icon: Newspaper, label: 'Berita & Galeri', desc: 'Update terkini & galeri foto/video', path: '/berita', color: '#4A7CFF' },
                            { icon: Calendar, label: 'Event', desc: 'Jadwal pertandingan & klasemen', path: '/', color: '#22C55E' },
                        ].map((item, i) => (
                            <motion.div
                                key={item.label}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1, duration: 0.4 }}
                                viewport={{ once: true }}
                            >
                                <Link
                                    to={item.path}
                                    style={{
                                        display: 'block',
                                        padding: '1.75rem',
                                        background: 'rgba(255,255,255,0.04)',
                                        border: '1px solid rgba(255,255,255,0.06)',
                                        borderRadius: '8px',
                                        textDecoration: 'none',
                                        transition: 'all 0.3s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                                        e.currentTarget.style.transform = 'translateY(-4px)'
                                        e.currentTarget.style.borderColor = `${item.color}33`
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                                        e.currentTarget.style.transform = 'translateY(0)'
                                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                                    }}
                                >
                                    <item.icon size={32} color={item.color} style={{ marginBottom: '1rem' }} />
                                    <h3 style={{ color: 'white', fontSize: '1.05rem', marginBottom: '0.5rem', textTransform: 'none', letterSpacing: 0, fontFamily: 'var(--font-body)', fontWeight: 700 }}>
                                        {item.label}
                                    </h3>
                                    <p style={{ color: '#9E9E9E', fontSize: '0.85rem', lineHeight: 1.5 }}>
                                        {item.desc}
                                    </p>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}
