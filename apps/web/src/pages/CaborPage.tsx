import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Users, Phone, Mail, X, Trophy, Filter } from 'lucide-react'
import { caborData as dummyCabor } from '../data/dummy'
import { api, Cabor } from '../services/api'

const categories = ['Semua', 'Beregu', 'Perorangan', 'Campuran']

export default function CaborPage() {
    const [search, setSearch] = useState('')
    const [activeCategory, setActiveCategory] = useState('Semua')
    const [cabors, setCabors] = useState<Cabor[]>([])
    const [selectedCabor, setSelectedCabor] = useState<Cabor | null>(null)

    useEffect(() => {
        async function loadCabors() {
            try {
                const res = await api.getCabor()
                if (res.success) {
                    setCabors(res.data)
                }
            } catch (error) {
                console.error('Failed to fetch cabors, using dummy data', error)
                // Fallback to dummy data mapping
                setCabors(dummyCabor.map(c => ({
                    id: c.id,
                    name: c.name,
                    fullName: c.fullName,
                    category: c.category,
                    logoUrl: '',
                    chairmanName: c.chairmanName
                })))
            }
        }
        loadCabors()
    }, [])

    const filtered = cabors.filter((c) => {
        const matchesSearch =
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.fullName.toLowerCase().includes(search.toLowerCase())
        const matchesCategory = activeCategory === 'Semua' || c.category === activeCategory
        return matchesSearch && matchesCategory
    })

    return (
        <div>
            {/* Hero */}
            <section style={{
                position: 'relative',
                padding: 'clamp(4rem, 8vw, 7rem) 0 clamp(3rem, 6vw, 5rem)',
                background: 'linear-gradient(135deg, #1A1A2E 0%, #2D2D44 50%, #3A1520 100%)',
            }}>
                <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.35rem 0.85rem', background: 'rgba(200,16,46,0.15)',
                            border: '1px solid rgba(200,16,46,0.3)', borderRadius: '24px',
                            color: '#E0334D', fontSize: '0.75rem', fontWeight: 600, marginBottom: '1rem',
                        }}>
                            <Users size={14} /> Direktori Cabang Olahraga
                        </div>
                        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: 'white', marginBottom: '1rem' }}>
                            Cabang <span style={{ color: '#D4AF37' }}>Olahraga</span>
                        </h1>
                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.05rem', maxWidth: '600px', lineHeight: 1.7 }}>
                            {(cabors.length || dummyCabor.length)} cabang olahraga kompetisi bernaung di bawah KONI Kabupaten Malang
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Filters */}
            <section style={{ background: 'white', borderBottom: '1px solid var(--color-koni-gray-medium)', padding: '1.25rem 0', position: 'sticky', top: '72px', zIndex: 50 }}>
                <div className="container" style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Search */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.6rem 1rem', background: 'var(--color-koni-gray)',
                        borderRadius: '6px', flex: '1', minWidth: '200px', maxWidth: '360px',
                    }}>
                        <Search size={16} color="var(--color-koni-gray-dark)" />
                        <input
                            type="text"
                            placeholder="Cari cabang olahraga..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{
                                background: 'none', border: 'none', outline: 'none',
                                fontSize: '0.9rem', color: 'var(--color-koni-navy)', width: '100%',
                                fontFamily: 'var(--font-body)',
                            }}
                        />
                    </div>

                    {/* Category Filter */}
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {categories.map((cat) => (
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
                                    background: activeCategory === cat ? 'var(--color-koni-red)' : 'var(--color-koni-gray)',
                                    color: activeCategory === cat ? 'white' : 'var(--color-koni-navy)',
                                }}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <span style={{ fontSize: '0.85rem', color: 'var(--color-koni-gray-dark)', marginLeft: 'auto' }}>
                        {filtered.length} Cabor
                    </span>
                </div>
            </section>

            {/* Grid */}
            <section className="section" style={{ background: 'var(--color-koni-gray)' }}>
                <div className="container">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
                        {filtered.map((cabor, i) => (
                            <motion.div
                                key={cabor.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.04, duration: 0.4 }}
                                viewport={{ once: true }}
                                className="card"
                                style={{ cursor: 'pointer' }}
                                onClick={() => setSelectedCabor(cabor)}
                            >
                                <div style={{ padding: '1.75rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                        <div style={{
                                            width: '56px', height: '56px', borderRadius: '12px',
                                            background: 'var(--color-koni-gray)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '1.75rem',
                                            overflow: 'hidden'
                                        }}>
                                            {cabor.logoUrl ? (
                                                <img src={cabor.logoUrl} alt={cabor.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                            ) : (
                                                <Trophy size={28} color="#D4AF37" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 style={{
                                                fontFamily: 'var(--font-body)', fontWeight: 700,
                                                fontSize: '1.1rem', color: 'var(--color-koni-navy)',
                                                textTransform: 'none', letterSpacing: 0,
                                            }}>
                                                {cabor.name}
                                            </h3>
                                            <span style={{
                                                display: 'inline-block', fontSize: '0.7rem', fontWeight: 600,
                                                padding: '0.15rem 0.5rem', borderRadius: '4px',
                                                background: cabor.category === 'Beregu' ? 'rgba(200,16,46,0.1)' : cabor.category === 'Perorangan' ? 'rgba(212,175,55,0.1)' : 'rgba(74,124,255,0.1)',
                                                color: cabor.category === 'Beregu' ? 'var(--color-koni-red)' : cabor.category === 'Perorangan' ? 'var(--color-koni-gold-dark)' : '#4A7CFF',
                                            }}>
                                                {cabor.category}
                                            </span>
                                        </div>
                                    </div>

                                    <p style={{ fontSize: '0.82rem', color: '#999', marginBottom: '1rem', lineHeight: 1.3 }}>
                                        {cabor.fullName}
                                    </p>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: '#666' }}>
                                            <Users size={14} /> {cabor.athleteCount} Atlet
                                        </div>
                                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-koni-red)' }}>
                                            Detail →
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {filtered.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '4rem 0', color: '#999' }}>
                            <Search size={48} strokeWidth={1} />
                            <p style={{ marginTop: '1rem', fontSize: '1rem' }}>Tidak ada cabang olahraga yang cocok</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedCabor && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedCabor(null)}
                        style={{
                            position: 'fixed', inset: 0, zIndex: 200,
                            background: 'rgba(0,0,0,0.6)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            padding: '1.5rem',
                        }}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                background: 'white',
                                borderRadius: '12px',
                                maxWidth: '540px',
                                width: '100%',
                                maxHeight: '85vh',
                                overflowY: 'auto',
                            }}
                        >
                            {/* Header */}
                            <div style={{
                                padding: '2rem', borderBottom: '1px solid var(--color-koni-gray-medium)',
                                background: 'linear-gradient(135deg, var(--color-koni-navy), var(--color-koni-navy-light))',
                                borderRadius: '12px 12px 0 0',
                                position: 'relative',
                            }}>
                                <button
                                    onClick={() => setSelectedCabor(null)}
                                    style={{
                                        position: 'absolute', top: '1rem', right: '1rem',
                                        background: 'rgba(255,255,255,0.1)', border: 'none',
                                        borderRadius: '50%', width: '32px', height: '32px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'white', cursor: 'pointer',
                                    }}
                                >
                                    <X size={16} />
                                </button>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{
                                        width: '64px', height: '64px', borderRadius: '14px',
                                        background: 'rgba(255,255,255,0.1)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '2rem',
                                        overflow: 'hidden'
                                    }}>
                                        {selectedCabor.logoUrl ? (
                                            <img src={selectedCabor.logoUrl} alt={selectedCabor.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                        ) : (
                                            <Trophy size={32} color="#D4AF37" />
                                        )}
                                    </div>
                                    <div>
                                        <h2 style={{ color: '#D4AF37', fontSize: '1.4rem' }}>{selectedCabor.name}</h2>
                                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>{selectedCabor.fullName}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Body */}
                            <div style={{ padding: '2rem' }}>
                                <p style={{ fontSize: '0.92rem', color: '#555', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                                    {selectedCabor.description}
                                </p>

                                <div style={{ display: 'grid', gap: '0.85rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem' }}>
                                        <Users size={16} color="var(--color-koni-red)" />
                                        <span><strong>Ketua Pengkab:</strong> {selectedCabor.chairmanName}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem' }}>
                                        <Phone size={16} color="var(--color-koni-red)" />
                                        <span><strong>Telepon:</strong> {selectedCabor.phone}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem' }}>
                                        <Mail size={16} color="var(--color-koni-red)" />
                                        <span><strong>Email:</strong> {selectedCabor.email}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem' }}>
                                        <Filter size={16} color="var(--color-koni-gold)" />
                                        <span><strong>Kategori:</strong> {selectedCabor.category}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem' }}>
                                        <Users size={16} color="var(--color-koni-gold)" />
                                        <span><strong>Jumlah Atlet:</strong> {selectedCabor.athleteCount} atlet aktif</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
