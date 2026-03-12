import { Router, Response } from 'express'
import { prisma } from '../lib/prisma.js'
import { requireAuth, AuthRequest } from '../middleware/auth.js'
import { UserRole } from '@prisma/client'

const router = Router()

// GET /api/v1/news - Public list (moved from index.ts)
router.get('/', async (req, res) => {
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

// GET /api/v1/news/admin - List all news (for CMS)
router.get('/admin', requireAuth(UserRole.CABOR_ADMIN), async (req: AuthRequest, res: Response) => {
    try {
        const where: any = {}
        if (req.user?.role === UserRole.CABOR_ADMIN) {
            const cabor = await prisma.cabangOlahraga.findUnique({
                where: { adminId: req.user.id }
            })
            if (cabor) where.caborId = cabor.id
        }

        const news = await prisma.news.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        })
        res.json({ success: true, data: news })
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error' })
    }
})

// GET /api/v1/news/:slug - Public detail
router.get('/:slug', async (req, res) => {
    try {
        const { slug } = req.params
        if (slug.toLowerCase() === 'admin') {
            res.status(404).json({ success: false, message: 'Berita tidak ditemukan' })
            return
        }

        const news = await prisma.news.findUnique({
            where: { slug, status: 'PUBLISHED' }
        })

        if (!news) {
            res.status(404).json({ success: false, message: 'Berita tidak ditemukan' })
            return
        }

        // Increment views
        await prisma.news.update({
            where: { id: news.id },
            data: { views: { increment: 1 } }
        })

        res.json({ success: true, data: news })
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal mengambil detail berita' })
    }
})

const createNewsHandler = async (req: AuthRequest, res: Response) => {
    const { title, content, category, caborId, status, thumbnailUrl } = req.body

    try {
        const slug = title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')
        
        const news = await prisma.news.create({
            data: {
                title,
                slug,
                content,
                category,
                caborId,
                status: status || 'DRAFT',
                thumbnailUrl,
                publishedAt: status === 'PUBLISHED' ? new Date() : null,
                author: req.user?.email || 'Admin'
            }
        })
        res.json({ success: true, data: news })
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error' })
    }
}

const updateNewsHandler = async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string
    const { title, content, category, status, thumbnailUrl } = req.body

    try {
        const existing = await prisma.news.findUnique({ where: { id } })
        if (!existing) {
            res.status(404).json({ success: false, error: 'News not found' })
            return
        }

        // RBAC: Cabor admin can only edit their own cabor's news
        if (req.user?.role === UserRole.CABOR_ADMIN && existing.caborId) {
            const cabor = await prisma.cabangOlahraga.findUnique({ where: { adminId: req.user.id } })
            if (!cabor || existing.caborId !== cabor.id) {
                res.status(403).json({ success: false, error: 'Access denied' })
                return
            }
        }

        const data: any = { title, content, category, status, thumbnailUrl }
        if (status === 'PUBLISHED' && existing.status !== 'PUBLISHED') {
            data.publishedAt = new Date()
        }

        const news = await prisma.news.update({
            where: { id },
            data
        })
        res.json({ success: true, data: news })
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error' })
    }
}

const deleteNewsHandler = async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string
    try {
        await prisma.news.delete({ where: { id } })
        res.json({ success: true, message: 'News deleted' })
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error' })
    }
}

// Admin write routes
router.post('/', requireAuth(UserRole.CABOR_ADMIN), createNewsHandler)
router.patch('/:id', requireAuth(UserRole.CABOR_ADMIN), updateNewsHandler)
router.delete('/:id', requireAuth(UserRole.SUPER_ADMIN), deleteNewsHandler)

export default router
