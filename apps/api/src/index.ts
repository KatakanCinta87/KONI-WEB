import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())

// Health check
app.get('/api/health', (_req, res) => {
    res.json({
        status: 'ok',
        service: 'KONI Kabupaten Malang API',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
    })
})

// Placeholder: Fase 1 public API routes
app.get('/api/v1/cabor', (_req, res) => {
    res.json({
        message: 'Endpoint Cabor — akan diimplementasikan di Fase 2 dengan PostgreSQL',
        data: [],
    })
})

app.get('/api/v1/news', (_req, res) => {
    res.json({
        message: 'Endpoint News — akan diimplementasikan di Fase 2 dengan CMS',
        data: [],
    })
})

app.get('/api/v1/events', (_req, res) => {
    res.json({
        message: 'Endpoint Events — akan diimplementasikan di Fase 3',
        data: [],
    })
})

// Contact form handler (placeholder)
app.post('/api/v1/contact', (req, res) => {
    const { nama, email, subjek, pesan } = req.body
    console.log('📧 Pesan kontak diterima:', { nama, email, subjek, pesan })
    res.json({ success: true, message: 'Pesan berhasil dikirim' })
})

// Start server
app.listen(PORT, () => {
    console.log(`
  ╔══════════════════════════════════════════╗
  ║   KONI Kabupaten Malang API Server       ║
  ║   Running on http://localhost:${PORT}       ║
  ║   Environment: ${process.env.NODE_ENV || 'development'}            ║
  ╚══════════════════════════════════════════╝
  `)
})
