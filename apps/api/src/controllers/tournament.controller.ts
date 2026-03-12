import { Response } from 'express'
import { UserRole } from '@prisma/client'
import { prisma } from '../lib/prisma.js'
import { AuthRequest } from '../middleware/auth.js'
import { createAuditLog } from '../services/audit.service.js'
import { resolveManagedCaborId } from '../services/rbac.service.js'
import { generateKnockoutFromRoundRobin, generateTournamentBracket, updateTournamentMatchWithBracket } from '../services/tournament-bracket.service.js'
import { recomputeEventMedalFromTournament, recomputeTournamentStandings } from '../services/event-medal.service.js'
import { emitScoreUpdate, emitMedalUpdate } from '../socket.js'

type TournamentParticipantType = 'CABOR_CONTINGENT' | 'ATHLETE'
type TournamentMatchStatus = 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'FORFEIT' | 'CANCELLED'
type TournamentScope = 'OFFICIAL' | 'SANDBOX'

const eventTournamentModel = (prisma as any).eventTournament
const eventTournamentMatchModel = (prisma as any).eventTournamentMatch
const eventTournamentStandingModel = (prisma as any).eventTournamentStanding

function getUserAgent(req: AuthRequest) {
  const value = req.get('user-agent')
  return typeof value === 'string' ? value : undefined
}

async function ensureEventExists(eventId: string) {
  const event = await prisma.event.findUnique({ where: { id: eventId } })
  if (!event) throw new Error('Event tidak ditemukan')
  return event
}

async function ensureOfficialEventExists(eventId: string) {
  const event = await prisma.event.findFirst({ where: { id: eventId, scope: 'OFFICIAL' } })
  if (!event) throw new Error('Event tidak ditemukan')
  return event
}

function buildMatchWhereClause(tournamentId: string, query: Record<string, unknown>) {
  const where: any = { tournamentId }
  if (query.stageId) where.stageId = String(query.stageId)
  if (query.status) where.status = String(query.status)
  if (query.roundNumber !== undefined) {
    const parsed = Number(query.roundNumber)
    if (!Number.isInteger(parsed) || parsed < 1) {
      throw new Error('Parameter roundNumber tidak valid')
    }
    where.roundNumber = parsed
  }
  return where
}

async function ensureTournamentBelongsToEvent(eventId: string, tournamentId: string, params?: { scope?: TournamentScope; ownerUserId?: string }) {
  const where: any = { id: tournamentId, eventId }
  if (params?.scope) where.scope = params.scope
  if (params?.ownerUserId) where.ownerUserId = params.ownerUserId
  const tournament = await eventTournamentModel.findFirst({
    where,
    select: { id: true, scope: true, ownerUserId: true },
  })
  if (!tournament) throw new Error('Tournament tidak ditemukan')
  return tournament
}

async function ensureWriteScope(params: {
  req: AuthRequest
  eventId: string
  tournamentId?: string
  matchId?: string
  scope?: TournamentScope
  enforceOwner?: boolean
}) {
  if (params.scope === 'SANDBOX') {
    if (!params.req.user?.id) throw new Error('Akses ditolak')
    if (params.req.user.role === UserRole.SUPER_ADMIN) return null

    if (!params.tournamentId) return null

    const tournament = await eventTournamentModel.findUnique({
      where: { id: params.tournamentId },
      include: {
        participants: { include: { athlete: { select: { caborId: true, userId: true } } } },
        matches: true,
      },
    })
    if (!tournament || tournament.eventId !== params.eventId) throw new Error('Tournament tidak ditemukan')
    if (params.enforceOwner !== false && tournament.ownerUserId !== params.req.user.id) throw new Error('Akses ditolak')

    if (!params.matchId) return null
    const match = tournament.matches.find((item: any) => item.id === params.matchId)
    if (!match) throw new Error('Match tidak ditemukan')
    return null
  }

  if (params.req.user?.role !== UserRole.CABOR_ADMIN) return null

  const managedCaborId = await resolveManagedCaborId(params.req.user.id)
  if (!managedCaborId) throw new Error('Akses ditolak')

  if (!params.tournamentId) return managedCaborId

  const tournament = await eventTournamentModel.findUnique({
    where: { id: params.tournamentId },
    include: {
      participants: { include: { athlete: { select: { caborId: true } } } },
      matches: true,
    },
  })

  if (!tournament || tournament.eventId !== params.eventId) throw new Error('Tournament tidak ditemukan')
  if (tournament.caborId && tournament.caborId !== managedCaborId) throw new Error('Akses ditolak')

  if (!params.matchId) return managedCaborId

  const match = tournament.matches.find((item: any) => item.id === params.matchId)
  if (!match) throw new Error('Match tidak ditemukan')

  const participantById = new Map<string, any>(tournament.participants.map((item: any) => [item.id, item]))
  const home = match.homeParticipantId ? participantById.get(match.homeParticipantId) : null
  const away = match.awayParticipantId ? participantById.get(match.awayParticipantId) : null

  const homeCabor = home?.participantType === 'CABOR_CONTINGENT' ? home.caborId : home?.athlete?.caborId
  const awayCabor = away?.participantType === 'CABOR_CONTINGENT' ? away.caborId : away?.athlete?.caborId

  if (homeCabor !== managedCaborId && awayCabor !== managedCaborId) throw new Error('Akses ditolak')

  return managedCaborId
}

async function resolveUserContextCaborId(req: AuthRequest) {
  if (!req.user?.id) return null
  if (req.user.role === UserRole.CABOR_ADMIN) return resolveManagedCaborId(req.user.id)

  if (req.user.role === UserRole.COACH) {
    const coach = await prisma.coach.findUnique({
      where: { userId: req.user.id },
      select: { caborId: true },
    })
    return coach?.caborId ?? null
  }

  if (req.user.role === UserRole.ATHLETE) {
    const athlete = await prisma.athlete.findUnique({
      where: { userId: req.user.id },
      select: { caborId: true, id: true },
    })
    return athlete?.caborId ?? null
  }

  return null
}

async function ensureSandboxOwner(req: AuthRequest, eventId: string, tournamentId: string) {
  if (!req.user?.id) throw new Error('Akses ditolak')
  await ensureTournamentBelongsToEvent(eventId, tournamentId, {
    scope: 'SANDBOX',
    ownerUserId: req.user.id,
  })
}

export const createEventTournament = async (req: AuthRequest, res: Response) => {
  try {
    const eventId = String(req.params.eventId)
    await ensureEventExists(eventId)

    const role = req.user?.role
    const managedCaborId = role === UserRole.CABOR_ADMIN ? await resolveManagedCaborId(req.user?.id) : null

    const payload = req.body as {
      name: string
      participantType: TournamentParticipantType
      caborId?: string
      roundRobinGroups?: number
      knockoutQualified?: number
      participants: Array<{ participantType: TournamentParticipantType; caborId?: string; athleteId?: string; name?: string; seedNumber?: number }>
    }

    if (role === UserRole.CABOR_ADMIN && (!managedCaborId || (payload.caborId && payload.caborId !== managedCaborId))) {
      return res.status(403).json({ success: false, error: 'Akses ditolak' })
    }

    const athleteIds = payload.participants
      .filter((item) => item.participantType === 'ATHLETE' && item.athleteId)
      .map((item) => item.athleteId as string)

    const athletes = athleteIds.length > 0
      ? await prisma.athlete.findMany({
        where: { id: { in: athleteIds }, deletedAt: null },
        select: { id: true, fullName: true, caborId: true },
      })
      : []

    const athleteById = new Map(athletes.map((athlete) => [athlete.id, athlete]))

    const created = await prisma.$transaction(async (tx) => {
      const tournament = await (tx as any).eventTournament.create({
        data: {
          eventId,
          scope: 'OFFICIAL',
          name: payload.name,
          participantType: payload.participantType,
          caborId: payload.caborId ?? (role === UserRole.CABOR_ADMIN ? managedCaborId : null),
          roundRobinGroups: payload.roundRobinGroups ?? 1,
          knockoutQualified: payload.knockoutQualified ?? 4,
          totalParticipantsTarget: payload.participants.length,
        },
      })

      if (payload.participants.length > 0) {
        await (tx as any).eventTournamentParticipant.createMany({
          data: payload.participants.map((item, index) => {
            const athlete = item.athleteId ? athleteById.get(item.athleteId) : null
            return {
              tournamentId: tournament.id,
              participantType: item.participantType,
              caborId: item.participantType === 'CABOR_CONTINGENT' ? (item.caborId ?? null) : (athlete?.caborId ?? null),
              athleteId: item.participantType === 'ATHLETE' ? item.athleteId ?? null : null,
              name: item.name || athlete?.fullName || `Participant ${index + 1}`,
              seedNumber: item.seedNumber ?? index + 1,
            }
          }),
        })
      }
      return tournament
    })

    await createAuditLog({
      userId: req.user?.id,
      action: 'CREATE_EVENT_TOURNAMENT',
      resource: 'event-tournament',
      resourceId: created.id,
      after: created,
      ipAddress: req.ip,
      userAgent: getUserAgent(req),
    })

    res.status(201).json({ success: true, data: created })
  } catch (error: any) {
    const message = error?.message || 'Gagal membuat tournament event'
    res.status(message.includes('Akses ditolak') ? 403 : 400).json({ success: false, error: message })
  }
}

export const listEventTournaments = async (req: AuthRequest, res: Response) => {
  try {
    const eventId = String(req.params.eventId)
    await ensureEventExists(eventId)

    const tournaments = await eventTournamentModel.findMany({
      where: { eventId, scope: 'OFFICIAL' },
      include: {
        _count: { select: { participants: true, matches: true, standings: true } },
      },
      orderBy: [{ createdAt: 'desc' }],
    })

    res.json({ success: true, data: tournaments })
  } catch (error: any) {
    const message = error?.message || 'Gagal mengambil data tournament event'
    if (message.includes('tidak ditemukan')) return res.status(404).json({ success: false, error: message })
    res.status(500).json({ success: false, error: message })
  }
}

export const getEventTournamentById = async (req: AuthRequest, res: Response) => {
  try {
    const tournament = await eventTournamentModel.findFirst({
      where: { id: String(req.params.tournamentId), eventId: String(req.params.eventId), scope: 'OFFICIAL' },
      include: {
        participants: {
          include: {
            cabor: { select: { id: true, name: true, fullName: true } },
            athlete: { select: { id: true, fullName: true, caborId: true } },
          },
          orderBy: [{ seedNumber: 'asc' }, { createdAt: 'asc' }],
        },
        stages: { orderBy: [{ stageOrder: 'asc' }, { groupNumber: 'asc' }] },
      },
    })

    if (!tournament) return res.status(404).json({ success: false, error: 'Tournament tidak ditemukan' })
    res.json({ success: true, data: tournament })
  } catch {
    res.status(500).json({ success: false, error: 'Gagal mengambil detail tournament' })
  }
}

export const generateEventTournament = async (req: AuthRequest, res: Response) => {
  try {
    const eventId = String(req.params.eventId)
    const tournamentId = String(req.params.tournamentId)

    await ensureWriteScope({ req, eventId, tournamentId, scope: 'OFFICIAL' })
    await generateTournamentBracket(tournamentId)
    const standings = await recomputeTournamentStandings(tournamentId)

    await createAuditLog({
      userId: req.user?.id,
      action: 'GENERATE_EVENT_TOURNAMENT',
      resource: 'event-tournament',
      resourceId: tournamentId,
      after: { standings },
      ipAddress: req.ip,
      userAgent: getUserAgent(req),
    })

    res.json({ success: true, message: 'Bracket tournament berhasil digenerate', data: { standings } })
  } catch (error: any) {
    const message = error?.message || 'Gagal generate tournament'
    res.status(message.includes('Akses ditolak') ? 403 : 400).json({ success: false, error: message })
  }
}

export const generateEventTournamentKnockout = async (req: AuthRequest, res: Response) => {
  try {
    const eventId = String(req.params.eventId)
    const tournamentId = String(req.params.tournamentId)

    await ensureWriteScope({ req, eventId, tournamentId, scope: 'OFFICIAL' })
    const standings = await recomputeTournamentStandings(tournamentId)
    const knockoutMeta = await generateKnockoutFromRoundRobin(tournamentId)

    await createAuditLog({
      userId: req.user?.id,
      action: 'GENERATE_EVENT_TOURNAMENT_KNOCKOUT',
      resource: 'event-tournament',
      resourceId: tournamentId,
      after: { standingsCount: standings.length, knockoutMeta },
      ipAddress: req.ip,
      userAgent: getUserAgent(req),
    })

    res.json({ success: true, message: 'Stage knockout berhasil digenerate dari standings round-robin', data: knockoutMeta })
  } catch (error: any) {
    const message = error?.message || 'Gagal generate knockout tournament'
    if (message.includes('Akses ditolak')) {
      return res.status(403).json({ success: false, error: message })
    }
    if (message.includes('sudah digenerate') || message.includes('belum selesai')) {
      return res.status(409).json({ success: false, error: message })
    }
    res.status(400).json({ success: false, error: message })
  }
}

export const getEventTournamentMatches = async (req: AuthRequest, res: Response) => {
  try {
    const eventId = String(req.params.eventId)
    const tournamentId = String(req.params.tournamentId)
    await ensureTournamentBelongsToEvent(eventId, tournamentId, { scope: 'OFFICIAL' })

    const { stageId, status, roundNumber } = req.query as Record<string, unknown>
    const where = buildMatchWhereClause(tournamentId, { stageId, status, roundNumber })

    const matches = await eventTournamentMatchModel.findMany({
      where,
      include: {
        stage: true,
        homeParticipant: { include: { cabor: { select: { id: true, name: true } }, athlete: { select: { id: true, fullName: true, caborId: true } } } },
        awayParticipant: { include: { cabor: { select: { id: true, name: true } }, athlete: { select: { id: true, fullName: true, caborId: true } } } },
        winnerParticipant: { include: { cabor: { select: { id: true, name: true } }, athlete: { select: { id: true, fullName: true, caborId: true } } } },
      },
      orderBy: [{ roundNumber: 'asc' }, { matchNumber: 'asc' }],
    })

    res.json({ success: true, data: matches })
  } catch (error: any) {
    const message = error?.message || 'Gagal mengambil data match tournament'
    if (message.includes('tidak valid')) return res.status(400).json({ success: false, error: message })
    if (message.includes('tidak ditemukan')) return res.status(404).json({ success: false, error: message })
    res.status(500).json({ success: false, error: message })
  }
}

export const updateEventTournamentMatchResult = async (req: AuthRequest, res: Response) => {
  try {
    const eventId = String(req.params.eventId)
    const tournamentId = String(req.params.tournamentId)
    const matchId = String(req.params.matchId)

    await ensureTournamentBelongsToEvent(eventId, tournamentId, { scope: 'OFFICIAL' })
    await ensureWriteScope({ req, eventId, tournamentId, matchId, scope: 'OFFICIAL' })

    const payload = req.body as { homeScore: number; awayScore: number; status: TournamentMatchStatus; notes?: string }

    await updateTournamentMatchWithBracket({
      tournamentId,
      matchId,
      homeScore: payload.homeScore,
      awayScore: payload.awayScore,
      status: payload.status,
      notes: payload.notes,
    })

    const standings = await recomputeTournamentStandings(tournamentId)
    const medal = await recomputeEventMedalFromTournament({
      tournamentId,
      eventId,
      userId: req.user?.id,
      notes: 'Auto update after match result patch',
    })

    // Emit real-time updates
    emitScoreUpdate(eventId, { tournamentId, matchId, standings })
    if (medal) {
      emitMedalUpdate(eventId, { medal })
    }

    await createAuditLog({
      userId: req.user?.id,
      action: 'UPDATE_TOURNAMENT_MATCH_RESULT',
      resource: 'event-tournament-match',
      resourceId: matchId,
      after: { standings, medal },
      ipAddress: req.ip,
      userAgent: getUserAgent(req),
    })

    res.json({ success: true, data: { standings, medal } })
  } catch (error: any) {
    const message = error?.message || 'Gagal memperbarui hasil pertandingan'
    if (message.includes('Akses ditolak')) return res.status(403).json({ success: false, error: message })
    if (message.includes('tidak ditemukan')) return res.status(404).json({ success: false, error: message })
    res.status(400).json({ success: false, error: message })
  }
}

export const getEventTournamentStandings = async (req: AuthRequest, res: Response) => {
  try {
    const eventId = String(req.params.eventId)
    const tournamentId = String(req.params.tournamentId)
    await ensureTournamentBelongsToEvent(eventId, tournamentId, { scope: 'OFFICIAL' })
    const standings = await eventTournamentStandingModel.findMany({
      where: { tournamentId },
      include: {
        participant: {
          include: {
            cabor: { select: { id: true, name: true, fullName: true } },
            athlete: { select: { id: true, fullName: true, caborId: true } },
          },
        },
        cabor: { select: { id: true, name: true, fullName: true } },
      },
      orderBy: [{ rank: 'asc' }, { points: 'desc' }, { scoreDiff: 'desc' }, { scoreFor: 'desc' }],
    })

    res.json({ success: true, data: standings })
  } catch (error: any) {
    const message = error?.message || 'Gagal mengambil klasemen tournament'
    if (message.includes('tidak ditemukan')) return res.status(404).json({ success: false, error: message })
    res.status(500).json({ success: false, error: message })
  }
}

export const recomputeEventTournamentMedals = async (req: AuthRequest, res: Response) => {
  try {
    const eventId = String(req.params.eventId)
    const tournamentId = String(req.params.tournamentId)

    await ensureTournamentBelongsToEvent(eventId, tournamentId, { scope: 'OFFICIAL' })
    await ensureWriteScope({ req, eventId, tournamentId, scope: 'OFFICIAL' })

    const standings = await recomputeTournamentStandings(tournamentId)
    const medal = await recomputeEventMedalFromTournament({
      tournamentId,
      eventId,
      userId: req.user?.id,
      notes: 'Manual auto-recompute trigger',
    })

    // Emit real-time updates
    emitMedalUpdate(eventId, { medal, standings })

    res.json({ success: true, data: { standings, medal } })
  } catch (error: any) {
    const message = error?.message || 'Gagal recompute medali'
    res.status(message.includes('Akses ditolak') ? 403 : 400).json({ success: false, error: message })
  }
}

export const createSandboxEventTournament = async (req: AuthRequest, res: Response) => {
  try {
    const eventId = String(req.params.eventId)
    await ensureEventExists(eventId)
    if (!req.user?.id || !req.user?.role) {
      return res.status(403).json({ success: false, error: 'Akses ditolak' })
    }

    const ownerUserId = req.user.id
    const ownerRole = req.user.role
    const contextCaborId = await resolveUserContextCaborId(req)

    const payload = req.body as {
      name: string
      participantType: TournamentParticipantType
      caborId?: string
      roundRobinGroups?: number
      knockoutQualified?: number
      participants: Array<{ participantType: TournamentParticipantType; caborId?: string; athleteId?: string; name?: string; seedNumber?: number }>
    }

    if (contextCaborId && payload.caborId && payload.caborId !== contextCaborId) {
      return res.status(403).json({ success: false, error: 'Akses ditolak lintas cabor' })
    }

    const athleteIds = payload.participants
      .filter((item) => item.participantType === 'ATHLETE' && item.athleteId)
      .map((item) => item.athleteId as string)

    const athletes = athleteIds.length > 0
      ? await prisma.athlete.findMany({
        where: { id: { in: athleteIds }, deletedAt: null },
        select: { id: true, fullName: true, caborId: true, userId: true },
      })
      : []
    const athleteById = new Map(athletes.map((athlete) => [athlete.id, athlete]))

    if (ownerRole === UserRole.ATHLETE) {
      const ownAthleteIds = new Set(athletes.filter((item) => item.userId === ownerUserId).map((item) => item.id))
      const hasForeignAthlete = athleteIds.some((athleteId) => !ownAthleteIds.has(athleteId))
      if (hasForeignAthlete) {
        return res.status(403).json({ success: false, error: 'Atlet hanya dapat mengelola peserta dirinya sendiri pada sandbox' })
      }
    }

    if (contextCaborId) {
      const outOfCabor = athletes.some((athlete) => athlete.caborId && athlete.caborId !== contextCaborId)
      if (outOfCabor) {
        return res.status(403).json({ success: false, error: 'Akses ditolak lintas cabor' })
      }
    }

    const created = await prisma.$transaction(async (tx) => {
      const tournament = await (tx as any).eventTournament.create({
        data: {
          eventId,
          scope: 'SANDBOX',
          ownerUserId,
          ownerRole,
          name: payload.name,
          participantType: payload.participantType,
          caborId: payload.caborId ?? contextCaborId ?? null,
          roundRobinGroups: payload.roundRobinGroups ?? 1,
          knockoutQualified: payload.knockoutQualified ?? 4,
          totalParticipantsTarget: payload.participants.length,
        },
      })

      if (payload.participants.length > 0) {
        await (tx as any).eventTournamentParticipant.createMany({
          data: payload.participants.map((item, index) => {
            const athlete = item.athleteId ? athleteById.get(item.athleteId) : null
            return {
              tournamentId: tournament.id,
              participantType: item.participantType,
              caborId: item.participantType === 'CABOR_CONTINGENT' ? (item.caborId ?? contextCaborId ?? null) : (athlete?.caborId ?? contextCaborId ?? null),
              athleteId: item.participantType === 'ATHLETE' ? item.athleteId ?? null : null,
              name: item.name || athlete?.fullName || `Sandbox Participant ${index + 1}`,
              seedNumber: item.seedNumber ?? index + 1,
            }
          }),
        })
      }
      return tournament
    })

    await createAuditLog({
      userId: req.user?.id,
      action: 'CREATE_SANDBOX_EVENT_TOURNAMENT',
      resource: 'event-tournament-sandbox',
      resourceId: created.id,
      after: created,
      ipAddress: req.ip,
      userAgent: getUserAgent(req),
    })

    res.status(201).json({ success: true, data: created })
  } catch (error: any) {
    const message = error?.message || 'Gagal membuat tournament sandbox'
    res.status(message.includes('Akses ditolak') ? 403 : 400).json({ success: false, error: message })
  }
}

export const listSandboxEventTournaments = async (req: AuthRequest, res: Response) => {
  try {
    const eventId = String(req.params.eventId)
    await ensureEventExists(eventId)
    if (!req.user?.id) return res.status(403).json({ success: false, error: 'Akses ditolak' })

    const tournaments = await eventTournamentModel.findMany({
      where: { eventId, scope: 'SANDBOX', ownerUserId: req.user.id },
      include: { _count: { select: { participants: true, matches: true, standings: true } } },
      orderBy: [{ createdAt: 'desc' }],
    })

    res.json({ success: true, data: tournaments })
  } catch {
    res.status(500).json({ success: false, error: 'Gagal mengambil data tournament sandbox' })
  }
}

export const generateSandboxEventTournament = async (req: AuthRequest, res: Response) => {
  try {
    const eventId = String(req.params.eventId)
    const tournamentId = String(req.params.tournamentId)
    await ensureSandboxOwner(req, eventId, tournamentId)

    await generateTournamentBracket(tournamentId)
    const standings = await recomputeTournamentStandings(tournamentId)
    res.json({ success: true, message: 'Bracket sandbox tournament berhasil digenerate', data: { standings } })
  } catch (error: any) {
    const message = error?.message || 'Gagal generate sandbox tournament'
    res.status(message.includes('Akses ditolak') ? 403 : 400).json({ success: false, error: message })
  }
}

export const generateSandboxEventTournamentKnockout = async (req: AuthRequest, res: Response) => {
  try {
    const eventId = String(req.params.eventId)
    const tournamentId = String(req.params.tournamentId)
    await ensureSandboxOwner(req, eventId, tournamentId)
    const standings = await recomputeTournamentStandings(tournamentId)
    const knockoutMeta = await generateKnockoutFromRoundRobin(tournamentId)
    res.json({ success: true, message: 'Stage knockout sandbox berhasil digenerate', data: { standingsCount: standings.length, knockoutMeta } })
  } catch (error: any) {
    const message = error?.message || 'Gagal generate knockout sandbox'
    if (message.includes('sudah digenerate') || message.includes('belum selesai')) {
      return res.status(409).json({ success: false, error: message })
    }
    res.status(message.includes('Akses ditolak') ? 403 : 400).json({ success: false, error: message })
  }
}

export const getSandboxEventTournamentMatches = async (req: AuthRequest, res: Response) => {
  try {
    const eventId = String(req.params.eventId)
    const tournamentId = String(req.params.tournamentId)
    await ensureSandboxOwner(req, eventId, tournamentId)

    const { stageId, status, roundNumber } = req.query as Record<string, unknown>
    const where = buildMatchWhereClause(tournamentId, { stageId, status, roundNumber })

    const matches = await eventTournamentMatchModel.findMany({
      where,
      include: {
        stage: true,
        homeParticipant: { include: { cabor: { select: { id: true, name: true } }, athlete: { select: { id: true, fullName: true, caborId: true } } } },
        awayParticipant: { include: { cabor: { select: { id: true, name: true } }, athlete: { select: { id: true, fullName: true, caborId: true } } } },
        winnerParticipant: { include: { cabor: { select: { id: true, name: true } }, athlete: { select: { id: true, fullName: true, caborId: true } } } },
      },
      orderBy: [{ roundNumber: 'asc' }, { matchNumber: 'asc' }],
    })

    res.json({ success: true, data: matches })
  } catch (error: any) {
    const message = error?.message || 'Gagal mengambil data match sandbox'
    if (message.includes('tidak valid')) return res.status(400).json({ success: false, error: message })
    if (message.includes('tidak ditemukan')) return res.status(404).json({ success: false, error: message })
    res.status(message.includes('Akses ditolak') ? 403 : 500).json({ success: false, error: message })
  }
}

export const updateSandboxEventTournamentMatchResult = async (req: AuthRequest, res: Response) => {
  try {
    const eventId = String(req.params.eventId)
    const tournamentId = String(req.params.tournamentId)
    const matchId = String(req.params.matchId)
    await ensureSandboxOwner(req, eventId, tournamentId)

    const payload = req.body as { homeScore: number; awayScore: number; status: TournamentMatchStatus; notes?: string }
    await updateTournamentMatchWithBracket({
      tournamentId,
      matchId,
      homeScore: payload.homeScore,
      awayScore: payload.awayScore,
      status: payload.status,
      notes: payload.notes,
    })

    const standings = await recomputeTournamentStandings(tournamentId)
    res.json({ success: true, data: { standings } })
  } catch (error: any) {
    const message = error?.message || 'Gagal memperbarui hasil pertandingan sandbox'
    if (message.includes('Akses ditolak')) return res.status(403).json({ success: false, error: message })
    if (message.includes('tidak ditemukan')) return res.status(404).json({ success: false, error: message })
    res.status(400).json({ success: false, error: message })
  }
}

export const getSandboxEventTournamentStandings = async (req: AuthRequest, res: Response) => {
  try {
    const eventId = String(req.params.eventId)
    const tournamentId = String(req.params.tournamentId)
    await ensureSandboxOwner(req, eventId, tournamentId)

    const standings = await eventTournamentStandingModel.findMany({
      where: { tournamentId },
      include: {
        participant: {
          include: {
            cabor: { select: { id: true, name: true, fullName: true } },
            athlete: { select: { id: true, fullName: true, caborId: true } },
          },
        },
        cabor: { select: { id: true, name: true, fullName: true } },
      },
      orderBy: [{ rank: 'asc' }, { points: 'desc' }, { scoreDiff: 'desc' }, { scoreFor: 'desc' }],
    })

    res.json({ success: true, data: standings })
  } catch (error: any) {
    const message = error?.message || 'Gagal mengambil klasemen sandbox'
    if (message.includes('tidak ditemukan')) return res.status(404).json({ success: false, error: message })
    res.status(message.includes('Akses ditolak') ? 403 : 500).json({ success: false, error: message })
  }
}

export const getPublicEventTournaments = async (req: AuthRequest, res: Response) => {
  try {
    const eventId = String(req.params.eventId)
    await ensureOfficialEventExists(eventId)

    const tournaments = await eventTournamentModel.findMany({
      where: { eventId, scope: 'OFFICIAL' },
      select: {
        id: true,
        name: true,
        status: true,
        participantType: true,
      },
      orderBy: [{ createdAt: 'desc' }],
    })

    res.json({ success: true, data: tournaments })
  } catch (error: any) {
    const message = error?.message || 'Gagal mengambil data tournament event'
    if (message.includes('tidak ditemukan')) return res.status(404).json({ success: false, error: message })
    res.status(500).json({ success: false, error: message })
  }
}

export const getPublicTournamentMatches = async (req: AuthRequest, res: Response) => {
  try {
    const eventId = String(req.params.eventId)
    const tournamentId = String(req.params.tournamentId)
    await ensureOfficialEventExists(eventId)
    await ensureTournamentBelongsToEvent(eventId, tournamentId, { scope: 'OFFICIAL' })

    const { stageId, status, roundNumber } = req.query as Record<string, unknown>
    const where = buildMatchWhereClause(tournamentId, { stageId, status, roundNumber })

    const matches = await eventTournamentMatchModel.findMany({
      where,
      include: {
        stage: { select: { id: true, type: true, stageOrder: true, groupNumber: true } },
        homeParticipant: { select: { id: true, name: true, participantType: true } },
        awayParticipant: { select: { id: true, name: true, participantType: true } },
        winnerParticipant: { select: { id: true, name: true, participantType: true } },
      },
      orderBy: [{ roundNumber: 'asc' }, { matchNumber: 'asc' }],
    })

    res.json({ success: true, data: matches })
  } catch (error: any) {
    const message = error?.message || 'Gagal mengambil data match tournament'
    if (message.includes('tidak valid')) return res.status(400).json({ success: false, error: message })
    if (message.includes('tidak ditemukan')) return res.status(404).json({ success: false, error: message })
    res.status(500).json({ success: false, error: message })
  }
}

export const getPublicTournamentStandings = async (req: AuthRequest, res: Response) => {
  try {
    const eventId = String(req.params.eventId)
    const tournamentId = String(req.params.tournamentId)
    await ensureOfficialEventExists(eventId)
    await ensureTournamentBelongsToEvent(eventId, tournamentId, { scope: 'OFFICIAL' })

    const standings = await eventTournamentStandingModel.findMany({
      where: { tournamentId },
      include: {
        participant: { select: { id: true, name: true, participantType: true } },
      },
      orderBy: [{ rank: 'asc' }, { points: 'desc' }, { scoreDiff: 'desc' }, { scoreFor: 'desc' }],
    })

    res.json({ success: true, data: standings })
  } catch (error: any) {
    const message = error?.message || 'Gagal mengambil klasemen tournament'
    if (message.includes('tidak ditemukan')) return res.status(404).json({ success: false, error: message })
    res.status(500).json({ success: false, error: message })
  }
}

export const getEventCaborRankingsBundle = async (req: AuthRequest, res: Response) => {
  try {
    const eventId = String(req.params.eventId)
    const tournamentIdQuery = typeof req.query.tournamentId === 'string' ? req.query.tournamentId : undefined

    const tournament = tournamentIdQuery
      ? await eventTournamentModel.findFirst({ where: { id: tournamentIdQuery, eventId, scope: 'OFFICIAL' }, select: { id: true } })
      : await eventTournamentModel.findFirst({ where: { eventId, scope: 'OFFICIAL' }, orderBy: [{ generatedAt: 'desc' }, { createdAt: 'desc' }], select: { id: true } })

    const competitionRanking = tournament
      ? await eventTournamentStandingModel.findMany({
        where: { tournamentId: tournament.id },
        include: {
          participant: {
            include: {
              cabor: { select: { id: true, name: true, fullName: true } },
              athlete: { select: { id: true, fullName: true, caborId: true } },
            },
          },
          cabor: { select: { id: true, name: true, fullName: true } },
        },
        orderBy: [{ rank: 'asc' }, { points: 'desc' }, { scoreDiff: 'desc' }, { scoreFor: 'desc' }],
      })
      : []

    const medalRanking = await prisma.medalStanding.findMany({
      where: { eventId },
      include: { cabor: { select: { id: true, name: true, fullName: true } } },
      orderBy: [{ rank: 'asc' }, { gold: 'desc' }, { silver: 'desc' }, { bronze: 'desc' }],
    })

    res.json({
      success: true,
      data: { tournamentId: tournament?.id ?? null, competitionRanking, medalRanking },
    })
  } catch {
    res.status(500).json({ success: false, error: 'Gagal mengambil bundle ranking cabor event' })
  }
}






