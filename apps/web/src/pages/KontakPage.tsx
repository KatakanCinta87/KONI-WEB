import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, Mail, Phone, MapPin, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { publicApi } from '../services/public-api'

export default function KontakPage() {
    const [formState, setFormState] = useState({
        nama: '',
        email: '',
        subjek: '',
        pesan: '',
    })
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [errorMessage, setErrorMessage] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setStatus('loading')
        setErrorMessage('')

        try {
            const res = await publicApi.sendContact(formState)
            if (res.success) {
                setStatus('success')
                setFormState({ nama: '', email: '', subjek: '', pesan: '' })
                setTimeout(() => setStatus('idle'), 5000)
            } else {
                setStatus('error')
                setErrorMessage(res.errors ? res.errors.join(', ') : res.message || 'Gagal mengirim pesan')
            }
        } catch (error) {
            console.error('Contact form error:', error)
            setStatus('error')
            setErrorMessage('Terjadi kesalahan sistem. Silakan coba lagi nanti.')
        }
    }

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
                            padding: '0.35rem 0.85rem', background: 'rgba(34,197,94,0.15)',
                            border: '1px solid rgba(34,197,94,0.3)', borderRadius: '24px',
                            color: '#22C55E', fontSize: '0.75rem', fontWeight: 600, marginBottom: '1rem',
                        }}>
                            <Mail size={14} /> Hubungi Kami
                        </div>
                        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: 'white', marginBottom: '1rem' }}>
                            Kontak <span style={{ color: '#D4AF37' }}>KONI</span>
                        </h1>
                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.05rem', maxWidth: '600px', lineHeight: 1.7 }}>
                            Hubungi Sekretariat KONI Kabupaten Malang untuk informasi, kerja sama, atau pertanyaan seputar keolahragaan.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Main Content */}
            <section className="section">
                <div className="container">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }} className="kontak-grid">
                        {/* Contact Form */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="gold-underline" style={{ fontSize: '1.6rem', color: 'var(--color-koni-navy)', marginBottom: '1.5rem' }}>
                                Kirim Pesan
                            </h2>
                            <p style={{ color: '#777', marginBottom: '2rem', fontSize: '0.92rem', lineHeight: 1.6 }}>
                                Isi formulir di bawah ini dan kami akan merespons pesan Anda sesegera mungkin.
                            </p>

                            {status === 'success' ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    style={{
                                        padding: '2.5rem',
                                        background: 'rgba(34,197,94,0.05)',
                                        border: '2px solid rgba(34,197,94,0.2)',
                                        borderRadius: '8px',
                                        textAlign: 'center',
                                    }}
                                >
                                    <CheckCircle size={48} color="#22C55E" style={{ margin: '0 auto 1rem' }} />
                                    <h3 style={{ fontFamily: 'var(--font-body)', fontWeight: 700, color: '#22C55E', marginBottom: '0.5rem', textTransform: 'none', letterSpacing: 0 }}>
                                        Pesan Terkirim!
                                    </h3>
                                    <p style={{ color: '#777', fontSize: '0.9rem' }}>
                                        Terima kasih telah menghubungi KONI Kabupaten Malang. Kami akan segera membalas pesan Anda.
                                    </p>
                                    <button 
                                        onClick={() => setStatus('idle')}
                                        style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: '#22C55E', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                                    >
                                        Kirim pesan lain
                                    </button>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.25rem' }}>
                                    {status === 'error' && (
                                        <div style={{
                                            padding: '1rem', background: '#FEF2F2', border: '1px solid #FCA5A5',
                                            borderRadius: '6px', color: '#B91C1C', fontSize: '0.85rem',
                                            display: 'flex', alignItems: 'center', gap: '0.5rem'
                                        }}>
                                            <AlertCircle size={16} /> {errorMessage}
                                        </div>
                                    )}
                                    {[
                                        { id: 'nama', label: 'Nama Lengkap', type: 'text', placeholder: 'Masukkan nama lengkap' },
                                        { id: 'email', label: 'Email', type: 'email', placeholder: 'Masukkan alamat email' },
                                        { id: 'subjek', label: 'Subjek', type: 'text', placeholder: 'Subjek pesan' },
                                    ].map((field) => (
                                        <div key={field.id}>
                                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-koni-navy)', marginBottom: '0.4rem' }}>
                                                {field.label}
                                            </label>
                                            <input
                                                type={field.type}
                                                placeholder={field.placeholder}
                                                required
                                                disabled={status === 'loading'}
                                                value={formState[field.id as keyof typeof formState]}
                                                onChange={(e) => setFormState({ ...formState, [field.id]: e.target.value })}
                                                style={{
                                                    width: '100%',
                                                    padding: '0.75rem 1rem',
                                                    border: '1.5px solid var(--color-koni-gray-medium)',
                                                    borderRadius: '6px',
                                                    fontSize: '0.9rem',
                                                    fontFamily: 'var(--font-body)',
                                                    transition: 'border-color 0.2s ease',
                                                    outline: 'none',
                                                    background: 'white',
                                                    boxSizing: 'border-box',
                                                    opacity: status === 'loading' ? 0.7 : 1,
                                                }}
                                                onFocus={(e) => { e.target.style.borderColor = '#D4AF37' }}
                                                onBlur={(e) => { e.target.style.borderColor = 'var(--color-koni-gray-medium)' }}
                                            />
                                        </div>
                                    ))}

                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-koni-navy)', marginBottom: '0.4rem' }}>
                                            Pesan
                                        </label>
                                        <textarea
                                            placeholder="Tulis pesan Anda..."
                                            required
                                            disabled={status === 'loading'}
                                            rows={5}
                                            value={formState.pesan}
                                            onChange={(e) => setFormState({ ...formState, pesan: e.target.value })}
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem 1rem',
                                                border: '1.5px solid var(--color-koni-gray-medium)',
                                                borderRadius: '6px',
                                                fontSize: '0.9rem',
                                                fontFamily: 'var(--font-body)',
                                                transition: 'border-color 0.2s ease',
                                                outline: 'none',
                                                resize: 'vertical',
                                                background: 'white',
                                                boxSizing: 'border-box',
                                                opacity: status === 'loading' ? 0.7 : 1,
                                            }}
                                            onFocus={(e) => { e.target.style.borderColor = '#D4AF37' }}
                                            onBlur={(e) => { e.target.style.borderColor = 'var(--color-koni-gray-medium)' }}
                                        />
                                    </div>

                                    <button 
                                        type="submit" 
                                        className="btn-primary" 
                                        disabled={status === 'loading'}
                                        style={{ 
                                            width: '100%', 
                                            justifyContent: 'center',
                                            opacity: status === 'loading' ? 0.8 : 1,
                                            cursor: status === 'loading' ? 'not-allowed' : 'pointer'
                                        }}
                                    >
                                        {status === 'loading' ? (
                                            <>
                                                <Loader2 size={16} className="animate-spin" /> Mengirim...
                                            </>
                                        ) : (
                                            <>
                                                <Send size={16} /> Kirim Pesan
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </motion.div>

                        {/* Contact Info + Map */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="gold-underline" style={{ fontSize: '1.6rem', color: 'var(--color-koni-navy)', marginBottom: '1.5rem' }}>
                                Informasi Kontak
                            </h2>

                            <div style={{ display: 'grid', gap: '1.25rem', marginBottom: '2rem' }}>
                                {[
                                    {
                                        icon: MapPin, color: '#C8102E',
                                        title: 'Alamat Sekretariat',
                                        text: 'Jl. Panji No. 100, Kepanjen, Kabupaten Malang, Jawa Timur 65163',
                                    },
                                    {
                                        icon: Phone, color: '#D4AF37',
                                        title: 'Telepon',
                                        text: '(0341) 396-789',
                                    },
                                    {
                                        icon: Mail, color: '#4A7CFF',
                                        title: 'Email',
                                        text: 'sekretariat@koni-kabmalang.or.id',
                                    },
                                    {
                                        icon: Clock, color: '#22C55E',
                                        title: 'Jam Operasional',
                                        text: 'Senin - Jumat: 08.00 - 16.00 WIB',
                                    },
                                ].map((item, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            display: 'flex', alignItems: 'flex-start', gap: '1rem',
                                            padding: '1.25rem',
                                            background: 'var(--color-koni-gray)',
                                            borderRadius: '8px',
                                            borderLeft: `3px solid ${item.color}`,
                                        }}
                                    >
                                        <div style={{
                                            width: '40px', height: '40px', borderRadius: '8px',
                                            background: `${item.color}15`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            flexShrink: 0,
                                        }}>
                                            <item.icon size={18} color={item.color} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-koni-navy)', marginBottom: '0.2rem' }}>
                                                {item.title}
                                            </div>
                                            <div style={{ fontSize: '0.88rem', color: '#777' }}>{item.text}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Map */}
                            <div style={{
                                height: '260px',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                border: '2px solid var(--color-koni-gray-medium)',
                            }}>
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3951.4!2d112.55!3d-8.13!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zOMKwMDcnNDguMCJTIDExMsKwMzMnMDAuMCJF!5e0!3m2!1sid!2sid!4v1"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="Lokasi KONI Kabupaten Malang"
                                />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Responsive CSS */}
            <style>{`
        @media (max-width: 768px) {
          .kontak-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
        </div>
    )
}
