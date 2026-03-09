import { Response, Request } from 'express'
import { prisma } from '../lib/prisma.js'
import { AuthRequest } from '../middleware/auth.js'
import { createAuditLog } from '../services/audit.service.js'
import { UserRole } from '@prisma/client'

export const getSettings = async (_req: Request, res: Response) => {
  try {
    const settings = await prisma.systemSetting.findMany()
    // Convert array to object for easier consumption
    const settingsObj = settings.reduce((acc: any, curr) => {
      acc[curr.key] = curr.value
      return acc
    }, {})
    
    res.json({ success: true, data: settingsObj })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Gagal mengambil pengaturan' })
  }
}

export const updateSettings = async (req: AuthRequest, res: Response) => {
  const settings = req.body // Expect { key: value, ... }
  
  try {
    const keys = Object.keys(settings)
    
    // Process all updates in a transaction
    await prisma.$transaction(
      keys.map(key => prisma.systemSetting.upsert({
        where: { key },
        update: { value: String(settings[key]) },
        create: { key, value: String(settings[key]) }
      }))
    )

    await createAuditLog({
      userId: req.user?.id,
      action: 'UPDATE_SYSTEM_SETTINGS',
      resource: 'system',
      after: settings,
      ipAddress: req.ip,
    })

    res.json({ success: true, message: 'Pengaturan berhasil diperbarui' })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Gagal memperbarui pengaturan' })
  }
}
