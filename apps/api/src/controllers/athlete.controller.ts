import { Response } from 'express'
import { prisma } from '../lib/prisma.js'
import { AuthRequest } from '../middleware/auth.js'
import { createAuditLog } from '../services/audit.service.js'
import { storage } from '../services/storage.service.js'
import { UserRole, AthleteStatus } from '@prisma/client'

// ── Base Athlete Handlers ────────────────────────────────────

export const getAthletes = async (req: AuthRequest, res: Response) => {
  const { caborId, status, search } = req.query
  try {
    const where: any = { deletedAt: null }
    if (caborId) where.caborId = String(caborId)
    if (status) where.status = status as AthleteStatus
    if (search) where.fullName = { contains: String(search), mode: 'insensitive' }

    if (req.user?.role === UserRole.CABOR_ADMIN) {
      const cabor = await prisma.cabangOlahraga.findUnique({ where: { adminId: req.user.id } })
      if (cabor) where.caborId = cabor.id
      else return res.json({ success: true, data: [] })
    }

    const athletes = await prisma.athlete.findMany({
      where,
      include: { 
        cabor: { select: { name: true } }, 
        user: { select: { email: true, isActive: true } } 
      },
      orderBy: { fullName: 'asc' }
    })
    res.json({ success: true, data: athletes })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
}

export const getAthleteById = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string
  try {
    const athlete = await prisma.athlete.findUnique({
      where: { id },
      include: {
        cabor: true,
        user: { select: { email: true, role: true, isActive: true } },
        achievements: true,
        documents: true,
        physicalTests: { orderBy: { testDate: 'desc' }, take: 5 }
      }
    })

    if (!athlete || athlete.deletedAt) {
      res.status(404).json({ success: false, error: 'Atlet tidak ditemukan' })
      return
    }

    // RBAC check
    if (req.user?.role === UserRole.ATHLETE && req.user.id !== athlete.userId) {
      res.status(403).json({ success: false, error: 'Akses ditolak' })
      return
    }

    res.json({ success: true, data: athlete })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
}

export const createAthlete = async (req: AuthRequest, res: Response) => {
  const data = req.body
  try {
    // RBAC: Cabor admin restricted to their cabor
    if (req.user?.role === UserRole.CABOR_ADMIN) {
      const managedCabor = await prisma.cabangOlahraga.findUnique({ where: { adminId: req.user.id } })
      if (!managedCabor || data.caborId !== managedCabor.id) {
        res.status(403).json({ success: false, error: 'Akses ditolak' })
        return
      }
    }

    const athlete = await prisma.athlete.create({ data })

    await createAuditLog({
      userId: req.user?.id,
      action: 'CREATE_ATHLETE',
      resource: 'athlete',
      resourceId: athlete.id,
      after: athlete,
      ipAddress: req.ip,
    })

    res.status(201).json({ success: true, data: athlete })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Gagal membuat data atlet' })
  }
}

export const updateAthlete = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string
  const data = req.body
  try {
    const existing = await prisma.athlete.findUnique({ where: { id } })
    if (!existing) {
      res.status(404).json({ success: false, error: 'Atlet tidak ditemukan' })
      return
    }

    // RBAC check
    if (req.user?.role === UserRole.CABOR_ADMIN) {
      const managedCabor = await prisma.cabangOlahraga.findUnique({ where: { adminId: req.user.id } })
      if (!managedCabor || existing.caborId !== managedCabor.id) {
        res.status(403).json({ success: false, error: 'Akses ditolak' })
        return
      }
    }

    const updated = await prisma.athlete.update({ where: { id }, data })

    await createAuditLog({
      userId: req.user?.id,
      action: 'UPDATE_ATHLETE',
      resource: 'athlete',
      resourceId: id,
      before: existing,
      after: updated,
      ipAddress: req.ip,
    })

    res.json({ success: true, data: updated })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Gagal memperbarui data atlet' })
  }
}

export const deleteAthlete = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string
  try {
    const existing = await prisma.athlete.findUnique({ where: { id } })
    if (!existing) {
      res.status(404).json({ success: false, error: 'Atlet tidak ditemukan' })
      return
    }

    // Soft delete
    await prisma.athlete.update({
      where: { id },
      data: { deletedAt: new Date(), status: AthleteStatus.INACTIVE }
    })

    await createAuditLog({
      userId: req.user?.id,
      action: 'DELETE_ATHLETE',
      resource: 'athlete',
      resourceId: id,
      before: existing,
      ipAddress: req.ip,
    })

    res.json({ success: true, message: 'Atlet berhasil dinonaktifkan' })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Gagal menghapus data atlet' })
  }
}

// ── Achievement Handlers ─────────────────────────────────────

export const getAchievements = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string

  try {
    const achievements = await prisma.achievement.findMany({
      where: { athleteId: id },
      orderBy: { year: 'desc' },
    })

    res.json({ success: true, data: achievements })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Gagal mengambil data prestasi' })
  }
}

export const createAchievement = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string
  const data = req.body

  try {
    const athlete = await prisma.athlete.findUnique({
      where: { id },
      select: { caborId: true },
    })

    if (!athlete) {
      res.status(404).json({ success: false, error: 'Atlet tidak ditemukan' })
      return
    }

    // RBAC: CABOR_ADMIN can only add achievements for athletes in their cabor
    if (req.user?.role === UserRole.CABOR_ADMIN) {
      const managedCabor = await prisma.cabangOlahraga.findUnique({
        where: { adminId: req.user.id },
      })
      if (!managedCabor || athlete.caborId !== managedCabor.id) {
        res.status(403).json({ success: false, error: 'Anda tidak memiliki akses ke atlet ini' })
        return
      }
    }

    const achievement = await prisma.achievement.create({
      data: {
        ...data,
        athleteId: id,
      },
    })

    await createAuditLog({
      userId: req.user?.id,
      action: 'CREATE_ACHIEVEMENT',
      resource: 'achievement',
      resourceId: achievement.id,
      after: achievement,
      ipAddress: req.ip,
    })

    res.status(201).json({ success: true, data: achievement })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Gagal menambahkan prestasi' })
  }
}

export const updateAchievement = async (req: AuthRequest, res: Response) => {
  const achievementId = req.params.achievementId as string
  const data = req.body

  try {
    const existing = await prisma.achievement.findUnique({
      where: { id: achievementId },
      include: { athlete: true },
    })

    if (!existing) {
      res.status(404).json({ success: false, error: 'Prestasi tidak ditemukan' })
      return
    }

    // RBAC check
    if (req.user?.role === UserRole.CABOR_ADMIN) {
      const managedCabor = await prisma.cabangOlahraga.findUnique({
        where: { adminId: req.user.id },
      })
      if (!managedCabor || existing.athlete.caborId !== managedCabor.id) {
        res.status(403).json({ success: false, error: 'Akses ditolak' })
        return
      }
    }

    const updated = await prisma.achievement.update({
      where: { id: achievementId },
      data,
    })

    await createAuditLog({
      userId: req.user?.id,
      action: 'UPDATE_ACHIEVEMENT',
      resource: 'achievement',
      resourceId: updated.id,
      before: existing,
      after: updated,
      ipAddress: req.ip,
    })

    res.json({ success: true, data: updated })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Gagal memperbarui prestasi' })
  }
}

export const deleteAchievement = async (req: AuthRequest, res: Response) => {
  const achievementId = req.params.achievementId as string

  try {
    const existing = await prisma.achievement.findUnique({
      where: { id: achievementId },
      include: { athlete: true },
    })

    if (!existing) {
      res.status(404).json({ success: false, error: 'Prestasi tidak ditemukan' })
      return
    }

    // RBAC check
    if (req.user?.role === UserRole.CABOR_ADMIN) {
      const managedCabor = await prisma.cabangOlahraga.findUnique({
        where: { adminId: req.user.id },
      })
      if (!managedCabor || existing.athlete.caborId !== managedCabor.id) {
        res.status(403).json({ success: false, error: 'Akses ditolak' })
        return
      }
    }

    await prisma.achievement.delete({ where: { id: achievementId } })

    await createAuditLog({
      userId: req.user?.id,
      action: 'DELETE_ACHIEVEMENT',
      resource: 'achievement',
      resourceId: achievementId,
      before: existing,
      ipAddress: req.ip,
    })

    res.json({ success: true, message: 'Prestasi berhasil dihapus' })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Gagal menghapus prestasi' })
  }
}

// ── Document Handlers ────────────────────────────────────────

export const getDocuments = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string

  try {
    const documents = await prisma.document.findMany({
      where: { athleteId: id },
      orderBy: { uploadedAt: 'desc' },
    })

    res.json({ success: true, data: documents })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Gagal mengambil data dokumen' })
  }
}

export const uploadDocument = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string
  const { type } = req.body
  const file = req.file

  if (!file) {
    res.status(400).json({ success: false, error: 'File tidak ditemukan' })
    return
  }

  try {
    const athlete = await prisma.athlete.findUnique({
      where: { id },
      select: { caborId: true, fullName: true },
    })

    if (!athlete) {
      res.status(404).json({ success: false, error: 'Atlet tidak ditemukan' })
      return
    }

    // RBAC: CABOR_ADMIN ownership check
    if (req.user?.role === UserRole.CABOR_ADMIN) {
      const managedCabor = await prisma.cabangOlahraga.findUnique({
        where: { adminId: req.user.id },
      })
      if (!managedCabor || athlete.caborId !== managedCabor.id) {
        res.status(403).json({ success: false, error: 'Akses ditolak' })
        return
      }
    }

    // Upload to storage
    const uploadResult = await storage.uploadFile({
      buffer: file.buffer,
      filename: file.originalname,
      mimeType: file.mimetype,
      folder: `athletes/${id}/documents`,
    })

    const document = await prisma.document.create({
      data: {
        athleteId: id,
        type,
        name: file.originalname,
        url: uploadResult.url,
        fileSize: file.size,
        mimeType: file.mimetype,
      },
    })

    await createAuditLog({
      userId: req.user?.id,
      action: 'UPLOAD_DOCUMENT',
      resource: 'document',
      resourceId: document.id,
      after: document,
      ipAddress: req.ip,
    })

    res.status(201).json({ success: true, data: document })
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ success: false, error: 'Gagal mengunggah dokumen' })
  }
}

export const deleteDocument = async (req: AuthRequest, res: Response) => {
  const documentId = req.params.documentId as string

  try {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: { athlete: true },
    })

    if (!document) {
      res.status(404).json({ success: false, error: 'Dokumen tidak ditemukan' })
      return
    }

    // RBAC check
    if (req.user?.role === UserRole.CABOR_ADMIN) {
      const managedCabor = await prisma.cabangOlahraga.findUnique({
        where: { adminId: req.user.id },
      })
      if (!managedCabor || document.athlete.caborId !== managedCabor.id) {
        res.status(403).json({ success: false, error: 'Akses ditolak' })
        return
      }
    }

    // Delete from DB first
    await prisma.document.delete({ where: { id: documentId } })

    // Delete from storage (fileId is the relative path in local storage)
    const fileId = document.url.replace('/uploads/', '')
    await storage.deleteFile(fileId)

    await createAuditLog({
      userId: req.user?.id,
      action: 'DELETE_DOCUMENT',
      resource: 'document',
      resourceId: documentId,
      before: document,
      ipAddress: req.ip,
    })

    res.json({ success: true, message: 'Dokumen berhasil dihapus' })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Gagal menghapus dokumen' })
  }
}
