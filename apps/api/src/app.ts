import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { prisma } from './lib/prisma.js'
import authRoutes from './routes/auth.js'
import athleteRoutes from './routes/athletes.js'
import coachRoutes from './routes/coaches.js'
import newsRoutes from './routes/news.js'
import caborRoutes from './routes/cabor.js'
import adminRoutes from './routes/admin.js'
import galleryRoutes from './routes/gallery.js'
import eventRoutes from './routes/events.js'
import publicRoutes from './routes/public.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const app = express()

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean) as string[]

app.use(helmet())
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
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  setHeaders: (res) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
  },
}))

app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/athletes', athleteRoutes)
app.use('/api/v1/coaches', coachRoutes)
app.use('/api/v1/news', newsRoutes)
app.use('/api/v1/cabor', caborRoutes)
app.use('/api/v1/admin', adminRoutes)
app.use('/api/v1/gallery', galleryRoutes)
app.use('/api/v1/events', eventRoutes)
app.use('/api/v1', publicRoutes)

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
  } catch {
    res.status(500).json({
      status: 'error',
      database: 'disconnected',
      message: 'API is up but database connection failed',
      timestamp: new Date().toISOString(),
    })
  }
})

