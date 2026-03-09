import { Response } from 'express'
import { prisma } from '../lib/prisma.js'
import { AuthRequest } from '../middleware/auth.js'
import { createAuditLog } from '../services/audit.service.js'

const eventModel = prisma.event as any
const medalStandingModel = prisma.medalStanding as any
const caborModel = prisma.cabangOlahraga as any

function normalizeEventPayload(body: Record<string, unknown>) {
  return {
    ...body,
    description: body.description || null,
    logoUrl: body.logoUrl || null,
  }
}

function getUserAgent(req: AuthRequest) {
  const value = req.get('user-agent')
  return typeof value === 'string' ? value : undefined
}

export const getEvents = async (_req: AuthRequest, res: Response) => {
  try {
    const events = await eventModel.findMany({
      orderBy: [
        { startDate: 'asc' },
        { createdAt: 'desc' },
      ],
    })

    res.json({ success: true, data: events })
  } catch {
    res.status(500).json({ success: false, error: 'Gagal mengambil data event' })
  }
}

export const getEventById = async (req: AuthRequest, res: Response) => {
  try {
    const event = await eventModel.findUnique({
      where: { id: req.params.id },
      include: {
        medalStandings: {
          include: {
            cabor: {
              select: { id: true, name: true, fullName: true },
            },
          },
          orderBy: [
            { rank: 'asc' },
            { gold: 'desc' },
            { silver: 'desc' },
            { bronze: 'desc' },
          ],
        },
      },
    })

    if (!event) {
      res.status(404).json({ success: false, error: 'Event tidak ditemukan' })
      return
    }

    res.json({ success: true, data: event })
  } catch {
    res.status(500).json({ success: false, error: 'Gagal mengambil detail event' })
  }
}

export const createEvent = async (req: AuthRequest, res: Response) => {
  try {
    const payload: any = normalizeEventPayload(req.body as Record<string, unknown>)
    const event = await eventModel.create({ data: payload })

    await createAuditLog({
      userId: req.user?.id,
      action: 'CREATE_EVENT',
      resource: 'event',
      resourceId: event.id,
      after: event,
      ipAddress: req.ip,
      userAgent: getUserAgent(req),
    })

    res.status(201).json({ success: true, data: event })
  } catch {
    res.status(500).json({ success: false, error: 'Gagal membuat event' })
  }
}

export const updateEvent = async (req: AuthRequest, res: Response) => {
  try {
    const existing = await eventModel.findUnique({ where: { id: req.params.id } })
    if (!existing) {
      res.status(404).json({ success: false, error: 'Event tidak ditemukan' })
      return
    }

    const payload: any = normalizeEventPayload(req.body as Record<string, unknown>)
    const updated = await eventModel.update({
      where: { id: req.params.id },
      data: payload,
    })

    await createAuditLog({
      userId: req.user?.id,
      action: 'UPDATE_EVENT',
      resource: 'event',
      resourceId: updated.id,
      before: existing,
      after: updated,
      ipAddress: req.ip,
      userAgent: getUserAgent(req),
    })

    res.json({ success: true, data: updated })
  } catch {
    res.status(500).json({ success: false, error: 'Gagal memperbarui event' })
  }
}

export const deleteEvent = async (req: AuthRequest, res: Response) => {
  try {
    const existing = await eventModel.findUnique({
      where: { id: req.params.id },
      include: { medalStandings: true },
    })
    if (!existing) {
      res.status(404).json({ success: false, error: 'Event tidak ditemukan' })
      return
    }

    await eventModel.delete({ where: { id: req.params.id } })

    await createAuditLog({
      userId: req.user?.id,
      action: 'DELETE_EVENT',
      resource: 'event',
      resourceId: existing.id,
      before: existing,
      ipAddress: req.ip,
      userAgent: getUserAgent(req),
    })

    res.json({ success: true, message: 'Event berhasil dihapus' })
  } catch {
    res.status(500).json({ success: false, error: 'Gagal menghapus event' })
  }
}

export const getEventMedalStandings = async (req: AuthRequest, res: Response) => {
  try {
    const event = await eventModel.findUnique({
      where: { id: req.params.id },
      select: { id: true, name: true },
    })
    if (!event) {
      res.status(404).json({ success: false, error: 'Event tidak ditemukan' })
      return
    }

    const standings = await medalStandingModel.findMany({
      where: { eventId: req.params.id },
      include: {
        cabor: {
          select: { id: true, name: true, fullName: true },
        },
      },
      orderBy: [
        { rank: 'asc' },
        { gold: 'desc' },
        { silver: 'desc' },
        { bronze: 'desc' },
      ],
    })

    res.json({ success: true, data: { event, standings } })
  } catch {
    res.status(500).json({ success: false, error: 'Gagal mengambil klasemen medali' })
  }
}

export const replaceEventMedalStandings = async (req: AuthRequest, res: Response) => {
  try {
    const event = await eventModel.findUnique({ where: { id: req.params.id } })
    if (!event) {
      res.status(404).json({ success: false, error: 'Event tidak ditemukan' })
      return
    }

    const standingsInput = req.body.standings as Array<{
      caborId: string
      gold: number
      silver: number
      bronze: number
      rank?: number
    }>

    const caborIds = standingsInput.map((item) => item.caborId)
    const cabors = await caborModel.findMany({
      where: { id: { in: caborIds } },
      select: { id: true },
    })

    if (cabors.length !== new Set(caborIds).size) {
      res.status(400).json({ success: false, error: 'Terdapat cabang olahraga yang tidak valid' })
      return
    }

    const duplicateCount = caborIds.length - new Set(caborIds).size
    if (duplicateCount > 0) {
      res.status(400).json({ success: false, error: 'Cabang olahraga duplikat dalam klasemen tidak diperbolehkan' })
      return
    }

    const before = await medalStandingModel.findMany({ where: { eventId: event.id } })

    await prisma.$transaction(async (tx) => {
      await (tx.medalStanding as any).deleteMany({ where: { eventId: event.id } })
      if (standingsInput.length > 0) {
        await (tx.medalStanding as any).createMany({
          data: standingsInput.map((item) => ({
            eventId: event.id,
            caborId: item.caborId,
            gold: item.gold,
            silver: item.silver,
            bronze: item.bronze,
            rank: item.rank ?? null,
          })),
        })
      }
    })

    const after = await medalStandingModel.findMany({
      where: { eventId: event.id },
      include: {
        cabor: {
          select: { id: true, name: true, fullName: true },
        },
      },
      orderBy: [
        { rank: 'asc' },
        { gold: 'desc' },
        { silver: 'desc' },
        { bronze: 'desc' },
      ],
    })

    await createAuditLog({
      userId: req.user?.id,
      action: 'REPLACE_EVENT_MEDAL_STANDINGS',
      resource: 'medal-standing',
      resourceId: event.id,
      before,
      after,
      ipAddress: req.ip,
      userAgent: getUserAgent(req),
    })

    res.json({ success: true, data: after })
  } catch {
    res.status(500).json({ success: false, error: 'Gagal memperbarui klasemen medali' })
  }
}
