import { Router } from 'express'
import rateLimit from 'express-rate-limit'

const router = Router()

const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { success: false, message: 'Terlalu banyak permintaan. Coba lagi nanti.' },
})

function sanitize(str: unknown): string {
    if (typeof str !== 'string') return ''
    return str.replace(/<[^>]*>/g, '').trim()
}

function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

router.post('/contact', contactLimiter, (req, res) => {
    const { nama, email, subjek, pesan } = req.body
    const errors: string[] = []
    
    if (!nama || sanitize(nama).length < 2) errors.push('Nama tidak valid')
    if (!email || !isValidEmail(email)) errors.push('Email tidak valid')
    if (!subjek || sanitize(subjek).length < 3) errors.push('Subjek tidak valid')
    if (!pesan || sanitize(pesan).length < 10) errors.push('Pesan terlalu pendek')

    if (errors.length > 0) {
        res.status(400).json({ success: false, errors })
        return
    }

    // In a real app, this would send an email
    console.log('📧 Pesan kontak:', { nama, email, subjek, pesan })
    res.json({ success: true, message: 'Pesan berhasil dikirim' })
})

export default router
