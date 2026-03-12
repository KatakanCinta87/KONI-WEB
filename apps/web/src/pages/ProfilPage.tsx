import { motion } from 'framer-motion'
import { BookOpen, Eye, Target, Users, Award } from 'lucide-react'
import { orgStructure, programKerja, sejarahKoni, visiMisi } from '../data/profile-content'

export default function ProfilPage() {
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
                            padding: '0.35rem 0.85rem', background: 'rgba(212,175,55,0.15)',
                            border: '1px solid rgba(212,175,55,0.3)', borderRadius: '24px',
                            color: '#D4AF37', fontSize: '0.75rem', fontWeight: 600, marginBottom: '1rem',
                        }}>
                            <BookOpen size={14} /> Profil Organisasi
                        </div>
                        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: 'white', marginBottom: '1rem' }}>
                            KONI <span style={{ color: '#D4AF37' }}>Kabupaten Malang</span>
                        </h1>
                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.05rem', maxWidth: '600px', lineHeight: 1.7 }}>
                            Komite Olahraga Nasional Indonesia tingkat Kabupaten Malang — Wadah koordinasi seluruh federasi olahraga kompetisi.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Sejarah */}
            <section className="section">
                <div className="container">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center' }} className="profil-grid">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="gold-underline" style={{ fontSize: '1.8rem', color: 'var(--color-koni-navy)', marginBottom: '1.5rem' }}>
                                Sejarah
                            </h2>
                            {sejarahKoni.split('\n\n').map((p, i) => (
                                <p key={i} style={{ color: '#555', lineHeight: 1.8, marginBottom: '1rem', fontSize: '0.95rem' }}>{p}</p>
                            ))}
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                            style={{
                                height: '360px',
                                borderRadius: '8px',
                                background: 'linear-gradient(135deg, var(--color-koni-navy), var(--color-koni-navy-light))',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '2px solid rgba(212,175,55,0.15)',
                            }}
                        >
                            <div style={{ textAlign: 'center' }}>
                                <Award size={64} color="rgba(212,175,55,0.3)" />
                                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', marginTop: '1rem' }}>Foto Kantor KONI</p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Visi & Misi */}
            <section className="section" style={{ background: 'var(--color-koni-gray)' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                        <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: 'var(--color-koni-navy)' }}>
                            Visi & <span style={{ color: 'var(--color-koni-gold)' }}>Misi</span>
                        </h2>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }} className="profil-grid">
                        {/* Visi */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            viewport={{ once: true }}
                            style={{
                                padding: '2.5rem',
                                background: 'linear-gradient(135deg, var(--color-koni-navy), var(--color-koni-navy-light))',
                                borderRadius: '8px',
                                border: '2px solid rgba(212,175,55,0.15)',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                                <Eye size={24} color="#D4AF37" />
                                <h3 style={{ color: '#D4AF37', fontSize: '1.25rem' }}>VISI</h3>
                            </div>
                            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.05rem', lineHeight: 1.8, fontStyle: 'italic' }}>
                                "{visiMisi.visi}"
                            </p>
                        </motion.div>

                        {/* Misi */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            viewport={{ once: true }}
                            style={{
                                padding: '2.5rem',
                                background: 'white',
                                borderRadius: '8px',
                                boxShadow: 'var(--shadow-card)',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                                <Target size={24} color="var(--color-koni-red)" />
                                <h3 style={{ color: 'var(--color-koni-red)', fontSize: '1.25rem' }}>MISI</h3>
                            </div>
                            <ol style={{ paddingLeft: '1.25rem' }}>
                                {visiMisi.misi.map((item, i) => (
                                    <li key={i} style={{ color: '#555', lineHeight: 1.7, marginBottom: '0.65rem', fontSize: '0.9rem', paddingLeft: '0.5rem' }}>
                                        {item}
                                    </li>
                                ))}
                            </ol>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Struktur Organisasi */}
            <section className="section">
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                        <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: 'var(--color-koni-navy)' }}>
                            Struktur <span style={{ color: 'var(--color-koni-red)' }}>Organisasi</span>
                        </h2>
                        <p style={{ color: 'var(--color-koni-gray-dark)', marginTop: '0.5rem' }}>
                            Pengurus KONI Kabupaten Malang Periode 2025-2029
                        </p>
                    </div>

                    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                        {/* Ketua */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            viewport={{ once: true }}
                            style={{
                                textAlign: 'center',
                                padding: '2rem',
                                background: 'linear-gradient(135deg, var(--color-koni-navy), var(--color-koni-navy-light))',
                                borderRadius: '8px',
                                marginBottom: '1.5rem',
                                border: '2px solid rgba(212,175,55,0.3)',
                            }}
                        >
                            <div style={{
                                width: '80px', height: '80px', borderRadius: '50%',
                                background: 'linear-gradient(135deg, #D4AF37, #E8CC6E)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 1rem',
                                fontSize: '2rem',
                            }}>
                                <Users size={36} color="#1A1A2E" />
                            </div>
                            <div style={{ color: '#D4AF37', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.35rem' }}>
                                {orgStructure[0]?.position}
                            </div>
                            <div style={{ color: 'white', fontSize: '1.2rem', fontWeight: 700 }}>
                                {orgStructure[0]?.name}
                            </div>
                        </motion.div>

                        {/* Other Members */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                            {orgStructure.slice(1).map((member, i) => (
                                <motion.div
                                    key={member.name}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.06, duration: 0.4 }}
                                    viewport={{ once: true }}
                                    className="card"
                                    style={{ padding: '1.5rem', textAlign: 'center' }}
                                >
                                    <div style={{
                                        width: '56px', height: '56px', borderRadius: '50%',
                                        background: 'var(--color-koni-gray)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        margin: '0 auto 0.75rem',
                                    }}>
                                        <Users size={24} color="var(--color-koni-navy-lighter)" />
                                    </div>
                                    <div style={{ color: 'var(--color-koni-red)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>
                                        {member.position}
                                    </div>
                                    <div style={{ color: 'var(--color-koni-navy)', fontWeight: 600, fontSize: '0.9rem' }}>
                                        {member.name}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Program Kerja */}
            <section className="section" style={{ background: 'var(--color-koni-gray)' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                        <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: 'var(--color-koni-navy)' }}>
                            Program <span style={{ color: 'var(--color-koni-gold)' }}>Kerja</span>
                        </h2>
                        <p style={{ color: 'var(--color-koni-gray-dark)', marginTop: '0.5rem' }}>
                            Program kerja tahun 2025 KONI Kabupaten Malang
                        </p>
                    </div>

                    <div style={{ maxWidth: '700px', margin: '0 auto', display: 'grid', gap: '0.75rem' }}>
                        {programKerja.map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05, duration: 0.4 }}
                                viewport={{ once: true }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '1rem',
                                    padding: '1rem 1.25rem',
                                    background: 'white',
                                    borderRadius: '6px',
                                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                                    borderLeft: '3px solid var(--color-koni-gold)',
                                }}
                            >
                                <span style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    width: '28px', height: '28px', borderRadius: '50%',
                                    background: 'rgba(212,175,55,0.1)', color: 'var(--color-koni-gold)',
                                    fontWeight: 700, fontSize: '0.8rem', flexShrink: 0,
                                }}>
                                    {i + 1}
                                </span>
                                <p style={{ color: '#444', fontSize: '0.9rem', lineHeight: 1.5 }}>{item}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Responsive CSS */}
            <style>{`
        @media (max-width: 768px) {
          .profil-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
        </div>
    )
}
