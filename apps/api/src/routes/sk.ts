import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.js'
import { UserRole } from '@prisma/client'

const router = Router()

// GET /api/v1/sk/:caborId
router.get('/:caborId', requireAuth(UserRole.CABOR_ADMIN), async (req, res) => {
    const caborId = req.params.caborId as string
    try {
        const docs = await prisma.sKDocument.findMany({
            where: { caborId },
            orderBy: { uploadedAt: 'desc' }
        })
        res.json({ success: true, data: docs })
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error' })
    }
})

// POST /api/v1/sk/:caborId
router.post('/:caborId', requireAuth(UserRole.CABOR_ADMIN), async (req, res) => {
    const caborId = req.params.caborId as string
    const { skNumber, issuedAt, validFrom, validUntil, notes, fileUrl } = req.body
    
    try {
        // Simple status logic for now
        const status = new Date(validUntil) < new Date() ? 'EXPIRED' : 'ACTIVE'

        const doc = await prisma.sKDocument.create({
            data: {
                caborId,
                skNumber,
                issuedAt: new Date(issuedAt),
                validFrom: new Date(validFrom),
                validUntil: new Date(validUntil),
                status,
                notes,
                fileUrl,
            }
        })
        res.status(201).json({ success: true, data: doc })
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error' })
    }
})

export default router
