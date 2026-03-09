import { Response } from 'express'
import { prisma } from '../lib/prisma.js'
import { AuthRequest } from '../middleware/auth.js'
import { createAuditLog } from '../services/audit.service.js'
import { UserRole } from '@prisma/client'

export const getCabors = async (req: AuthRequest, res: Response) => {
  try {
    const cabors = await prisma.cabangOlahraga.findMany({
      include: {
        _count: {
          select: { athletes: true, coaches: true }
        },
        skDocuments: {
          orderBy: { issuedAt: 'desc' },
          take: 1
        }
      },
      orderBy: { name: 'asc' }
    })

    res.json({ success: true, data: cabors })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Gagal mengambil data cabor' })
  }
}

export const getCaborById = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string

  try {
    const cabor = await prisma.cabangOlahraga.findUnique({
      where: { id },
      include: {
        admin: {
          select: { id: true, email: true, fullName: true }
        },
        skDocuments: {
          orderBy: { issuedAt: 'desc' }
        },
        _count: {
          select: { athletes: true, coaches: true }
        }
      }
    })

    if (!cabor) {
      res.status(404).json({ success: false, error: 'Cabor tidak ditemukan' })
      return
    }

    res.json({ success: true, data: cabor })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Gagal mengambil detail cabor' })
  }
}

export const createCabor = async (req: AuthRequest, res: Response) => {
  const data = req.body

  try {
    const cabor = await prisma.cabangOlahraga.create({
      data
    })

    await createAuditLog({
      userId: req.user?.id,
      action: 'CREATE_CABOR',
      resource: 'cabor',
      resourceId: cabor.id,
      after: cabor,
      ipAddress: req.ip,
    })

    res.status(201).json({ success: true, data: cabor })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Gagal membuat data cabor' })
  }
}

export const updateCabor = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string
  const data = req.body

  try {
    const existing = await prisma.cabangOlahraga.findUnique({ where: { id } })
    if (!existing) {
      res.status(404).json({ success: false, error: 'Cabor tidak ditemukan' })
      return
    }

    // RBAC: Cabor Admin can only update their own cabor
    if (req.user?.role === UserRole.CABOR_ADMIN && existing.adminId !== req.user.id) {
      res.status(403).json({ success: false, error: 'Akses ditolak' })
      return
    }

    const updated = await prisma.cabangOlahraga.update({
      where: { id },
      data
    })

    await createAuditLog({
      userId: req.user?.id,
      action: 'UPDATE_CABOR',
      resource: 'cabor',
      resourceId: id,
      before: existing,
      after: updated,
      ipAddress: req.ip,
    })

    res.json({ success: true, data: updated })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Gagal memperbarui data cabor' })
  }
}

// ── SK Document Handlers ─────────────────────────────────────

export const getCaborSKs = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string

  try {
    const sks = await prisma.sKDocument.findMany({
      where: { caborId: id },
      orderBy: { issuedAt: 'desc' }
    })

    res.json({ success: true, data: sks })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Gagal mengambil data SK' })
  }
}

export const uploadCaborSK = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string
  const data = req.body
  
  // Note: File upload for SK would use storage service similar to athlete documents
  // For now, assume fileUrl is provided or handled by a middleware
  
  try {
    const sk = await prisma.sKDocument.create({
      data: {
        ...data,
        caborId: id,
        issuedAt: new Date(data.issuedAt),
        validFrom: new Date(data.validFrom),
        validUntil: new Date(data.validUntil),
      }
    })

    await createAuditLog({
      userId: req.user?.id,
      action: 'UPLOAD_SK',
      resource: 'sk',
      resourceId: sk.id,
      after: sk,
      ipAddress: req.ip,
    })

    res.status(201).json({ success: true, data: sk })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Gagal mengunggah SK' })
  }
}
