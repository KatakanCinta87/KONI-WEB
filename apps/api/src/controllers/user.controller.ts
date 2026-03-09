import { Response, Request } from 'express'
import { prisma } from '../lib/prisma.js'
import { AuthRequest } from '../middleware/auth.js'
import { createAuditLog } from '../services/audit.service.js'
import { UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

export const getUsers = async (req: AuthRequest, res: Response) => {
  const { role, search } = req.query
  try {
    const where: any = {}
    if (role) where.role = role as UserRole
    if (search) {
      where.OR = [
        { email: { contains: String(search), mode: 'insensitive' } },
        { fullName: { contains: String(search), mode: 'insensitive' } }
      ]
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    })
    res.json({ success: true, data: users })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Gagal mengambil data user' })
  }
}

export const createUser = async (req: AuthRequest, res: Response) => {
  const { email, password, fullName, role } = req.body
  try {
    const hashedPassword = await bcrypt.hash(password || 'koni123', 12)
    
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        role,
        mustChangePassword: true
      }
    })

    await createAuditLog({
      userId: req.user?.id,
      action: 'CREATE_USER',
      resource: 'user',
      resourceId: user.id,
      after: { email, fullName, role },
      ipAddress: req.ip,
    })

    res.status(201).json({ success: true, data: { id: user.id, email: user.email } })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Gagal membuat user' })
  }
}

export const updateUser = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string
  const data = req.body
  try {
    const existing = await prisma.user.findUnique({ where: { id } })
    if (!existing) {
      res.status(404).json({ success: false, error: 'User tidak ditemukan' })
      return
    }

    const updated = await prisma.user.update({
      where: { id },
      data
    })

    await createAuditLog({
      userId: req.user?.id,
      action: 'UPDATE_USER',
      resource: 'user',
      resourceId: id,
      before: { email: existing.email, role: existing.role, isActive: existing.isActive },
      after: { email: updated.email, role: updated.role, isActive: updated.isActive },
      ipAddress: req.ip,
    })

    res.json({ success: true, data: { id: updated.id, email: updated.email } })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Gagal memperbarui user' })
  }
}

export const deleteUser = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string
  try {
    if (req.user?.id === id) {
      res.status(400).json({ success: false, error: 'Tidak bisa menghapus diri sendiri' })
      return
    }

    await prisma.user.delete({ where: { id } })

    await createAuditLog({
      userId: req.user?.id,
      action: 'DELETE_USER',
      resource: 'user',
      resourceId: id,
      ipAddress: req.ip,
    })

    res.json({ success: true, message: 'User berhasil dihapus' })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Gagal menghapus user' })
  }
}
