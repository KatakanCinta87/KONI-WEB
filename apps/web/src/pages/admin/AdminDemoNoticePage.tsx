import { DatabaseZap, Globe, ArrowLeft, Rocket } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function AdminDemoNoticePage() {
    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1.5rem',
                background: 'linear-gradient(135deg, #0A192F 0%, #112240 55%, #1E293B 100%)',
            }}
        >
            <div
                style={{
                    width: '100%',
                    maxWidth: '720px',
                    background: 'rgba(255,255,255,0.98)',
                    borderRadius: '24px',
                    padding: '2rem',
                    boxShadow: '0 30px 60px rgba(15, 23, 42, 0.3)',
                }}
            >
                <div
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.45rem 0.9rem',
                        borderRadius: '999px',
                        background: 'rgba(212, 175, 55, 0.14)',
                        color: '#9A6700',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                    }}
                >
                    <Rocket size={16} />
                    Demo Publish Vercel
                </div>

                <h1 style={{ margin: '1.25rem 0 0.75rem', fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', color: '#0F172A' }}>
                    Panel admin tidak diaktifkan pada branch demo ini
                </h1>

                <p style={{ margin: 0, color: '#475569', lineHeight: 1.7, fontSize: '1rem' }}>
                    Branch aktif ini disiapkan khusus untuk publish demo di Vercel. Halaman publik tetap tampil memakai data statis,
                    sedangkan alur login, CMS, dan integrasi backend asli tetap dijalankan dari environment repo utama.
                </p>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: '1rem',
                        marginTop: '1.5rem',
                    }}
                >
                    <div
                        style={{
                            border: '1px solid #E2E8F0',
                            borderRadius: '16px',
                            padding: '1rem',
                            background: '#F8FAFC',
                        }}
                    >
                        <Globe size={20} color="#2563EB" />
                        <h2 style={{ margin: '0.75rem 0 0.4rem', fontSize: '1rem', color: '#0F172A' }}>Yang tetap aktif</h2>
                        <p style={{ margin: 0, color: '#64748B', fontSize: '0.9rem', lineHeight: 1.6 }}>
                            Homepage, berita, cabor, profil, dan kontak demo untuk presentasi publik.
                        </p>
                    </div>

                    <div
                        style={{
                            border: '1px solid #E2E8F0',
                            borderRadius: '16px',
                            padding: '1rem',
                            background: '#F8FAFC',
                        }}
                    >
                        <DatabaseZap size={20} color="#C2410C" />
                        <h2 style={{ margin: '0.75rem 0 0.4rem', fontSize: '1rem', color: '#0F172A' }}>Yang sengaja dipisah</h2>
                        <p style={{ margin: 0, color: '#64748B', fontSize: '0.9rem', lineHeight: 1.6 }}>
                            Auth, admin CMS, dan proses backend riil agar tidak bergantung pada serverless Vercel branch ini.
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1.75rem' }}>
                    <Link
                        to="/"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.85rem 1.2rem',
                            borderRadius: '12px',
                            background: '#0F172A',
                            color: '#FFFFFF',
                            textDecoration: 'none',
                            fontWeight: 700,
                        }}
                    >
                        <ArrowLeft size={16} />
                        Kembali ke demo publik
                    </Link>
                </div>
            </div>
        </div>
    )
}
