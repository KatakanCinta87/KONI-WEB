import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Trophy } from 'lucide-react'

const navLinks = [
    { path: '/', label: 'Beranda' },
    { path: '/profil', label: 'Profil' },
    { path: '/cabor', label: 'Cabang Olahraga' },
    { path: '/berita', label: 'Berita' },
    { path: '/kontak', label: 'Kontak' },
]

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false)
    const location = useLocation()

    return (
        <nav
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 100,
                background: 'rgba(26, 26, 46, 0.92)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                borderBottom: '1px solid rgba(212, 175, 55, 0.15)',
            }}
        >
            <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
                {/* Logo */}
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, #D4AF37, #E8CC6E)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <Trophy size={22} color="#1A1A2E" strokeWidth={2.5} />
                    </div>
                    <div>
                        <div style={{ color: '#D4AF37', fontFamily: 'var(--font-heading)', fontSize: '1.1rem', letterSpacing: '0.05em', lineHeight: 1.1 }}>
                            KONI
                        </div>
                        <div style={{ color: '#9E9E9E', fontSize: '0.65rem', fontWeight: 500, letterSpacing: '0.08em', lineHeight: 1 }}>
                            KABUPATEN MALANG
                        </div>
                    </div>
                </Link>

                {/* Desktop Nav */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }} className="desktop-nav">
                    {navLinks.map((link) => {
                        const isActive = location.pathname === link.path
                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                style={{
                                    padding: '0.5rem 1rem',
                                    color: isActive ? '#D4AF37' : '#E0E0E0',
                                    textDecoration: 'none',
                                    fontSize: '0.9rem',
                                    fontWeight: isActive ? 600 : 400,
                                    borderRadius: '4px',
                                    transition: 'all 0.25s ease',
                                    position: 'relative',
                                }}
                                onMouseEnter={(e) => {
                                    if (!isActive) (e.target as HTMLElement).style.color = '#D4AF37'
                                }}
                                onMouseLeave={(e) => {
                                    if (!isActive) (e.target as HTMLElement).style.color = '#E0E0E0'
                                }}
                            >
                                {link.label}
                                {isActive && (
                                    <motion.div
                                        layoutId="nav-indicator"
                                        style={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: '1rem',
                                            right: '1rem',
                                            height: '2px',
                                            background: '#D4AF37',
                                            borderRadius: '1px',
                                        }}
                                    />
                                )}
                            </Link>
                        )
                    })}
                </div>

                {/* Mobile Hamburger */}
                <button
                    className="mobile-menu-btn"
                    onClick={() => setIsOpen(!isOpen)}
                    style={{
                        display: 'none',
                        background: 'none',
                        border: 'none',
                        color: '#D4AF37',
                        cursor: 'pointer',
                        padding: '0.5rem',
                    }}
                    aria-label="Toggle menu"
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mobile-nav"
                        style={{
                            overflow: 'hidden',
                            background: 'rgba(26, 26, 46, 0.98)',
                            borderTop: '1px solid rgba(212, 175, 55, 0.1)',
                        }}
                    >
                        <div style={{ padding: '1rem 1.5rem' }}>
                            {navLinks.map((link) => {
                                const isActive = location.pathname === link.path
                                return (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        onClick={() => setIsOpen(false)}
                                        style={{
                                            display: 'block',
                                            padding: '0.75rem 1rem',
                                            color: isActive ? '#D4AF37' : '#E0E0E0',
                                            textDecoration: 'none',
                                            fontWeight: isActive ? 600 : 400,
                                            fontSize: '1rem',
                                            borderLeft: isActive ? '3px solid #D4AF37' : '3px solid transparent',
                                            transition: 'all 0.2s ease',
                                        }}
                                    >
                                        {link.label}
                                    </Link>
                                )
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Responsive CSS */}
            <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
        @media (min-width: 769px) {
          .mobile-nav { display: none !important; }
        }
      `}</style>
        </nav>
    )
}
