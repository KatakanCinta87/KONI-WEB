import { Response } from 'express'
import { prisma } from '../lib/prisma.js'
import { AuthRequest } from '../middleware/auth.js'
import { createAuditLog } from '../services/audit.service.js'
import { emitMedalUpdate } from '../socket.js'
import ExcelJS from 'exceljs'
import PDFDocument from 'pdfkit-table'

const eventModel = prisma.event as any
const medalStandingModel = prisma.medalStanding as any
const caborModel = prisma.cabangOlahraga as any
const eventTypePriority: Record<string, number> = {
  PON: 5,
  PORPROV: 4,
  PORKAB: 3,
  KEJURKAB: 2,
  OTHER: 1,
}

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
      where: { scope: 'OFFICIAL' },
      orderBy: [
        { startDate: 'asc' },
        { createdAt: 'desc' },
      ],
    })

    const includeConcurrent = String((_req.query as Record<string, unknown>)?.includeConcurrent ?? '').toLowerCase() === 'true'
    if (!includeConcurrent) {
      res.json({ success: true, data: events })
      return
    }

    const eventIds = events.map((event: any) => event.id)
    const medalCounts = eventIds.length > 0
      ? await (prisma.medalStanding as any).groupBy({
        by: ['eventId'],
        where: { eventId: { in: eventIds } },
        _count: { eventId: true },
      })
      : []
    const medalCountMap = new Map<string, number>(
      medalCounts.map((row: any) => [row.eventId, Number(row?._count?.eventId ?? 0)]),
    )

    const withMedals = events
      .filter((event: any) => (medalCountMap.get(event.id) ?? 0) > 0)
      .map((event: any) => ({
        ...event,
        medalRows: medalCountMap.get(event.id) ?? 0,
      }))

    const statusPriorityOrder: Array<'ONGOING' | 'UPCOMING'> = ['ONGOING', 'UPCOMING']
    const prioritized = statusPriorityOrder
      .map((status) => withMedals.filter((event: any) => event.status === status))
      .find((rows) => rows.length > 0) ?? []

    const sorted = prioritized.sort((a: any, b: any) => {
      const typeDiff = (eventTypePriority[b.type] ?? 0) - (eventTypePriority[a.type] ?? 0)
      if (typeDiff !== 0) return typeDiff

      const endDiff = new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
      if (endDiff !== 0) return endDiff

      const startDiff = new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      if (startDiff !== 0) return startDiff

      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })

    const featured = sorted[0] ?? null
    const concurrent = featured
      ? sorted.filter((event: any) => event.id !== featured.id && isAgendaOverlapping(event, featured))
      : []

    res.json({
      success: true,
      data: {
        events,
        medalSelection: {
          featuredEventId: featured?.id ?? null,
          concurrentEventIds: concurrent.map((event: any) => event.id),
        },
      },
    })
    return
  } catch {
    res.status(500).json({ success: false, error: 'Gagal mengambil data event' })
  }
}

function isAgendaOverlapping(a: { startDate: Date | string; endDate: Date | string }, b: { startDate: Date | string; endDate: Date | string }) {
  const aStart = new Date(a.startDate).getTime()
  const aEnd = new Date(a.endDate).getTime()
  const bStart = new Date(b.startDate).getTime()
  const bEnd = new Date(b.endDate).getTime()
  return aStart <= bEnd && bStart <= aEnd
}

export const getEventById = async (req: AuthRequest, res: Response) => {
  try {
    const event = await eventModel.findFirst({
      where: { id: req.params.id, scope: 'OFFICIAL' },
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
    const existing = await eventModel.findFirst({ where: { id: req.params.id, scope: 'OFFICIAL' } })
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
    const existing = await eventModel.findFirst({
      where: { id: req.params.id, scope: 'OFFICIAL' },
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
    const event = await eventModel.findFirst({
      where: { id: req.params.id, scope: 'OFFICIAL' },
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
    const event = await eventModel.findFirst({ where: { id: req.params.id, scope: 'OFFICIAL' } })
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
      manualOverride?: boolean
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
            manualOverride: item.manualOverride ?? true,
            lastSource: item.manualOverride === false ? 'AUTO' : 'MANUAL',
            updatedByUserId: req.user?.id,
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

export const resetEventMedalStandingsOverride = async (req: AuthRequest, res: Response) => {
  try {
    const event = await eventModel.findFirst({ where: { id: req.params.id, scope: 'OFFICIAL' } })
    if (!event) {
      res.status(404).json({ success: false, error: 'Event tidak ditemukan' })
      return
    }

    const caborIds = Array.isArray(req.body.caborIds) ? req.body.caborIds as string[] : null
    const whereClause: any = {
      eventId: event.id,
      manualOverride: true,
    }
    if (caborIds && caborIds.length > 0) {
      whereClause.caborId = { in: caborIds }
    }

    await (prisma.medalStanding as any).updateMany({
      where: whereClause,
      data: {
        manualOverride: false,
        lastSource: 'AUTO',
        updatedByUserId: req.user?.id,
      },
    })

    const data = await medalStandingModel.findMany({
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
      action: 'RESET_EVENT_MEDAL_STANDINGS_OVERRIDE',
      resource: 'medal-standing',
      resourceId: event.id,
      after: data,
      ipAddress: req.ip,
      userAgent: getUserAgent(req),
    })

    // Emit real-time updates
    emitMedalUpdate(event.id, { medalStandings: data })

    res.json({ success: true, data })
  } catch {
    res.status(500).json({ success: false, error: 'Gagal mereset manual override klasemen medali' })
  }
}

export const getEventRegistrations = async (req: AuthRequest, res: Response) => {
  try {
    const { id: eventId } = req.params
    const caborId = req.user?.role === 'CABOR_ADMIN'
      ? (await prisma.cabangOlahraga.findUnique({ where: { adminId: req.user.id } }))?.id
      : null

    const where: any = { eventId }
    if (caborId) {
      where.caborId = caborId
    }

    const registrations = await prisma.eventRegistration.findMany({
      where,
      include: {
        athlete: {
          select: { id: true, fullName: true, nik: true, gender: true },
        },
        cabor: {
          select: { id: true, name: true, fullName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    res.json({ success: true, data: registrations })
  } catch {
    res.status(500).json({ success: false, error: 'Gagal mengambil data registrasi' })
  }
}

export const registerAthleteToEvent = async (req: AuthRequest, res: Response) => {
  try {
    const { id: eventId } = req.params
    const { athleteId, matchNumber, notes } = req.body

    const event = await prisma.event.findUnique({ where: { id: eventId } })
    if (!event) {
      res.status(404).json({ success: false, error: 'Event tidak ditemukan' })
      return
    }

    if (event.registDeadline && new Date() > new Date(event.registDeadline)) {
      res.status(400).json({ success: false, error: 'Batas waktu pendaftaran telah berakhir' })
      return
    }

    const athlete = await prisma.athlete.findUnique({ where: { id: athleteId } })
    if (!athlete) {
      res.status(404).json({ success: false, error: 'Atlet tidak ditemukan' })
      return
    }

    if (req.user?.role === 'CABOR_ADMIN') {
      const cabor = await prisma.cabangOlahraga.findUnique({ where: { adminId: req.user.id } })
      if (!cabor || athlete.caborId !== cabor.id) {
        res.status(403).json({ success: false, error: 'Anda hanya dapat mendaftarkan atlet dari cabang olahraga Anda' })
        return
      }
    }

    const existing = await prisma.eventRegistration.findUnique({
      where: { eventId_athleteId: { eventId, athleteId } },
    })

    if (existing) {
      res.status(400).json({ success: false, error: 'Atlet sudah terdaftar dalam event ini' })
      return
    }

    const registration = await prisma.eventRegistration.create({
      data: {
        eventId,
        athleteId,
        caborId: athlete.caborId,
        matchNumber,
        notes,
        status: 'CONFIRMED',
      },
      include: {
        athlete: true,
        cabor: true,
      },
    })

    await createAuditLog({
      userId: req.user?.id,
      action: 'REGISTER_ATHLETE_EVENT',
      resource: 'event-registration',
      resourceId: registration.id,
      after: registration,
      ipAddress: req.ip,
      userAgent: getUserAgent(req),
    })

    res.status(201).json({ success: true, data: registration })
    } catch {
    res.status(500).json({ success: false, error: 'Gagal mendaftarkan atlet' })
    }
    }

export const deleteEventRegistration = async (req: AuthRequest, res: Response) => {
  try {
    const registrationIdParam = req.params.registrationId
    const registrationId = Array.isArray(registrationIdParam) ? registrationIdParam[0] : registrationIdParam

    if (!registrationId) {
      res.status(400).json({ success: false, error: 'ID registrasi tidak valid' })
      return
    }

    const registration = await prisma.eventRegistration.findUnique({
      where: { id: registrationId },
      include: {
        athlete: { select: { id: true, fullName: true, caborId: true } },
        cabor: { select: { id: true, name: true, fullName: true } },
        event: { select: { id: true, name: true } },
      },
    })

    if (!registration) {
      res.status(404).json({ success: false, error: 'Registrasi tidak ditemukan' })
      return
    }

    if (req.user?.role === 'CABOR_ADMIN') {
      const cabor = await prisma.cabangOlahraga.findUnique({ where: { adminId: req.user.id } })
      if (!cabor || registration.caborId !== cabor.id) {
        res.status(403).json({ success: false, error: 'Anda hanya dapat menghapus registrasi cabang olahraga Anda' })
        return
      }
    }

    await prisma.eventRegistration.delete({ where: { id: registrationId } })

    await createAuditLog({
      userId: req.user?.id,
      action: 'DELETE_EVENT_REGISTRATION',
      resource: 'event-registration',
      resourceId: registration.id,
      before: registration,
      ipAddress: req.ip,
      userAgent: getUserAgent(req),
    })

    res.json({ success: true, message: 'Registrasi berhasil dihapus' })
  } catch {
    res.status(500).json({ success: false, error: 'Gagal menghapus registrasi' })
  }
}

export const exportEventMedalExcel = async (req: AuthRequest, res: Response) => {
  try {
    const { id: eventId } = req.params
    const event = await prisma.event.findUnique({ where: { id: eventId } })
    if (!event) {
      res.status(404).json({ success: false, error: 'Event tidak ditemukan' })
      return
    }

    const standings = await prisma.medalStanding.findMany({
      where: { eventId },
      include: {
        cabor: { select: { name: true } },
      },
      orderBy: [
        { rank: 'asc' },
        { gold: 'desc' },
        { silver: 'desc' },
        { bronze: 'desc' },
      ],
    })

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Klasemen Medali')

    worksheet.columns = [
      { header: 'Rank', key: 'rank', width: 10 },
      { header: 'Cabang Olahraga', key: 'cabor', width: 30 },
      { header: 'Emas', key: 'gold', width: 10 },
      { header: 'Perak', key: 'silver', width: 10 },
      { header: 'Perunggu', key: 'bronze', width: 10 },
      { header: 'Total', key: 'total', width: 10 },
    ]

    standings.forEach((s) => {
      worksheet.addRow({
        rank: s.rank,
        cabor: s.cabor.name,
        gold: s.gold,
        silver: s.silver,
        bronze: s.bronze,
        total: s.gold + s.silver + s.bronze,
      })
    })

    // Styling
    worksheet.getRow(1).font = { bold: true }
    worksheet.getRow(1).alignment = { horizontal: 'center' }

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    )
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=medal-standings-${eventId}.xlsx`,
    )

    await workbook.xlsx.write(res)
    res.end()
  } catch {
    res.status(500).json({ success: false, error: 'Gagal mengekspor data ke Excel' })
  }
}

export const exportEventMedalPdf = async (req: AuthRequest, res: Response) => {
  try {
    const { id: eventId } = req.params
    const event = await prisma.event.findUnique({ where: { id: eventId } })
    if (!event) {
      res.status(404).json({ success: false, error: 'Event tidak ditemukan' })
      return
    }

    const standings = await prisma.medalStanding.findMany({
      where: { eventId },
      include: {
        cabor: { select: { name: true } },
      },
      orderBy: [
        { rank: 'asc' },
        { gold: 'desc' },
        { silver: 'desc' },
        { bronze: 'desc' },
      ],
    })

    const doc = new PDFDocument({ margin: 30, size: 'A4' })

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=medal-standings-${eventId}.pdf`,
    )

    doc.pipe(res)

    doc.fontSize(18).text('Klasemen Medali', { align: 'center' })
    doc.fontSize(14).text(event.name, { align: 'center' })
    doc.moveDown()

    const table = {
      title: 'Daftar Perolehan Medali',
      headers: ['Rank', 'Cabang Olahraga', 'Emas', 'Perak', 'Perunggu', 'Total'],
      rows: standings.map((s) => [
        String(s.rank),
        s.cabor.name,
        String(s.gold),
        String(s.silver),
        String(s.bronze),
        String(s.gold + s.silver + s.bronze),
      ]),
    }

    await doc.table(table, {
      prepareHeader: () => doc.font('Helvetica-Bold').fontSize(10),
      prepareRow: () => doc.font('Helvetica').fontSize(10),
    })

    doc.end()
  } catch {
    res.status(500).json({ success: false, error: 'Gagal mengekspor data ke PDF' })
  }
}
