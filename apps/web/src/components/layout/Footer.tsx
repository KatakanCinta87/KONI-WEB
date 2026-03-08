import { Link } from 'react-router-dom'
import { Trophy, Mail, Phone, MapPin, Facebook, Instagram, Youtube } from 'lucide-react'

export default function Footer() {
    return (
        <footer style={{ background: 'var(--color-koni-navy)', color: '#E0E0E0', paddingTop: '4rem' }}>
            <div className="container">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2.5rem', paddingBottom: '3rem' }}>
                    {/* Brand */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                            <div style={{
                                width: '44px',
                                height: '44px',
                                borderRadius: '8px',
                                background: 'linear-gradient(135deg, #D4AF37, #E8CC6E)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <Trophy size={24} color="#1A1A2E" strokeWidth={2.5} />
                            </div>
                            <div>
                                <div style={{ color: '#D4AF37', fontFamily: 'var(--font-heading)', fontSize: '1.2rem', letterSpacing: '0.05em' }}>KONI</div>
                                <div style={{ fontSize: '0.7rem', color: '#9E9E9E', letterSpacing: '0.08em' }}>KABUPATEN MALANG</div>
                            </div>
                        </div>
                        <p style={{ fontSize: '0.9rem', lineHeight: 1.7, color: '#9E9E9E', maxWidth: '320px' }}>
                            Komite Olahraga Nasional Indonesia Kabupaten Malang — Wadah koordinasi pembinaan olahraga prestasi dan penyelenggaraan event keolahragaan daerah.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 style={{ fontFamily: 'var(--font-heading)', color: '#D4AF37', fontSize: '1rem', marginBottom: '1rem', letterSpacing: '0.05em' }}>
                            NAVIGASI
                        </h4>
                        {[
                            { path: '/', label: 'Beranda' },
                            { path: '/profil', label: 'Profil Organisasi' },
                            { path: '/cabor', label: 'Cabang Olahraga' },
                            { path: '/berita', label: 'Berita & Galeri' },
                            { path: '/kontak', label: 'Kontak' },
                        ].map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                style={{
                                    display: 'block',
                                    padding: '0.35rem 0',
                                    color: '#9E9E9E',
                                    textDecoration: 'none',
                                    fontSize: '0.9rem',
                                    transition: 'color 0.2s',
                                }}
                                onMouseEnter={(e) => { (e.target as HTMLElement).style.color = '#D4AF37' }}
                                onMouseLeave={(e) => { (e.target as HTMLElement).style.color = '#9E9E9E' }}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 style={{ fontFamily: 'var(--font-heading)', color: '#D4AF37', fontSize: '1rem', marginBottom: '1rem', letterSpacing: '0.05em' }}>
                            KONTAK
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.9rem', color: '#9E9E9E' }}>
                                <MapPin size={16} style={{ marginTop: '3px', flexShrink: 0 }} color="#D4AF37" />
                                <span>Jl. Panji No. 100, Kepanjen, Kabupaten Malang, Jawa Timur 65163</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: '#9E9E9E' }}>
                                <Phone size={16} style={{ flexShrink: 0 }} color="#D4AF37" />
                                <span>(0341) 396-789</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: '#9E9E9E' }}>
                                <Mail size={16} style={{ flexShrink: 0 }} color="#D4AF37" />
                                <span>sekretariat@koni-kabmalang.or.id</span>
                            </div>
                        </div>

                        {/* Social */}
                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                            {[Facebook, Instagram, Youtube].map((Icon, i) => (
                                <a
                                    key={i}
                                    href="#"
                                    style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '6px',
                                        border: '1px solid rgba(212, 175, 55, 0.3)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#D4AF37',
                                        transition: 'all 0.25s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                        const el = e.currentTarget
                                        el.style.background = '#D4AF37'
                                        el.style.color = '#1A1A2E'
                                    }}
                                    onMouseLeave={(e) => {
                                        const el = e.currentTarget
                                        el.style.background = 'transparent'
                                        el.style.color = '#D4AF37'
                                    }}
                                >
                                    <Icon size={16} />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div style={{ borderTop: '1px solid rgba(212, 175, 55, 0.1)', padding: '1.25rem 0' }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <p style={{ fontSize: '0.8rem', color: '#6E6E8A' }}>
                        © 2025 KONI Kabupaten Malang. Hak Cipta Dilindungi.
                    </p>
                    <p style={{ fontSize: '0.8rem', color: '#6E6E8A' }}>
                        Portal Resmi Sistem Informasi Keolahragaan Terpadu
                    </p>
                </div>
            </div>
        </footer>
    )
}
