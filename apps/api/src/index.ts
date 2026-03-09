import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import { prisma } from './lib/prisma.js'
import authRoutes from './routes/auth.js'
import athleteRoutes from './routes/athletes.js'
import coachRoutes from './routes/coaches.js'
import newsRoutes from './routes/news.js'
import caborRoutes from './routes/cabor.js'
import adminRoutes from './routes/admin.js'
import galleryRoutes from './routes/gallery.js'
import eventRoutes from './routes/events.js'
import { initCronJobs } from './services/cron.service.js'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Initialize Cron Jobs
initCronJobs()

// â”€â”€ Security Middleware â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
app.use(helmet())

// â”€â”€ CORS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL,
].filter(Boolean) as string[]

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    credentials: true,
}))

app.use(express.json({ limit: '100kb' }))
app.use(express.urlencoded({ extended: false, limit: '100kb' }))

// â”€â”€ Static Files â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
    setHeaders: (res) => {
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
    }
}))

// â”€â”€ Helper functions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function sanitize(str: unknown): string {
    if (typeof str !== 'string') return ''
    return str.replace(/<[^>]*>/g, '').trim()
}

function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// â”€â”€ Routes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// API Routes
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/athletes', athleteRoutes)
app.use('/api/v1/coaches', coachRoutes)
app.use('/api/v1/news/admin', newsRoutes)
app.use('/api/v1/cabor', caborRoutes)
app.use('/api/v1/admin', adminRoutes)
app.use('/api/v1/gallery', galleryRoutes)
app.use('/api/v1/events', eventRoutes)

// Health check
app.get('/api/health', async (_req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`
        res.json({
            status: 'ok',
            database: 'connected',
            service: 'KONI Kabupaten Malang API',
            version: '1.0.0',
            timestamp: new Date().toISOString(),
        })
    } catch (err) {
        res.status(500).json({
            status: 'error',
            database: 'disconnected',
            message: 'API is up but database connection failed',
            timestamp: new Date().toISOString(),
        })
    }
})

// Public News API
app.get('/api/v1/news', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit as string) || 6
        const news = await prisma.news.findMany({
            where: { status: 'PUBLISHED' },
            orderBy: { publishedAt: 'desc' },
            take: limit
        })
        res.json({ success: true, data: news })
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal mengambil data berita' })
    }
})

const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { success: false, message: 'Terlalu banyak permintaan. Coba lagi nanti.' },
})

app.post('/api/v1/contact', contactLimiter, (req, res) => {
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

    console.log('ðŸ“§ Pesan kontak:', { nama, email, subjek, pesan })
    res.json({ success: true, message: 'Pesan berhasil dikirim' })
})

// â”€â”€ Start server â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
app.listen(PORT, () => {
    console.log(`
  â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
  â•‘   KONI Kabupaten Malang API Server       â•‘
  â•‘   Running on http://localhost:${PORT}       â•‘
  â•‘   Environment: ${process.env.NODE_ENV || 'development'}            â•‘
  â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  `)
})
