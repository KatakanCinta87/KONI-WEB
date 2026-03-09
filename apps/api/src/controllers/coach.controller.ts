import { Response } from 'express'
import { prisma } from '../lib/prisma.js'
import { AuthRequest } from '../middleware/auth.js'
import { createAuditLog } from '../services/audit.service.js'
import { UserRole } from '@prisma/client'

// Helper to pick only allowed fields for Coach model
const pickCoachFields = (data: any) => {
  const fields = [
    'nik', 'fullName', 'birthPlace', 'birthDate', 'gender', 
    'address', 'phone', 'email', 'photoUrl', 
    'licenseNumber', 'licenseLevel', 'licenseIssuer', 
    'licenseIssuedAt', 'licenseExpiresAt', 'isActive', 'caborId'
  ]
  const picked: any = {}
  fields.forEach(f => {
    if (data[f] !== undefined) picked[f] = data[f]
  })
  
  // Ensure birthDate is a Date object if it's a string
  if (picked.birthDate && typeof picked.birthDate === 'string') {
    picked.birthDate = new Date(picked.birthDate)
  }
  
  return picked
}

export const getCoaches = async (req: AuthRequest, res: Response) => {
  const { caborId, search } = req.query

  try {
    const where: any = {}
    if (caborId) where.caborId = String(caborId)
    if (search) {
      where.fullName = {
        contains: String(search),
        mode: 'insensitive'
      }
    }

    if (req.user?.role === UserRole.CABOR_ADMIN) {
      const managedCabor = await prisma.cabangOlahraga.findUnique({
        where: { adminId: req.user.id }
      })
      if (managedCabor) {
        where.caborId = managedCabor.id
      } else {
        res.json({ success: true, data: [] })
        return
      }
    }

    const coaches = await prisma.coach.findMany({
      where,
      include: {
        cabor: {
          select: { name: true, fullName: true }
        },
        _count: {
          select: { athletes: true }
        }
      },
      orderBy: { fullName: 'asc' }
    })

    res.json({ success: true, data: coaches })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Gagal mengambil data pelatih' })
  }
}

export const getCoachById = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string

  try {
    const coach = await prisma.coach.findUnique({
      where: { id },
      include: {
        cabor: true,
        user: {
          select: { email: true, isActive: true }
        }
      }
    })

    if (!coach) {
      res.status(404).json({ success: false, error: 'Pelatih tidak ditemukan' })
      return
    }

    if (req.user?.role === UserRole.CABOR_ADMIN) {
      const managedCabor = await prisma.cabangOlahraga.findUnique({
        where: { adminId: req.user.id }
      })
      if (!managedCabor || coach.caborId !== managedCabor.id) {
        res.status(403).json({ success: false, error: 'Akses ditolak' })
        return
      }
    }

    res.json({ success: true, data: coach })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Gagal mengambil detail pelatih' })
  }
}

export const createCoach = async (req: AuthRequest, res: Response) => {
  try {
    const data = pickCoachFields(req.body)

    // RBAC: CABOR_ADMIN can only create coaches for their cabor
    if (req.user?.role === UserRole.CABOR_ADMIN) {
      const managedCabor = await prisma.cabangOlahraga.findUnique({
        where: { adminId: req.user.id }
      })
      if (!managedCabor || data.caborId !== managedCabor.id) {
        res.status(403).json({ success: false, error: 'Akses ditolak: Cabor tidak sesuai' })
        return
      }
    }

    const coach = await prisma.coach.create({
      data
    })

    await createAuditLog({
      userId: req.user?.id,
      action: 'CREATE_COACH',
      resource: 'coach',
      resourceId: coach.id,
      after: coach,
      ipAddress: req.ip,
    })

    res.status(201).json({ success: true, data: coach })
  } catch (error: any) {
    console.error('Create Coach Error:', error)
    if (error.code === 'P2002') {
      res.status(400).json({ success: false, error: 'NIK atau Email sudah terdaftar' })
      return
    }
    res.status(500).json({ success: false, error: 'Gagal membuat data pelatih' })
  }
}

export const updateCoach = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string

  try {
    const existing = await prisma.coach.findUnique({ where: { id } })
    if (!existing) {
      res.status(404).json({ success: false, error: 'Pelatih tidak ditemukan' })
      return
    }

    const data = pickCoachFields(req.body)

    // RBAC check
    if (req.user?.role === UserRole.CABOR_ADMIN) {
      const managedCabor = await prisma.cabangOlahraga.findUnique({
        where: { adminId: req.user.id }
      })
      if (!managedCabor || existing.caborId !== managedCabor.id) {
        res.status(403).json({ success: false, error: 'Akses ditolak' })
        return
      }
    }

    const updated = await prisma.coach.update({
      where: { id },
      data
    })

    await createAuditLog({
      userId: req.user?.id,
      action: 'UPDATE_COACH',
      resource: 'coach',
      resourceId: id,
      before: existing,
      after: updated,
      ipAddress: req.ip,
    })

    res.json({ success: true, data: updated })
  } catch (error: any) {
    console.error('Update Coach Error:', error)
    res.status(500).json({ success: false, error: 'Gagal memperbarui data pelatih' })
  }
}

export const deleteCoach = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string

  try {
    const existing = await prisma.coach.findUnique({ where: { id } })
    if (!existing) {
      res.status(404).json({ success: false, error: 'Pelatih tidak ditemukan' })
      return
    }

    if (req.user?.role !== UserRole.SUPER_ADMIN) {
      res.status(403).json({ success: false, error: 'Hanya Super Admin yang dapat menghapus data' })
      return
    }

    await prisma.coach.delete({ where: { id } })

    await createAuditLog({
      userId: req.user?.id,
      action: 'DELETE_COACH',
      resource: 'coach',
      resourceId: id,
      before: existing,
      ipAddress: req.ip,
    })

    res.json({ success: true, message: 'Data pelatih berhasil dihapus' })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Gagal menghapus data pelatih' })
  }
}
